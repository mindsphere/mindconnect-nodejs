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
     * Returns the currently configured Xcelerator customer tenant id (OAuth/PIAM identity zone
     * id), with no fallback to the core tenant id - "" if not explicitly configured. Used
     * (together with GetCoreTenantId()) to build the
     * <customerTenantId>-<appName>-<coreTenantId>.<region>.siemens.app application links (Asset
     * Manager, Operations Insight, ...); building those links with a wrong guess would be worse
     * than not showing them, so no fallback is used here.
     *
     * @memberOf SdkClient
     */
    public GetCustomerTenantId(): string {
        const authenticator = this._authenticator as Partial<TokenRotation>;
        return typeof authenticator.GetRawCustomerTenantId === "function"
            ? authenticator.GetRawCustomerTenantId()
            : "";
    }

    /**
     * Builds the URL of a tenant-specific Xcelerator/MindSphere application (Asset Manager,
     * Operations Insight, ...) for a given entity path, e.g. GetAppUrl("assetmanager",
     * `/entity/${assetId}`).
     *
     * On Xcelerator tenants (coreTenantId + customerTenantId both configured) this builds
     * https://<customerTenantId>-<appName>-<coreTenantId>.<region>.siemens.app<path> - the
     * gateway host (api.<region>.siemens.app) itself does not serve these UI applications, so the
     * legacy gateway.replace("gateway", ...) trick (which only worked for the old
     * gateway.<tenant>.<region>.mindsphere.io hosts) is not applicable here and would silently
     * produce a broken link (https://api.<region>.siemens.app<path>, with no app subdomain at
     * all) since there is no "gateway" substring in api.<region>.siemens.app to replace.
     *
     * Returns "" (instead of a guessed/broken link) when the Xcelerator region can't be
     * determined, or a coreTenantId is configured but no customerTenantId is - since both ids are
     * required and are normally *different* values, so guessing one from the other would produce
     * a wrong link.
     *
     * Falls back to the legacy gateway.replace("gateway", `${tenant}-${appName}`) behavior,
     * unchanged, when no coreTenantId is configured at all (on-premise installations, legacy
     * mindsphere.io tenants).
     *
     * @memberOf SdkClient
     */
    public GetAppUrl(appName: string, path: string, legacyReplaceToken: string = "gateway"): string {
        const coreTenantId = this.GetCoreTenantId();
        if (!coreTenantId) {
            return `${this.GetGateway().replace(legacyReplaceToken, `${this.GetTenant()}-${appName}`)}${path}`;
        }

        const customerTenantId = this.GetCustomerTenantId();
        const xceleratorRegion = this.GetGateway().match(/^https?:\/\/api\.([^./]+)\.siemens\.app/i);
        if (!customerTenantId || !xceleratorRegion) {
            return "";
        }

        return `https://${customerTenantId}-${appName}-${coreTenantId}.${xceleratorRegion[1]}.siemens.app${path}`;
    }

    /**
     * Builds the base url for a MindSphere/Insights Hub service.
     *
     * When a coreTenantId is configured, the new Xcelerator scheme is used:
     * /api/<serviceName>-<coreTenantId>/<version>. The /api prefix is always included here -
     * confirmed required when calls are made relative to an embedded app's own
     * <customerTenantId>-<appName>-<coreTenantId>.<region>.siemens.app origin (e.g. via
     * BrowserAuth), since that origin also serves the app's static frontend and uses /api to
     * route API calls; the api.<region>.siemens.app gateway tolerates the prefix either way.
     *
     * Without a coreTenantId (on-premise installations, legacy mindsphere.io tenants) the legacy
     * /api/<serviceName>/<version> relative path is used, unchanged from previous SDK versions.
     *
     * @protected
     * @memberOf SdkClient
     */
    protected GetServiceBaseUrl(serviceName: string, version: string): string {
        const coreTenantId = this.GetCoreTenantId();
        if (!coreTenantId) {
            return `/api/${serviceName}/${version}`;
        }
        return `/api/${serviceName}-${coreTenantId}/${version}`;
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
