import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as _ from "lodash";
import * as path from "path";
import { MindSphereSdk, TrendPredictionClient, TrendPredictionModels } from "../../api/sdk";
import { decrypt, loadAuth, retry } from "../../api/utils";
import { errorLog, getColor, homeDirLog, proxyLog, serviceCredentialLog, verboseLog } from "./command-utils";
import ora = require("ora");

const color = getColor("blue");

export default (program: CommanderStatic) => {
    program
        .command("trend-prediction")
        .alias("tp")
        .option("-f, --file <timeseries>", `timeseries file`, `timeseries-sample.json in mindsphere format`)
        .option(
            "-m, --mode [train|predict|trainandpredict|list|read|delete]",
            `mode see ${color("@ Additional Documentation")}`
        )
        .option("-o, --output <output>", `output variables`)
        .option("-i, --input <input>", `input variables (comma separated)`)
        .option("-e, --modelid <modelid>", `modelid of the stored model for prediction`)
        .option("-r, --predict <predict>", `regression parameters for prediction (comma separated)`)
        .option("-d, --degree [degree]", "degree for linear / polynomial regression ", 1)
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-p, --passkey <passkey>", `passkey`)
        .option("-v, --verbose", "verbose output")
        .description(`${color("perform trend prediction (linear/polynomial) @")}`)
        .action(options => {
            (async () => {
                try {
                    checkParameters(options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const auth = loadAuth();
                    const sdk = new MindSphereSdk({
                        tenant: auth.tenant,
                        gateway: auth.gateway,
                        basicAuth: decrypt(auth, options.passkey)
                    });

                    const trendPrediction = sdk.GetTrendPredictionClient();

                    switch (options.mode) {
                        case "list":
                            await listModels(trendPrediction, options);
                            break;

                        case "get":
                            const model = await retry(options.retry, () => trendPrediction.GetModel(options.modelid));
                            console.log(JSON.stringify(model, null, 2));
                            console.log(`Sucessfully retrieved model with ${color(options.modelid)} id.`);
                            break;

                        case "delete":
                            await retry(options.retry, () => trendPrediction.DeleteModel(options.modelid));
                            console.log(`Sucessfully deleted model with ${color(options.modelid)} id`);
                            break;

                        case "train":
                            {
                                const trainBody = getTrainBody(options);
                                const trainedModel = await retry(options.retry, () => trendPrediction.Train(trainBody));
                                verboseLog(JSON.stringify(trainedModel, null, 2), options.verbose);
                                console.log(`Sucessfully trained model with ${color(trainedModel.id)} id.`);
                            }
                            break;

                        case "predict":
                            {
                                const predictionData = getpredictors(options);
                                const prediction = (await retry(options.retry, () =>
                                    trendPrediction.Predict({
                                        modelConfiguration: { modelId: options.modelid },
                                        ...predictionData
                                    })
                                )) as TrendPredictionModels.PredictionDataArray;

                                displayPrediction(options, prediction);
                            }
                            break;
                        case "trainandpredict":
                            {
                                const trainBody = getTrainBody(options);
                                const predictionData = getpredictors(options);

                                const prediction = (await retry(options.retry, () =>
                                    trendPrediction.TrainAndPredict({
                                        ...trainBody,
                                        ...predictionData
                                    })
                                )) as TrendPredictionModels.PredictionDataArray;
                                displayPrediction(options, prediction);
                            }
                            break;
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc trend-prediction --mode list \t\t\t\t lists all trend prediction models`);
            log(
                `    mc trend-prediction --mode get --modelid 12345..ef \t\t retrieves the trend prediction model from the mindsphere`
            );
            log(
                `    mc trend-prediction --mode delete --modelid 12345..ef \t deletes the trend prediction model from the mindsphere`
            );

            log(
                `    mc tp --mode trendandpredict \t\t\t\t training and prediction in one single step (see parameters below)`
            );

            log(
                `\n    mc tp --mode train -f data.json -i "temp,vibration" -o "quality" -d 2 \t\t   trains quadratic fit function for f(temp, vibration) = quality `
            );

            log(
                `    mc tp --mode predict --modelid 12345..ef -i "temp,vibration" -o "quality" -p "30,0.01" predict the quality with temp=30, vibration=0.01 using trained model`
            );

            log("\n  Additional Documentation:\n");
            log(
                `    ${color(
                    "https://developer.mindsphere.io/apis/analytics-trendprediction/api-trendprediction-basics.html"
                )}`
            );
            serviceCredentialLog(color);
        });
};

function displayPrediction(options: any, prediction: TrendPredictionModels.PredictionDataArray) {
    console.log(`${color("(")}${options.input}${color(") =>")} ${options.output}`);
    const predictionValue = prediction[0].timeSeries![0][options.output];
    console.log(`${color("(")}${options.predict}${color(") =>")} ${predictionValue}`);
    verboseLog(JSON.stringify(prediction, null, 2), options.verbose);
}

function getpredictors(options: any) {
    const predictiondata = {
        predictionData: [
            {
                variable: { entityId: "cli-trend-prediction", propertySetName: "cli-trend-prediction" },
                timeSeries: [{ _time: new Date().toISOString() }]
            }
        ]
    };
    const variables = `${options.input}`.split(",").map((x: string) => x.trim());
    const predictors = `${options.predict}`.split(",").map((x: string) => x.trim());
    for (let i = 0; i < variables.length; i++) {
        const element = variables[i];
        (predictiondata.predictionData as any)[0].timeSeries[0][element] = predictors[i];
    }
    return predictiondata;
}

function getTrainBody(options: any) {
    const timeSeriesDataFile = path.resolve(options.file);
    verboseLog(`reading data from ${timeSeriesDataFile}`, options.verbose);
    const buffer = fs.readFileSync(timeSeriesDataFile);
    const data = JSON.parse(buffer.toString());
    const variables = `${options.input}`.split(",").map((x: string) => x.trim());
    const allvariables = [...variables, options.output, "_time"];
    const result = _.map(data, item => _.pick(item, allvariables));
    const params: TrendPredictionModels.TrainBody = {
        modelConfiguration: { polynomialDegree: options.degree },
        metadataConfiguration: {
            outputVariable: {
                entityId: "cli-trend-prediction",
                propertySetName: "cli-trend-prediction",
                propertyName: options.output
            },
            inputVariables: []
        },
        trainingData: [
            {
                variable: { entityId: "cli-trend-prediction", propertySetName: "cli-trend-prediction" },
                timeSeries: result
            }
        ]
    };
    variables.forEach((item: string) => {
        params.metadataConfiguration!.inputVariables!.push({
            entityId: "cli-trend-prediction",
            propertySetName: "cli-trend-prediction",
            propertyName: item
        });
    });
    return params;
}

async function listModels(trendPrediction: TrendPredictionClient, options: any) {
    const result = (await retry(options.retry, () => trendPrediction.GetModels())) as TrendPredictionModels.ModelDto[];

    console.log(`${color("id")} function creation date`);
    result.forEach(element => {
        console.log(
            `${color(element.id)} ${color("(")}${element.metadataConfiguration?.inputVariables
                ?.map(x => x.propertyName)
                .join(",")}${color(") =>")} ${element.metadataConfiguration?.outputVariable?.propertyName} ${
                element.creationDate
            }`
        );
    });
}

function checkParameters(options: any) {
    !options.passkey && errorLog(" You have to provide the passkey for the trend-prediction command.", true);
    !options.mode &&
        errorLog("You have to provide the mode for the command. Run mc tp --help for full syntax and examples.", true);

    !["train", "predict", "trainandpredict", "list", "get", "delete"].includes(options.mode) &&
        errorLog(
            `the mode must be either one of: ${color(
                "train, predict or trainandpredict"
            )} for trend prediction or ${color("list, get, delete")} for model management`,
            true
        );

    options.mode === "get" && !options.modelid && errorLog("you have to specify the id of the model (--modelid)", true);
    options.mode === "delete" &&
        !options.modelid &&
        errorLog("you have to specify the id of the model (--modelid)", true);

    (options.mode === "train" || options.mode === "trainandpredict") &&
        !options.file &&
        errorLog("you have to provide the file with timeseries data (--file)", true);
    (options.mode === "train" || options.mode === "trainandpredict") &&
        !options.degree &&
        errorLog("you have to provide the polynomial degree for the fit function (--degree)", true);
    (options.mode === "train" || options.mode === "predict" || options.mode === "trainandpredict") &&
        !options.input &&
        errorLog("you have to provide the input variables for the fit function (--input)", true);
    (options.mode === "train" || options.mode === "predict" || options.mode === "trainandpredict") &&
        !options.output &&
        errorLog("you have to provide the output variable for the fit function (--output)", true);

    options.mode === "predict" &&
        !options.modelid &&
        errorLog("you have to specify the id of the model (--modelid)", true);
    (options.mode === "predict" || options.mode === "trainandpredict") &&
        !options.predict &&
        errorLog("you have to provide the values of input variables (--predict)", true);
}
