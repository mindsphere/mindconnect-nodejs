export interface MindSphereCredentials {
    basicAuth: string;
    gateway: string;
    tenant: string;
}

export interface UserCredentials extends MindSphereCredentials {}

export interface TenantCredentials extends MindSphereCredentials {
    subTenant?: string;
}

export interface AppCredentials extends MindSphereCredentials {
    appName: string;
    appVersion: string;
    usertenant: string;
}

export function isTokenManagerAuth(obj: any): boolean {
    return obj && obj.gateway && obj.basicAuth && obj.tenant && obj.appName && obj.appVersion && obj.usertenant;
}

export function isCredentialAuth(obj: any): boolean {
    return obj && obj.gateway && obj.basicAuth && obj.tenant && !obj.appName && !obj.appVersion && !obj.usertenant;
}
