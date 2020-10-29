export namespace KPICalculationModels {
    /**
     *
     * @export
     * @class RequiredError
     * @extends {Error}
     */
    export class RequiredError extends Error {
        name: string = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *
     * @export
     * @interface Calendar
     */
    export interface Calendar {
        /**
         *
         * @type {Array<CalendarPlannedOutage>}
         * @memberof Calendar
         */
        PlannedOutage?: Array<CalendarPlannedOutage>;
    }

    /**
     *
     * @export
     * @interface CalendarPlannedOutage
     */
    export interface CalendarPlannedOutage {
        /**
         * Inclusive start time of the interval.
         * @type {string}
         * @memberof CalendarPlannedOutage
         */
        from?: string;
        /**
         * Exclusive end time of the interval.
         * @type {string}
         * @memberof CalendarPlannedOutage
         */
        to?: string;
    }

    /**
     *
     * @export
     * @interface ControlSystemEvent
     */
    export interface ControlSystemEvent {
        /**
         * Event type
         * @type {string}
         * @memberof ControlSystemEvent
         */
        type?: ControlSystemEvent.TypeEnum;
        /**
         * time
         * @type {string}
         * @memberof ControlSystemEvent
         */
        time?: string;
    }

    /**
     * @export
     * @namespace ControlSystemEvent
     */
    export namespace ControlSystemEvent {
        /**
         * @export
         * @enum {string}
         */
        export enum TypeEnum {
            SHUTDOWN = <any>"SHUTDOWN",
            NORMALSTOP = <any>"NORMAL_STOP",
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
        logref?: string;
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
     * @interface ExceptionDuringJobProcessing
     */
    export interface ExceptionDuringJobProcessing {
        /**
         *
         * @type {string}
         * @memberof ExceptionDuringJobProcessing
         */
        logref?: string;
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
     * @interface KpiSet
     */
    export interface KpiSet {
        /**
         * Time in hours when not all required data are available.
         * @type {string}
         * @memberof KpiSet
         */
        unknownHours?: string;
        /**
         * Time in hours at the period being under consideration.
         * @type {string}
         * @memberof KpiSet
         */
        periodHours?: string;
        /**
         * Time in hours during the unit was in-service.
         * @type {string}
         * @memberof KpiSet
         */
        serviceHours?: string;
        /**
         * Time in hours during the unit was available, but not in service.
         * @type {string}
         * @memberof KpiSet
         */
        reserveShutdownHours?: string;
        /**
         * Time in hours during the unit was capable of providing service.
         * @type {string}
         * @memberof KpiSet
         */
        availableHours?: string;
        /**
         * Time in hours during the unit was not capable of operation because of operational or equipment failures.
         * @type {string}
         * @memberof KpiSet
         */
        unavailableHours?: string;
        /**
         * Time in hours during the unit (or a major item of equipment) was originally scheduled for a planned outage.
         * @type {string}
         * @memberof KpiSet
         */
        plannedOutageHours?: string;
        /**
         * Time in hours during the unit was unavailable due to a component failure or another condition.
         * @type {string}
         * @memberof KpiSet
         */
        forcedOutageHours?: string;
        /**
         * Probability (expressed in percentage with values between 0.0 and 100.0) that the unit will be usable at a point in time.
         * @type {string}
         * @memberof KpiSet
         */
        availabilityFactor?: string;
        /**
         * Probability (expressed in percentage with values between 0.0 and 100.0) that the unit will be unusable at a point in time.
         * @type {string}
         * @memberof KpiSet
         */
        unavailabilityFactor?: string;
        /**
         * Probability (expressed in percentage with values between 0.0 and 100.0) that the unit will not be in a forced outage condition.
         * @type {string}
         * @memberof KpiSet
         */
        reliabilityFactor?: string;
        /**
         * Probability (expressed in percentage with values between 0.0 and 100.0) that the unit will not be in an operating condition.
         * @type {string}
         * @memberof KpiSet
         */
        serviceFactor?: string;
        /**
         * Probability (expressed in percentage with values between 0.0 and 100.0) that the unit will be in a forced outage condition.
         * @type {string}
         * @memberof KpiSet
         */
        forcedOutageFactor?: string;
        /**
         * Average time between failures which initiate a forced outage.
         * @type {string}
         * @memberof KpiSet
         */
        meanTimeBetweenFailures?: string;
    }

    /**
     *
     * @export
     * @interface KpiStateIndication
     */
    export interface KpiStateIndication {
        /**
         * Timestamp.
         * @type {string}
         * @memberof KpiStateIndication
         */
        timestamp?: string;
        /**
         * Kpi status.
         * @type {string}
         * @memberof KpiStateIndication
         */
        state?: string;
        /**
         * Kpi status source.
         * @type {string}
         * @memberof KpiStateIndication
         */
        source?: string;
    }

    /**
     *
     * @export
     * @interface KpiStateIndicationSet
     */
    export interface KpiStateIndicationSet {
        /**
         *
         * @type {Array<KpiStateIndication>}
         * @memberof KpiStateIndicationSet
         */
        indications?: Array<KpiStateIndication>;
    }

    /**
     *
     * @export
     * @interface RequestParametersBundle
     */
    export interface RequestParametersBundle {
        /**
         *
         * @type {Calendar}
         * @memberof RequestParametersBundle
         */
        calendar?: Calendar;
        /**
         *
         * @type {Array<Timeseries>}
         * @memberof RequestParametersBundle
         */
        timeseries?: Array<Timeseries>;
        /**
         *
         * @type {Array<ControlSystemEvent>}
         * @memberof RequestParametersBundle
         */
        ControlSystemEvents?: Array<ControlSystemEvent>;
    }

    export interface RequestParametersBundleDirect {
        /**
         *
         * @type {Calendar}
         * @memberof RequestParametersBundleDirect
         */
        calendar?: Calendar;
        /**
         *
         * @type {Array<ControlSystemEvent>}
         * @memberof RequestParametersBundleDirect
         */
        ControlSystemEvents?: Array<ControlSystemEvent>;
    }

    /**
     *
     * @export
     * @interface Timeseries
     */
    export interface Timeseries {
        // ! fix: better model for timeseries
        [x: string]: any;
        /**
         * particular variable (number of variables could be arbitary)
         * @type {string}
         * @memberof Timeseries
         */
        variableName?: string;
        /**
         * time
         * @type {string}
         * @memberof Timeseries
         */
        _time?: string;
    }

    /**
     *
     * @export
     * @interface WrongArgumentsException
     */
    export interface WrongArgumentsException {
        /**
         *
         * @type {string}
         * @memberof WrongArgumentsException
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof WrongArgumentsException
         */
        message?: string;
    }
}
