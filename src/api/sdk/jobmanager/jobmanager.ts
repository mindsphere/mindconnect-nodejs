import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { JobManagerModels } from "./jobmanager-models";

/**
 * Offers execution mechanisms for running models stored in Model Management module.
 * A schedule is created based on a model identifier and a cron expression so the model will run one or multiple times.
 * Each time a model runs a new job is generated.
 * When the schedule is created it will start according to the cron expression.
 * If a user wants to stop the executions it can update the status of the schedule and the executions will stop.
 * Also the user has the possibility to update again the status and trigger again the schedule.
 * If a user does not want to run a model multiple times or based on a schedule expression
 * it can start immediately a new job.
 *
 * @export
 * @class JobManagerClient
 * @extends {SdkClient}
 */
export class JobManagerClient extends SdkClient {
    private _baseUrl: string = "/api/jobmanager/v3";

    /**
     * * Jobs
     *
     * Retrieves all the job executions within a tenant, sorted by creationDate descendant order,
     * up to 10.000 items, paged, maximum 100 items per request if no paging parameters are specified.
     * The service purges all jobs older than 90 days that have one of the final statuses
     * (e.g. STOPPED, FAILED, SUCCEEDED).
     *
     * @param {{
     *         pageNumber?: number;
     *         pageSize?: number;
     *         filter?: string;
     *     }} [params]
     * @returns {Promise<JobManagerModels.JobList>}
     *
     * @example Filter example:
     * {"message": {"contains": "Error"},"status": { "or": {{"eq" : "STOPPED"},{"eq" : "FAILED"}}},"creationDate":
     * {{"after": "2018-06-23T20:09:00"}}}
     * @memberOf JobManagerClient
     */
    public async GetJobs(params?: {
        pageNumber?: number;
        pageSize?: number;
        filter?: string;
    }): Promise<JobManagerModels.JobList> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/jobs?${toQueryString(parameters)}`,
        });

        return result as JobManagerModels.JobList;
    }

    /**
     * * Jobs
     *
     * Creates a new job execution based on the model identifier.
     * This endpoint offers the possibility of running a model or an algorithms
     * just one time without the need of providing a schedule string
     * The inputFolderId and outputFolderId are identifiers of data sources provided by
     * Data Exchange module.
     *
     * @param {JobManagerModels.JobParameters} parameter
     * @returns {Promise<JobManagerModels.Job>}
     *
     * @memberOf JobManagerClient
     */
    public async PostJob(parameter: JobManagerModels.JobParameters): Promise<JobManagerModels.Job> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            body: parameter,
            baseUrl: `${this._baseUrl}/jobs`,
        });

        return result as JobManagerModels.Job;
    }

    /**
     *
     * * Jobs
     *
     * Retrieves the details regarding a job execution
     *
     * @param {string} id
     * @returns {Promise<JobManagerModels.Job>}
     *
     * @memberOf JobManagerClient
     */
    public async GetJob(id: string): Promise<JobManagerModels.Job> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/jobs/${id}`,
        });

        return result as JobManagerModels.Job;
    }

    /**
     *
     * * Jobs
     *
     * Stops a job execution. The call sets the job's status to STOPPING,
     * while letting the service to internally handle the additional
     * steps required to get the job into a STOPPED status.
     * Caller is responsible for polling the status until the job has reached
     * a final state. In the event that the stop action fails for various
     * reasons, the job execution can end up with a FAILED status.
     * Existing results that were resulted from execution will be kept and
     * provided to Data Exchange following the parameters used to start the
     * job execution. If no output parameters were defined, any definitive
     * (or partial) results will be lost and cleaned up during the stopping process.
     *
     * @param {string} id
     * @returns {Promise<JobManagerModels.Job>}
     *
     * @memberOf JobManagerClient
     */
    public async StopJob(id: string): Promise<JobManagerModels.Job> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/jobs/${id}/stop`,
        });

        return result as JobManagerModels.Job;
    }

    /**
     * * Schedules
     *
     * Retrieves a list with all schedules stored within the same tenant
     *
     * @param {{
     *         pageNumber?: number;
     *         pageSize?: number;
     *         filter?: string;
     *     }} [params]
     * @returns {Promise<JobManagerModels.ScheduleList>}
     * @example Schedule Filter
     *
     * Complex and flexible filter that can filter by creationDate, name, status, modelId and scheduleString.
     * All the top fields used in the filter are ANDed, but the searched values can use AND and OR operands, including comparison operators where the values allow. All fields are optional.
     * The expected filter format is:
     * ?filter={
     * "status": {
     * "eq": "RUNNING"
     * },"message": {
     * "eq": "Insufficient disk space"
     * },"creationDate": {
     * "gt": "2018-06-23T20:09:00"
     * },
     * "name": {
     * "eq": "Every 2 Months"
     * }
     * }
     *
     * @memberOf JobManagerClient
     */
    public async GetSchedules(params?: {
        pageNumber?: number;
        pageSize?: number;
        filter?: string;
    }): Promise<JobManagerModels.ScheduleList> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/schedules?${toQueryString(parameters)}`,
            body: {},
            additionalHeaders: { "Content-Type": "application/json" }, // ! fix:  April 2021 manual fix for the schedules endpoint
        });

        return result as JobManagerModels.ScheduleList;
    }

    /**
     * * Schedules
     *
     * Schedules a job for execution specified by its model id and a schedule string.
     * The model ID is retrieved from Model Management module after uploading a model.
     * The schedule string follows the cron format. Example 0 15 10 * * ? - will trigger the model at 10:15 am every day
     *
     * @param {JobManagerModels.ScheduleParameters} parameters
     * @returns {Promise<JobManagerModels.ScheduleDetails>}
     *
     * @memberOf JobManagerClient
     */
    public async PostSchedule(
        parameters: JobManagerModels.ScheduleParameters
    ): Promise<JobManagerModels.ScheduleDetails> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            body: parameters,
            baseUrl: `${this._baseUrl}/schedules`,
        });

        return result as JobManagerModels.ScheduleDetails;
    }

    /**
     * * Schedules
     *
     * Retrieves information about a schedule
     *
     * @param {string} id
     * @returns {Promise<JobManagerModels.ScheduleDetails>}
     *
     * @memberOf JobManagerClient
     */
    public async GetSchedule(id: string): Promise<JobManagerModels.ScheduleDetails> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/schedules/${id}`,
        });

        return result as JobManagerModels.ScheduleDetails;
    }

    /**
     * * Schedules
     *
     * Removes a schedule
     *
     * This endpoint offers the possibility of removing a schedule from the storage
     *
     * @param {string} id
     *
     * @memberOf JobManagerClient
     */
    public async DeleteSchedule(id: string) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/schedules/${id}`,
            noResponse: true,
        });
    }

    /**
     *
     * * Jobs
     *
     * Updates the status of the schedule to started.
     * If a schedule has been stopped it can be started again using this endpoint.
     * If a schedule is running, based on the schedule string it creates jobs
     *
     * @param {string} id
     * @returns {Promise<JobManagerModels.ScheduleDetails>}
     *
     * @memberOf JobManagerClient
     */
    public async StartSchedule(id: string): Promise<JobManagerModels.ScheduleDetails> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/schedules/${id}/start`,
        });

        return result as JobManagerModels.ScheduleDetails;
    }

    /**
     * * Schedules
     *
     * Updates the status of the schedule to stopped.
     * If a user wants to stop a schedule this endpoint offers the possibility to update the status
     * of the schedule to stop. When a scheduler is stopped it cannot create new jobs executions
     *
     * @param {string} id
     * @returns {Promise<JobManagerModels.ScheduleDetails>}
     *
     * @memberOf JobManagerClient
     */
    public async StopSchedule(id: string): Promise<JobManagerModels.ScheduleDetails> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/schedules/${id}/stop`,
        });

        return result as JobManagerModels.ScheduleDetails;
    }
}
