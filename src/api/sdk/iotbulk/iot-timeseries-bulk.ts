import { checkAssetId, toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { TimeSeriesBulkModels } from "./iot-timeseries-bulk-models";

/**
 * This API allows the bulk import of files containing high frequent data with up to nano-second precision
 * to the IoT Time Series services.
 * Additionally it can be used to retrieve the status of a specific import job and it provides capabilities to read the data back for use in applications.
 *
 * @export
 * @class TimeSeriesBulkClient
 * @extends {SdkClient}
 */
export class TimeSeriesBulkClient extends SdkClient {
    private _baseUrl: string = "/api/iottsbulk/v3";

    /**
     * Bulk imports time series data for a specific asset and aspect.
     * This API can also be used for submitting multiple jobs for same hour interval.
     * The API will not do partial processing of input files, in case the total size for a job for an hour interval exceeds 350 MB.
     *
     * @param {TimeSeriesBulkModels.BulkImportInput} job
     * @returns {Promise<TimeSeriesBulkModels.JobStatus>}
     *
     * @memberOf TimeSeriesBulkClient
     */
    public async PostImportJob(job: TimeSeriesBulkModels.BulkImportInput): Promise<TimeSeriesBulkModels.JobStatus> {
        return (await this.HttpAction({
            verb: "POST",
            baseUrl: `${this._baseUrl}/importJobs`,
            body: job,
            message: "PostImportJob"
        })) as TimeSeriesBulkModels.JobStatus;
    }

    /**
     * Get job status API to get current status of bulk ingest job.
     *
     * @param {string} jobId
     * @returns {Promise<TimeSeriesBulkModels.JobStatus>}
     *
     * @memberOf TimeSeriesBulkClient
     */
    public async GetJobStatus(jobId: string): Promise<TimeSeriesBulkModels.JobStatus> {
        const result = (await this.HttpAction({
            verb: "GET",
            baseUrl: `${this._baseUrl}/importJobs/${jobId}`,
            message: "GetJobStatus"
        })) as any;

        // ! This is unfortunately necessary as the version of the API (3.3.0) on eu1 in April 2019
        // ! was returning properties jobId, jobStartTime, jobLastModified but OpenAPI specification was id, startTime, lastModified
        result.id = result.id || result.jobId;
        result.startTime = result.startTime || result.jobStartTime;
        result.lastModifed = result.lastModifed || result.jobLastModified;

        return result as TimeSeriesBulkModels.JobStatus;
    }

    /**
     * Read time series data for a single entity and property set.
     * Returns data for a specified time range.
     * Returns the latest value if no range is provided.
     * Returns only the selected properties if 'select' parameter is used.
     * Returns a limited number of records if the 'limit' parameter is used
     *
     * @param {string} entity
     * @param {string} propertysetname
     * @param {Date} from
     * @param {Date} to
     * @param {{ limit?: number; select?: string; sort?: string }} [optional]
     * @returns {Promise<TimeSeriesBulkModels.Timeseries[]>}
     *
     * @memberOf TimeSeriesBulkClient
     */
    public async GetTimeSeries(
        entity: string,
        propertysetname: string,
        from: Date,
        to: Date,
        optional?: { limit?: number; select?: string; sort?: string }
    ): Promise<TimeSeriesBulkModels.Timeseries[]> {
        checkAssetId(entity);
        const fromto = toQueryString({ from: from, to: to });
        let qs = toQueryString(optional);
        if (qs !== "") qs = `&${qs}`;
        return (await this.HttpAction({
            verb: "GET",
            baseUrl: `${this._baseUrl}/timeseries/${entity}/${propertysetname}?${fromto}${qs}`,
            message: "GetTimeSeries"
        })) as TimeSeriesBulkModels.Timeseries[];
    }
}
