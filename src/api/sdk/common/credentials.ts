import { IMindConnectConfiguration } from "../../mindconnect-models";

export interface MindSphereCredentials {
    basicAuth: string;
    gateway: string;
    tenant: string;
    coreTenantId?: string;
    /**
     * Xcelerator customer tenant id (OAuth/PIAM identity zone id), used to build the
     * https://<customerTenantId>.<region>.sws.siemens.com/ auth urls.
     * This can be a *different* id than the API `coreTenantId` (the identity zone
     * and the API system are provisioned/assigned independently). Leave empty
     * to fall back to `coreTenantId` (the common case where both ids are equal).
     */
    customerTenantId?: string;
}

export interface AgentCredentials extends IMindConnectConfiguration {}

export interface ServiceCrendtials extends MindSphereCredentials {
    subTenant?: string; // not supported yet
}

export interface AppCredentials extends MindSphereCredentials {
    appName: string;
    appVersion: string;
    usertenant: string;
}

export function isAgentAuth(obj: any): boolean {
    return (
        obj &&
        obj.content &&
        obj.content.baseUrl &&
        obj.content.iat &&
        obj.content.clientCredentialProfile &&
        obj.content.clientId &&
        obj.content.tenant &&
        obj.expiration &&
        obj.response &&
        obj.response.client_id &&
        obj.response.token_endpoint_auth_method &&
        obj.response.grant_types &&
        obj.response.client_secret_expires_at &&
        obj.response.registration_access_token &&
        obj.response.registration_client_uri
    );
}

export function isAppCredentials(obj: any): boolean {
    return obj && obj.gateway && obj.basicAuth && obj.tenant && obj.appName && obj.appVersion && obj.usertenant;
}

export function isServiceCredentials(obj: any): boolean {
    return obj && obj.gateway && obj.basicAuth && obj.tenant && !obj.appName && !obj.appVersion && !obj.usertenant;
}
