import { AgentManagementClient } from "../agent/agent-management";
import { AssetManagementClient } from "../asset/asset-management";
import { DataExchangeClient } from "../data-exchange/data-exchange";
import { DataLakeClient } from "../data-lake/data-lake";
import { DeviceStatusManagementClient } from "../device-status/device-status-management";
import { EventAnalyticsClient } from "../event-analytics/eventanalytics";
import { EventManagementClient } from "../event/event-management";
import { IdentityManagementClient } from "../identity/identity";
import { TimeSeriesClient } from "../iot/iot-timeseries";
import { TimeSeriesAggregateClientV4 } from "../iotaggregate-v4/iot-timeseries-aggregate-v4";
import { TimeSeriesAggregateClient } from "../iotaggregate/iot-timeseries-aggregate";
import { TimeSeriesBulkClient } from "../iotbulk/iot-timeseries-bulk";
import { IotFileClient } from "../iotfile/iot-file";
import { JobManagerClient } from "../jobmanager/jobmanager";
import { KPICalculationClient } from "../kpi/kpi";
import { MindConnectApiClient } from "../mcapi/mcapi";
import { ModelManagementClient } from "../model/model-management";
import { AnomalyDetectionClient } from "../anomaly-detection/anomaly-detection";
import { NotificationClientV4 } from "../notification-v4/notification-v4";
import { SignalCalculationClient } from "../signal-calculation/signal-calculation";
import { SignalValidationClient } from "../signal-validation/signal-validation";
import { SpectrumAnalysisClient } from "../spectrum/spectrum-analysis";
import { TenantManagementClient } from "../tenant/tenant-management";
import { TrendPredictionClient } from "../trend/trend-prediction";
import { UsageTransparencyClient } from "../utc/utc";
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

    private _anomalyDetectionClient?: AnomalyDetectionClient;

    /**
     * * Anomaly Detection Client
     *
     * @returns {AnomalyDetectionClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetAnomalydetectionClient(): AnomalyDetectionClient {
        this._anomalyDetectionClient = this._anomalyDetectionClient || new AnomalyDetectionClient(this._authenticator);
        return this._anomalyDetectionClient;
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

    private _spectrumAnalysisClient?: SpectrumAnalysisClient;

    /**
     *  * Spectrum Analysis Client
     *
     * @returns {SpectrumAnalysisClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetSpectrumAnalysisClient(): SpectrumAnalysisClient {
        this._spectrumAnalysisClient = this._spectrumAnalysisClient || new SpectrumAnalysisClient(this._authenticator);

        return this._spectrumAnalysisClient;
    }

    private _signalValidationClient?: SignalValidationClient;

    /**
     * * Signal Validation Client
     *
     * @returns {SignalValidationClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetSignalValidationClient(): SignalValidationClient {
        this._signalValidationClient = this._signalValidationClient || new SignalValidationClient(this._authenticator);

        return this._signalValidationClient;
    }

    private _trendPredictionClient?: TrendPredictionClient;

    /**
     * * Trend Prediction Client
     *
     * @returns {TrendPredictionClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetTrendPredictionClient(): TrendPredictionClient {
        this._trendPredictionClient = this._trendPredictionClient || new TrendPredictionClient(this._authenticator);
        return this._trendPredictionClient;
    }

    private _kpiCalculationClient?: KPICalculationClient;

    /**
     * * KPI Calculation Client
     *
     * @returns {KPICalculationClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetKPICalculationClient(): KPICalculationClient {
        this._kpiCalculationClient = this._kpiCalculationClient || new KPICalculationClient(this._authenticator);
        return this._kpiCalculationClient;
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

    /**
     * * Event Analytics Client
     *
     * @returns {EventAnalyticsClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetEventAnalyticsClient(): EventAnalyticsClient {
        this._eventAnalyticsClient = this._eventAnalyticsClient || new EventAnalyticsClient(this._authenticator);
        return this._eventAnalyticsClient;
    }

    private _eventAnalyticsClient?: EventAnalyticsClient;

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

    private _deviceStatusManagementClient?: DeviceStatusManagementClient;

    /**
     ** Device Status Management Client
     *
     * @returns {DeviceStatusManagementClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetDeviceStatusManagementClient(): DeviceStatusManagementClient {
        this._deviceStatusManagementClient = this._deviceStatusManagementClient || new DeviceStatusManagementClient(this._authenticator);
        return this._deviceStatusManagementClient;
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

    private _signalCalculationClient?: SignalCalculationClient;

    /**
     * * Signal Calculation Client
     *
     * @returns {SignalCalculationClient}
     *
     * @memberOf MindSphereSdk
     */
    public GetSignalCalculationClient(): SignalCalculationClient {
        this._signalCalculationClient =
            this._signalCalculationClient || new SignalCalculationClient(this._authenticator);
        return this._signalCalculationClient;
    }
}
