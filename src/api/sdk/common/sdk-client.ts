import { CredentialAuth } from "../../credential-auth";
import { AssetManagementClient } from "../asset/asset-management";

export abstract class SdkClient extends CredentialAuth {
    public async GetToken() {
        return await this.GetServiceToken();
    }
    public GetGateway() {
        return this._gateway;
    }
}

export type SdkConfiguration = {
    gateway: string;
    basicAuth: string;
    tenant: string;
};

function isSdkConfiguration(obj: any): obj is SdkConfiguration {
    return obj && obj.gateway && obj.basicAuth && obj.tenant;
}
export class MindSphereSdk {
    private _assetManagementClient?: AssetManagementClient;
    public GetAssetManagementClient(): AssetManagementClient {
        this._assetManagementClient =
            this._assetManagementClient || new AssetManagementClient(this._gateway, this._basicAuth, this._tenant);
        return this._assetManagementClient;
    }

    public GetTenant() {
        return this._tenant;
    }

    private _gateway: string;
    private _basicAuth: string;
    private _tenant: string;

    constructor();
    constructor(gateway: string, basicAuth: string, tenant: string);
    constructor(sdkConfiguration: string | SdkConfiguration);
    constructor(gatewayOrOptions?: string | SdkConfiguration, basicAuth?: string, tenant?: string) {
        if (gatewayOrOptions === undefined) {
            throw new Error("not implemented yet!");
        }
        if (isSdkConfiguration(gatewayOrOptions)) {
            this._gateway = gatewayOrOptions.gateway;
            this._basicAuth = gatewayOrOptions.basicAuth;
            this._tenant = gatewayOrOptions.tenant;
        } else if (
            typeof gatewayOrOptions === "string" &&
            typeof basicAuth === "string" &&
            typeof tenant === "string"
        ) {
            this._gateway = gatewayOrOptions;
            this._basicAuth = basicAuth;
            this._tenant = tenant;
        } else {
            throw new Error("invalid constructor, see documentation");
        }
    }
}
