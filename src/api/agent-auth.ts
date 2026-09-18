import * as AsyncLock from "async-lock";
import fetch from "cross-fetch";
import * as debug from "debug";
import * as jwt from "jsonwebtoken";
import "url-search-params-polyfill";
import * as uuid from "uuid";
import { MindConnectBase, TokenRotation } from "./mindconnect-base";
import {
    AccessToken,
    IMindConnectConfiguration,
    OnboardingStatus,
    SelfSignedClientAssertion,
    TokenKey,
} from "./mindconnect-models";
import { DefaultStorage, IConfigurationStorage, IsConfigurationStorage } from "./mindconnect-storage";
import { retry } from "./utils";

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
        const url = `${this.AgentManagementGateway()}${this.AgentManagementBaseUrl()}/register`;

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
        const url = `${this.AgentManagementGateway()}${this.AgentManagementBaseUrl()}/oauth/token`;
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
                `Network error occured ${err.message} (hint: ${hint}) see also: https://developer.siemens.com/industrial-iot-open-source/mindconnect-nodejs/troubleshooting.html`
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
        const url = `${this.AgentManagementGateway()}${this.AgentManagementBaseUrl()}/oauth/token_key`;
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
     * Checks a jku hostname against the set of hosts we're willing to fetch signing keys from.
     *
     * The jku header claim comes from the token itself, i.e. it is *not yet* trusted at the point
     * we need to decide whether to fetch it - blindly following it would let anyone who can forge/
     * substitute a token (e.g. a compromised gateway or MITM) redirect key lookup to a server they
     * control, defeating signature verification entirely (the classic jku header-injection bypass,
     * cf. CVE-2018-0114).
     *
     * By default only `<coreTenantId>.<region>.sws.siemens.com` is trusted: that's a Siemens-owned
     * domain (registering a subdomain there requires access to Siemens' own DNS, a much higher bar
     * than pointing jku at an attacker-controlled host), and the `<coreTenantId>` segment is cross-
     * checked against our *own configured* value (from GetCoreTenantId()) rather than anything the
     * token itself claims, so a forged token can't redirect key lookup to a different, still-
     * Siemens-hosted tenant's key endpoint either.
     *
     * Different Insights Hub deployments/stamps may use other, currently unknown-to-us host
     * conventions - rather than guessing/hardcoding those upfront (and risking silently breaking
     * them), operators can opt in explicitly via the MDSP_TRUSTED_JKU_HOSTS environment variable
     * (comma separated exact hostnames or `*.`-prefixed wildcard patterns). This only *adds* to the
     * default check, it never replaces/weakens it.
     *
     * @private
     * @param {string} hostname
     * @returns {boolean}
     * @memberof AgentAuth
     */
    private IsTrustedJkuHost(hostname: string): boolean {
        const coreTenantId = this.GetCoreTenantId();
        const defaultPattern = coreTenantId
            ? new RegExp(`^${_.escapeRegExp(coreTenantId)}\\.[a-z0-9-]+\\.sws\\.siemens\\.com$`, "i")
            : undefined;

        if (defaultPattern && defaultPattern.test(hostname)) return true;

        const extraHosts = (process.env.MDSP_TRUSTED_JKU_HOSTS || "")
            .split(",")
            .map((x) => x.trim())
            .filter((x) => x.length > 0);

        return extraHosts.some((allowed) => {
            if (allowed.startsWith("*.")) {
                return hostname.toLowerCase().endsWith(allowed.slice(1).toLowerCase());
            }
            return hostname.toLowerCase() === allowed.toLowerCase();
        });
    }

    /**
     * Fallback used when the documented /oauth/token_key endpoint returns a key that doesn't match
     * the one that actually signed the access token. Resolves the real signing key from the token's
     * own `jku` header claim (the issuer's own key store) instead of trusting the gateway's endpoint.
     *
     * The jku claim is only followed if IsTrustedJkuHost() accepts its host - see that method for
     * why blindly trusting it would be a security bypass.
     *
     * @private
     * @returns {Promise<TokenKey>}
     * @memberof AgentAuth
     */
    private async GetCertificateFromJku(): Promise<TokenKey> {
        if (!this._accessToken?.access_token) throw new Error("Invalid access token");

        const decoded = jwt.decode(this._accessToken.access_token, { complete: true }) as {
            header?: { jku?: string; kid?: string };
        } | null;
        const jku = decoded?.header?.jku;
        const kid = decoded?.header?.kid;

        if (!jku) {
            throw new Error(
                "couldnt validate token: /oauth/token_key key didn't match and the token has no jku claim to fall back to"
            );
        }

        let jkuUrl: URL;
        try {
            jkuUrl = new URL(jku);
        } catch (err) {
            throw new Error(`couldnt validate token: jku claim "${jku}" is not a valid URL`);
        }

        if (jkuUrl.protocol !== "https:" || !this.IsTrustedJkuHost(jkuUrl.hostname)) {
            throw new Error(
                `couldnt validate token: jku host "${jkuUrl.hostname}" is not a trusted key-issuer host ` +
                    `(expected https://${this.GetCoreTenantId() || "<coreTenantId>"}.<region>.sws.siemens.com). ` +
                    "If this is a legitimate deployment with a different convention, add it via " +
                    "MDSP_TRUSTED_JKU_HOSTS (comma separated hostnames or *.-prefixed wildcard patterns)."
            );
        }

        log(`Fetching signing key from token issuer (jku claim): ${jku}`);
        const headers = this._headers;
        try {
            const response = await fetch(jku, {
                method: "GET",
                headers: headers,
                agent: this._proxyHttpAgent,
            } as RequestInit);

            if (!response.ok) {
                throw new Error(`${response.statusText} ${await response.text()}`);
            }

            const json = await response.json();
            log(`jku key response ${JSON.stringify(json)}`);
            const keys: TokenKey[] = json.keys || [];
            const key = kid ? keys.find((x) => x.kid === kid) : keys[0];

            if (!key) {
                throw new Error(`couldnt find signing key with kid ${kid} at jku endpoint ${jku}`);
            }

            return key;
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    private VerifyWithPemKey(pemValue: string, token: string): boolean {
        // Some endpoints return the PEM body already split across lines, others as a single line.
        // Strip any existing line breaks first so re-wrapping the header/footer is always safe -
        // inserting a newline next to one that's already there produces an invalid, unparsable PEM
        // (silently downgraded by jsonwebtoken to a secret key, causing a confusing "invalid algorithm").
        const publicKeyWithLineBreaks = pemValue
            .replace(/\r?\n/g, "")
            .replace("-----BEGIN PUBLIC KEY-----", "-----BEGIN PUBLIC KEY-----\n")
            .replace("-----END PUBLIC KEY-----", "\n-----END PUBLIC KEY-----");

        const result = jwt.verify(token, publicKeyWithLineBreaks);
        return result ? true : false;
    }

    /**
     * Validates /exchange token on the client. If the certificate is not available retrieves certificate from /oauth/token_key endpoint
     * acnd caches it in _oauthPublicKey property for the lifetime of the agent.
     *
     * If the documented /oauth/token_key endpoint returns a key that doesn't match the token's real
     * signer (a known gateway defect - see insights-hub-gateway-migration-shim/FINDINGS.md), this logs
     * a warning and falls back to the key referenced by the token's own jku claim.
     *
     * @private
     * @returns {Promise<boolean>}
     * @memberof AgentAuth
     */
    private async ValidateToken(): Promise<boolean> {
        if (!this._accessToken) throw new Error("The token needs to be acquired first before validation.");
        if (!this._accessToken.access_token) throw new Error("Invalid access token");

        if (!this._oauthPublicKey) {
            await retry(5, () => this.GetCertificate());
        }

        if (!this._oauthPublicKey) {
            throw new Error("couldnt read client certificate!");
        }

        log(this._oauthPublicKey.value);

        try {
            return this.VerifyWithPemKey(this._oauthPublicKey.value, this._accessToken.access_token);
        } catch (err) {
            if (err.name !== "JsonWebTokenError") {
                throw err;
            }

            console.warn(
                "warning: the /oauth/token_key endpoint returned a signing key that doesn't match the access token - " +
                    "falling back to the key referenced by the token's own jku claim (see also: https://developer.siemens.com/industrial-iot-open-source/mindconnect-nodejs/troubleshooting.html)"
            );

            const jkuKey = await this.GetCertificateFromJku();
            this._oauthPublicKey = jkuKey;
            return this.VerifyWithPemKey(jkuKey.value, this._accessToken.access_token);
        }
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
        // This is also what backs MindSphereSdk/AgentManagementClient's ServiceBaseUrl()-agnostic
        // callers (data source configuration, mappings, ...) via the Sdk() wrapper below - so it
        // needs the same fds.baseUrl preference as AgentManagementGateway(), not just content.baseUrl.
        return this.AgentManagementGateway();
    }
    GetCoreTenantId(): string {
        // Note: this reads the "systemId" key from the onboarding file JSON as issued by the
        // server (wire format) - do not rename that key, only our own getter method name.
        // Some onboarding responses nest the same id under fds.mntTenant instead - honor that too.
        return this._configuration.content.systemId || this._configuration.content.fds?.mntTenant || "";
    }

    /**
     * Base url used for the agent management endpoints (register, token, token_key). Prefers the
     * Xcelerator gateway (content.fds.baseUrl) when the onboarding response provides one, since that
     * is where the tenant-id-embedded paths built by ServiceBaseUrl() are actually routed. Falls back
     * to the regular content.baseUrl otherwise (on-premise, legacy tenants, or older onboarding files).
     *
     * @protected
     * @memberof AgentAuth
     */
    protected AgentManagementGateway(): string {
        return this._configuration.content.fds?.baseUrl || this._configuration.content.baseUrl!;
    }

    /**
     * Builds a service base url, honoring the Xcelerator core tenant id when the onboarding file provides one.
     * Falls back to the legacy /api/<serviceName>/<version> path otherwise (on-premise, legacy tenants).
     *
     * @protected
     * @memberof AgentAuth
     */
    protected ServiceBaseUrl(serviceName: string, version: string): string {
        const coreTenantId = this.GetCoreTenantId();
        return coreTenantId ? `/${serviceName}-${coreTenantId}/${version}` : `/api/${serviceName}/${version}`;
    }

    /**
     * Builds the agentmanagement base url, honoring the Xcelerator core tenant id when the onboarding file provides one.
     * Falls back to the legacy /api/agentmanagement/v3 path otherwise (on-premise, legacy tenants).
     *
     * @private
     * @memberof AgentAuth
     */
    private AgentManagementBaseUrl(): string {
        return this.ServiceBaseUrl("agentmanagement", "v3");
    }
}
