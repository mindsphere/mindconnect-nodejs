import { CredentialAuth } from "../../credential-auth";

export abstract class SdkClient extends CredentialAuth {
    public async GetToken() {
        return await this.GetServiceToken();
    }
    public GetGateway() {
        return this._gateway;
    }

    public GetTenant() {
        return this._tenant;
    }
}

export type SdkConfiguration = {
    gateway: string;
    basicAuth: string;
    tenant: string;
};

export function isSdkConfiguration(obj: any): obj is SdkConfiguration {
    return obj && obj.gateway && obj.basicAuth && obj.tenant;
}
