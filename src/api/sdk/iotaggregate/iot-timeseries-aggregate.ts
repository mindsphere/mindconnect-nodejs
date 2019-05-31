import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { TimeSeriesAggregateModels } from "./iot-timeseries-aggregate-models";

/**
 * *  The aggregate service enables querying aggregated time series data including
 *    * aggregates generated on the fly
 *    * aggregates pre-calculated during ingest
 *
 *    Depending on, if entity is performance or simulation entity, different aggregation intervals are supported.
 *
 *    ### Performance Entity
 *
 *    Pre-calculated aggregates are available in the following intervals
 *    * 2 minute
 *    * 1 hour
 *    * 1 day
 *
 *    Intervals smaller than 2 minutes are also available and generated on the fly.
 *
 *    ### Simulation Entity
 *
 *    Pre-calculated aggregates are available in the following intervals
 *    * 1 millisecond
 *    * 10 millisecond
 *    * 1 second
 *
 *    On the fly aggregation is not supported for simulation entities.
 *
 *    Note: There might be time series data ingested in the past for which pre-calculated aggregates have not been computed. In that case for simulation entities, no aggregated data is returned.
 *
 * @export
 * @class TimeSeriesAggregateClient
 * @extends {SdkClient}
 */
export class TimeSeriesAggregateClient extends SdkClient {
    private _baseUrl: string = "/api/iottsaggregates/v3";

    /**
     * Read time series data aggregated over a certain interval for a single entity and propertyset within the provided time range.
     *
     * @param {string} entityid Unique identifier of the asset
     * @param {string} propertyset Name of the propertyset (aspect) to read.
     *
     * * See full documentation at
     * * https://developer.mindsphere.io/apis/iot-iottsaggregates/api-iottsaggregates-overview.html
     *
     * @param {{ from: Date; to: Date; intervalValue: number; intervalUnit: string; select?: string }} params
     * @param params.from Begfining of the time range to read.
     * @param params.to End of the time range to read.
     * @param params.intervalValue interval duration for the aggregates in intervalUnits.
     * @param params.intervalUnit Interval duration unit for the aggregates.
     * @param params.select Properties and fields to select. By default all properties and the availale fields are returned. Providing a property name selects all fields of a property. A property name followed by a ‘.’ and field name selects a specific field of a property.
     * @returns {Promise<TimeSeriesAggregateModels.Aggregates>}
     *
     * @memberOf TimeSeriesAggregateClient
     */
    public async GetAggregates(
        entityid: string,
        propertyset: string,
        params: { from: Date; to: Date; intervalValue: number; intervalUnit: string; select?: string }
    ): Promise<TimeSeriesAggregateModels.Aggregates> {
        const qs = toQueryString(params);
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/aggregates/${entityid}/${propertyset}?${qs}`,
            message: "GetTimeSeriesAggregates"
        })) as TimeSeriesAggregateModels.Aggregates;
    }
}
