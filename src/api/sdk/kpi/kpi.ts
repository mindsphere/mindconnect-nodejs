import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { KPICalculationModels } from "./kpi-models";

/**
 * The KPI Calculation Service computes Key Performance Indicators (KPIs) for an asset. It uses data sources such as sensors, control units and calendars.
 * Typical use cases for the KPI Calculation Service are:
 * Evaluation of characteristics, such as reliability, availability, and maintainability
 * Condition-based maintenance
 * Diagnostics applications and root-cause analysis
 * Risk assessment
 *
 * @see https://developer.mindsphere.io/apis/analytics-kpicalculation/api-kpicalculation-samples.html
 *
 * @export
 * @class KPICalculationClient
 * @extends {SdkClient}
 */
export class KPICalculationClient extends SdkClient {
    private _baseUrl: string = "/api/kpicalculation/v3";

    /**
     * Launches kpi computation task with specific parameters.
     *
     * @param {KPICalculationModels.Timeseries} timeseries
     * @param {{
     *             from: Date;
     *             to: Date;
     *             variableName: string;
     *             initialState: string;
     *         }} params
     * @param params.from Start time of the interval
     * @param params.to End time of the interval
     * @param params.variableName: Target variable name. Only this variable will be taken from the given timeseries data.
     * @param params.initialState: initial KP state (Available values : "RSH", "SH", "POH", FOH") -
     * @see https://developer.mindsphere.io/apis/analytics-kpicalculation/api-kpicalculation-basics-kpi.html
     *
     * * No Data Hours (NoData) - Time, in hours, where required data from the unit is unavailable. This KPI is introduced to deal with possible data gaps.
     *
     * * Period Hours (PH) – Time, in hours, inside the period under consideration.
     *
     * * Available Hours (AH) – Time, in hours, during which the unit was capable of providing service, regardless of the capacity level that it provides.\
     *
     * * Service Hours (SH) – Time, in hours, during which the unit was in-service.
     *
     * * Reserve Shutdown Hours (RSH) – Time, in hours, during which the unit was available, but not in service.
     *
     * * Unavailable Hours (UH) – Time, in hours, during which the unit was not capable of operation because of operational or equipment failures, external restrictions, testing, work being performed, or an adverse condition. The unavailable state persists until the unit is made available for operation.
     *
     * * Planned Outage Hours (POH) – Time, in hours, during which the unit (or a major item of equipment) was originally scheduled for a planned outage including the estimated duration plus the extension of planned work beyond this. The extension due to either a condition discovered during the planned outage or a startup failure would result as forced (unplanned) outage.
     *
     * * Forced Outage Hours (FOH) – Time, in hours, during which the unit was unavailable due to a component failure or another condition that requires the unit to be removed from service immediately or before the next planned outage.
     *
     * @returns {Promise<KPICalculationModels.KpiSet>}
     *
     * @memberOf KPICalculationClient
     */
    async ComputeKPI(
        timeseries: KPICalculationModels.Timeseries,
        params: {
            from: Date;
            to: Date;
            variableName: string;
            initialState: string;
        }
    ): Promise<KPICalculationModels.KpiSet> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/computekpi?${toQueryString(params)}`,
            body: timeseries
        })) as KPICalculationModels.KpiSet;
    }

    /**
     *
     * Launches kpi state computation task with specific parameters.
     *
     * @see https://developer.mindsphere.io/apis/analytics-kpicalculation/api-kpicalculation-basics-kpi-states.html
     *
     * @param {KPICalculationModels.RequestParametersBundle} requestParametersBundle
     * @param {{
     *             from: Date;
     *             to: Date;
     *             variableName: Date;
     *             initialState: string;
     *             defaultState: string;
     *             threshold: number;
     *             shutdownCorrelationThreshold: number;
     *         }} params
     * @param params.from Start time of the interval
     * @param params.to End time of the interval
     * @param params.variableName: Target variable name. Only this variable will be taken from the given timeseries data.
     * @param params.initialState: initial KPI state (Available values : "RSH", "SH", "POH", FOH") -
     * @param params.defaultState: default KPI state (Avaialble values: "RSH", "FOH")
     * @param params.threshold: Threshould to check values. Positive value
     * @param params.shutdownCorrelationThreshold: Shutdown correlation threshold in mills. The first event from the interval [timestamp - shutdownCorrelationThreshold, timestamp + shutdownCorrelationThreshold] will be analyzed for each timeseries item.
     *
     * * No Data Hours (NoData) - Time, in hours, where required data from the unit is unavailable. This KPI is introduced to deal with possible data gaps.
     *
     * * Period Hours (PH) – Time, in hours, inside the period under consideration.
     *
     * * Available Hours (AH) – Time, in hours, during which the unit was capable of providing service, regardless of the capacity level that it provides.\
     *
     * * Service Hours (SH) – Time, in hours, during which the unit was in-service.
     *
     * * Reserve Shutdown Hours (RSH) – Time, in hours, during which the unit was available, but not in service.
     *
     * * Unavailable Hours (UH) – Time, in hours, during which the unit was not capable of operation because of operational or equipment failures, external restrictions, testing, work being performed, or an adverse condition. The unavailable state persists until the unit is made available for operation.
     *
     * * Planned Outage Hours (POH) – Time, in hours, during which the unit (or a major item of equipment) was originally scheduled for a planned outage including the estimated duration plus the extension of planned work beyond this. The extension due to either a condition discovered during the planned outage or a startup failure would result as forced (unplanned) outage.
     *
     * * Forced Outage Hours (FOH) – Time, in hours, during which the unit was unavailable due to a component failure or another condition that requires the unit to be removed from service immediately or before the next planned outage.
     *
     * @returns {Promise<KPICalculationModels.KpiStateIndicationSet>}
     * @memberOf KPICalculationClient
     */
    async CaclulateKpiStates(
        requestParametersBundle: KPICalculationModels.RequestParametersBundle,
        params: {
            from: Date;
            to: Date;
            variableName: string;
            initialState: string;
            defaultState: string;
            threshold: number;
            shutdownCorrelationThreshold: number;
        }
    ) {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/calculatekpistates?${toQueryString(params)}`,
            body: requestParametersBundle
        })) as KPICalculationModels.KpiStateIndicationSet;
    }
}
