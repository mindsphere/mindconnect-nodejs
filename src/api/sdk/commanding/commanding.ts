import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { CommandingModels } from "./commanding-models";

/**
 * Commanding is a service that provides the APIs to manage delivery jobs to send commands to MQTT clients for execution.
 *
 * Limitations
 * The maximum number of clients to which a command can be published is 20.
 * Command data size is restricted to 4kB.
 *
 * @export
 * @class CommandingClient
 * @extends {SdkClient}
 */
export class CommandingClient extends SdkClient {
    private _baseUrl: string = "/api/commanding/v3";

    /**
     * Creates a delivery job.
     *
     * A delivery job is used to send an MQTT command to a list of clients for execution.
     * The following validations are performed when a delivery job is created.
     * The provided clients must be valid.
     * * Maximum number of clients can be 20 in a delivery job.
     * * Data size is restricted to 4kB.
     *
     * @param {CommandingModels.JobRequest} jobRequest Object describing the Job request
     * @returns {Promise<CommandingModels.Job>}
     *
     * @memberOf CommandingClient
     */
    public async PostDeliveryJob(jobRequest: CommandingModels.JobRequest): Promise<CommandingModels.Job> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/deliveryJobs`,
            body: jobRequest,
        });

        return result as CommandingModels.Job;
    }

    /**
     *
     * Get all delivery jobs
     *
     * @param {{
     *         filter?: string;
     *         page?: number;
     *         size?: number;
     *     }} [params]
     * @returns {Promise<CommandingModels.DeliveryJobsResponse>}
     *
     * @param params.filter
     * JSON string describing filter operations performed on delivery jobs to be returned. The following fields and operations are supported
     * Filter
     * name: eq, in, endsWith,startsWith, contains
     * createdAt: before, after, between
     *
     * @example
     * // Unencoded example filter value to fetch all delivery jobs for name "test"
     * { "name": "test" }
     * { "name": { "startsWith" : "test" }}
     *
     * @example
     * // Unencoded example filter value to fetch all delivery jobs based on createdAt:
     * {"createdAt": {"between": "[2021-11-06T13:46:00Z, 2021-11-11T13:46:00Z]"}}
     * {"createdAt": {"after": "2021-11-06T13:46:00Z"}}
     * {"createdAt": {"before": "2021-11-06T13:46:00Z"}}
     *
     *
     * @param params.size
     * The maximum number of elements returned in one page.
     * Default value is 20.
     * Maximum allowed value is 100.
     *
     *
     * @param params.page
     * The zero-based index of the page to be returned.
     * Default value - 0.
     *
     * @memberOf CommandingClient
     */
    public async GetDeliveryJobs(params?: {
        filter?: string;
        page?: number;
        size?: number;
    }): Promise<CommandingModels.DeliveryJobsResponse> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/deliveryJobs?${toQueryString(params)}`,
        });
        return result as CommandingModels.DeliveryJobsResponse;
    }

    /**
     * Get the delivery job by Id
     *
     * @param {string} jobid
     * @returns {Promise<CommandingModels.Job>}
     *
     * @memberOf CommandingClient
     */
    public async GetDeliveryJob(jobid: string): Promise<CommandingModels.Job> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/deliveryJobs/${jobid}`,
        });
        return result as CommandingModels.Job;
    }

    /**
     * Delete the job and its related commands.
     *
     * @param {string} jobid
     *
     * @memberOf CommandingClient
     */
    public async DeleteDeliveryJob(jobid: string) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/deliveryJobs/${jobid}`,
            noResponse: true,
        });
    }

    /**
     *
     * Get all the commands for the given delivery job Id.
     *
     * @param {string} id
     * @param {{filter?: string; page?: number; size?: number}} [params]
     * @returns {Promise<CommandingModels.CommandsResponse>}
     *
     * @param params.filter
     * JSON string describing filter operations performed on commands associated with a delivery job to be returned.
     * The following fields and operations are supported
     *
     * clientId: eq, in, endsWith,startsWith, contains
     * status: eq, in, endsWith,startsWith, contains
     * updatedAt: before, after, between
     *
     * @example
     * // Unencoded example filter value to fetch all commands associated with delivery job for clientId "punint05_testDevice":
     * { "clientId": "punint05_testDevice" }
     * { "clientId": { "startsWith" : "punint05" }}
     * // Unencoded example filter value to fetch all commands associated with delivery job for status "EXECUTED":
     * { "status": "EXECUTED" }
     * { "status": { "startsWith" : "EXE" }}
     * // Unencoded example filter value to fetch all commands associated with delivery job based on updatedAt:
     * {"updatedAt": {"between": "[2021-08-06T13:46:00Z, 2021-11-11T13:46:00Z]"}}
     * {"updatedAt": {"after": "2021-11-06T13:46:00Z"}}
     * {"updatedAt": {"before": "2021-11-06T13:46:00Z"}}
     *
     * @param params.size
     * The maximum number of elements returned in one page.
     * Default value is 20.
     * Maximum allowed value is 100.
     *     *
     * @param params.page
     * The zero-based index of the page to be returned.
     * Default value - 0.
     * @memberOf CommandingClient
     */
    public async GetDeliveryJobCommands(
        id: string,
        params?: { filter?: string; page?: number; size?: number }
    ): Promise<CommandingModels.CommandsResponse> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/deliveryJobs/${id}/commands?${toQueryString(params)}`,
        });
        return result as CommandingModels.CommandsResponse;
    }

    /**
     *
     * Get the command associated with a delivery job by command Id
     *
     * @param {string} id
     * @param {string} commandId
     * @returns {Promise<CommandingModels.Command>}
     *
     * @memberOf CommandingClient
     */
    public async GetDeliveryJobCommand(id: string, commandId: string): Promise<CommandingModels.Command> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/deliveryJobs/${id}/commands/${commandId}`,
        });
        return result as CommandingModels.Command;
    }
}
