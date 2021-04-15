export namespace TimeSeriesAggregateModelsV4 {
    export class RequiredError extends Error {
        name: string = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *
     * @export
     * @interface Aggregates
     */
    export interface Aggregates {
        /**
         *
         * @type {Array<any>}
         * @memberof Aggregates
         */
        aggregates?: Array<AggregateItem>;
    }

    /**
     * AggregateItem manually created for the 4.0.0 version of the API
     *
     * @export
     * @interface AggregateItem
     */
    export interface AggregateItem {
        starttime: string;
        endtime: string;
        [key: string]: Variable | any;
    }

    /**
     *
     * @export
     * @interface Errors
     */
    export interface Errors {
        /**
         *
         * @type {Array<any>}
         * @memberof Errors
         */
        errors?: Array<any>;
    }

    /**
     *
     * @export
     * @interface Variable
     */
    export interface Variable {
        /**
         * Number of good records in the aggregated interval.
         * @type {number}
         * @memberof Variable
         */
        countgood?: number;
        /**
         * Number of uncertain records in the aggregated interval.
         * @type {number}
         * @memberof Variable
         */
        countuncertain?: number;
        /**
         * Number of bad records in the aggregated interval.
         * @type {number}
         * @memberof Variable
         */
        countbad?: number;
        /**
         * Sum of the values within the interval.
         * @type {number}
         * @memberof Variable
         */
        sum?: number;
        /**
         * Average of the values within the interval.
         * @type {number}
         * @memberof Variable
         */
        average?: number;
        /**
         * Timestamp of the minimum value within the interval.
         * @type {Date}
         * @memberof Variable
         */
        mintime?: Date;
        /**
         * Minimum value within the interval.
         * @type {number}
         * @memberof Variable
         */
        minvalue?: number;
        /**
         * Timestamp of the maximum value within the interval.
         * @type {Date}
         * @memberof Variable
         */
        maxtime?: Date;
        /**
         * Maximum value within the interval.
         * @type {number}
         * @memberof Variable
         */
        maxvalue?: number;
        /**
         * Timestamp of the first value within the interval.
         * @type {Date}
         * @memberof Variable
         */
        firsttime?: Date;
        /**
         * First value within the interval.
         * @type {number}
         * @memberof Variable
         */
        firstvalue?: number;
        /**
         * Timestamp of the last measurement within the interval.
         * @type {Date}
         * @memberof Variable
         */
        lasttime?: Date;
        /**
         * Last value within the interval.
         * @type {number}
         * @memberof Variable
         */
        lastvalue?: number;
        /**
         * Standard deviation of the values within the interval. It will return null, if number goes beyond Double range during calculation of Standard Deviation.
         * @type {number}
         * @memberof Variable
         */
        sd?: number;
    }
}
