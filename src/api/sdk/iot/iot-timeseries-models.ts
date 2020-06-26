export namespace TimeSeriesModels {
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
     * @interface Timeseries
     */
    export interface Timeseries {
        [x: string]: any;
        /**
         * Timestamp of the data points.
         * @type {Date}
         * @memberof Timeseries
         */
        _time: Date | string;
        /**
         * Property as specified in the property set type configuration
         * @type {string}
         * @memberof Timeseries
         */
        exampleproperty0?: string;
        /**
         * Quality code for a property as specified in the property set type configuration
         * @type {number}
         * @memberof Timeseries
         */
        exampleproperty0_qc?: number;
        /**
         * Property as specified in the property set type configuration
         * @type {number}
         * @memberof Timeseries
         */
        exampleproperty1?: number;
    }

    export interface BulkTimeseries {
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
        nextRecord?: string;
    }

    /**
     *
     * @export
     * @interface Toomanyrequests
     */
    export interface Toomanyrequests {
        /**
         *
         * @type {string}
         * @memberof Toomanyrequests
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Toomanyrequests
         */
        message?: string;
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
}
