import { SdkClient } from "../common/sdk-client";
import { SpectrumAnalysisModels } from "./spectrum-analysis-models";
import { spectralAnalysisTemplate } from "./spectrum-analysis-template";

/**
 * Signal Spectrum Analysis API
 *
 * * Fourier Transformation
 * * Provides Fourier Transform functionality for sound analysis.
 *
 * @export
 * @class SpectrumAnalysisClient
 * @extends {SdkClient}
 */
export class SpectrumAnalysisClient extends SdkClient {
    private _baseUrl = "/api/spectrumanalysis/v3";

    /**
     * Decomposes the sound file into frequency components and returns the amplitude of each component.
     * By default a FLATTOP window is applied before the Fourier transformation to help improve processing results.
     *
     * @param {Buffer} file
     * The sound file that is transformed.
     * If the sound is stereo then an average operation is made to obtain one channel.
     * Supports up to 1MB input files and the file must be either 8 bits or 16 bits wav format.
     * @param {SpectrumAnalysisModels.WindowType.WindowTypeEnum} [windowType]
     *
     * The input properties for the Short Time Fourier transformation processing. windowType -
     * the type of window used for preprocessing input signal.
     * The allowed values for window type are: FLATTOP, HAMMING, HANNING and BLACKMAN.
     * The input format for the paramater is a JSON string like the example below
     *
     * @param {{ filename?: string; mimetype?: string }} [params]
     * @returns {Promise<SpectrumAnalysisModels.FFTOutput>}
     *
     * @memberOf SpectrumAnalysisClient
     */
    public async CalculateFrequencies(
        file: Buffer,
        windowType?: SpectrumAnalysisModels.WindowType.WindowTypeEnum,
        params?: { filename?: string; mimetype?: string }
    ): Promise<SpectrumAnalysisModels.FFTOutput> {
        const selectedWindowType = windowType || SpectrumAnalysisModels.WindowType.WindowTypeEnum.FLATTOP;
        const parameters = params || {};
        const { filename, mimetype } = parameters;

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/calculateFrequencies`,
            body: spectralAnalysisTemplate(file, filename, selectedWindowType.toString(), mimetype),
            multiPartFormData: true
        });

        return result as SpectrumAnalysisModels.FFTOutput;
    }

    /**
     * * Threshold Alert
     * * Performs amplitude breaching detection.
     * * Detects out of bounds frequency amplitudes inside a frequency range.
     *
     * Detects Fourier Transformation components which breach given thresholds. (Either lower, upper thresholds or both)
     *
     * @param {SpectrumAnalysisModels.ThresholdViolationInput} data
     *
     * Data structure with two parts - data and spectrumFilter.
     *  * data - array of amplitudes of frequency components as returned by the Fourier Transformation.
     *  * Conforms to data array from output of /calculateFrequencies.
     *  * spectrumFilter - represents a frequency interval and thresholds that, when breached, will be signalled in the response.
     *  * You can specify either lower or upper thresholds, or both but at least one of the thresholds must be specified.
     * @returns {Promise<SpectrumAnalysisModels.ThresholdViolationOutput>}
     *
     * @memberOf SpectrumAnalysisClient
     */
    public async DetectThresholdViolations(
        data: SpectrumAnalysisModels.ThresholdViolationInput
    ): Promise<SpectrumAnalysisModels.ThresholdViolationOutput> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/detectThresholdViolations`,
            body: data
        });
        return result as SpectrumAnalysisModels.ThresholdViolationOutput;
    }
}
