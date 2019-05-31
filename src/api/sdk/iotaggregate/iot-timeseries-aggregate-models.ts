export namespace TimeSeriesAggregateModels {
    /**
     *
     * @export
     * @interface Aggregate
     */
    export interface Aggregate {
        /**
         * Number of good records in the aggregated interval.
         * @type {number}
         * @memberof Aggregate
         */
        countgood?: number;
        /**
         * Number of uncertain records in the aggregated interval.
         * @type {number}
         * @memberof Aggregate
         */
        countuncertain?: number;
        /**
         * Number of bad records in the aggregated interval.
         * @type {number}
         * @memberof Aggregate
         */
        countbad?: number;
        /**
         * Sum of the values within the interval.
         * @type {number}
         * @memberof Aggregate
         */
        sum?: number;
        /**
         * Average of the values within the interval.
         * @type {number}
         * @memberof Aggregate
         */
        average?: number;
        /**
         * Timestamp of the minimum value within the interval.
         * @type {Date}
         * @memberof Aggregate
         */
        mintime?: Date;
        /**
         * Minimum value within the interval.
         * @type {number}
         * @memberof Aggregate
         */
        minvalue?: number;
        /**
         * Timestamp of the maximum value within the interval.
         * @type {Date}
         * @memberof Aggregate
         */
        maxtime?: Date;
        /**
         * Maximum value within the interval.
         * @type {number}
         * @memberof Aggregate
         */
        maxvalue?: number;
        /**
         * Timestamp of the first value within the interval.
         * @type {Date}
         * @memberof Aggregate
         */
        firsttime?: Date;
        /**
         * First value within the interval.
         * @type {number}
         * @memberof Aggregate
         */
        firstvalue?: number;
        /**
         * Timestamp of the last measurement within the interval.
         * @type {Date}
         * @memberof Aggregate
         */
        lasttime?: Date;
        /**
         * Last value within the interval.
         * @type {number}
         * @memberof Aggregate
         */
        lastvalue?: number;
    }

    /**
     * Aggregates for the properties of the propertyset
     * @export
     * @interface Aggregates
     */
    export interface Aggregates {
        [key: string]: Aggregate | any;

        /**
         * !fix: manual fix for the 3.2.0 version of the API, starttime is not optional
         * start time of the interval (exclusive)
         * @type {Date}
         * @memberof Aggregates
         */
        starttime: Date;
        /**
         * !fix: manual fix for the 3.2.0 version of the API, endtime is not optional
         * end time of the interval (inclusive)
         * @type {Date}
         * @memberof Aggregates
         */
        endtime: Date;
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
