import fetch from "cross-fetch";
import * as debug from "debug";
import { AuthBase } from "./auth-base";
import { TokenRotation } from "./mindconnect-base";
import { isUrl, throwError } from "./utils";

const log = debug("mindconnect-credentialauth");

/**
 * Token Manager Authentication
 *
 * @see https://developer.mindsphere.io/apis/exchange-tokenmanager/api-tokenmanager-overview.html
 *
 * @export
 * @class TokenManagerAuth
 * @extends {AuthBase}
 * @implements {TokenRotation}
 */
export class TokenManagerAuth extends AuthBase implements TokenRotation {
    protected async AcquireToken(): Promise<boolean> {
        const headers = {
            ...this._apiHeaders,
            "X-SPACE-AUTH-KEY": this._basicAuth,
        };
        const url = this._coreTenantId
            ? `${this._gateway}/technicaltokenmanager-${this._coreTenantId}/v3/oauth/token`
            : `${this._gateway}/api/technicaltokenmanager/v3/oauth/token`;
        log(`AcquireToken Headers: ${JSON.stringify(headers)} Url: ${url}`);

        const body = {
            appName: this._appName,
            appVersion: this._appVersion,
            // The OAuth/PIAM token endpoint identifies the tenant by its numeric identity-zone id
            // (customerTenantId), not by its human-readable name - which is what _hostTenant/_userTenant
            // hold and what GetTenant()/GetUserTenant() expose for asset-model qualified names. Fall
            // back to _hostTenant/_userTenant themselves when no customerTenantId is configured (legacy
            // on-premise/SERVICE credentials, where the tenant name and the OAuth identity coincide).
            hostTenant: this._customerTenantId || this._hostTenant,
            userTenant: this._customerTenantId || this._userTenant,
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(body),
                headers: headers,
                agent: this._proxyHttpAgent,
            } as RequestInit);
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
     * This token can be used in e.g. in Postman to call mindsphere APIs.
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
     * User Tenant
     *
     * @returns {string}
     *
     * @memberOf TokenManagerAuth
     */
    public GetUserTenant(): string {
        return this._userTenant;
    }

    /**
     * HostTenant
     *
     * @returns {string}
     *
     * @memberOf TokenManagerAuth
     */
    public GetHostTenant(): string {
        return this._hostTenant;
    }
    /**
     * Creates an instance of TokenManagerAuth.
     * @param {string} _gateway
     * @param {string} _basicAuth
     * @param {string} _hostTenant
     * @param {string} _userTenant
     * @param {string} [_appName]
     * @param {string} [_appVersion]
     * @param {string} [_coreTenantId] Xcelerator core tenant id (leave empty for on-premise / legacy tenants).
     * @param {string} [_customerTenantId] Xcelerator customer tenant id (OAuth/PIAM identity zone id),
     *                             usually different from _coreTenantId and normally must be set explicitly.
     *
     * @memberOf TokenManagerAuth
     */
    constructor(
        protected _gateway: string,
        protected _basicAuth: string,
        protected _hostTenant: string,
        protected _userTenant: string,
        protected _appName: string = "cli",
        protected _appVersion: string = "1.0.0",
        protected _coreTenantId: string = "",
        protected _customerTenantId: string = ""
    ) {
        super(_gateway, _basicAuth, _hostTenant, _coreTenantId, _customerTenantId);

        (!_basicAuth || !_basicAuth.startsWith("Basic")) &&
            throwError(
                "You have to pass the basic authentication header (Basic: <base64encoded login:password> in the constructor. Wrong Passkey in CLI?"
            );

        !isUrl(_gateway) && throwError("the gateway must be an URL (e.g. https://api.eu1.siemens.app");

        !_hostTenant && throwError("You have to provide a host tenant");
        !_userTenant && throwError("You have to provide a user tenant");
        !_appName && throwError("You have to provide the app name");
        !_appVersion && throwError("You have to provide the app version");
    }
}
