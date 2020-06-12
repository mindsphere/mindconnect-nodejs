import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { MindSphereSdk, SignalValidationModels } from "../../api/sdk";
import { decrypt, loadAuth, retry, throwError } from "../../api/utils";
import {
    errorLog,
    generateTestData,
    getColor,
    homeDirLog,
    proxyLog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";

const color = getColor("blue");

export default (program: CommanderStatic) => {
    program
        .command("signal-validation")
        .alias("sv")
        .option("-f, --file <timeseries>", `timeseries file`, `timeseries-sample.json`)
        .option("-o, --output <output>", `result-file (signal-validation-${color("mode")}.json)`)
        .option(
            "-m, --mode [testdata|range|spike|jumps|noise|gaps|interpolate|bias]",
            `mode see ${color("@ Additional Documentation")}`
        )
        .option("-n, --variablename [variablename]", `this variable will be taken from timeseries`, `variable1`)
        .option("-l, --lowerlimit [lowerlimit]", `processing lower limit (for range)`)
        .option("-u, --upperlimit [upperlimit]", `processing upper limit (for range)`)
        .option("-w, --windowsize [windowsize]", `processing window size`)
        .option("-r, --windowradius [windowradius]", `processing window radius (for noise)`)
        .option("-t, --threshold [threshold]", `processing threshold`)
        .option("-s, --step [step]", `processing step (for bias detection) `)
        .option("-z, --size [size]", `generating test data size `, "100")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-p, --passkey <passkey>", `passkey`)
        .option("-v, --verbose", "verbose output")
        .description(`${color("perform signal validation @")}`)
        .action((options) => {
            (async () => {
                try {
                    checkParameters(options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const auth = loadAuth();
                    const sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, options.passkey) });

                    const signalvalidation = sdk.GetSignalValidationClient();

                    if (options.mode === "testdata") {
                        createFile(options);
                        process.exit(0);
                    }

                    const timeseriesData = fs.readFileSync(options.file).toString();
                    const timeseries = JSON.parse(timeseriesData) as SignalValidationModels.Timeseries[];

                    let result;

                    if (options.mode === "range") {
                        result = await retry(options.retry, () =>
                            signalvalidation.DetectRangeViolations(timeseries, {
                                variableName: options.variablename,
                                lowerLimit: options.lowerlimit,
                                upperLimit: options.upperlimit,
                            })
                        );
                    } else if (options.mode === "spike") {
                        result = await retry(options.retry, () =>
                            signalvalidation.DetectSpikes(timeseries, {
                                variableName: options.variablename,
                                windowSize: options.windowsize,
                            })
                        );
                    } else if (options.mode === "jumps") {
                        result = await retry(options.retry, () =>
                            signalvalidation.DetectJumps(timeseries, {
                                variableName: options.variablename,
                                windowSize: options.windowsize,
                            })
                        );
                    } else if (options.mode === "noise") {
                        result = await retry(options.retry, () =>
                            signalvalidation.DetectNoise(timeseries, {
                                variableName: options.variablename,
                                windowRadius: options.windowradius,
                                threshold: options.threshold,
                            })
                        );
                    } else if (options.mode === "gaps") {
                        result = await retry(options.retry, () =>
                            signalvalidation.DetectGaps(timeseries, {
                                variableName: options.variablename,
                                threshold: options.threshold,
                            })
                        );
                    } else if (options.mode === "interpolate") {
                        result = await retry(options.retry, () =>
                            signalvalidation.DetectGapsAndInterpolate(timeseries, {
                                variableName: options.variablename,
                                threshold: options.threshold,
                            })
                        );
                    } else if (options.mode === "bias") {
                        result = await retry(options.retry, () =>
                            signalvalidation.DetectBias(timeseries, {
                                variableName: options.variablename,
                                windowSize: options.windowsize,
                                threshold: options.threshold,
                                step: options.step,
                            })
                        );
                    } else {
                        throw new Error(`inalid  mode ${options.mode}`);
                    }

                    const validationResult = JSON.stringify(result, null, 2);
                    verboseLog(validationResult, options.verbose);
                    const outputFile = options.output || `signal-validation-${options.mode}.json`;
                    fs.writeFileSync(outputFile, validationResult);
                    console.log(
                        `The result of the ${color(options.mode)} operation was written into ${color(outputFile)} file.`
                    );
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc signal-validation --mode range --lowerlimit \ -1 --upperlimit 1  \t performes the range validation for range [-1..1]`
            );
            log(`    mc signal-validation -mode jumps --windowsize 12  \t\t\t searches for jumps in the data`);
            log(
                `    mc signal-validation --mode interpolate --threshold 1000  \t\t interpolates a value for every gap > 1000ms`
            );
            log("\n  Additional Documentation:\n");
            log(
                `    ${color(
                    "https://developer.mindsphere.io/apis/analytics-signalvalidation/api-signalvalidation-basics.html"
                )}`
            );

            serviceCredentialLog(color);
        });
};

function createFile(options: any) {
    fs.existsSync(options.file) && throwError(`The file ${options.file} already exists.`);
    const data = generateTestData(options.size, (x) => {
        let result: number | undefined = Math.sin(x);
        if (x === 40 || x === 41) result = Math.sin(x) + 18; // create spike
        if (x >= 20 && x <= 30) result = Math.sin(x) * Math.random() * 5 + Math.random(); // create noise
        if (x === 95 || x === 96) result = undefined;
        return result;
    });
    fs.writeFileSync(options.file, JSON.stringify(data, undefined, 2));
}

function checkParameters(options: any) {
    !options.passkey && errorLog(" You have to provide the passkey for the signal-validation command.", true);
    !options.mode &&
        errorLog("You have to provide the mode for the command. Run mc sv --help for full syntax and examples.", true);
    options.mode !== "testdata" &&
        !options.variablename &&
        errorLog("You have to provide the variable name for signal validation operation", true);

    options.mode === "testdata" &&
        !options.size &&
        !parseInt(options.size) &&
        errorLog("Size must be a number > 0", true);

    options.mode === "range" &&
        (!options.lowerlimit || !options.upperlimit) &&
        errorLog("Required parameters for range: variablename, lowerLimit, upperLimit", true);

    options.mode === "spike" &&
        !options.windowsize &&
        errorLog("Required parameters for spike: variablename, windowsize", true);

    options.mode === "jumps" &&
        !options.windowsize &&
        errorLog("Required parameters for jumps: variableName, windowsize", true);

    options.mode === "noise" &&
        (!options.windowradius || !options.threshold) &&
        errorLog("Required parameters for noise: variablename, windowradius, threshold", true);

    options.mode === "gaps" &&
        !options.threshold &&
        errorLog("Required parameters for gaps: variableName, threshold", true);

    options.mode === "interpolate" &&
        !options.threshold &&
        errorLog("Required parameters for interpolate: variablename, threshold", true);

    options.mode === "bias" &&
        (!options.threshold || !options.step || !options.windowsize) &&
        errorLog("Required parameters for interpolate: variablename, threshold, step, windowsize", true);
}
