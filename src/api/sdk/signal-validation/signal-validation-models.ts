export namespace SignalValidationModels {
    /**
     *
     * @export
     * @interface Bias
     */
    export interface Bias {
        /**
         * Event description
         * @type {string}
         * @memberof Bias
         */
        description?: Bias.DescriptionEnum;
        /**
         * Timestamp
         * @type {string}
         * @memberof Bias
         */
        timestamp?: string;
    }

    /**
     * @export
     * @namespace Bias
     */
    export namespace Bias {
        /**
         * @export
         * @enum {string}
         */
        export enum DescriptionEnum {
            BIAS = <any>"BIAS"
        }
    }

    /**
     *
     * @export
     * @interface BlankArray
     */
    export interface BlankArray {}

    /**
     *
     * @export
     * @interface DataGap
     */
    export interface DataGap {
        /**
         *
         * @type {Array<Event>}
         * @memberof DataGap
         */
        events?: Array<Event>;
        /**
         *
         * @type {Array<BlankArray>}
         * @memberof DataGap
         */
        interpolatedMeasurements?: Array<BlankArray>;
    }

    /**
     *
     * @export
     * @interface DataGapInterpolated
     */
    export interface DataGapInterpolated {
        /**
         *
         * @type {Array<Event>}
         * @memberof DataGapInterpolated
         */
        events?: Array<Event>;
        /**
         *
         * @type {Array<InterpolatedMeasurement>}
         * @memberof DataGapInterpolated
         */
        interpolatedMeasurements?: Array<InterpolatedMeasurement>;
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
     * @interface Event
     */
    export interface Event {
        /**
         * Describes event kind
         * @type {string}
         * @memberof Event
         */
        description?: Event.DescriptionEnum;
        /**
         * Timestamp
         * @type {string}
         * @memberof Event
         */
        time?: string;
    }

    /**
     * @export
     * @namespace Event
     */
    export namespace Event {
        /**
         * @export
         * @enum {string}
         */
        export enum DescriptionEnum {
            START = <any>"EVENT_START",
            END = <any>"EVENT_END"
        }
    }

    /**
     *
     * @export
     * @interface ExceptionDuringJobProcessing
     */
    export interface ExceptionDuringJobProcessing {
        /**
         *
         * @type {string}
         * @memberof ExceptionDuringJobProcessing
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof ExceptionDuringJobProcessing
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface InterpolatedMeasurement
     */
    export interface InterpolatedMeasurement {
        /**
         * interpolated variable
         * @type {string}
         * @memberof InterpolatedMeasurement
         */
        variableName1?: string;
        /**
         * Timestamp
         * @type {string}
         * @memberof InterpolatedMeasurement
         */
        time?: string;
    }

    /**
     *
     * @export
     * @interface Jump
     */
    export interface Jump {
        /**
         * Event description
         * @type {string}
         * @memberof Jump
         */
        description?: Jump.DescriptionEnum;
        /**
         * Timestamp
         * @type {string}
         * @memberof Jump
         */
        timestamp?: string;
    }

    /**
     * @export
     * @namespace Jump
     */
    export namespace Jump {
        /**
         * @export
         * @enum {string}
         */
        export enum DescriptionEnum {
            JUMP = <any>"JUMP"
        }
    }

    /**
     *
     * @export
     * @interface Noise
     */
    export interface Noise {
        /**
         * Event description
         * @type {string}
         * @memberof Noise
         */
        description?: Noise.DescriptionEnum;
        /**
         * Timestamp
         * @type {string}
         * @memberof Noise
         */
        timestamp?: string;
    }

    /**
     * @export
     * @namespace Noise
     */
    export namespace Noise {
        /**
         * @export
         * @enum {string}
         */
        export enum DescriptionEnum {
            NOISE = <any>"NOISE"
        }
    }

    /**
     *
     * @export
     * @interface Range
     */
    export interface Range {
        /**
         * RANGE
         * @type {string}
         * @memberof Range
         */
        description?: string;
        /**
         * Event kind description
         * @type {string}
         * @memberof Range
         */
        kind?: Range.KindEnum;
        /**
         * Timestamp
         * @type {string}
         * @memberof Range
         */
        timestamp?: string;
    }

    /**
     * @export
     * @namespace Range
     */
    export namespace Range {
        /**
         * @export
         * @enum {string}
         */
        export enum KindEnum {
            UPPERLIMIT = <any>"EVENT_UPPER_LIMIT",
            LOWERLIMIT = <any>"EVENT_LOWER_LIMIT"
        }
    }

    /**
     *
     * @export
     * @interface Spike
     */
    export interface Spike {
        /**
         * Event kind description
         * @type {string}
         * @memberof Spike
         */
        description?: Spike.DescriptionEnum;
        /**
         * Timestamp
         * @type {string}
         * @memberof Spike
         */
        timestamp?: string;
    }

    /**
     * @export
     * @namespace Spike
     */
    export namespace Spike {
        /**
         * @export
         * @enum {string}
         */
        export enum DescriptionEnum {
            SPIKE = <any>"SPIKE"
        }
    }

    /**
     *
     * @export
     * @interface Timeseries
     */
    export interface Timeseries {
        /**
         * particular variable (number of variables could be arbitary)
         * @type {string}
         * @memberof Timeseries
         */
        variableName1?: string;
        /**
         * particular variable (number of variables could be arbitary)
         * @type {string}
         * @memberof Timeseries
         */
        variableName2?: string;
        /**
         * particular variable (number of variables could be arbitary)
         * @type {string}
         * @memberof Timeseries
         */
        variableName3?: string;
        /**
         * time
         * @type {string}
         * @memberof Timeseries
         */
        _time: string;
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
        id?: string;
        /**
         *
         * @type {string}
         * @memberof WrongArgumentException
         */
        message?: string;
    }
}
