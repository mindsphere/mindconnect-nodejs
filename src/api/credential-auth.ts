import * as debug from "debug";
import * as jwt from "jsonwebtoken";
import fetch from "node-fetch";
import { MindConnectBase, TokenRotation } from "./mindconnect-base";
import { getPiamUrl, isUrl } from "./utils";

const log = debug("mindconnect-credentialauth");

export abstract class CredentialAuth extends MindConnectBase implements TokenRotation {
    protected _accessToken?: any;
    protected _oauthResponse?: any;
    protected _publicKey: any;

    private async AcquireToken(): Promise<boolean> {
        const headers = { ...this._urlEncodedHeaders, Authorization: this._basicAuth };
        const url = `${getPiamUrl(this._gateway, this._tenant)}oauth/token`;
        log(`AcquireToken Headers: ${JSON.stringify(headers)} Url: ${url}`);
        const body = "grant_type=client_credentials";

        try {
            const response = await fetch(url, {
                method: "POST",
                body: body,
                headers: headers,
                agent: this._proxyHttpAgent
            });
            if (!response.ok) {
                throw new Error(`${response.statusText} ${await response.text()}`);
            }
            if (response.status >= 200 && response.status <= 299) {
                const json = await response.json();
                log(`AcquireToken Response ${JSON.stringify(json)}`);
                this._accessToken = json;
            } else {
                throw new Error(`invalid response ${JSON.stringify(response)}`);
            }
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
        return true;
    }

    private async ValidateToken(): Promise<boolean> {
        await this.AcquirePublicKey();
        const publicKey = this._oauthResponse.keys[0].value;
        if (!this._accessToken.access_token) throw new Error("Invalid access token");

        const result = jwt.verify(this._accessToken.access_token, publicKey);
        log("Token validated, still good");
        return result ? true : false;
    }

    private async AcquirePublicKey(): Promise<boolean> {
        if (!this._oauthResponse) {
            const headers = this._urlEncodedHeaders;
            const url = `${getPiamUrl(this._gateway, this._tenant)}token_keys`;
            log(`AcquirePublicKey Headers: ${JSON.stringify(headers)} Url: ${url}`);

            try {
                const response = await fetch(url, { method: "GET", headers: headers, agent: this._proxyHttpAgent });
                if (!response.ok) {
                    throw new Error(`${response.statusText} ${await response.text()}`);
                }
                if (response.status >= 200 && response.status <= 299) {
                    const json = await response.json();
                    log(`OauthPublicKey Response ${JSON.stringify(json)}`);
                    this._oauthResponse = json;
                } else {
                    throw new Error(`invalid response ${JSON.stringify(response)}`);
                }
            } catch (err) {
                log(err);
                throw new Error(`Network error occured ${err.message}`);
            }
        }
        return true;
    }

    public async RenewToken(): Promise<boolean> {
        if (this._accessToken) {
            try {
                await this.ValidateToken();
            } catch (err) {
                log(`jwt exchange token expired - renewing : ${err}`);
                this._accessToken = undefined;
                if (err.name === "JsonWebTokenError" && err.message === "invalid signature") {
                    log("invalid certificate - renewing");
                    this._oauthResponse = undefined;
                }
            }
        }

        if (!this._accessToken) {
            await this.AcquireToken();
            await this.ValidateToken();
            if (!this._accessToken) {
                throw new Error("Error aquiering the new token!");
            }
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
    public async GetServiceToken(): Promise<string> {
        await this.RenewToken();
        if (!this._accessToken || !this._accessToken.access_token) throw new Error("Error getting the new token!");
        return this._accessToken.access_token;
    }

    /**
     * Creates an instance of CredentialAuth.
     * @param {string} _gateway
     * @param {string} _basicAuth
     * @param {string} _tenant
     *
     * @memberOf CredentialAuth
     */
    constructor(protected _gateway: string, protected _basicAuth: string, protected _tenant: string) {
        super();
        if (!_basicAuth || !_basicAuth.startsWith("Basic")) {
            throw new Error(
                "You have to pass the basic authentication header (Basic: <base64encoded login:password> in the constructor. Wrong Passkey in CLI?"
            );
        }

        if (!isUrl(_gateway)) {
            throw new Error("the gateway must be an URL (e.g. https://gateway.eu1.mindsphere.io");
        }

        if (!_tenant) {
            throw new Error("You have to provide a tenant");
        }
    }
}
