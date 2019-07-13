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
     * @param param.variableName Target variable name. Only this variable will be taken from given timeseries data.
     * @param param.lowerLimit Processing lower limit, should be less than upper limit.
     * @param param.upperLimit Processing upper limit, should be greater than lower limit.
     * @returns {Promise<SignalValidationModels.Range>}
     *
     * @memberOf SignalValidationClient
     */
    public async DetectRangeViolations(
        timeseries: SignalValidationModels.Timeseries,
        params: {
            variableName: string;
            lowerLimit: number;
            upperLimit: number;
        }
    ): Promise<SignalValidationModels.Range> {
        return ((await this.HttpAction({
            verb: "POST",
            body: timeseries,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/detectrangeviolations?${toQueryString(params)}`
        })) as unknown) as SignalValidationModels.Range;
    }
}
