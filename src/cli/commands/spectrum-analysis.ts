import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { SpectrumAnalysisModels } from "../../api/sdk/spectrum/spectrum-analysis-models";
import { retry, throwError } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    proxyLog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";
import ora = require("ora");
const mime = require("mime-types");
let color = getColor("blue");

export default (program: Command) => {
    program
        .command("spectrum-analysis")
        .alias("sp")
        .option(
            "-f, --file <fileToUpload>",
            `wav file to upload or json to analyze (default for threshold detection: ${color("fft.spectrum.json")})`
        )
        .option("-m, --mode [fft|threshold]", "Fast Fourier Transformation or threshold detection", "fft")
        .option(
            "-t, --thresholds <thresholdsFile>",
            "threshold json for threshold detection",
            "thresholds.spectrum.json"
        )
        .option(
            "-t, --output <results>",
            `output file (fft: ${color("fft.spectrum.json")}, threshold: ${color("violations.spectrum.json")})`
        )
        .option("-w, --windowtype [flattop|hamming|hanning|blackman]", "window type for the FFT", "flattop")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-p, --passkey <passkey>", `passkey`)
        .option("-v, --verbose", "verbose output")
        .description(`${color("perform spectrum analysis on a sound file @")}`)
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options, true);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const spinner = ora("uploadingFile");
                    !options.verbose && spinner.start();
                    options.file = options.file || "fft.spectrum.json";
                    const uploadFile = path.resolve(options.file);
                    verboseLog(`File to upload: ${color(uploadFile)}.`, options.verbose, spinner);
                    if (!fs.existsSync(uploadFile)) {
                        throw new Error(`Can't find file ${uploadFile}`);
                    }

                    const outputfilename =
                        options.output || (options.mode === "fft" ? "fft.spectrum.json" : "violations.spectrum.json");

                    fs.existsSync(outputfilename) && throwError(`The file ${outputfilename} already exists`);
                    verboseLog(`Mode: ${options.mode}`, options.verbose, spinner);
                    verboseLog(`OutputFileName: ${outputfilename}`, options.verbose, spinner);

                    const mimeType = mime.lookup(uploadFile);

                    options.mode === "fft" &&
                        mimeType !== "audio/wave" &&
                        throwError("the file must be a audio/wave audio file");
                    options.mode === "threshold" &&
                        mimeType !== "application/json" &&
                        throwError("the file must be a json file!");

                    const spectrumAnalysis = sdk.GetSpectrumAnalysisClient();
                    const buffer = fs.readFileSync(uploadFile);

                    if (options.windowtype !== undefined) {
                        options.windowtype = `${options.windowtype}`.toUpperCase();
                    }

                    if (options.mode === "fft") {
                        const result = (await retry(options.retry, () =>
                            spectrumAnalysis.CalculateFrequencies(
                                buffer,
                                `${options.windowtype}` as unknown as SpectrumAnalysisModels.WindowType.WindowTypeEnum,
                                {
                                    filename: path.basename(uploadFile),
                                    mimetype: mimeType,
                                }
                            )
                        )) as SpectrumAnalysisModels.FFTOutput;

                        fs.writeFileSync(outputfilename, JSON.stringify(result));
                        if (!fs.existsSync("thresholds.spectrum.json")) {
                            fs.writeFileSync(
                                "thresholds.spectrum.json",
                                JSON.stringify(
                                    {
                                        minFrequency: 100,
                                        maxFrequency: 200,
                                        lowerThreshold: -40.25,
                                        upperThreshold: -30,
                                    },
                                    null,
                                    2
                                )
                            );
                            verboseLog("creating thresholds.spectrum.json", options.verbose, spinner);
                        }
                    } else {
                        const fft = JSON.parse(buffer.toString("utf-8")) as unknown as SpectrumAnalysisModels.FFTOutput;
                        const thresholds = fs.readFileSync(path.resolve(options.thresholds), "utf-8");

                        const result = (await retry(options.retry, () =>
                            spectrumAnalysis.DetectThresholdViolations({
                                data: fft.data,
                                spectrumFilter: JSON.parse(thresholds),
                            } as SpectrumAnalysisModels.ThresholdViolationInput)
                        )) as SpectrumAnalysisModels.ThresholdViolationOutput;

                        fs.writeFileSync(outputfilename, JSON.stringify(result, null, 2));
                    }

                    spinner.succeed(`Done. See output in ${color(outputfilename)}`);

                    options.mode === "fft" &&
                        console.log(
                            `\nPlease edit the thresholds in ${color(
                                "thresholds.spectrum.json"
                            )} file before running the threshold violation detection\n`
                        );
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mdsp spectrum-analysis -f machine.wav  \t Decomposes the sound file into frequency components`);
            log(
                `    mdsp spectrum-analysis -f machine.wav --windowtype blackman \t use blackman window type for FFT preprocessing`
            );
            log(
                `    mdsp spectrum-analysis --mode threshold \t detect threshold violations for thresholds stored in ${color(
                    "thresholds.spectrum.json"
                )}`
            );

            serviceCredentialLog(color);
        });
};

function checkRequiredParameters(options: any) {
    options.mode === "fft" &&
        !options.file &&
        errorLog(
            "Missing file name for spectrum-analytics command. Run mdsp sp --help for full syntax and examples.",
            true
        );

    options.mode !== "fft" && options.mode !== "threshold" && errorLog(`Invalid mode: ${options.mode}`, true);
    options.mode === "fft" &&
        ["flattop", "hamming", "hanning", "blackman"].indexOf(options.windowtype) < 0 &&
        errorLog(`invalid window type ${options.windowtype} for FFT`, true);

    fs.existsSync(`${options.output}`) && errorLog(`The file ${options.output} already exists!`, true);
}
