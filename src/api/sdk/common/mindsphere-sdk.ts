import { AgentManagementClient } from "../agent/agent-management";
import { AssetManagementClient } from "../asset/asset-management";
import { IotFileClient } from "../iotfile/iot-file";
import { isSdkConfiguration, SdkConfiguration } from "./sdk-client";
export class MindSphereSdk {
    private _assetManagementClient?: AssetManagementClient;
    public GetAssetManagementClient(): AssetManagementClient {
        this._assetManagementClient =
            this._assetManagementClient || new AssetManagementClient(this._gateway, this._basicAuth, this._tenant);
        return this._assetManagementClient;
    }

    private _agentManagementClient?: AgentManagementClient;
    public GetAgentManagementClient(): AgentManagementClient {
        this._agentManagementClient =
            this._agentManagementClient || new AgentManagementClient(this._gateway, this._basicAuth, this._tenant);
        return this._agentManagementClient;
    }

    private _iotFileClient?: IotFileClient;
    public GetIoTFileClient(): IotFileClient {
        this._iotFileClient = this._iotFileClient || new IotFileClient(this._gateway, this._basicAuth, this._tenant);
        return this._iotFileClient;
    }

    public GetTenant() {
        return this._tenant;
    }

    public GetGateway() {
        return this._gateway;
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
