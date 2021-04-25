import { SdkClient } from "../common/sdk-client";
import { SignalCalculationModels } from "./signal-calculation-models";

/**
 * Applies operations on one or multiple small input time series -- referred here as signals --
 * producing a new signal as output.
 *
 * Idea¶
 * The Signal Calculation Service processes time series data of an entity's sensor.
 * The service aggregates, modifies, smoothes and transforms the original sensor data
 * for further analysis or storage along with the original data.
 *
 * The service enables a user to carry out the following tasks:
 *
 * Detect missing sensor values
 * Replace missing sensor values with interpolated ones
 * Compute a new physical parameter from available sensor readings
 * Aggregate sensor values over a sliding window
 *
 *
 *
 * @export
 * @class SignalCalculationClient
 * @extends {SdkClient}
 * @see https://developer.mindsphere.io/apis/analytics-signalcalculation/api-signalcalculation-overview.html
 */
export class SignalCalculationClient extends SdkClient {
    private _baseUrl: string = "/api/signalcalculation/v3";

    /**
     * Applies an operation to the specified properties for the operands defined in the body parameters
     *
     * @param {SignalCalculationModels.InputParameters} body Operation properties and input data
     * @returns {Promise<SignalCalculationModels.Signal>}
     *
     * @memberOf SignalCalculationClient
     */
    public async PostApplyOperation(
        body: SignalCalculationModels.InputParameters
    ): Promise<SignalCalculationModels.Signal> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(), // always use this.GetGateway()  and this.GetToken()
            authorization: await this.GetToken(), // this is overriden in different authorizers
            body: body,
            baseUrl: `${this._baseUrl}/applyOperation`,
        })) as SignalCalculationModels.Signal;
    }

    private async PostApplyOperationDirectRaw(
        body: SignalCalculationModels.InputParametersDirect
    ): Promise<SignalCalculationModels.SignalDirect> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(), // always use this.GetGateway()  and this.GetToken()
            authorization: await this.GetToken(), // this is overriden in different authorizers
            body: body,
            baseUrl: `${this._baseUrl}/applyOperationDirect`,
        })) as SignalCalculationModels.SignalDirect;
    }

    /**
     * Applies an operation to the specified properties for the operands defined in the body parameters
     *
     * @param {SignalCalculationModels.InputParametersDirect} body Operation properties and input data
     * @returns {Promise<SignalCalculationModels.SignalDirect>}
     *
     * @memberOf SignalCalculationClient
     */
    public async PostApplyOperationDirect(
        body: SignalCalculationModels.InputParametersDirect
    ): Promise<SignalCalculationModels.SignalDirect> {
        const result = await this.PostApplyOperationDirectRaw(body);

        result.timeSeries.forEach((result) => {
            if ((result._time as any)?.nano && (result._time as any)?.epochSecond) {
                const unixMillisecondsDate =
                    (result._time as any)?.epochSecond * 1000 + Math.floor((result._time as any)?.nano / 1000000);

                // !fix: this thing is buggy, as it returns the nano precision epoch timestamp
                // !instead of proper ISOString date, fix on the client, report to mindsphere,
                // !hope for the server side fix...

                result._time = new Date(unixMillisecondsDate).toISOString();
            }
        });
        return result;
    }
}
