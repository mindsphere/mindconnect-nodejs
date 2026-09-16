import { BrowserAuth } from "../../browser-auth";
import { CredentialAuth } from "../../credential-auth";
import { isTokenRotation, TokenRotation } from "../../mindconnect-base";
import { TokenManagerAuth } from "../../tokenmanager-auth";
import {
    AppCredentials,
    isAppCredentials,
    isServiceCredentials,
    MindSphereCredentials,
    ServiceCrendtials,
} from "./credentials";

export abstract class SdkClient {
    public async GetToken() {
        return await this._authenticator.GetToken();
    }

    public async RenewToken() {
        return await this._authenticator.RenewToken();
    }

    public GetGateway() {
        return this._authenticator.GetGateway();
    }

    public GetTenant() {
        return this._authenticator.GetTenant();
    }

    /**
     * Returns the currently configured Xcelerator core tenant id, or "" if none is configured
     * (on-premise installations, legacy mindsphere.io tenants, BrowserAuth).
     *
     * @memberOf SdkClient
     */
    public GetCoreTenantId(): string {
        const authenticator = this._authenticator as Partial<TokenRotation>;
        return typeof authenticator.GetCoreTenantId === "function" ? authenticator.GetCoreTenantId() : "";
    }

    /**
     * Builds the base url for a MindSphere/Insights Hub service.
     *
     * When a coreTenantId is configured, the new Xcelerator scheme is used:
     * /<serviceName>-<coreTenantId>/<version> (or /api/<serviceName>-<coreTenantId>/<version> when apiPrefix is set,
     * required for e.g. messagebroker and notification).
     *
     * Without a coreTenantId (on-premise installations, legacy mindsphere.io tenants, BrowserAuth) the legacy
     * /api/<serviceName>/<version> relative path is used, unchanged from previous SDK versions.
     *
     * @protected
     * @memberOf SdkClient
     */
    protected GetServiceBaseUrl(serviceName: string, version: string, options?: { apiPrefix?: boolean }): string {
        const coreTenantId = this.GetCoreTenantId();
        if (!coreTenantId) {
            return `/api/${serviceName}/${version}`;
        }
        const prefix = options?.apiPrefix ? "/api" : "";
        return `${prefix}/${serviceName}-${coreTenantId}/${version}`;
    }

    public GetUserTenant(): string | undefined {
        if (this._authenticator instanceof TokenManagerAuth) {
            return this._authenticator.GetUserTenant();
        }
        return undefined;
    }

    protected _authenticator: TokenRotation;

    public async HttpAction({
        verb,
        gateway,
        baseUrl,
        authorization,
        body,
        message,
        octetStream,
        multiPartFormData,
        additionalHeaders,
        noResponse,
        rawResponse,
        returnHeaders,
        ignoreCodes,
    }: {
        verb: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
        gateway: string;
        baseUrl: string;
        authorization: string;
        body?: Object;
        message?: string;
        octetStream?: boolean;
        multiPartFormData?: boolean;
        additionalHeaders?: Object;
        noResponse?: boolean;
        rawResponse?: boolean;
        returnHeaders?: boolean;
        ignoreCodes?: number[];
    }): Promise<Object | undefined> {
        return this._authenticator.HttpAction({
            verb,
            gateway,
            baseUrl,
            authorization,
            body,
            message,
            octetStream,
            multiPartFormData,
            additionalHeaders,
            noResponse,
            rawResponse,
            returnHeaders,
            ignoreCodes,
        });
    }

    /**
     * * Creates a client for MinSphere API
     *
     * @param {(TokenRotation | ServiceCrendtials | AppCredentials)} [credentialsOrAuthorizer]
     *
     * you can pass either an instance an Authorizer:
     * UserAuth, BrowserAuth, CredentialsAuth, TokenManagerAuth or MindConnectAgent
     *
     * or a set of Credentials:
     * ServiceCredentials or AppCredentials
     *
     * implement the TokenRotation interface if you want to provide your own authorizer.
     *
     * The default constructor uses frontend authorization.
     *
     * @memberOf SdkClient
     */
    constructor(credentialsOrAuthorizer?: TokenRotation | ServiceCrendtials | AppCredentials) {
        if (credentialsOrAuthorizer === undefined) {
            this._authenticator = new BrowserAuth();
        } else if (isTokenRotation(credentialsOrAuthorizer)) {
            this._authenticator = credentialsOrAuthorizer as TokenRotation;
        } else if (isAppCredentials(credentialsOrAuthorizer)) {
            const appCredentials = credentialsOrAuthorizer as AppCredentials;

            this._authenticator = new TokenManagerAuth(
                appCredentials.gateway,
                appCredentials.basicAuth,
                appCredentials.tenant,
                appCredentials.usertenant,
                appCredentials.appName,
                appCredentials.appVersion,
                appCredentials.coreTenantId,
                appCredentials.customerTenantId
            );
        } else if (isServiceCredentials(credentialsOrAuthorizer)) {
            const credentialsAuth = credentialsOrAuthorizer as MindSphereCredentials;
            this._authenticator = new CredentialAuth(
                credentialsAuth.gateway,
                credentialsAuth.basicAuth,
                credentialsAuth.tenant,
                credentialsAuth.coreTenantId,
                credentialsAuth.customerTenantId
            );
        } else {
            throw new Error("invalid constructor");
        }
    }
}
