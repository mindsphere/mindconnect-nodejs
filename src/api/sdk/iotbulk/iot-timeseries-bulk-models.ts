export namespace TimeSeriesBulkModels {
    /**
     * Input for time series bulk ingestion job.
     * @export
     * @interface BulkImportInput
     */
    export interface BulkImportInput {
        /**
         *
         * @type {Array<Data>}
         * @memberof BulkImportInput
         */
        data?: Array<Data>;
    }

    /**
     * metadata of input time series files for bulk import.
     * @export
     * @interface Data
     */
    export interface Data {
        /**
         * unique identifier of the entity.
         * @type {string}
         * @memberof Data
         */
        entity: string;
        /**
         * name of the property set.
         * @type {string}
         * @memberof Data
         */
        propertySetName: string;
        /**
         *
         * @type {Array<FileInfo>}
         * @memberof Data
         */
        timeseriesFiles: Array<FileInfo>;
    }

    /**
     *
     * @export
     * @interface Error
     */
    export interface Error {
        /**
         *
         * @type {Date}
         * @memberof Error
         */
        timestamp?: Date;
        /**
         *
         * @type {number}
         * @memberof Error
         */
        status?: number;
        /**
         *
         * @type {string}
         * @memberof Error
         */
        error?: string;
        /**
         *
         * @type {string}
         * @memberof Error
         */
        exception?: string;
        /**
         *
         * @type {string}
         * @memberof Error
         */
        message?: string;
        /**
         *
         * @type {string}
         * @memberof Error
         */
        path?: string;
    }

    /**
     *
     * @export
     * @interface FileInfo
     */
    export interface FileInfo {
        /**
         * File path for hourly time series. E.g, it can be a file path (\"Sample.json\") or it can be a relative path (\"Folder1/Folder2/Sample.json\"). - Supported file format is JSON. - File should have time interval sorted in asscending order.
         * @type {string}
         * @memberof FileInfo
         */
        filePath?: string;
        /**
         * Start time interval. It should match with 'from' time of input file. Supported format is ISO date format.
         * @type {Date}
         * @memberof FileInfo
         */
        from?: Date;
        /**
         * End time interval. It should match with 'to' time of input file. Supported format is ISO date format.
         * @type {Date}
         * @memberof FileInfo
         */
        to?: Date;
    }

    /**
     *
     * @export
     * @interface JobStatus
     */
    export interface JobStatus {
        /**
         * Job id for checking status of bulk ingest job. The request will return below job status.
         * - SUBMITTED - Once job is submitted for bulk ingestion.
         * - IN_PROGRESS - Once job is in progress.
         * - ERROR - Job failed due to invalid input or because of internal error.
         * - SUCCESS - Job is successful and parquet file is uploaded in time series cold store.
         * @type {string}
         * @memberof JobStatus
         */
        id?: string;
        /**
         * Status of bulk ingest job.
         * @type {string}
         * @memberof JobStatus
         */
        status?: JobStatus.StatusEnum;
        /**
         * Message for bulk ingest job.
         * @type {string}
         * @memberof JobStatus
         */
        message?: string;
        /**
         * Job start time in ISO date format.
         * @type {Date}
         * @memberof JobStatus
         */
        startTime?: Date;
        /**
         * Job last modified time in ISO date format.
         * @type {Date}
         * @memberof JobStatus
         */
        lastModified?: Date;

        /**
         * Job id for checking status of bulk ingest job. The request will return below job status. - SUBMITTED - Once job is submitted for bulk ingestion. - IN_PROGRESS - Once job is in progress. - ERROR - Job failed due to invalid input or because of internal error. - SUCCESS - Job is successful and parquet file is uploaded in time series cold store.
         * @type {string}
         * @memberof JobStatus
         */
        jobId?: string;

        /**
         * Job start time in ISO date format.
         * @type {Date}
         * @memberof JobStatus
         */

        jobStartTime?: Date;
        /**
         * Job last modified time in ISO date format.
         * @type {Date}
         * @memberof JobStatus
         */
        jobLastModified?: Date;
    }

    /**
     * @export
     * @namespace JobStatus
     */
    export namespace JobStatus {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            SUBMITTED = <any>"SUBMITTED",
            INPROGRESS = <any>"IN_PROGRESS",
            ERROR = <any>"ERROR",
            SUCCESS = <any>"SUCCESS"
        }
    }

    /**
     *
     * @export
     * @interface Timeseries
     */
    export interface Timeseries {
        /**
         * Array of Timeseries records
         * @type {Array<{ [key: string]: any; }>}
         * @memberof Timeseries
         */
        records: Array<{ [key: string]: any }>;
        /**
         * nextRecord url returned when response is not complete in current response
         * @type {string}
         * @memberof Timeseries
         */
        nextRecord: string;
    }
}
