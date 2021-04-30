export namespace AnomalyDetectionModels {
        
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
     * @interface Anomaly
     */
    export interface Anomaly {
        /**
         * Extent of anomaly at this point
         * @type {number}
         * @memberof Anomaly
         */
        anomalyExtent?: number;
        /**
         * time
         * @type {string}
         * @memberof Anomaly
         */
        time?: string;
    }

    /**
     * 
     * @export
     * @interface JobProcessingException
     */
    export interface JobProcessingException {
        /**
         * 
         * @type {string}
         * @memberof JobProcessingException
         */
        logref?: string;
        /**
         * 
         * @type {string}
         * @memberof JobProcessingException
         */
        message?: string;
    }

    /**
     * 
     * @export
     * @interface Model
     */
    export interface Model {
        /**
         * ID of the created Model.
         * @type {string}
         * @memberof Model
         */
        id?: string;
        /**
         * Timestamp model was created at.
         * @type {string}
         * @memberof Model
         */
        creationTimestamp?: string;
        /**
         * Variables used to train the model (variables from input json).
         * @type {string}
         * @memberof Model
         */
        variables?: string;
        /**
         * Human-friendly name of the model, not an empty string. Maximum length is 255 characters. Only ASCII characters.
         * @type {string}
         * @memberof Model
         */
        name?: string;
    }

    /**
     * 
     * @export
     * @interface ModelError
     */
    export interface ModelError {
        /**
         * 
         * @type {string}
         * @memberof ModelError
         */
        logref?: string;
        /**
         * 
         * @type {string}
         * @memberof ModelError
         */
        message?: string;
    }

    /**
     * 
     * @export
     * @interface NotFoundException
     */
    export interface NotFoundException {
        /**
         * 
         * @type {string}
         * @memberof NotFoundException
         */
        logref?: string;
        /**
         * 
         * @type {string}
         * @memberof NotFoundException
         */
        message?: string;
    }

    /**
     * 
     * @export
     * @interface ReasoningJobInfo
     */
    export interface ReasoningJobInfo {
        /**
         * unique identifier of the job
         * @type {string}
         * @memberof ReasoningJobInfo
         */
        id?: string;
        /**
         * job status
         * @type {string}
         * @memberof ReasoningJobInfo
         */
        status?: ReasoningJobInfo.StatusEnum;
        /**
         * job creation time
         * @type {Date}
         * @memberof ReasoningJobInfo
         */
        timestamp?: Date;
        /**
         * 
         * @type {any}
         * @memberof ReasoningJobInfo
         */
        parameters?: any;
    }

    /**
     * @export
     * @namespace ReasoningJobInfo
     */
    export namespace ReasoningJobInfo {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            SUBMITTED = <any> 'SUBMITTED',
            RUNNING = <any> 'RUNNING',
            SUCCEEDED = <any> 'SUCCEEDED',
            FAILED = <any> 'FAILED'
        }
    }

    /**
     * 
     * @export
     * @interface SubmitReasoningRequest
     */
    export interface SubmitReasoningRequest {
        /**
         * Name of the entity in IoT Timeseries service to read data for.
         * @type {string}
         * @memberof SubmitReasoningRequest
         */
        asset?: string;
        /**
         * Name of the property set in IoT Timeseries service to read data for.
         * @type {string}
         * @memberof SubmitReasoningRequest
         */
        aspect?: string;
        /**
         * List of variables to take from property set in IoT Timeseries service. Only those variables which are both in this list and in the propertySet will be taken. Also this list must be the same as the one used to train the model, in other words training and reasoning must be performed over the same variables.
         * @type {string}
         * @memberof SubmitReasoningRequest
         */
        variables?: string;
        /**
         * Beginning of the time range to read (exclusive) from IoT Timeseries service. Date must follow the specified format 'YYYY-MM-DDThh:mm:ss'.
         * @type {Date}
         * @memberof SubmitReasoningRequest
         */
        from?: Date;
        /**
         * End of the time range to read (inclusive) from IoT Timeseries service. Date must follow the specified format 'YYYY-MM-DDThh:mm:ss'.
         * @type {Date}
         * @memberof SubmitReasoningRequest
         */
        to?: Date;
        /**
         * ID of the folder in Data Exchange Service to get model from. Must not be empty.
         * @type {string}
         * @memberof SubmitReasoningRequest
         */
        modelFolderId?: string;
        /**
         * ID of the folder in Data Exchange Service to save results to. Must not be empty.
         * @type {string}
         * @memberof SubmitReasoningRequest
         */
        resultFolderId?: string;
    }

    /**
     * 
     * @export
     * @interface SubmitTrainingRequest
     */
    export interface SubmitTrainingRequest {
        /**
         * Name of the entity in IoT Timeseries service to read data for.
         * @type {string}
         * @memberof SubmitTrainingRequest
         */
        asset?: string;
        /**
         * Name of the property set in IoT Timeseries service to read data for.
         * @type {string}
         * @memberof SubmitTrainingRequest
         */
        aspect?: string;
        /**
         * List of variables to take from property set in IoT Timeseries service. Only those variables which are both in this list and in the propertySet will be taken. List must contain up to 10 variables.
         * @type {string}
         * @memberof SubmitTrainingRequest
         */
        variables?: string;
        /**
         * Beginning of the time range to read (exclusive) from IoT Timeseries service. Date must follow the specified format 'YYYY-MM-DDThh:mm:ss'.
         * @type {Date}
         * @memberof SubmitTrainingRequest
         */
        from?: Date;
        /**
         * End of the time range to read (inclusive) from IoT Timeseries service. Date must follow the specified format 'YYYY-MM-DDThh:mm:ss'.
         * @type {Date}
         * @memberof SubmitTrainingRequest
         */
        to?: Date;
        /**
         * Anomaly Detection threshold for the distance to check if point belongs to cluster.
         * @type {number}
         * @memberof SubmitTrainingRequest
         */
        epsilon?: number;
        /**
         * Anomaly detection minimum cluster size. Positive. Minimum is 2.
         * @type {number}
         * @memberof SubmitTrainingRequest
         */
        minPointsPerCluster?: number;
        /**
         * Name of the Anomaly Detection distance measure algorithm.
         * @type {string}
         * @memberof SubmitTrainingRequest
         */
        distanceMeasureAlgorithm?: SubmitTrainingRequest.DistanceMeasureAlgorithmEnum;
        /**
         * ID of the folder in Data Exchange Service to save results to. Must not be empty.
         * @type {string}
         * @memberof SubmitTrainingRequest
         */
        resultFolderId?: string;
    }

    /**
     * @export
     * @namespace SubmitTrainingRequest
     */
    export namespace SubmitTrainingRequest {
        /**
         * @export
         * @enum {string}
         */
        export enum DistanceMeasureAlgorithmEnum {
            EUCLIDEAN = <any> 'EUCLIDEAN',
            MANHATTAN = <any> 'MANHATTAN',
            CHEBYSHEV = <any> 'CHEBYSHEV'
        }
    }

    /**
     * 
     * @export
     * @interface Timeseries
     */
    export interface Timeseries {
        [key: string]: any | any;

        /**
         * time
         * @type {string}
         * @memberof Timeseries
         */
        time: string;
    }

    /**
     * 
     * @export
     * @interface TrainingJobInfo
     */
    export interface TrainingJobInfo {
        /**
         * unique identifier of the job
         * @type {string}
         * @memberof TrainingJobInfo
         */
        id?: string;
        /**
         * job status
         * @type {string}
         * @memberof TrainingJobInfo
         */
        status?: TrainingJobInfo.StatusEnum;
        /**
         * job creation time
         * @type {Date}
         * @memberof TrainingJobInfo
         */
        timestamp?: Date;
        /**
         * 
         * @type {any}
         * @memberof TrainingJobInfo
         */
        parameters?: any;
    }

    /**
     * @export
     * @namespace TrainingJobInfo
     */
    export namespace TrainingJobInfo {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            SUBMITTED = <any> 'SUBMITTED',
            RUNNING = <any> 'RUNNING',
            SUCCEEDED = <any> 'SUCCEEDED',
            FAILED = <any> 'FAILED'
        }
    }

    /**
     * 
     * @export
     * @interface WrongArgumentException
     */
    export interface WrongArgumentException {
        /**
         * 
         * @type {string}
         * @memberof WrongArgumentException
         */
        logref?: string;
        /**
         * 
         * @type {string}
         * @memberof WrongArgumentException
         */
        message?: string;
    }

    /**
     *
     * @export
     */
    export const COLLECTION_FORMATS = {
        csv: ",",
        ssv: " ",
        tsv: "\t",
        pipes: "|",
    };
}
