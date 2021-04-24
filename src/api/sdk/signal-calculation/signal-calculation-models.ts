export namespace SignalCalculationModels {
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
     * @interface Data
     */
    export interface Data extends Array<Signal> {}

    /**
     *
     * @export
     * @interface InputParameters
     */
    export interface InputParameters {
        /**
         *
         * @type {any}
         * @memberof InputParameters
         */
        configuration?: any;
        /**
         *
         * @type {Data}
         * @memberof InputParameters
         */
        data?: Data;
    }

    /**
     *
     * @export
     * @interface InputParametersDirect
     */
    export interface InputParametersDirect {
        /**
         *
         * @type {any}
         * @memberof InputParametersDirect
         */
        configuration?: any;
    }

    /**
     *
     * @export
     * @interface Operand
     */
    export interface Operand {
        /**
         *
         * @type {string}
         * @memberof Operand
         */
        entityId: string;
        /**
         *
         * @type {string}
         * @memberof Operand
         */
        propertySetName: string;
        /**
         *
         * @type {string}
         * @memberof Operand
         */
        propertyName: string;
    }

    /**
     *
     * @export
     * @interface OperandDirect
     */
    export interface OperandDirect {
        /**
         *
         * @type {string}
         * @memberof OperandDirect
         */
        assetId: string;
        /**
         *
         * @type {string}
         * @memberof OperandDirect
         */
        aspectName: string;
        /**
         *
         * @type {string}
         * @memberof OperandDirect
         */
        variableName: string;
        /**
         *
         * @type {Date}
         * @memberof OperandDirect
         */
        from: Date;
        /**
         *
         * @type {Date}
         * @memberof OperandDirect
         */
        to: Date;
    }

    /**
     *
     * @export
     * @interface OperandDirectResult
     */
    export interface OperandDirectResult {
        /**
         *
         * @type {string}
         * @memberof OperandDirectResult
         */
        assetId: string;
        /**
         *
         * @type {string}
         * @memberof OperandDirectResult
         */
        aspectName: string;
        /**
         *
         * @type {string}
         * @memberof OperandDirectResult
         */
        variableName: string;
    }

    /**
     *
     * @export
     * @interface Result
     */
    export interface Result {
        /**
         *
         * @type {string}
         * @memberof Result
         */
        entityId: string;
        /**
         *
         * @type {string}
         * @memberof Result
         */
        propertySetName: string;
        /**
         *
         * @type {string}
         * @memberof Result
         */
        propertyName: string;
    }

    /**
     *
     * @export
     * @interface Signal
     */
    export interface Signal {
        /**
         *
         * @type {string}
         * @memberof Signal
         */
        entityId: string;
        /**
         *
         * @type {string}
         * @memberof Signal
         */
        propertySetName: string;
        /**
         *
         * @type {Array<TimeSeries>}
         * @memberof Signal
         */
        timeSeries: Array<TimeSeries>;
    }

    /**
     *
     * @export
     * @interface SignalDirect
     */
    export interface SignalDirect {
        /**
         *
         * @type {string}
         * @memberof SignalDirect
         */
        assetId: string;
        /**
         *
         * @type {string}
         * @memberof SignalDirect
         */
        aspectName: string;
        /**
         *
         * @type {Array<TimeSeries>}
         * @memberof SignalDirect
         */
        timeSeries: Array<TimeSeries>;
    }

    /**
     *
     * @export
     * @interface TimeSeries
     */
    export interface TimeSeries {
        [key: string]: any | any;

        /**
         * time
         * @type {string}
         * @memberof TimeSeries
         */
        _time: string;
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
        errorMessage?: string;
    }
}
