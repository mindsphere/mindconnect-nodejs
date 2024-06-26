import { AdvancedTokenExchangeClient } from "../advanced-token/advanced-token";
import { AgentManagementClient } from "../agent/agent-management";
import { AssetManagementClient } from "../asset/asset-management";
import { CaseManagementClient } from "../cases/cases";
import { CommandingClient } from "../commanding/commanding";
import { DataExchangeClient } from "../data-exchange/data-exchange";
import { DataLakeClient } from "../data-lake/data-lake";
import { EventManagementClient } from "../event/event-management";
import { IdentityManagementClient } from "../identity/identity";
import { TimeSeriesClient } from "../iot/iot-timeseries";
import { TimeSeriesAggregateClientV4 } from "../iotaggregate-v4/iot-timeseries-aggregate-v4";
import { TimeSeriesAggregateClient } from "../iotaggregate/iot-timeseries-aggregate";
import { TimeSeriesBulkClient } from "../iotbulk/iot-timeseries-bulk";
import { IotFileClient } from "../iotfile/iot-file";
import { JobManagerClient } from "../jobmanager/jobmanager";
import { MindConnectApiClient } from "../mcapi/mcapi";
import { MessageBrokerClient } from "../messagebroker/messagebroker";
import { ModelManagementClient } from "../model/model-management";
import { NotificationClientV4 } from "../notification-v4/notification-v4";
import {
    DeploymentWorkflowClient,
    DeviceConfigurationClient,
    DeviceManagementClient,
    DeviceStatusManagementClient,
    EdgeAppDeploymentClient,
    EdgeAppInstanceManagementClient,
    FirmwareDeploymentClient,
} from "../open-edge/open-edge";
import { ResourceAccessManagementClient } from "../policy/policy";
import { SemanticDataInterconnectClient } from "../sdi/sdi-v4";
import { TenantManagementClient } from "../tenant/tenant-management";
import { UsageTransparencyClient } from "../utc/utc";
import { VisualFlowCreatorClient } from "../vfc/vfc";
import { SdkClient } from "./sdk-client";

/**
 *
 * MindSphere typescript SDK
 *
 * Runs in browser and in NodeJs.
 *
 * The SDK uses all 4 types of MindSphere Credentials
 * (Agent Credentials, User Credentials, App Credentials,ServiceCredentials).
 *
 * @export
 * @class MindSphereSdk
 */
export class MindSphereSdk extends SdkClient {
    private _assetManagementClient?: AssetManagementClient;

    /**
     * * Asset Management
     *
     * @returns {AssetManagementClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetAssetManagementClient(): AssetManagementClient {
        this._assetManagementClient = this._assetManagementClient || new AssetManagementClient(this._authenticator);
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
        this._agentManagementClient = this._agentManagementClient || new AgentManagementClient(this._authenticator);
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
        this._iotFileClient = this._iotFileClient || new IotFileClient(this._authenticator);
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
        this._tsBulkClient = this._tsBulkClient || new TimeSeriesBulkClient(this._authenticator);
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
        this._timeSeriesClient = this._timeSeriesClient || new TimeSeriesClient(this._authenticator);
        return this._timeSeriesClient;
    }

    private _timeSeriesAggregateClient?: TimeSeriesAggregateClient;

    /**
     * * Time Series Aggregates
     *
     * @returns {TimeSeriesAggregateClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetTimeSeriesAggregateClient(): TimeSeriesAggregateClient {
        this._timeSeriesAggregateClient =
            this._timeSeriesAggregateClient || new TimeSeriesAggregateClient(this._authenticator);
        return this._timeSeriesAggregateClient;
    }

    private _timeSeriesAggregateClientV4?: TimeSeriesAggregateClientV4;

    /**
     * * Time Series Aggregates
     * * V4 Client
     *
     * @returns {TimeSeriesAggregateClientV4}
     *
     * @memberOf MindSphereSdk
     */
    public GetTimeSeriesAggregateClientV4(): TimeSeriesAggregateClientV4 {
        this._timeSeriesAggregateClientV4 =
            this._timeSeriesAggregateClientV4 || new TimeSeriesAggregateClientV4(this._authenticator);
        return this._timeSeriesAggregateClientV4;
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
        this._eventManagementClient = this._eventManagementClient || new EventManagementClient(this._authenticator);
        return this._eventManagementClient;
    }

    private _mindConnectApiClient?: MindConnectApiClient;

