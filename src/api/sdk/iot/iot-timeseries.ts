import { checkAssetId, toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { TimeSeriesModels } from "./iot-timeseries-models";

/**
 * Store and query time series data with a precision of 1 millisecond.
 *
 * @export
 * @class TimeSeriesClient
 * @extends {SdkClient}
 */
export class TimeSeriesClient extends SdkClient {
    private _baseUrl: string = "/api/iottimeseries/v3";

    /**
     * Read time series data for a single entity and propertyset. Returns data for a specified time range. Returns the latest value if no range is provided.
     *
     * @param {string} entity
     * @param {string} propertysetname
     * @param {{ from?: Date; to?: Date; limit?: number; select?: string; sort?: string }} [optional]
     * @returns {Promise<TimeSeriesModels.Timeseries[]>}
     *
     * @memberOf TimeSeriesClient
     */
    public async GetTimeSeries(
        entity: string,
        propertysetname: string,
        optional?: {
            from?: Date;
            to?: Date;
            limit?: number;
            select?: string;
            sort?: string;
        }
    ): Promise<TimeSeriesModels.Timeseries[]> {
        checkAssetId(entity);
        const qs = toQueryString(optional);
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/timeseries/${entity}/${propertysetname}?${qs}`,
            message: "GetTimeSeries",
        })) as TimeSeriesModels.Timeseries[];
    }

    /**
     * Returns the data bulk style.
     *
     * ! This is necessary as bulk data upload has a bug with links and limits in December 2019
     *
     * @param {string} entity
     * @param {string} propertysetname
     * @param {{
     *       from?: Date;
     *       to?: Date;
     *       limit?: number;
     *       select?: string;
     *       sort?: string;
     *     }} [optional]
     * @returns {Promise<TimeSeriesModels.BulkTimeseries>}
     *
     * @memberOf TimeSeriesClient
     */
    public async GetTimeSeriesBulkStyle(
        entity: string,
        propertysetname: string,
        optional?: {
            from?: Date;
            to?: Date;
            limit?: number;
            select?: string;
            sort?: string;
        }
    ): Promise<TimeSeriesModels.BulkTimeseries> {
        checkAssetId(entity);
        const qs = toQueryString(optional);
        const url = `${this._baseUrl}/timeseries/${entity}/${propertysetname}?${qs}`;
        return await this.GetNextRecordsBulkStyle(url);
    }

    public async GetNextRecordsBulkStyle(url: string): Promise<TimeSeriesModels.BulkTimeseries> {
        const response = (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: url,
            message: "GetTimeSeries",
            rawResponse: true,
        })) as Response;

        const nextRecord = response.headers
            .get("link")
            // tslint:disable-next-line: quotemark
            ?.replace('; rel="next"', "")
            .replace(/</g, "")
            .replace(/>/g, "")
            .replace(this.GetGateway(), "");
        const values = (await response.json()) as Array<{ [key: string]: any }>;

        return {
            records: values,
            nextRecord: nextRecord,
        } as TimeSeriesModels.BulkTimeseries;
    }

    /**

    /**
     * Write or update time series data for a single entity and propertyset. Existing time series data is overwritten. Data for all properties within a propertyset needs to be provided together.
     *
     * @param {string} entity
     * @param {string} propertysetname
     * @param {[TimeSeriesModels.Timeseries]} timeseries
     * @returns
     *
     * @memberOf TimeSeriesClient
     */
    public async PutTimeSeries(entity: string, propertysetname: string, timeseries: [TimeSeriesModels.Timeseries]) {
        checkAssetId(entity);
        return await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/timeseries/${entity}/${propertysetname}`,
            body: timeseries,
            message: "PutTimeSeries",
            noResponse: true,
        });
    }

    /**
     * Delete time series data for a single entity and propertyset within a given time range.
     * Data for all properties within a propertyset is deleted.
     *
     * @param {string} entity
     * @param {string} propertysetname
     * @param {Date} from
     * @param {Date} to
     * @returns
     *
     * @memberOf TimeSeriesClient
     */
    public async DeleteTimeSeries(entity: string, propertysetname: string, from: Date, to: Date) {
        checkAssetId(entity);
        const qs = toQueryString({ from: from, to: to });
        return await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/timeseries/${entity}/${propertysetname}?${qs}`,
            message: "DeleteTimeSeries",
            noResponse: true,
        });
    }
}
