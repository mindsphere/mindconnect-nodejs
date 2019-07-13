import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { SignalValidationModels } from "./signal-validation-models";

/**
 *
 * ! The following services are intended to be used on small ranges of timeseries data.
 *
 * * Range Check
 * Performs range check. Tries to find data going beyond range for given
 * sensor’s values on given interval.
 *
 * * Spike Alert
 * Performs spike detection. Tries to find spikes for given sensor’s values.
 *
 * * Noise Alert
 * Performs noise detection. Tries to find noises for given sensor’s values.
 *
 * * Jump Alert
 * Performs jump detection. Tries to find jumps for given sensor’s values.
 *
 * * Data Gap Analysis
 * Performs data gap analysis. Tries to find gaps for given sensor’s values and
 * tries to interpolate insufficient measurements.
 *
 * * Bias Alert
 * Performs bias detection. Tries to find biases for given sensor’s values.
 *
 * @export
 * @class SignalValidationClient
 * @extends {SdkClient}
 */
export class SignalValidationClient extends SdkClient {
    private _baseUrl: string = "/api/signalvalidation/v3";

    /**
     * * Launches range check task with specific parameters
     *
     * @param {SignalValidationModels.Timeseries} timeseries
     * @param {{
     *             variableName: string;
     *             lowerLimit: number;
     *             upperLimit: number;
     *         }} params
     *
     * @param params.variableName Target variable name. Only this variable will be taken from given timeseries data.
     * @param params.lowerLimit Processing lower limit, should be less than upper limit.
     * @param params.upperLimit Processing upper limit, should be greater than lower limit.
     * @returns {Promise<SignalValidationModels.Range>}
     *
     * @memberOf SignalValidationClient
     */
    public async DetectRangeViolations(
        timeseries: SignalValidationModels.Timeseries[],
        params: {
            variableName: string;
            lowerLimit: number;
            upperLimit: number;
        }
    ): Promise<SignalValidationModels.Range[]> {
        return ((await this.HttpAction({
            verb: "POST",
            body: timeseries,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/detectrangeviolations?${toQueryString(params)}`
        })) as unknown) as SignalValidationModels.Range[];
    }

    /**
     * * Launches spike alert task with specific parameters.
     *
     * @param {SignalValidationModels.Timeseries[]} timeseries
     * @param {{
     *             variableName: string;
     *             windowSize: number;
     *         }} params
     *
     * @param params.variableName Target variable name. Only this variable will be taken from given timeseries data.
     * @param params.windowSize The processing windows size, should be positive.
     * @returns {Promise<SignalValidationModels.Spike[]>}
     * @memberOf SignalValidationClient
     */
    public async DetectSpikes(
        timeseries: SignalValidationModels.Timeseries[],
        params: {
            variableName: string;
            windowSize: number;
        }
    ): Promise<SignalValidationModels.Spike[]> {
        return ((await this.HttpAction({
            verb: "POST",
            body: timeseries,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/detectspikes?${toQueryString(params)}`
        })) as unknown) as SignalValidationModels.Spike[];
    }

