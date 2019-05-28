export namespace SpectrumAnalysisModels {
    /**
     *
     * @export
     * @class RequiredError
     * @extends {Error}
     */
    export class RequiredError extends Error {
        constructor(public field: string, msg?: string) {
            super(msg);
            this.name = "RequiredError";
        }
    }

    /**
     * Server error
     * @export
     * @interface CalculateFrequenciesBadRequestError
     */
    export interface CalculateFrequenciesBadRequestError extends ModelError {}

    /**
     * Server error
     * @export
     * @interface DetectThresholdViolationsBadRequestError
     */
    export interface DetectThresholdViolationsBadRequestError extends ModelError {}

    /**
     * Input data resulted from a Fourier Transformation.
     * @export
     * @interface FFTData
     */
    export interface FFTData {
        /**
         * Maximum value of the frequency from the Fourier Transformation result.
         * @type {number}
         * @memberof FFTData
         */
        maxFFTFrequency: number;
        /**
         * The array with the amplitudes from the Fourier Transformation result.
         * @type {Array<number>}
         * @memberof FFTData
         */
        amplitudes: Array<number>;
    }

    /**
     * Data model describing the Fourier Transformation result.
     * @export
     * @interface FFTOutput
     */
    export interface FFTOutput {
        /**
         *
         * @type {FFTOutputData}
         * @memberof FFTOutput
         */
        data?: FFTOutputData;
        /**
         * Number of samples from the wav file.
         * @type {number}
         * @memberof FFTOutput
         */
        numberOfFFTComponents?: number;
        /**
         * Measure unit for the Fourier Transformation result.
         * @type {string}
         * @memberof FFTOutput
         */
        amplitudeUnit?: string;
    }

    /**
     * Object containg values of the amplitudes and corresponding value of maximum frequencies.
     * @export
     * @interface FFTOutputData
     */
    export interface FFTOutputData {
        /**
         * Maximum value of the frequency from the Fourier Transformation result.
         * @type {number}
         * @memberof FFTOutputData
         */
        maxFFTFrequency?: number;
        /**
         * The array with the amplitudes from the Fourier Transformation result.
         * @type {Array<number>}
         * @memberof FFTOutputData
         */
        amplitudes?: Array<number>;
    }

    /**
     * The input properties for the Fourier transformation processing.
     * @export
     * @interface FFTProperties
     */
    export interface FFTProperties {
        /**
         *
         * @type {WindowType}
         * @memberof FFTProperties
         */
        windowType?: WindowType;
    }

    /**
     *
     * @export
     * @interface InlineResponse400
     */
    export interface InlineResponse400 {
        /**
         *
         * @type {Array<CalculateFrequenciesBadRequestError>}
         * @memberof InlineResponse400
         */
        errors?: Array<CalculateFrequenciesBadRequestError>;
    }

    /**
     *
     * @export
     * @interface InlineResponse4001
     */
    export interface InlineResponse4001 {
        /**
         *
         * @type {Array<DetectThresholdViolationsBadRequestError>}
         * @memberof InlineResponse4001
         */
        errors?: Array<DetectThresholdViolationsBadRequestError>;
    }

    /**
     * Data model describing the breaching of lower threshold.
     * @export
     * @interface LowerDetection
     */
    export interface LowerDetection {
        /**
         * The frequency of the lowest component.
         * @type {number}
         * @memberof LowerDetection
         */
        frequencyAtMinAmplitude?: number;
        /**
         * The lowest value detected.
         * @type {number}
         * @memberof LowerDetection
         */
        minAmplitude?: number;
        /**
         * The percentage of components below the threshold within the frequency interval.
         * @type {number}
         * @memberof LowerDetection
         */
        breachPercentage?: number;
    }

    /**
     *
     * @export
     * @interface ModelError
     */
    export interface ModelError {
        /**
         * Platform wide unique error code.
         * @type {string}
         * @memberof ModelError
         */
        code?: string;
        /**
         * Log correlation id
         * @type {string}
         * @memberof ModelError
         */
        logref?: string;
        /**
         * Short error message in English.
         * @type {string}
         * @memberof ModelError
         */
        message?: string;
    }

    /**
     * Contains the values of frequencies between which the detection is performed and the procesing limit and also the procesing thresholds that specify upper and/or lower limit for breaches to be detected. It is required to specify at least one of the thresholds.
     * @export
     * @interface SpectrumFilter
     */
    export interface SpectrumFilter {
        /**
         * Lower limit of frequency band measured in Hz.
         * @type {number}
         * @memberof SpectrumFilter
         */
        minFrequency?: number;
        /**
         * Upper limit of frequency band measured in Hz.
         * @type {number}
         * @memberof SpectrumFilter
         */
        maxFrequency?: number;
        /**
         * Lower value of the threshold measured in db.
         * @type {number}
         * @memberof SpectrumFilter
         */
        lowerThreshold?: number;
        /**
         * Upper value of the threshold measured in db.
         * @type {number}
         * @memberof SpectrumFilter
         */
        upperThreshold?: number;
    }

    /**
     * Data model containing threshold alert input.
     * @export
     * @interface ThresholdViolationInput
     */
    export interface ThresholdViolationInput {
        /**
         *
         * @type {FFTData}
         * @memberof ThresholdViolationInput
         */
        data: FFTData;
        /**
         *
         * @type {SpectrumFilter}
         * @memberof ThresholdViolationInput
         */
        spectrumFilter: SpectrumFilter;
    }

    /**
     * Data model describing the Threshold Alert result.
     * @export
     * @interface ThresholdViolationOutput
     */
    export interface ThresholdViolationOutput {
        /**
         *
         * @type {UpperDetection}
         * @memberof ThresholdViolationOutput
         */
        upperDetection?: UpperDetection;
        /**
         *
         * @type {LowerDetection}
         * @memberof ThresholdViolationOutput
         */
        lowerDetection?: LowerDetection;
    }

    /**
     * Data model describing the breaching of upper threshold.
     * @export
     * @interface UpperDetection
     */
    export interface UpperDetection {
        /**
         * The frequency of the highest component.
         * @type {number}
         * @memberof UpperDetection
         */
        frequencyAtMaxAmplitude?: number;
        /**
         * The highest value detected.
         * @type {number}
         * @memberof UpperDetection
         */
        maxAmplitude?: number;
        /**
         * The percentage of components above the threshold within the frequency interval.
         * @type {number}
         * @memberof UpperDetection
         */
        breachPercentage?: number;
    }

    /**
     *
     * @export
     * @interface WindowType
     */
    export interface WindowType {
        /**
         * The type of window used for preprocessing input signal.
         * @type {string}
         * @memberof WindowType
         */
        windowType?: WindowType.WindowTypeEnum;
    }

    /**
     * @export
     * @namespace WindowType
     */
    export namespace WindowType {
        /**
         * @export
         * @enum {string}
         */
        export enum WindowTypeEnum {
            FLATTOP = <any>"FLATTOP",
            HAMMING = <any>"HAMMING",
            HANNING = <any>"HANNING",
            BLACKMAN = <any>"BLACKMAN"
        }
    }
}