    /**
     * * MindConnectApiClient
     *
     * @returns {MindConnectApiClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetMindConnectApiClient(): MindConnectApiClient {
        this._mindConnectApiClient = this._mindConnectApiClient || new MindConnectApiClient(this._authenticator);
        return this._mindConnectApiClient;
    }

    /**
     * * Identity Management Client
     *
     * @returns {IdentityManagementClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetIdentityManagementClient(): IdentityManagementClient {
        this._identityManagementClient =
            this._identityManagementClient || new IdentityManagementClient(this._authenticator);
        return this._identityManagementClient;
    }

    private _identityManagementClient?: IdentityManagementClient;

    private _dataLakeClient?: DataLakeClient;

    /**
     * * Data Lake Client
     *
     * @returns {DataLakeClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetDataLakeClient(): DataLakeClient {
        this._dataLakeClient = this._dataLakeClient || new DataLakeClient(this._authenticator);
        return this._dataLakeClient;
    }

    private _usageTransparencyClient?: UsageTransparencyClient;

    /**
     * Usage Transparency Client
     *
     * @returns {UsageTransparencyClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetUsageTransparencyClient(): UsageTransparencyClient {
        this._usageTransparencyClient =
            this._usageTransparencyClient || new UsageTransparencyClient(this._authenticator);
        return this._usageTransparencyClient;
    }

    private _tenantManagementClient?: TenantManagementClient;

    /**
     * * Tenant Management Client
     *
     * @returns {TenantManagementClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetTenantManagementClient(): TenantManagementClient {
        this._tenantManagementClient = this._tenantManagementClient || new TenantManagementClient(this._authenticator);
        return this._tenantManagementClient;
    }

    private _deviceManagementClient?: DeviceManagementClient;

    /**
     * * Device Management Client
     *
     * @returns {DeviceManagementClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetDeviceManagementClient(): DeviceManagementClient {
        this._deviceManagementClient = this._deviceManagementClient || new DeviceManagementClient(this._authenticator);
        return this._deviceManagementClient;
    }

    private _deviceStatusManagementClient?: DeviceStatusManagementClient;

    /**
     * * Device Status Management Client
     *
     * @returns {DeviceStatusManagementClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetDeviceStatusManagementClient(): DeviceStatusManagementClient {
        this._deviceStatusManagementClient =
            this._deviceStatusManagementClient || new DeviceStatusManagementClient(this._authenticator);
        return this._deviceStatusManagementClient;
    }

    private _deviceConfigurationClient?: DeviceConfigurationClient;

    /**
     * * Device Configuration Management Client
     *
     * @returns {DeviceStatusManagementClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetDeviceConfigurationClient(): DeviceConfigurationClient {
        this._deviceConfigurationClient =
            this._deviceConfigurationClient || new DeviceConfigurationClient(this._authenticator);
        return this._deviceConfigurationClient;
    }

    private _deploymentWorkflowClient?: DeploymentWorkflowClient;

    /**
     * * Deployment Workflow Client
     *
     * @returns {DeploymentWorkflowClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetDeploymentWorkflowClient(): DeploymentWorkflowClient {
        this._deploymentWorkflowClient =
            this._deploymentWorkflowClient || new DeploymentWorkflowClient(this._authenticator);
        return this._deploymentWorkflowClient;
    }

    private _edgeAppInstanceManagementClient?: EdgeAppInstanceManagementClient;

    /**
     * * Edge App Instance Management Client
     *
     * @returns {EdgeAppInstanceManagementClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetEdgeAppInstanceManagementClient(): EdgeAppInstanceManagementClient {
        this._edgeAppInstanceManagementClient =
            this._edgeAppInstanceManagementClient || new EdgeAppInstanceManagementClient(this._authenticator);
        return this._edgeAppInstanceManagementClient;
    }

    private _edgeAppDeploymentClient?: EdgeAppDeploymentClient;

    /**
     * * Edge AppDeployment Client
     *
     * @returns {EdgeDeploymentClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetEdgeDeploymentClient(): EdgeAppDeploymentClient {
        this._edgeAppDeploymentClient =
            this._edgeAppDeploymentClient || new EdgeAppDeploymentClient(this._authenticator);
        return this._edgeAppDeploymentClient;
    }

    private _firmwareAppDeploymentClient?: FirmwareDeploymentClient;

    /**
     * * Edge AppDeployment Client
     *
     * @returns {FirmwareDeploymentClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetFirmwareDeploymentClient(): FirmwareDeploymentClient {
        this._firmwareAppDeploymentClient =
            this._firmwareAppDeploymentClient || new FirmwareDeploymentClient(this._authenticator);
        return this._firmwareAppDeploymentClient;
    }

    private _modelManagementClient?: ModelManagementClient;

    /**
     * * Model Management Client
     *
     * @returns {ModelManagementClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetModelManagementClient(): ModelManagementClient {
        this._modelManagementClient = this._modelManagementClient || new ModelManagementClient(this._authenticator);
        return this._modelManagementClient;
    }

    private _notificationClient?: NotificationClientV4;

    /**
     * * Notification Client
     *
     * @returns {NotificationClientV4}
     *
     * @memberOf MindSphereSdk
     */
    public GetNotificationClientV4(): NotificationClientV4 {
        this._notificationClient = this._notificationClient || new NotificationClientV4(this._authenticator);
        return this._notificationClient;
    }

