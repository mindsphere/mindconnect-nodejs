import * as debug from "debug";
import fetch from "node-fetch";
import { AuthBase } from "./auth-base";
import { TokenRotation } from "./mindconnect-base";
import { getPiamUrl } from "./utils";

const log = debug("mindconnect-credentialauth");

export class CredentialAuth extends AuthBase implements TokenRotation {
    protected async AcquireToken(): Promise<boolean> {
        const headers = {
            ...this._urlEncodedHeaders,
            Authorization: this._basicAuth,
        };
        const url = `${getPiamUrl(this._gateway, this._tenant)}oauth/token`;
        log(`AcquireToken Headers: ${JSON.stringify(headers)} Url: ${url}`);
        const body = "grant_type=client_credentials";

        try {
            const response = await fetch(url, {
                method: "POST",
                body: body,
                headers: headers,
                agent: this._proxyHttpAgent,
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

    /**
     * Returns the current agent token.
     * This token can be used in e.g. in Postman to call mindspher APIs.
     *
     * @returns {(Promise<string>)}
     *
     * @memberOf AgentAuth
     */
    public async GetToken(): Promise<string> {
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
        super(_gateway, _basicAuth, _tenant);
    }
}
