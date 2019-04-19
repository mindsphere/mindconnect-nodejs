import { CredentialAuth } from "./credential-auth";
import { BulkImportInput, JobStatus } from "./iot-ts-bulk-models";

/**
 * This class is used for the mc iot-bulk-upload command and utilizes the service credential
 * authorization. Don't use this on agent devices.
 *
 * This class allows the bulk import of files containing high frequent data with up to nano-second precision to the IoT Time Series services.
 * Additionally it can be used to retrieve the status of a specific import job and it provides capabilities to read the data back for use in applications.
 *
 * @export
 * @class IotBulkUpload
 * @extends {AgentAuth}
 */
export class IotTsBulkUpload extends CredentialAuth {
    /**
     * Write bulk time series for a given simulation asset, from given set of files for one hour.
     *
     * Bulk imports time series data for a specific asset and aspect.
     * This API can also be used for submitting multiple jobs for same hour interval.
     * The API will not do partial processing of input files, in case the total size for a job for an hour interval exceeds 350 MB.
     *
     * @param {BulkImportInput} jobs
     * Input for time series bulk ingestion job. API does not supports multiple combination of entity and property set name.
     *
     * @returns {Promise<JobStatus>} Promise<JobStatus>
     * The request will return HTTP 400 (BAD REQUEST) for the subsequent cases:
     *
     *  The input entity is not a simulation entity.
     *  Unable to find the tenant.
     *  Unable to find the entity.
     *  Unable to find the property set.
     *  Unable to find the entity type.
     *  The total file size for single / multiple jobs submitted for same hour interval, specific entity and property set exceeds 350 MB.
     *  The input consists of data for multiple combination of entity and property set name.
     *
     * @memberOf IotBulkUpload
     */
    public async PostImportJobs(jobs: BulkImportInput): Promise<JobStatus> {
        await this.RenewToken();
        return {};
    }
}