    private _jobManagerClient?: JobManagerClient;

    /**
     * * Job Manager Client
     *
     * @returns {JobManagerClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetJobManagerClient(): JobManagerClient {
        this._jobManagerClient = this._jobManagerClient || new JobManagerClient(this._authenticator);
        return this._jobManagerClient;
    }

    private _dataExchangeClient?: DataExchangeClient;

    /**
     * * Data Exchange Client
     *
     * @returns {DataExchangeClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetDataExchangeClient(): DataExchangeClient {
        this._dataExchangeClient = this._dataExchangeClient || new DataExchangeClient(this._authenticator);
        return this._dataExchangeClient;
    }

    private _semanticDataInterConnectClient?: SemanticDataInterconnectClient;

    /**
     * Semantic Data Interconnect Client
     *
     * @returns {SemanticDataInterconnectClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetSemanticDataInterConnectClient(): SemanticDataInterconnectClient {
        this._semanticDataInterConnectClient =
            this._semanticDataInterConnectClient || new SemanticDataInterconnectClient(this._authenticator);
        return this._semanticDataInterConnectClient;
    }

    private _messageBrokerClient?: MessageBrokerClient;

    /**
     * * Message Broker Client
     *
     * @returns {MessageBrokerClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetMessageBrokerClient(): MessageBrokerClient {
        this._messageBrokerClient = this._messageBrokerClient || new MessageBrokerClient(this._authenticator);
        return this._messageBrokerClient;
    }

    private _resourceAccessManagementClient?: ResourceAccessManagementClient;

    /**
     * * Resource Acess Management Client
     *
     * @returns {ResourceAccessManagementClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetResourceManagementClient(): ResourceAccessManagementClient {
        this._resourceAccessManagementClient =
            this._resourceAccessManagementClient || new ResourceAccessManagementClient(this._authenticator);
        return this._resourceAccessManagementClient;
    }

    private _commandingClient?: CommandingClient;

    /**
     * Commanding Client
     *
     * @returns {CommandingClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetCommandingClient(): CommandingClient {
        this._commandingClient = this._commandingClient || new CommandingClient(this._authenticator);
        return this._commandingClient;
    }

    private _advancedTokenExchangeClient?: AdvancedTokenExchangeClient;

    /**
     * Advanced Token Exchange Client
     *
     * @returns {AdvancedTokenExchangeClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetAdvancedTokenExchangeClient(): AdvancedTokenExchangeClient {
        this._advancedTokenExchangeClient =
            this._advancedTokenExchangeClient || new AdvancedTokenExchangeClient(this._authenticator);
        return this._advancedTokenExchangeClient;
    }

    private _visualFlowCreatorClient?: VisualFlowCreatorClient;

    /**
     * Visual Flow Creator Client
     *
     * @returns {VisualFlowCreatorClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetVisualFlowCreatorClient(): VisualFlowCreatorClient {
        this._visualFlowCreatorClient =
            this._visualFlowCreatorClient || new VisualFlowCreatorClient(this._authenticator);
        return this._visualFlowCreatorClient;
    }

    private _caseManagementClient?: CaseManagementClient;
    /**
     * Case Management Client
     *
     * @return {*}  {CaseManagementClient}
     * @memberof MindSphereSdk
     */
    public GetCaseManagementClient(): CaseManagementClient {
        this._caseManagementClient = this._caseManagementClient || new CaseManagementClient(this._authenticator);
        return this._caseManagementClient;
    }
}
