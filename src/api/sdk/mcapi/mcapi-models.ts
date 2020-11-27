export namespace MindConnectApiModels {
    /**
     *
     * @export
     * @class RequiredError
     * @extends {Error}
     */
    export class RequiredError extends Error {
        name: "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
            this.name = "RequiredError";
        }
    }

    /**
     *
     * @export
     * @interface Ingestion
     */
    export interface Ingestion {
        /**
         * Timeseries data for each timestamp
         * @type {Array<IngestionTimeseries>}
         * @memberof Ingestion
         */
        timeseries?: Array<IngestionTimeseries>;
    }

    /**
     *
     * @export
     * @interface IngestionTimeseries
     */
    export interface IngestionTimeseries {
        /**
         * Timestamp of the data point
         * @type {string}
         * @memberof IngestionTimeseries
         */
        timestamp: string;
        /**
         * List of datapoint(s)
         * @type {Array<IngestionValues>}
         * @memberof IngestionTimeseries
         */
        values: Array<IngestionValues>;
    }

    /**
     *
     * @export
     * @interface IngestionValues
     */
    export interface IngestionValues {
        /**
         * Unique identifier of the data point
         * @type {string}
         * @memberof IngestionValues
         */
        dataPointId: string;
        /**
         * Timeseries data value for a given data point id
         * @type {string}
         * @memberof IngestionValues
         */
        value: string;
        /**
         * Data Quality Code
         * @type {string}
         * @memberof IngestionValues
         */
        qualityCode: string;
    }

    /**
     *
     * @export
     * @interface Badrequest
     */
    export interface Badrequest {
        /**
         *
         * @type {string}
         * @memberof Badrequest
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Badrequest
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface Conflict
     */
    export interface Conflict {
        /**
         *
         * @type {string}
         * @memberof Conflict
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Conflict
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface DiagnosticActivation
     */
    export interface DiagnosticActivation {
        /**
         * Unique identifier of diagnostic activation resource
         * @type {string}
         * @memberof DiagnosticActivation
         */
        id?: string;
        /**
         * Unique identifier of the agent
         * @type {string}
         * @memberof DiagnosticActivation
         */
        agentId: string;
        /**
         * Status of the activation
         * @type {string}
         * @memberof DiagnosticActivation
         */
        status?: DiagnosticActivation.StatusEnum;
    }

    /**
     * @export
     * @namespace DiagnosticActivation
     */
    export namespace DiagnosticActivation {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            ACTIVE = <any>"ACTIVE",
            INACTIVE = <any>"INACTIVE",
        }
    }

    /**
     *
     * @export
     * @interface DiagnosticActivationStatus
     */
    export interface DiagnosticActivationStatus {
        /**
         * Status of the activation
         * @type {string}
         * @memberof DiagnosticActivationStatus
         */
        status?: DiagnosticActivationStatus.StatusEnum;
    }

    /**
     * @export
     * @namespace DiagnosticActivationStatus
     */
    export namespace DiagnosticActivationStatus {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            ACTIVE = <any>"ACTIVE",
            INACTIVE = <any>"INACTIVE",
        }
    }

    /**
     *
     * @export
     * @interface DiagnosticInformation
     */
    export interface DiagnosticInformation {
        /**
         *
         * @type {string}
         * @memberof DiagnosticInformation
         */
        agentId?: string;
        /**
         *
         * @type {string}
         * @memberof DiagnosticInformation
         */
        correlationId?: string;
        /**
         *
         * @type {string}
         * @memberof DiagnosticInformation
         */
        severity?: DiagnosticInformation.SeverityEnum;
        /**
         *
         * @type {string}
         * @memberof DiagnosticInformation
         */
        message?: string;
        /**
         * Source of diagnostic information.
         * @type {string}
         * @memberof DiagnosticInformation
         */
        source?: string;
        /**
         * State of diagnostic information.
         * @type {string}
         * @memberof DiagnosticInformation
         */
        state?: DiagnosticInformation.StateEnum;
        /**
         * Diagnostic information creation date.
         * @type {Date}
         * @memberof DiagnosticInformation
         */
        timestamp?: Date;
    }

    /**
     * @export
     * @namespace DiagnosticInformation
     */
    export namespace DiagnosticInformation {
        /**
         * @export
         * @enum {string}
         */
        export enum SeverityEnum {
            INFO = <any>"INFO",
            WARN = <any>"WARN",
            ERROR = <any>"ERROR",
        }
        /**
         * @export
         * @enum {string}
         */
        export enum StateEnum {
            ACCEPTED = <any>"ACCEPTED",
            RETRYING = <any>"RETRYING",
            DROPPED = <any>"DROPPED",
            PROCESSING = <any>"PROCESSING",
            FINISHED = <any>"FINISHED",
        }
    }

    /**
     *
     * @export
     * @interface DiagnosticInformationMessage
     */
    export interface DiagnosticInformationMessage {
        /**
         *
         * @type {string}
         * @memberof DiagnosticInformationMessage
         */
        correlationId?: string;
        /**
         *
         * @type {string}
         * @memberof DiagnosticInformationMessage
         */
        severity?: DiagnosticInformationMessage.SeverityEnum;
        /**
         *
         * @type {string}
         * @memberof DiagnosticInformationMessage
         */
        message?: string;
        /**
         * Source of diagnostic information.
         * @type {string}
         * @memberof DiagnosticInformationMessage
         */
        source?: string;
        /**
         * State of diagnostic information.
         * @type {string}
         * @memberof DiagnosticInformationMessage
         */
        state?: DiagnosticInformationMessage.StateEnum;
        /**
         * Diagnostic information creation date.
         * @type {Date}
         * @memberof DiagnosticInformationMessage
         */
        timestamp?: Date;
    }

    /**
     * @export
     * @namespace DiagnosticInformationMessage
     */
    export namespace DiagnosticInformationMessage {
        /**
         * @export
         * @enum {string}
         */
        export enum SeverityEnum {
            INFO = <any>"INFO",
            WARN = <any>"WARN",
            ERROR = <any>"ERROR",
        }
        /**
         * @export
         * @enum {string}
         */
        export enum StateEnum {
            ACCEPTED = <any>"ACCEPTED",
            RETRYING = <any>"RETRYING",
            DROPPED = <any>"DROPPED",
            PROCESSING = <any>"PROCESSING",
            FINISHED = <any>"FINISHED",
        }
    }

    /**
     *
     * @export
     * @interface Error
     */
    export interface Error {
        /**
         *
         * @type {string}
         * @memberof Error
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Error
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface Forbidden
     */
    export interface Forbidden {
        /**
         *
         * @type {string}
         * @memberof Forbidden
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Forbidden
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface Mapping
     */
    export interface Mapping {
        /**
         * Unique identifier of the mapping resource
         * @type {string}
         * @memberof Mapping
         */
        id?: string;
        /**
         * Unique identifier of the agent
         * @type {string}
         * @memberof Mapping
         */
        agentId: string;
        /**
         * Unique identifier of the data point
         * @type {string}
         * @memberof Mapping
         */
        dataPointId: string;
        /**
         * Unit of the data point
         * @type {string}
         * @memberof Mapping
         */
        dataPointUnit?: string;
        /**
         * Type of the data point
         * @type {string}
         * @memberof Mapping
         */
        dataPointType?: Mapping.DataPointTypeEnum;
        /**
         * Unique identifier of the entity
         * @type {string}
         * @memberof Mapping
         */
        entityId: string;
        /**
         *
         * @type {string}
         * @memberof Mapping
         */
        propertySetName: string;
        /**
         *
         * @type {string}
         * @memberof Mapping
         */
        propertyName: string;
        /**
         *
         * @type {string}
         * @memberof Mapping
         */
        propertyUnit?: string;
        /**
         *
         * @type {string}
         * @memberof Mapping
         */
        propertyType?: Mapping.PropertyTypeEnum;
        /**
         *
         * @type {boolean}
         * @memberof Mapping
         */
        qualityEnabled?: boolean;
        /**
         * Identifies auto deleting mapping or keeping mapping.
         * @type {boolean}
         * @memberof Mapping
         */
        keepMapping?: boolean;
        /**
         *
         * @type {any}
         * @memberof Mapping
         */
        validity?: any;
    }

    /**
     * @export
     * @namespace Mapping
     */
    export namespace Mapping {
        /**
         * @export
         * @enum {string}
         */
        export enum DataPointTypeEnum {
            INT = <any>"INT",
            LONG = <any>"LONG",
            DOUBLE = <any>"DOUBLE",
            BOOLEAN = <any>"BOOLEAN",
            STRING = <any>"STRING",
            BIGSTRING = <any>"BIG_STRING",
            TIMESTAMP = <any>"TIMESTAMP",
        }
        /**
         * @export
         * @enum {string}
         */
        export enum PropertyTypeEnum {
            INT = <any>"INT",
            LONG = <any>"LONG",
            DOUBLE = <any>"DOUBLE",
            BOOLEAN = <any>"BOOLEAN",
            STRING = <any>"STRING",
            BIGSTRING = <any>"BIG_STRING",
            TIMESTAMP = <any>"TIMESTAMP",
        }
    }

    /**
     *
     * @export
     * @interface Notfound
     */
    export interface Notfound {
        /**
         *
         * @type {string}
         * @memberof Notfound
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Notfound
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface Order
     */
    export interface Order {
        /**
         * The order the property shall be sorted for.
         * @type {string}
         * @memberof Order
         */
        direction?: Order.DirectionEnum;
        /**
         * The property to order for.
         * @type {string}
         * @memberof Order
         */
        property?: string;
        /**
         * Whether or not the sort will be case sensitive.
         * @type {boolean}
         * @memberof Order
         */
        ignoreCase?: boolean;
        /**
         *
         * @type {string}
         * @memberof Order
         */
        nullHandling?: Order.NullHandlingEnum;
        /**
         * Whether sorting for this property shall be descending.
         * @type {boolean}
         * @memberof Order
         */
        descending?: boolean;
        /**
         * Whether sorting for this property shall be ascending.
         * @type {boolean}
         * @memberof Order
         */
        ascending?: boolean;
    }

    /**
     * @export
     * @namespace Order
     */
    export namespace Order {
        /**
         * @export
         * @enum {string}
         */
        export enum DirectionEnum {
            ASC = <any>"ASC",
            DESC = <any>"DESC",
        }
        /**
         * @export
         * @enum {string}
         */
        export enum NullHandlingEnum {
            NATIVE = <any>"NATIVE",
            NULLSFIRST = <any>"NULLS_FIRST",
            NULLSLAST = <any>"NULLS_LAST",
        }
    }

    /**
     *
     * @export
     * @interface PagedDiagnosticActivation
     */
    export interface PagedDiagnosticActivation {
        /**
         *
         * @type {Array<DiagnosticActivation>}
         * @memberof PagedDiagnosticActivation
         */
        content: Array<DiagnosticActivation>;
        /**
         * Whether the current item is the last one.
         * @type {boolean}
         * @memberof PagedDiagnosticActivation
         */
        last: boolean;
        /**
         * The number of total pages.
         * @type {number}
         * @memberof PagedDiagnosticActivation
         */
        totalPages: number;
        /**
         * The total amount of elements.
         * @type {number}
         * @memberof PagedDiagnosticActivation
         */
        totalElements: number;
        /**
         * The number of elements currently on this page.
         * @type {number}
         * @memberof PagedDiagnosticActivation
         */
        numberOfElements: number;
        /**
         * Whether the current item is the first one.
         * @type {boolean}
         * @memberof PagedDiagnosticActivation
         */
        first: boolean;
        /**
         * The sorting parameters for the page.
         * @type {Array<Order>}
         * @memberof PagedDiagnosticActivation
         */
        sort: Array<Order>;
        /**
         * The size of the page.
         * @type {number}
         * @memberof PagedDiagnosticActivation
         */
        size: number;
        /**
         * The number of the current item.
         * @type {number}
         * @memberof PagedDiagnosticActivation
         */
        number: number;
    }

    /**
     *
     * @export
     * @interface PagedDiagnosticInformation
     */
    export interface PagedDiagnosticInformation {
        /**
         *
         * @type {Array<DiagnosticInformation>}
         * @memberof PagedDiagnosticInformation
         */
        content: Array<DiagnosticInformation>;
        /**
         * Whether the current item is the last one.
         * @type {boolean}
         * @memberof PagedDiagnosticInformation
         */
        last: boolean;
        /**
         * The number of total pages.
         * @type {number}
         * @memberof PagedDiagnosticInformation
         */
        totalPages: number;
        /**
         * The total amount of elements.
         * @type {number}
         * @memberof PagedDiagnosticInformation
         */
        totalElements: number;
        /**
         * The number of elements currently on this page.
         * @type {number}
         * @memberof PagedDiagnosticInformation
         */
        numberOfElements: number;
        /**
         * Whether the current item is the first one.
         * @type {boolean}
         * @memberof PagedDiagnosticInformation
         */
        first: boolean;
        /**
         * The sorting parameters for the page.
         * @type {Array<Order>}
         * @memberof PagedDiagnosticInformation
         */
        sort: Array<Order>;
        /**
         * The size of the page.
         * @type {number}
         * @memberof PagedDiagnosticInformation
         */
        size: number;
        /**
         * The number of the current item.
         * @type {number}
         * @memberof PagedDiagnosticInformation
         */
        number: number;
    }

    /**
     *
     * @export
     * @interface PagedDiagnosticInformationMessages
     */
    export interface PagedDiagnosticInformationMessages {
        /**
         *
         * @type {Array<DiagnosticInformationMessage>}
         * @memberof PagedDiagnosticInformationMessages
         */
        content: Array<DiagnosticInformationMessage>;
        /**
         * Whether the current item is the last one.
         * @type {boolean}
         * @memberof PagedDiagnosticInformationMessages
         */
        last: boolean;
        /**
         * The number of total pages.
         * @type {number}
         * @memberof PagedDiagnosticInformationMessages
         */
        totalPages: number;
        /**
         * The total amount of elements.
         * @type {number}
         * @memberof PagedDiagnosticInformationMessages
         */
        totalElements: number;
        /**
         * The number of elements currently on this page.
         * @type {number}
         * @memberof PagedDiagnosticInformationMessages
         */
        numberOfElements: number;
        /**
         * Whether the current item is the first one.
         * @type {boolean}
         * @memberof PagedDiagnosticInformationMessages
         */
        first: boolean;
        /**
         * The sorting parameters for the page.
         * @type {Array<Order>}
         * @memberof PagedDiagnosticInformationMessages
         */
        sort: Array<Order>;
        /**
         * The size of the page.
         * @type {number}
         * @memberof PagedDiagnosticInformationMessages
         */
        size: number;
        /**
         * The number of the current item.
         * @type {number}
         * @memberof PagedDiagnosticInformationMessages
         */
        number: number;
    }

    /**
     *
     * @export
     * @interface PagedMapping
     */
    export interface PagedMapping {
        /**
         *
         * @type {Array<Mapping>}
         * @memberof PagedMapping
         */
        content: Array<Mapping>;
        /**
         * Whether the current item is the last one.
         * @type {boolean}
         * @memberof PagedMapping
         */
        last: boolean;
        /**
         * The number of total pages.
         * @type {number}
         * @memberof PagedMapping
         */
        totalPages: number;
        /**
         * The total amount of elements.
         * @type {number}
         * @memberof PagedMapping
         */
        totalElements: number;
        /**
         * The number of elements currently on this page.
         * @type {number}
         * @memberof PagedMapping
         */
        numberOfElements: number;
        /**
         * Whether the current item is the first one.
         * @type {boolean}
         * @memberof PagedMapping
         */
        first: boolean;
        /**
         * The sorting parameters for the page.
         * @type {Array<Order>}
         * @memberof PagedMapping
         */
        sort: Array<Order>;
        /**
         * The size of the page.
         * @type {number}
         * @memberof PagedMapping
         */
        size: number;
        /**
         * The number of the current item.
         * @type {number}
         * @memberof PagedMapping
         */
        number: number;
    }

    /**
     *
     * @export
     * @interface PagedRecoverableRecords
     */
    export interface PagedRecoverableRecords {
        /**
         *
         * @type {Array<RecoverableRecords>}
         * @memberof PagedRecoverableRecords
         */
        content: Array<RecoverableRecords>;
        /**
         * Whether the current item is the last one.
         * @type {boolean}
         * @memberof PagedRecoverableRecords
         */
        last: boolean;
        /**
         * The number of total pages.
         * @type {number}
         * @memberof PagedRecoverableRecords
         */
        totalPages: number;
        /**
         * The total amount of elements.
         * @type {number}
         * @memberof PagedRecoverableRecords
         */
        totalElements: number;
        /**
         * The number of elements currently on this page.
         * @type {number}
         * @memberof PagedRecoverableRecords
         */
        numberOfElements: number;
        /**
         * Whether the current item is the first one.
         * @type {boolean}
         * @memberof PagedRecoverableRecords
         */
        first: boolean;
        /**
         * The sorting parameters for the page.
         * @type {Array<Order>}
         * @memberof PagedRecoverableRecords
         */
        sort: Array<Order>;
        /**
         * The size of the page.
         * @type {number}
         * @memberof PagedRecoverableRecords
         */
        size: number;
        /**
         * The number of the current item.
         * @type {number}
         * @memberof PagedRecoverableRecords
         */
        number: number;
    }

    /**
     *
     * @export
     * @interface PayLoadTooLarge
     */
    export interface PayLoadTooLarge {
        /**
         *
         * @type {string}
         * @memberof PayLoadTooLarge
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof PayLoadTooLarge
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface RecoverableRecords
     */
    export interface RecoverableRecords {
        /**
         * Unique identifier of the record
         * @type {string}
         * @memberof RecoverableRecords
         */
        id?: string;
        /**
         * Unique identifier of the record
         * @type {string}
         * @memberof RecoverableRecords
         */
        correlationId?: string;
        /**
         * agentId
         * @type {string}
         * @memberof RecoverableRecords
         */
        agentId?: string;
        /**
         * Ingestion date of the data.
         * @type {Date}
         * @memberof RecoverableRecords
         */
        requestTime?: Date;
        /**
         * Drop reason of data
         * @type {string}
         * @memberof RecoverableRecords
         */
        dropReason?: string;
    }

    /**
     *
     * @export
     * @interface Unauthorized
     */
    export interface Unauthorized {
        /**
         *
         * @type {string}
         * @memberof Unauthorized
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Unauthorized
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface Validity
     */
    export interface Validity {
        /**
         *
         * @type {string}
         * @memberof Validity
         */
        status: Validity.StatusEnum;
        /**
         *
         * @type {Array<string>}
         * @memberof Validity
         */
        reasons: Array<Validity.ReasonsEnum>;
    }

    /**
     * @export
     * @namespace Validity
     */
    export namespace Validity {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            VALID = <any>"VALID",
            INVALID = <any>"INVALID",
        }
        /**
         * @export
         * @enum {string}
         */
        export enum ReasonsEnum {
            MISSINGDATAPOINT = <any>"MISSING_DATAPOINT",
            MISSINGPROPERTY = <any>"MISSING_PROPERTY",
            INVALIDTYPE = <any>"INVALID_TYPE",
            INVALIDUNIT = <any>"INVALID_UNIT",
        }
    }
}
