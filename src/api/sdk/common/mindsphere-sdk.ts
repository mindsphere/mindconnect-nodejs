import { AgentManagementClient } from "../agent/agent-management";
import { AssetManagementClient } from "../asset/asset-management";
import { EventManagementClient } from "../event/event-management";
import { TimeSeriesClient } from "../iot/iot-timeseries";
import { TimeSeriesBulkClient } from "../iotbulk/iot-timeseries-bulk";
import { IotFileClient } from "../iotfile/iot-file";
import { isSdkConfiguration, SdkConfiguration } from "./sdk-client";
/**
 * * Pre-Alpha SDK for the mindsphere APIs
 *
 * ! You can experiment with this but please note that these interfaces will
 * ! will change in the next major version. See also CHANGELOG.md
 *
 * @export
 * @class MindSphereSdk
 */
export class MindSphereSdk {
    private _assetManagementClient?: AssetManagementClient;
    /**
     * * Asset Management
     *
     * @returns {AssetManagementClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetAssetManagementClient(): AssetManagementClient {
        this._assetManagementClient =
            this._assetManagementClient || new AssetManagementClient(this._gateway, this._basicAuth, this._tenant);
        return this._assetManagementClient;
    }

    private _agentManagementClient?: AgentManagementClient;

    /**
     * * Agent Management
     *
     * @returns {AgentManagementClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetAgentManagementClient(): AgentManagementClient {
        this._agentManagementClient =
            this._agentManagementClient || new AgentManagementClient(this._gateway, this._basicAuth, this._tenant);
        return this._agentManagementClient;
    }

    private _iotFileClient?: IotFileClient;

    /**
     * * Iot File
     *
     * @returns {IotFileClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetIoTFileClient(): IotFileClient {
        this._iotFileClient = this._iotFileClient || new IotFileClient(this._gateway, this._basicAuth, this._tenant);
        return this._iotFileClient;
    }

    private _tsBulkClient?: TimeSeriesBulkClient;

    /**
     * * Time Series Bulk
     *
     * @returns {TimeSeriesBulkClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetTimeSeriesBulkClient(): TimeSeriesBulkClient {
        this._tsBulkClient =
            this._tsBulkClient || new TimeSeriesBulkClient(this._gateway, this._basicAuth, this._tenant);
        return this._tsBulkClient;
    }

    private _timeSeriesClient?: TimeSeriesClient;

    /**
     * * Time Series
     *
     * @returns {TimeSeriesClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetTimeSeriesClient(): TimeSeriesClient {
        this._timeSeriesClient =
            this._timeSeriesClient || new TimeSeriesClient(this._gateway, this._basicAuth, this._tenant);
        return this._timeSeriesClient;
    }

    private _eventManagementClient?: EventManagementClient;

    /**
     * * Event Management
     *
     * @returns {EventManagementClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetEventManagementClient(): EventManagementClient {
        this._eventManagementClient =
            this._eventManagementClient || new EventManagementClient(this._gateway, this._basicAuth, this._tenant);
        return this._eventManagementClient;
    }

    /**
     * * Tenant
     *
     * @returns
     *
     * @memberOf MindSphereSdk
     */
    public GetTenant() {
        return this._tenant;
    }

    /**
     * * Gateway
     *
     * @returns
     *
     * @memberOf MindSphereSdk
     */
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
