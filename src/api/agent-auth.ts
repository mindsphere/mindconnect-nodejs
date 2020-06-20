import * as AsyncLock from "async-lock";
import * as debug from "debug";
import * as jwt from "jsonwebtoken";
import fetch from "cross-fetch";
import "url-search-params-polyfill";
import * as uuid from "uuid";
import {
    AccessToken,
    IConfigurationStorage,
    IMindConnectConfiguration,
    OnboardingStatus,
    retry,
    SelfSignedClientAssertion,
    TokenKey,
} from "..";
import { MindConnectBase, TokenRotation } from "./mindconnect-base";
import { DefaultStorage, IsConfigurationStorage } from "./mindconnect-storage";
import _ = require("lodash");
const log = debug("mindconnect-agentauth");
const rsaPemToJwk = require("rsa-pem-to-jwk");

export abstract class AgentAuth extends MindConnectBase implements TokenRotation {
    /**
     * The assertion response contains the /exchange token plus additional information. If this is not set, the client will try to
     * acquire a new token.
     * @private
     * @type {AccessToken}
     * @memberof AgentAuth
     */
    protected _accessToken?: AccessToken;

    /**
     * The /exchange tokens from the mindsphere use RSA256 algorithm also for SHARED_SECRET for token signing. This is where the public
     * key of mindsphere is cached during the lifetime of the agent.
     *
     * @private
     * @type {TokenKey}
     * @memberof AgentAuth
     */
    private _oauthPublicKey?: TokenKey;

    /**
     * lock object for client secret renewal. (this is the most sensitive part in the tocken rotation, which needs to be done in critical section)
     *
     * @private
     * @type {AsyncLock}
     * @memberOf AgentAuth
     */
    private secretLock: AsyncLock;

    /**
     * Asynchronous method which saves the agent state in the .mc (or reconfigured) folder.
     *
     * @private
     * @returns {Promise<object>}
     * @memberof AgentAuth
     */
    protected async SaveConfig(): Promise<object> {
        if (!this._storage) {
            throw new Error("Invalid storage configured");
        }
        return this._storage.SaveConfig(this._configuration);
    }

    /**
     * Onboard the agent and return the onboarding state.
     *
     * @returns {Promise<OnBoardingState>}
     * @memberof MindConnectAgent
     */
    public async OnBoard(): Promise<OnboardingStatus.StatusEnum> {
        const headers = {
            ...this._apiHeaders,
            Authorization: `Bearer ${this._configuration.content.iat}`,
        };
        const url = `${this._configuration.content.baseUrl}/api/agentmanagement/v3/register`;

        log(`Onboarding - Headers: ${JSON.stringify(headers)} Url: ${url} Profile: ${this.GetProfile()}`);
        try {
            let body: object = {};
            if (this.GetProfile() === "RSA_3072") {
                if (!this._publicJwk)
                    throw new Error(
                        "The RSA_3072 profile requires a certificate (did you call SetupAgentCerts before onboarding?)"
                    );

                body = {
                    jwks: { keys: [this._publicJwk] },
                };
            }

            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(body),
                headers: headers,
                agent: this._proxyHttpAgent,
            } as RequestInit);

            if (!response.ok) {
                throw new Error(`${response.statusText} ${await response.text()}`);
            }

            if (response.status === 201) {
                const json = await response.json();
                this._configuration.response = json;
                await retry(5, () => this.SaveConfig());
                return OnboardingStatus.StatusEnum.ONBOARDED;
            } else {
                throw new Error(`invalid response ${JSON.stringify(response)}`);
            }

            // process body
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    private PushKey() {
        if (!this._configuration.response) throw new Error("This agent was not onboarded yet.");
        this._configuration.recovery = this._configuration.recovery || [];

        if (!_.some(this._configuration.recovery, this._configuration.response)) {
            this._configuration.recovery.push(Object.assign({}, this._configuration.response));
        }
        this._configuration.recovery = _.takeRight(this._configuration.recovery, 5);
    }

    private async TryRecovery(): Promise<boolean> {
        this._configuration.recovery = this._configuration.recovery || [];

        this.PushKey();
        const backup = Object.assign({}, this._configuration.response);
        let success = false;

        let i = 0;
        for (const currentKey of this._configuration.recovery.reverse()) {
            try {
                this._configuration.response = currentKey;
                log(`recovery with ${i}`);
                await retry(3, () => this.RotateKey());
                log("success");
                success = true;
                break;
            } catch (err) {
                log(`recovery with ${i++} failed`);
            }
        }

        if (!success) {
            log("Recovery failed!");
            this._configuration.response = backup;
            log(this._configuration.response);
        }

        await retry(5, () => this.SaveConfig());

        return success;
    }

