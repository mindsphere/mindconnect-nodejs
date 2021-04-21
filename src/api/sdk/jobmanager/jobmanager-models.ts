export namespace JobManagerModels {
    export class RequiredError extends Error {
        name: "RequiredError" = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *
     * @export
     * @interface Errors
     */
    export interface Errors {
        /**
         *
         * @type {Array<VndError>}
         * @memberof Errors
         */
        errors?: Array<VndError>;
    }

    /**
     *
     * @export
     * @interface Job
     */
    export interface Job {
        /**
         *
         * @type {string}
         * @memberof Job
         */
        id?: string;
        /**
         * ID of the model which is to be executed by the jobs
         * @type {string}
         * @memberof Job
         */
        modelId?: string;
        /**
         * ID of the environment in which the model is to be executed
         * @type {string}
         * @memberof Job
         */
        environmentId?: string;
        /**
         *
         * @type {string}
         * @memberof Job
         */
        message?: string;
        /**
         *
         * @type {string}
         * @memberof Job
         */
        status?: Job.StatusEnum | string;
        /**
         *
         * @type {Date}
         * @memberof Job
         */
        creationDate?: Date;
        /**
         * Tenant who executed the job
         * @type {string}
         * @memberof Job
         */
        createdBy?: string;
        /**
         * The input folder with the input data required by the model
         * @type {string}
         * @memberof Job
         */
        inputFolderId?: string;
        /**
         * The output folder were the the results can be found after running the model
         * @type {string}
         * @memberof Job
         */
        outputFolderId?: string;
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
            SUBMITTED = "SUBMITTED",
            STARTING = "STARTING",
            RUNNING = "RUNNING",
            SUCCEEDED = "SUCCEEDED",
            STOPPING = "STOPPING",
            STOPPED = "STOPPED",
            FAILED = "FAILED",
        }
    }

    /**
     *
     * @export
     * @interface JobList
     */
    export interface JobList {
        /**
         *
         * @type {Array<Job>}
         * @memberof JobList
         */
        jobs?: Array<Job>;
        /**
         *
         * @type {Page}
         * @memberof JobList
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface JobParameters
     */
    export interface JobParameters {
        /**
         * ID of the model which is to be executed by the jobs
         * @type {string}
         * @memberof JobParameters
         */
        modelId?: string;
        /**
         * ID of the configuration used to start the environment in which the model is to be executed
         * @type {string}
         * @memberof JobParameters
         */
        configurationId?: string;
        /**
         * The input folder with the input data required by the model
         * @type {string}
         * @memberof JobParameters
         */
        inputFolderId?: string;
        /**
         * The output folder were the the results can be found after running the model
         * @type {string}
         * @memberof JobParameters
         */
        outputFolderId?: string;
        /**
         * Maximum execution time in seconds
         * @type {string}
         * @memberof JobParameters
         */
        maximumExecutionTimeInSeconds?: string;
    }

    /**
     *
     * @export
     * @interface Page
     */
    export interface Page {
        /**
         * Number of current page.
         * @type {number}
         * @memberof Page
         */
        number?: number;
        /**
         * Size of the page
         * @type {number}
         * @memberof Page
         */
        size?: number;
        /**
         * Number of the total pages
         * @type {number}
         * @memberof Page
         */
        totalPages?: number;
        /**
         *
         * @type {number}
         * @memberof Page
         */
        totalElements?: number;
    }

    /**
     *
     * @export
     * @interface ScheduleDetails
     */
    export interface ScheduleDetails {
        /**
         *
         * @type {string}
         * @memberof ScheduleDetails
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof ScheduleDetails
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof ScheduleDetails
         */
        modelId?: string;
        /**
         *
         * @type {string}
         * @memberof ScheduleDetails
         */
        scheduleString?: string;
        /**
         *
         * @type {Date}
         * @memberof ScheduleDetails
         */
        creationDate?: Date;
        /**
         *
         * @type {string}
         * @memberof ScheduleDetails
         */
        createdBy?: string;
        /**
         * schedule status
         * @type {string}
         * @memberof ScheduleDetails
         */
        status?: ScheduleDetails.StatusEnum | string;
    }

    /**
     * @export
     * @namespace ScheduleDetails
     */
    export namespace ScheduleDetails {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            RUNNING = "RUNNING",
            STOPPED = "STOPPED",
        }
    }

    /**
     *
     * @export
     * @interface ScheduleList
     */
    export interface ScheduleList {
        /**
         *
         * @type {Array<ScheduleDetails>}
         * @memberof ScheduleList
         */
        schedules?: Array<ScheduleDetails>;
        /**
         *
         * @type {Page}
         * @memberof ScheduleList
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface ScheduleParameters
     */
    export interface ScheduleParameters {
        /**
         * ID of the model which is to be executed by the jobs
         * @type {string}
         * @memberof ScheduleParameters
         */
        modelId?: string;
        /**
         * ID of the configuration in which the model is to be executed
         * @type {string}
         * @memberof ScheduleParameters
         */
        configurationId?: string;
        /**
         * The cron expression which is used to trigger the (periodical) execution of the model
         * @type {string}
         * @memberof ScheduleParameters
         */
        scheduleString?: string;
        /**
         * Parameter which specifies how many times a job will run (in case the CRON job is a recurrent one)
         * @type {number}
         * @memberof ScheduleParameters
         */
        maximumExecutionTime?: number;
        /**
         * The input folder with the input data required by the model
         * @type {string}
         * @memberof ScheduleParameters
         */
        inputFolderId?: string;
        /**
         * The output folder were the the results can be found after running the model
         * @type {string}
         * @memberof ScheduleParameters
         */
        outputFolderId?: string;
    }

    /**
     *
     * @export
     * @interface VndError
     */
    export interface VndError {
        /**
         *
         * @type {string}
         * @memberof VndError
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof VndError
         */
        message?: string;
        /**
         *
         * @type {string}
         * @memberof VndError
         */
        logref?: string;
    }
}