    /**
     * This endpoint detects noise for the given sensor. Result is the list of events.
     *
     * @param {SignalValidationModels.Timeseries[]} timeseries
     * @param {{
     *             variableName: string;
     *             windowRadius: number;
     *             threshold: number;
     *         }} params
     *
     * @param params.variableName Target variable name. Only this variable will be taken from given timeseries data.
     * @param params.windowRadius Processing window radius, should be positive.
     * @param params.threshold Threshold to consider outlier value as noise.
     * @returns {Promise<SignalValidationModels.Noise[]>}
     *
     * @memberOf SignalValidationClient
     */
    public async DetectNoise(
        timeseries: SignalValidationModels.Timeseries[],
        params: {
            variableName: string;
            windowRadius: number;
            threshold: number;
        }
    ): Promise<SignalValidationModels.Noise[]> {
        return ((await this.HttpAction({
            verb: "POST",
            body: timeseries,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/detectnoise?${toQueryString(params)}`
        })) as unknown) as SignalValidationModels.Noise[];
    }

    /**
     * * Lauches jump alert task with specific parameters.
     *
     * @param {SignalValidationModels.Timeseries[]} timeseries
     * @param {{
     *             variableName: string;
     *             windowSize: number;
     *         }} params
     *
     * @param params.variableName Target variable name. Only this variable will be taken from given timeseries data.
     * @param params.windowSize The value to limit window size. Positive value
     *
     * @returns {Promise<SignalValidationModels.Jump[]>}
     *
     * @memberOf SignalValidationClient
     */
    public async DetectJumps(
        timeseries: SignalValidationModels.Timeseries[],
        params: {
            variableName: string;
            windowSize: number;
        }
    ): Promise<SignalValidationModels.Jump[]> {
        return ((await this.HttpAction({
            verb: "POST",
            body: timeseries,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/detectjumps?${toQueryString(params)}`
        })) as unknown) as SignalValidationModels.Jump[];
    }

    /**
     * * Launches data gap analysis task with specific parameters
     *
     * @param {SignalValidationModels.Timeseries[]} timeseries
     * @param {{
     *             variableName: string;
     *             threshold: number;
     *         }} params
     *
     * @param params.variableName Target variable name. Only this variable will be taken from given timeseries data.
     * @param params.threshold Max inteval in milliseconds between two consecutive points which is not considered a gap.
     *
     * @returns {Promise<SignalValidationModels.DataGap>}
     *
     * @memberOf SignalValidationClient
     */
    public async DetectGaps(
        timeseries: SignalValidationModels.Timeseries[],
        params: {
            variableName: string;
            threshold: number;
        }
    ): Promise<SignalValidationModels.DataGap> {
        return ((await this.HttpAction({
            verb: "POST",
            body: timeseries,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/detectgaps?${toQueryString(params)}`
        })) as unknown) as SignalValidationModels.DataGap;
    }

    /**
     *
     * * Launches data gap analysis task with interpolation
     *
     * @param {SignalValidationModels.Timeseries[]} timeseries
     * @param {{
     *             variableName: string;
     *             threshold: number;
     *         }} params
     *
     * @param params.variableName Target variable name. Only this variable will be taken from given timeseries data.
     * @param params.threshold Max inteval in milliseconds between two consecutive points which is not considered a gap.
     *
     * @returns {Promise<SignalValidationModels.DataGapInterpolated>}
     *
     * @memberOf SignalValidationClient
     */
    public async DetectGapsAndInterpolate(
        timeseries: SignalValidationModels.Timeseries[],
        params: {
            variableName: string;
            threshold: number;
        }
    ): Promise<SignalValidationModels.DataGapInterpolated> {
        return ((await this.HttpAction({
            verb: "POST",
            body: timeseries,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/detectgapsandinterpolate?${toQueryString(params)}`
        })) as unknown) as SignalValidationModels.DataGapInterpolated;
    }

    /**
     * Launches bias alert task with specific parameters.
     *
     * @param {SignalValidationModels.Timeseries[]} timeseries
     * @param {{
     *             variableName: string;
     *             windowSize: number;
     *             threshold: number;
     *             step: number;
     *         }} params
     *
     * @param params.variableName Target variable name. Only this variable will be taken from given timeseries data.
     * @param params.windowSize Processing window size value, should be positive.
     * @param params.threshold Processing threshold value, should be positive.
     * @param params.step Processing step value, should be from 1 to windowSize.
     *
     * @returns {Promise<SignalValidationModels.Bias[]>}
     *
     * @memberOf SignalValidationClient
     */
    public async DetectBias(
        timeseries: SignalValidationModels.Timeseries[],
        params: {
            variableName: string;
            windowSize: number;
            threshold: number;
            step: number;
        }
    ): Promise<SignalValidationModels.Bias[]> {
        return ((await this.HttpAction({
            verb: "POST",
            body: timeseries,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/detectbias?${toQueryString(params)}`
        })) as unknown) as SignalValidationModels.Bias[];
    }
}
