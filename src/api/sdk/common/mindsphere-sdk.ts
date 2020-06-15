import { AgentManagementClient } from "../agent/agent-management";
import { AssetManagementClient } from "../asset/asset-management";
import { EventManagementClient } from "../event/event-management";
import { TimeSeriesClient } from "../iot/iot-timeseries";
import { TimeSeriesAggregateClient } from "../iotaggregate/iot-timeseries-aggregate";
import { TimeSeriesBulkClient } from "../iotbulk/iot-timeseries-bulk";
import { IotFileClient } from "../iotfile/iot-file";
import { KPICalculationClient } from "../kpi/kpi";
import { MindConnectApiClient } from "../mcapi/mcapi";
import { SignalValidationClient } from "../signal-validation/signal-validation";
import { SpectrumAnalysisClient } from "../spectrum/spectrum-analysis";
import { TrendPredictionClient } from "../trend/trend-prediction";
import { SdkClient } from "./sdk-client";
/**
 * * Pre-Alpha SDK for the mindsphere APIs
 *
 * ! You can experiment with this but please note that these interfaces will
 * ! will change in the next major version. See also CHANGELOG.md
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
}
