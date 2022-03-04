export namespace CommandingModels {
    /**
     *
     * @export
     * @class RequiredError
     * @extends {Error}
     */
    export class RequiredError extends Error {
        name: "RequiredError" = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *
     * @export
     * @interface Command
     */
    export interface Command {
        /**
         * Unique identifier of the command.
         * @type {string}
         * @memberof Command
         */
        id?: string;
        /**
         * Mqtt client Id. It is the unique identifier of the device.
         * @type {string}
         * @memberof Command
         */
        clientId?: string;
        /**
         * Id of tenant which client belongs to.
         * @type {string}
         * @memberof Command
         */
        tenantId?: string;
        /**
         * The status of the command received from the agent.
         * @type {string}
         * @memberof Command
         */
        status?: Command.StatusEnum;
        /**
         * The response data received from the MQTT client after the command execution.
         * @type {{ [key: string]: string; }}
         * @memberof Command
         */
        response?: { [key: string]: string };
        /**
         * The last time command response was received and updated (In UTC format).
         * @type {string}
         * @memberof Command
         */
        updatedAt?: string;
    }

    /**
     * @export
     * @namespace Command
     */
    export namespace Command {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            EXECUTING = <any>"EXECUTING",
            EXECUTED = <any>"EXECUTED",
            FAILED = <any>"FAILED",
            CANCELED = <any>"CANCELED",
        }
    }

    /**
     *
     * @export
     * @interface CommandListView
     */
    export interface CommandListView {
        /**
         * Unique identifier of the command.
         * @type {string}
         * @memberof CommandListView
         */
        id?: string;
        /**
         * Mqtt client Id.
         * @type {string}
         * @memberof CommandListView
         */
        clientId?: string;
        /**
         * Id of tenant which client belongs to.
         * @type {string}
         * @memberof CommandListView
         */
        tenantId?: string;
        /**
         * The status of the command received from the agent.
         * @type {string}
         * @memberof CommandListView
         */
        status?: CommandListView.StatusEnum;
        /**
         * The last time command response was received and updated (In UTC format).
         * @type {string}
         * @memberof CommandListView
         */
        updatedAt?: string;
    }

    /**
     * @export
     * @namespace CommandListView
     */
    export namespace CommandListView {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            EXECUTING = <any>"EXECUTING",
            EXECUTED = <any>"EXECUTED",
            FAILED = <any>"FAILED",
            CANCELED = <any>"CANCELED",
        }
    }

    /**
     * Error response body model.
     * @export
     * @interface Errors
     */
    export interface Errors {
        /**
         * Concrete error codes and messages are defined at operation error response descriptions in this API specification.
         * @type {Array<any>}
         * @memberof Errors
         */
        errors?: Array<any>;
    }

    /**
     *
     * @export
     * @interface Job
     */
    export interface Job {
        /**
         * Unique identifier of the delivery job.
         * @type {string}
         * @memberof Job
         */
        id?: string;
        /**
         * Name of the delivery job. Minimum allowed length is 1. Maximum allowed length is 128.
         * @type {string}
         * @memberof Job
         */
        name?: string;
        /**
         * List of MQTT client Id's to which the command needs to be sent.
         * @type {Array<string>}
         * @memberof Job
         */
        clientIds?: Array<string>;
        /**
         * Id of tenant which client belongs to.
         * @type {string}
         * @memberof Job
         */
        tenantId?: string;
        /**
         * The status of the delivery job.
         * @type {string}
         * @memberof Job
         */
        status?: Job.StatusEnum;
        /**
         * Command data to be sent to agent.
         * @type {{ [key: string]: string; }}
         * @memberof Job
         */
        data?: { [key: string]: string };
        /**
         * The time at which the job was created. (In UTC format).
         * @type {string}
         * @memberof Job
         */
        createdAt?: string;
        /**
         * The user who created the job
         * @type {string}
         * @memberof Job
         */
        createdBy?: string;
    }

    /**
     * @export
     * @namespace Job
     */
    export namespace Job {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            EXECUTING = <any>"EXECUTING",
            EXECUTED = <any>"EXECUTED",
            CANCELED = <any>"CANCELED",
        }
    }

    /**
     *
     * @export
     * @interface JobListView
     */
    export interface JobListView {
        /**
         * Unique identifier of the delivery job.
         * @type {string}
         * @memberof JobListView
         */
        id?: string;
        /**
         * Name of the delivery job. Minimum allowed length is 1. Maximum allowed length is 128.
         * @type {string}
         * @memberof JobListView
         */
        name?: string;
        /**
         * The status of the delivery job.
         * @type {string}
         * @memberof JobListView
         */
        status?: JobListView.StatusEnum;
        /**
         * The time at which the job was created. (In UTC format).
         * @type {string}
         * @memberof JobListView
         */
        createdAt?: string;
    }

    /**
     * @export
     * @namespace JobListView
     */
    export namespace JobListView {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            EXECUTING = <any>"EXECUTING",
            EXECUTED = <any>"EXECUTED",
            CANCELED = <any>"CANCELED",
        }
    }

    /**
     *
     * @export
     * @interface JobRequest
     */
    export interface JobRequest {
        /**
         * Name of the delivery job. Minimum allowed length is 1. Maximum allowed length is 128.
         * @type {string}
         * @memberof JobRequest
         */
        name: string;
        /**
         * List of MQTT client Id's to which the command will be sent.
         * @type {Array<string>}
         * @memberof JobRequest
         */
        clientIds: Array<string>;
        /**
         * Command data to be sent to MQTT client.
         * @type {{ [key: string]: string; }}
         * @memberof JobRequest
         */
        data: { [key: string]: string };
    }

    /**
     *
     * @export
     * @interface Page
     */
    export interface Page {
        /**
         * the service might decide to return fewer elements per page than requested
         * @type {number}
         * @memberof Page
         */
        size?: number;
        /**
         *
         * @type {number}
         * @memberof Page
         */
        totalElements?: number;
        /**
         *
         * @type {number}
         * @memberof Page
         */
        totalPages?: number;
        /**
         *
         * @type {number}
         * @memberof Page
         */
        number?: number;
    }

    /**
     *
     * @export
     * @interface RelFirst
     */
    export interface RelFirst {
        /**
         *
         * @type {string}
         * @memberof RelFirst
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface RelLast
     */
    export interface RelLast {
        /**
         *
         * @type {string}
         * @memberof RelLast
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface RelNext
     */
    export interface RelNext {
        /**
         *
         * @type {string}
         * @memberof RelNext
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface RelPrev
     */
    export interface RelPrev {
        /**
         *
         * @type {string}
         * @memberof RelPrev
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface RelSelf
     */
    export interface RelSelf {
        /**
         *
         * @type {string}
         * @memberof RelSelf
         */
        href?: string;
    }

    /**
     * Response of the GetDeliveryJobs operation.
     *
     * !fix: manually fixed on 3/4/2022 the swagger documentation is using inline response typing which is contrary to the API guideline.
     *
     * @export
     * @interface DeliveryJobsResponse
     */
    export interface DeliveryJobsResponse {
        _embedded: {
            deliveryJobs: Array<JobListView>;
        };

        page: Page;

        _links: {
            self: RelSelf;
            first: RelFirst;
            prev: RelPrev;
            next: RelNext;
            last: RelLast;
        };
    }

    export interface CommandsResponse {
        _embedded: {
            deliveryJobs: Array<CommandListView>;
        };

        page: Page;

        _links: {
            self: RelSelf;
            first: RelFirst;
            prev: RelPrev;
            next: RelNext;
            last: RelLast;
        };
    }
}
