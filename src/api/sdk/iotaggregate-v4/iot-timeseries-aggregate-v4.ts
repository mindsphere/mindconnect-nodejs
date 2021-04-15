import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { TimeSeriesAggregateModelsV4 } from "./iot-timeseries-aggregate-models-v4";

/**
 * The aggregate service enables querying aggregated time series data
 * for performance assets based on pre-calculated aggregate values.
 * Precalculated aggregates are available in the following aggregate intervals
 * * 2 minute
 * * 1 hour
 * * 1 day
 * Generic Errors
 *
 * The following generic error codes (with status codes) can occur at the operations of this API. Generic error codes are prefixed with 'mdsp.core.generic.'.
 * unauthorized (401)
 * forbidden (403)
 * tooManyRequests (429)
 * internalServerError (500)
 *
 * @see examples at : https://developer.mindsphere.io/apis/iot-iottsaggregates/api-iottsaggregates-samples.html
 *
 * @export
 * @class TimeSeriesAggregateClientV4
 * @extends {SdkClient}
 */
export class TimeSeriesAggregateClientV4 extends SdkClient {
    private _baseUrl: string = "/api/iottsaggregates/v4";

    /**
     *
     * Returns a list of aggregates for a given asset and aspect. The time range of
     * the aggregates can be defined by a combination of parameters;
     * such as from, to, intervalUnit, intervalValue and count.
     * Time range can be specified anywhere in past or future for which timeseries data is present.
     * In the case no time series data was available for an aggregation interval, no aggregate will be returned.
     * Pre-computed aggregates are aligned with the tenant's time zone.
     * Limitations
     * *
     * * The maximum time range for querying DAY/WEEK/MONTH aggregates is 90 days.
     * * The maximum time range for querying HOUR aggregates is 7 days.
     * * The maximum time range for querying 2 MINUTE aggregates is 24 hours.
     * * Parameter Auto-Completion
     * * The parameters from, to, intervalUnit, intervalValue, and count are used to determine the time range and interval length to return aggregates for. Intelligent auto-completion is applied to allow clients to only provide a subset of the parameters, according to the following rules:
     *
     * In case none of the parameters is provided, intervalUnit is set to DAY, intervalValue is set to 1, to is set to the current time, and from is set to the current time minus 7 days.
     * If only from is provided, to is set such that a 90 day time range results or, in case a larger range would result, to the current time. from is truncated to date-only for this calculation.
     * If only to is provided, from is set such that a 90 day time range results.
     * If intervalUnit, intervalValue and count are provided, it suffices to either provide to or from in addition. The missing parameter is determined based on the time range computed from intervalUnit, intervlValue and count.
     * If intervalUnit and intervalValue are not provided, the largest available interval length fitting into the used time range is chosen.
     * If count is not provided, but the other parameters are, count will be derived based on the time range divided by the intervalUnit and intervalValue.
     * In case parameters from or to are provided but do not coincide with the pre-calculated interval boundaries of the used interval, from and to are shifted such that the overall time range contains the provided one and time range boundaries coincide with interval boundaries.
     * If from, to and count are provided, intervalUnit, intervalValue is determined based on the time range divided by count.
     *
     * @param {{
     *             assetId: string;
     *             aspectName: string;
     *             from?: string;
     *             to?: string;
     *             intervalValue?: number;
     *             intervalUnit?: string;
     *             select?: string;
     *             count?: string;
     *         }} params
     *
     * @param {string} params.assetId Unique identifier of the asset.
     * @param {string} params.aspectName Name of the aspect.

     * @param params.from
     * Beginning of the time range to read. ISO date format is supported with timezone.
     * If no timezone is provided then it is considered as UTC aligned date-time.
     * @param params.to
     * End of the time range to read. ISO date format is supported with timezone.
     * If no timezone is provided then it is considered as UTC aligned date-time. Example date time values are
     * @param params.intervalValue
     * Interval duration for the aggregates in intervalUnits. Supported values depends upon intervalUnit
     * * intervalUnit	Supported intervalValue
     * * minute	2,4,6,8...58,60 (multiple of 2)
     * * hour	1,2,3,4,...23,24
     * * day	1,2,3,4,...89,90
     * * week	1,2,3,4,...11,12
     * * month	1,2,3
     * @param params.intervalUnit
     * Interval duration unit for the aggregates. Supported values are
     * * minute
     * * hour
     * * day
     * * week
     * * month
     * @param param.select
     * If this parameter is not provided all variables of aspect are returned in response. User can provide comma separated variables names in order to filter out variables. Variable names followed by '.' and aggregate field will return specific fields of aggregate object.
     * Example 1- select=variable1,variable2 If above parameter provided in request, agregate response will only contain variable1 and variable2.
     * Example 2- select=variable1.sum,variable2.sum If above parameter provided in request, agregate response will only contain variable1 and variable2 with only sum in aggregate response object.
     * @param param.count
     * This parameter is used to get number of aggregate objects in response.
     *
     * @returns {Promise<TimeSeriesAggregateModelsV4.Aggregates>}
     *
     * @example
     * from, to date formats
     * Beginning of the time range to read. ISO date format is supported with timezone.
     * If no timezone is provided then it is considered as UTC aligned date-time.
     * Example date time values are
     * * Date-time with no timezone provided	2020-02-20Z
     * * 2020-02-20T10Z
     * * 2020-02-20T10:30Z
     * * 2020-02-20T10:30:00Z
     * * 2020-02-20T10:30:00.000Z
     * * Date-time with timezone provided	2020-02-20-05:00
     * * 2020-02-20T10-05:00
     * * 2020-02-20T10:30-05:00
     * * 2020-02-20T10:30:00-05:00
     * * 2020-02-20T10:30:00.000-05:0
     *
     * @memberOf TimeSeriesAggregateClientV4
     */
    public async GetAggregates(params: {
        assetId: string;
        aspectName: string;
        from?: string;
        to?: string;
        intervalValue?: number;
        intervalUnit?: string;
        select?: string;
        count?: string;
    }): Promise<TimeSeriesAggregateModelsV4.Aggregates> {
        const qs = toQueryString(params);
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/aggregates?${qs}`,
            message: "GetTimeSeriesAggregates",
        })) as TimeSeriesAggregateModelsV4.Aggregates;
    }
}
