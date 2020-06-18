import { IMindConnectConfiguration } from "../../mindconnect-models";

export interface MindSphereCredentials {
    basicAuth: string;
    gateway: string;
    tenant: string;
}

export interface AgentCredentials extends IMindConnectConfiguration {}

export interface UserCredentials extends MindSphereCredentials {}

export interface TenantCredentials extends MindSphereCredentials {
    subTenant?: string;
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

export function isTokenManagerAuth(obj: any): boolean {
    return obj && obj.gateway && obj.basicAuth && obj.tenant && obj.appName && obj.appVersion && obj.usertenant;
}

export function isCredentialAuth(obj: any): boolean {
    return obj && obj.gateway && obj.basicAuth && obj.tenant && !obj.appName && !obj.appVersion && !obj.usertenant;
}
