import { SdkClient } from "../common/sdk-client";
import { SpectrumAnalysisModels } from "./spectrum-analysis-models";

export class SpectrumAnalysisClient extends SdkClient {
    private _baseUrl = "/api/spectrumanalysis/v3";

    public async CalculateFrequencies(
        file: string | Buffer,
        fftProperties: SpectrumAnalysisModels.FFTProperties
    ): Promise<SpectrumAnalysisModels.FFTOutput> {
        return ({} as unknown) as SpectrumAnalysisModels.FFTOutput;
    }
}