    /**
     * This method rotates the client secret (reregisters the agent). It is called by RenewToken when the secret is expiring.
     *
     * @private
     * @returns {Promise<boolean>}
     * @memberof AgentAuth
     */
    private async RotateKey(): Promise<boolean> {
        if (!this._configuration.response) throw new Error("This agent was not onboarded yet.");

        this.PushKey();

        const headers = {
            ...this._apiHeaders,
            Authorization: `Bearer ${this._configuration.response.registration_access_token}`,
        };
        const url = this._configuration.response.registration_client_uri;

        let body: object = { client_id: this._configuration.content.clientId }; // mindsphere 3.0. expects a body in the the put request

        if (this.GetProfile() === "RSA_3072") {
            if (!this._publicJwk)
                throw new Error(
                    "The RSA_3072 profile requires a certificate (did you call SetupAgentCerts before key rotation?)"
                );
            body = {
                ...body,
                jwks: { keys: [this._publicJwk] },
            };
        }

        log(`Rotating Key - Headers: ${JSON.stringify(headers)} Url: ${url} Profile: ${this.GetProfile()}`);

        try {
            const response = await fetch(url, {
                method: "PUT",
                body: JSON.stringify(body),
                headers: headers,
                agent: this._proxyHttpAgent,
            } as RequestInit);

            if (!response.ok) {
                throw new Error(`${response.statusText} ${await response.text()}`);
            }

            if (response.status >= 200 && response.status <= 299) {
                const json = await response.json();
                this._configuration.response = json;
                await retry(5, () => this.SaveConfig());
                return true;
            } else {
                throw new Error(`invalid response ${JSON.stringify(response)}`);
            }
            // process body
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    /**
     * Create Initial self-signed JWT Token which is needed to acquire the actual /exchange token.
     *
     * @private
     * @param {number} [expiration=3600]
     * @returns {URLSearchParams}
     * @memberof AgentAuth
     */
    private CreateClientAssertion(expiration: number = 3600): URLSearchParams {
        if (!this._configuration.response) {
            throw new Error("the device was not onborded or the response was deleted");
        }

        if (!this._configuration.content.clientId) {
            throw new Error("client id must be defined!");
        }

        if (!this._configuration.content.tenant) {
            throw new Error("tenant id must be defined!");
        }
        const now = Math.floor(Date.now() / 1000);
        const jwtToken: SelfSignedClientAssertion = {
            iss: this._configuration.content.clientId,
            sub: this._configuration.content.clientId,
            aud: ["southgate"],
            iat: now,
            nbf: now,
            exp: now + expiration,
            jti: uuid.v4().toString(),
            schemas: ["urn:siemens:mindsphere:v1"],
            ten: this._configuration.content.tenant,
        };

        log(jwtToken);
        let token: any;
        if (this.GetProfile() === "SHARED_SECRET") {
            if (!this._configuration.response.client_secret)
                throw new Error("There must be a shared secret in the response");

            token = jwt.sign(jwtToken, this._configuration.response.client_secret);
        } else {
            if (!this._privateCert) {
                throw new Error(
                    "The RSA_3072 profile requires a certificate (did you call SetupAgentCerts before acquiring a token?)"
                );
            }

            token = jwt.sign(jwtToken, this._privateCert, { algorithm: "RS384" });
        }

        log(token);

        const formData: any = {
            grant_type: "client_credentials",
            client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            client_assertion: token,
        };

        const result = new URLSearchParams();

        for (const key of Object.keys(formData)) {
            result.append(key, formData[key]);
        }
        log(result);
        return result;
    }

    /**
     * Acquires the /exchange token and stores it in _assertionResponse.
     *
     * @private
     * @returns {Promise<boolean>}
     * @memberof AgentAuth
     */
    private async AquireToken(): Promise<boolean> {
        const url = `${this._configuration.content.baseUrl}/api/agentmanagement/v3/oauth/token`;
        const headers = this._urlEncodedHeaders;
        const body = this.CreateClientAssertion().toString();

        log(`Acquire Token Headers ${JSON.stringify(headers)} Url: ${url} Body: ${body.toString()}`);

        try {
            const response = await fetch(url, {
                method: "POST",
                body: body,
                headers: headers,
                agent: this._proxyHttpAgent,
            } as RequestInit);

            if (!response.ok) {
                throw new Error(`${response.statusText} ${await response.text()}`);
            }

            if (response.status >= 200 && response.status <= 299) {
                const json = await response.json();
                log(`AcquireToken Response ${JSON.stringify(json)}`);
                this._accessToken = <AccessToken>json;
                return true;
            } else {
                throw new Error(`invalid response ${JSON.stringify(response)}`);
            }
            // process body
        } catch (err) {
            log(err);

            const hint = this.isSecretExpired()
                ? "the client secret has expired, you will have to onboard the agent again"
                : "possible cause for this error is invalid date/time on the device";

            throw new Error(
                `Network error occured ${err.message} (hint: ${hint}) see also: https://opensource.mindsphere.io/docs/mindconnect-nodejs/troubleshooting.html`
            );
        }
    }

    private isSecretExpired(): boolean {
        if (!this._configuration?.response?.client_secret_expires_at) {
            return false;
        }

        if (isNaN(this._configuration?.response?.client_secret_expires_at)) {
            return false;
        }

        const now = Math.floor(Date.now() / 1000);
        const secondsLeft = this._configuration.response.client_secret_expires_at - now;
        return secondsLeft < 0;
    }

    private async GetCertificate(): Promise<object> {
        const url = `${this._configuration.content.baseUrl}/api/agentmanagement/v3/oauth/token_key`;
        const headers = this._headers;
        log(`Validate Token Headers ${JSON.stringify(headers)} Url: ${url}`);
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: headers,
                agent: this._proxyHttpAgent,
            } as RequestInit);

            if (!response.ok) {
                throw new Error(`${response.statusText} ${await response.text()}`);
            }

            if (response.status >= 200 && response.status <= 299) {
                const json = await response.json();
                log(`OauthPublicKeyResponse ${JSON.stringify(json)}`);
                this._oauthPublicKey = <TokenKey>json;
                return json;
            } else {
                throw new Error(`invalid response ${JSON.stringify(response)}`);
            }
            // process body
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    /**
     * Validates /exchange token on the client. If the certificate is not available retrieves certificate from /oauth/token_key endpoint
     * acnd caches it in _oauthPublicKey property for the lifetime of the agent.
     *
     * @private
     * @returns {Promise<boolean>}
     * @memberof AgentAuth
     */
    private async ValidateToken(): Promise<boolean> {
        if (!this._accessToken) throw new Error("The token needs to be acquired first before validation.");

        if (!this._oauthPublicKey) {
            await retry(5, () => this.GetCertificate());
        }

        if (!this._oauthPublicKey) {
            throw new Error("couldnt read client certificate!");
        }

        log(this._oauthPublicKey.value);
        const publicKeyWithLineBreaks = this._oauthPublicKey.value
            .replace("-----BEGIN PUBLIC KEY-----", "-----BEGIN PUBLIC KEY-----\n")
            .replace("-----END PUBLIC KEY-----", "\n-----END PUBLIC KEY-----");
        if (!this._accessToken.access_token) throw new Error("Invalid access token");

        const result = jwt.verify(this._accessToken.access_token, publicKeyWithLineBreaks);
        return result ? true : false;
    }

    /**
     * The /exchange token handling. Handles validation, secret renewal and token renewal. Should be called
     * at the beginning of each operation which handles /exchange endpoint.
     * @private
     * @returns {Promise<boolean>}
     * @memberof AgentAuth
     */
    public async RenewToken(): Promise<boolean> {
        if (!this._configuration.response) {
            throw new Error("the device was not onborded or the response was deleted");
        }

        if (this._accessToken) {
            try {
                await this.ValidateToken();
            } catch (err) {
                log("jwt exchange token expired - renewing");
                this._accessToken = undefined;
                if (err.name === "JsonWebTokenError" && err.message === "invalid signature") {
                    log("invalid certificate - renewing");
                    this._oauthPublicKey = undefined;
                }
            }
        }

        if (!this._configuration.response.client_secret_expires_at) {
            throw new Error("Client secret expires at is undefined!");
        }

        const now = Math.floor(Date.now() / 1000);

        const secondsLeft = this._configuration.response.client_secret_expires_at - now;

        if (this._configuration.response.client_secret_expires_at - 25 * 3600 <= now) {
            log(`client secret will expire in ${secondsLeft} seconds - renewing`);
            try {
                await this.secretLock.acquire("secretLock", async () => {
                    await retry(5, () => this.RotateKey());
                    this._accessToken = undefined; // delete the token it will need to be regenerated with the new key
                });
            } catch (err) {
                log(
                    `There is a problem rotating the client secrets. The client secret ${
                        secondsLeft > 0 ? "will expire in" : "has expired since"
                    } ${Math.abs(secondsLeft)} seconds. The error was ${err}`
                );

                try {
                    log("trying recovery");
                    const recovery = await this.TryRecovery();
                    const message = recovery ? "Recovery succedded" : "Recovery failed";
                    log(message);
                } catch (recoveryError) {
                    log(`Recovery failed with ${recoveryError.message}`);
                }
            }
        }

        if (!this._accessToken) {
            await retry(5, () => this.AquireToken());
            await this.ValidateToken();
            if (!this._accessToken) throw new Error("Error aquiering the new token!");
            log("New token acquired");
        }

        return true;
    }

    /**
     * Returns the current agent token.
     * This token can be used in e.g. in Postman to call mindspher APIs.
     *
     * @returns {(Promise<string>)}
     *
     * @memberOf AgentAuth
     */
    public async GetAgentToken(): Promise<string> {
        return await this.GetToken();
    }

    public async GetToken(): Promise<string> {
        await this.RenewToken();
        if (!this._accessToken || !this._accessToken.access_token) throw new Error("Error getting the new token!");
        return this._accessToken.access_token;
    }

    private _profile: string;

    /**
     * returns the security profile of the agent
     *
     * @returns "SHARED_SECRET" || "RSA_3072"
     *
     * @memberOf AgentAuth
     */
    public GetProfile() {
        return this._profile;
    }

    private _privateCert?: string;
    private _publicJwk?: object;

    /**
     * Set up the certificate for RSA_3072 communication.
     * You can generate a certificate e.g. using openssl
     * openssl genrsa -out private.key 3072
     *
     * @param {(string | Buffer)} privateCert
     *
     * @memberOf AgentAuth
     */
    public SetupAgentCertificate(privateCert: string | Buffer) {
        if (this.GetProfile() !== "RSA_3072") {
            throw new Error("The certificates are required only for RSA_3072 configuration!");
        }

        if (!privateCert) {
            throw new Error("you need to create the certificate for the agent and provide the path to the agent");
        }

        this._privateCert = privateCert.toString();
        this._publicJwk = rsaPemToJwk(this._privateCert, { kid: "mindconnect-key-1" }, "public");
        log(this._publicJwk);
    }

    protected _storage?: IConfigurationStorage;
    protected _configuration: IMindConnectConfiguration;
    /**
     * Creates an instance of AgentAuth.
     * @param {IMindConnectConfiguration} _configuration
     * @param {number} [_tokenValidity=600] // this was required in previous versions of the implmentation , kept for compatibility.
     * @param {string} [_basePath=process.cwd() + "/.mc/"]
     * @memberof AgentAuth
     */
    constructor(
        configuration: IMindConnectConfiguration,
        protected _tokenValidity: number = 600,
        basePath: string | IConfigurationStorage = process.cwd() + "/.mc/"
    ) {
        super();
        log(`constructor called with parameters: configuration: ${JSON.stringify(configuration)} path: ${basePath}`);

        if (!configuration || !configuration.content) throw new Error("Invalid configuration!");

        if (typeof basePath === "string") {
            this._storage = new DefaultStorage(basePath);
        } else if (IsConfigurationStorage(basePath)) {
            this._storage = basePath;
        } else {
            throw new Error("you have to specify either a directory or configuration storage");
        }

        this._configuration = this._storage.GetConfig(configuration);

        this._profile = `${this._configuration.content.clientCredentialProfile}`;
        if (["SHARED_SECRET", "RSA_3072"].indexOf(this._profile) < 0) {
            throw new Error(
                "Configuration profile not supported. The library only supports the shared_secret and RSA_3072 config profiles"
            );
        }
        log(`Agent configuration with ${this._profile}`);

        this.secretLock = new AsyncLock({});
    }
    GetTenant(): string {
        return this._configuration.content.tenant!;
    }
    GetGateway(): string {
        return this._configuration.content.baseUrl!;
    }
}
