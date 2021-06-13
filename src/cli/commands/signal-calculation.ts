import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { isArray } from "lodash";
import * as path from "path";
import { MindSphereSdk, SignalCalculationModels } from "../../api/sdk";
import { throwError } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    generateTestData,
    getColor,
    getSdk,
    homeDirLog,
    proxyLog,
    serviceCredentialLog,
    verboseLog
} from "./command-utils";

let color = getColor("blue");

export default (program: CommanderStatic) => {
    program
        .command("signal-calculation")
        .alias("cal")
        .option("-m, --mode [template|calculate]", "template | calculate", "template")
        .option("-o, --on [data|asset]", "on [data | asset]", "data")
        .option(
            "-f, --template <template>",
            ".mdsp.json template file default: (signal.[template|templatedirect].mdsp.json)"
        )
        .option("-u, --result <result>", ".mdsp.json with signal calculation result", "signal.result.mdsp.json")
        .option("-i, --assetid <assetid>", `assetid for template creation`)
        .option("-a, --aspect <aspect>", `aspect for template creation`)
        .option("-r, --variable <variable>", `variables for template creation`)
        .option("-s, --size <size>", `timeseries length for generated data`, "5")
        .option("-t, --timeseries <timeseries>", `comma separated list of time series files (if data is not embedded)`)
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("process timeseries data *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options, true);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    switch (options.mode) {
                        case "template":
                            options.on === "data" && createTemplate(options);
                            options.on === "asset" && createTemplateDirect(options);
                            console.log("Edit the files before submitting them to mindsphere.");
                            break;

                        case "calculate":
                            options.on === "data" && (await calculateSignal(options, sdk));
                            options.on === "asset" && (await calculateSignalDirect(options, sdk));
                            break;
                        default:
                            throw Error(`no such option: ${options.mode}`);
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc signal-calculation --mode template \t create template file for signal calculation`);
            log(`    mc signal-calculation --mode template --on asset --assetid <assetid> --aspect <aspect> --variable variable\n\
                                            \t creates template for calculation using mindsphere timeseries data`);
            log(`    mc signal-calculation --mode calculate --template <filename> \n\
                                            \t calculates new signal from the timeseries specified in template file`);

            log(`    mc signal-calculation --mode calculate \\
                     --template <filename> \\
                     --timeseries <timeseriesfile> \\
                     --assetid <assetid> \\
                     --aspect <aspect>\n\
                                            \t calculates new signal from the timeseries specified in external file`);

            log(`    mc signal-calculation --mode calculate --on asset --template <filename> \n\
                                            \t calculates new signal from the mindsphere timeseries`);

            log(`\n  Operation List: \n`);
            log(
                `    ${color(
                    "https://developer.mindsphere.io/apis/analytics-signalcalculation/api-signalcalculation-overview.html"
                )}\n`
            );
            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    options.mode === "calculate" &&
        !options.template &&
        errorLog(
            "you have to provide a file with signal calculation parameters (see mc signal-calculation --help for more details)",
            true
        );

    options.on !== "data" &&
        options.on !== "asset" &&
        errorLog("you have to specify if the calculation is applied --on data or --on asset", true);
}

function createTemplate(options: any) {
    const template = {
        configuration: {
            operation: "SIN",
            params: [],
            operands: [],
            result: {
                entityId: options.assetid || "assetid",
                propertySetName: "resultAspect",
                propertyName: "result",
            },
        },
        data: [],
    };

    const variable = (options.variable || "variable1").trim();

    (template.configuration.operands as Array<any>).push({
        entityId: options.assetid || "assetid",
        propertySetName: options.aspect || "aspect",
        propertyName: variable,
    });

    const data = generateTestData(options.size, (x) => x, variable, "number");
    (template.data as Array<any>).push({
        entityId: options.assetid || "assetid",
        propertySetName: options.aspect || "aspect",
        timeSeries: data,
    });

    verboseLog(template, options.verbose);
    const fileName = options.template || `signal.calculation.mdsp.json`;
    writeToFile(fileName, options, template);

    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc signal-calculation --mode calculate --on data --template ${fileName} \n\nto calculate the signal.`
    );
}

function createTemplateDirect(options: any) {
    const template = {
        configuration: {
            operation: "SIN",
            params: [],
            operands: [],
            result: {
                assetId: options.assetid || "assetid",
                aspectName: "resultAspect",
                variableName: "result",
            },
        },
    };

    const variable = (options.variable || "variable1").trim();

    const now = new Date();
    const hourBefore = new Date(now);
    hourBefore.setHours(hourBefore.getHours() - 1);
    (template.configuration.operands as Array<any>).push({
        assetId: options.assetid || "assetid",
        aspectName: options.aspect || "aspect",
        variableName: variable,
        from: hourBefore.toISOString(),
        to: now.toISOString(),
    });

    verboseLog(template, options.verbose);
    const fileName = options.template || `signal.calculation.direct.mdsp.json`;
    writeToFile(fileName, options, template);

    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc signal-calculation --mode calculate --on asset --template ${fileName} \n\nto calculate the signal.`
    );
}

function writeToFile(fileName: string, options: any, jsonData: any) {
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    return fileName;
}
async function calculateSignal(options: any, sdk: MindSphereSdk) {
    const pathInfo = path.resolve(options.template);
    const metadataContent = fs.readFileSync(pathInfo);
    const metadata = JSON.parse(metadataContent.toString()) as SignalCalculationModels.InputParameters;

    if (options.timeseries) {
        const timeseriesFiles = (options.timeseries || "").split(",");

        timeseriesFiles.forEach((element: string) => {
            const fileName = path.resolve(element.trim());
            const data = JSON.parse(fs.readFileSync(fileName).toString());
            console.log(isArray(data), options.assetid, options.aspect);
            if (isArray(data)) {
                // this looks like the raw timeseries
                !options.assetid &&
                    errorLog("you have to specify the --assetid if you are using raw time series", true);
                !options.aspect && errorLog("you have to specify the --aspect if you are using raw time series", true);
                metadata.data!.push({ entityId: options.assetid, propertySetName: options.aspect, timeSeries: data });
            } else {
                metadata.data!.push(data);
            }
        });
    }

    const result = await sdk.GetSignalCalculationClient().PostApplyOperation(metadata);
    verboseLog(JSON.stringify(result, null, 2), options.verbose);
    console.log(`Signal Calculation Results:`);
    console.log(`entityid: ${color(result.entityId)}, aspect: ${color(result.propertySetName)}\n`);
    console.table(result.timeSeries);
    const fileName = options.result || `signal.result.mdsp.json`;
    writeToFile(fileName, options, result);

    console.log(`The result of signal calculation was written into ${color(fileName)}.`);
}

async function calculateSignalDirect(options: any, sdk: MindSphereSdk) {
    const pathInfo = path.resolve(options.template);
    const metadataContent = fs.readFileSync(pathInfo);
    const metadata = JSON.parse(metadataContent.toString()) as SignalCalculationModels.InputParametersDirect;

    const result = await sdk.GetSignalCalculationClient().PostApplyOperationDirect(metadata);
    verboseLog(JSON.stringify(result, null, 2), options.verbose);
    console.log(`Signal Calculation Results:`);
    console.log(`assetId: ${color(result.assetId)}, aspect: ${color(result.aspectName)}\n`);
    console.table(result.timeSeries);
    const fileName = options.result || `signal.result.direct.mdsp.json`;
    writeToFile(fileName, options, result);

    console.log(`The result of signal calculation was written into ${color(fileName)}.`);
}
