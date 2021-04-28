import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { AnomalyDetectionModels, MindSphereSdk} from "../../api/sdk";
import { retry } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    generateTestData,
    getColor,
    getSdk,
    homeDirLog,
    proxyLog,
    serviceCredentialLog,
} from "./command-utils";

let color = getColor("blue");

export default (program: CommanderStatic) => {
    program
        .command("anomaly-detection")
        .alias("ad")
        .option(
            "-m, --mode [template|train|detect]",
            "mode [template | train | detect]",
            "train"
        )
        .option(
            "-o, --on [data|asset]", // NOTE: 29/04/2021 - batch are excluded for now
            "on [data | asset]", // NOTE: 29/04/2021 - batch are excluded for now
            "data"
        )
        .option("-d, --data <data>", "time serie data file", "timeserie.mdsp.json")

        .option("-e, --epsilon <epsilon>", "threshold distance")
        .option("-s, --clustersize <clustersize>", "minimum cluster size")
        .option(
            "-a, --algorithm [EUCLIDEAN|MANHATTAN|CHEBYSHEV]",
            "distance measure algorithm [EUCLIDEAN | MANHATTAN | CHEBYSHEV]"
        )      
        .option("-n, --modelname <modelname>", "human-friendly name of the model")
        .option("-i, --modelid <modelid>", "mindsphere model id ")
        .option("-i, --assetid <assetid>", "mindsphere asset id ")
        .option("-n, --aspectname <aspectname>", "mindsphere aspect name")
        .option("-f, --from <from>", "begining of the time range")
        .option("-u, --to <to>", "end of the time range")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`train anomaly detection models and detect timeseries anomalies *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options, true);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    switch (options.mode) {
                        case "template":
                            await createTemplate(options, sdk);
                            console.log("Edit the files before submitting them to mindsphere.");
                            break;
                        case "train":
                            await trainNewModel(options, sdk);
                            break;
                        case "detect":
                            await detectAnomalies(options, sdk);
                            break;
                        default:
                            throw Error(`no such option: ${options.mode}`);
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => printHelp());
};

function printHelp() {
    log("\n  Examples:\n");
    log(
        `    mc ad --mode template --data timeserie.data.mdsp.json \t creates a template for a time serie data file`
    );
    log(
        `    mc ad --mode train --on data --data timeserie.data.mdsp.json --epsilon 0.5 \n\t\t\t\t\t\t\t\t trains a model on the timeserie specified in the data file`
    );
    log(`    mc ad --mode detect --on data --data timeserie.data.mdsp.json --modelid 123456...ef\n\t\t\t\t\t\t\t\t detects anomalities of the timeserie specified in the data file using the model with the id 132456...ef`);
    
    
    log(`    mc ad --mode train --on asset --asssetid 1234567..ef --aspectname Environment --epsilon 0.5\n\t\t\t\t\t\t\t\t trains a model on the time series of the aspect "Environment" of the asset with the id "1234567..ef"`);
    log(`    mc ad --mode detect --on asset --modelid 223456...ef --asssetid 1234567..ef --aspectname Environment --epsilon 0.5\n\t\t\t\t\t\t\t\t detect anomalities of the timeseries of the aspect "Environment" of the asset with the id "1234567..ef" using the model with the id "2234567..ef"`);
    
    serviceCredentialLog();
}

function checkRequiredParameters(options: any) {
    options.mode === "template" && !options.data && errorLog("you have to specify the output file of timeserie data", true);
    options.mode === "detect" && !options.modelid && errorLog("you have to specify the modelid", true);
    options.mode === "train" && !options.epsilon && errorLog("you have to specify the threshold distance", true);
    options.on === "data" && !options.data && errorLog("you have to specify the timeserie data file", true);
    options.on === "asset" && !options.assetid  && errorLog("you have to specify the targeted assetId", true);
    options.on === "asset" && !options.aspectname  && errorLog("you have to specify the targeted aspect name", true);
}


async function createTemplate(options: any, sdk: MindSphereSdk) {
    const generatedData = generateTestData(
        10,
        (x) => {
            return 80 + (Math.random() * 20) *  Math.sin(x);
        },
        "Acceleration",
        "number"
    );
    const fileName = options.data || "timeserie.data.mdsp.json";
    fs.writeFileSync(fileName, JSON.stringify(generatedData, null, 2));

    console.log(
        `The time serie data was written into ${color(fileName)}.\nRun \n\n\tmc ad --mode train --on data --data ${fileName} --epsilon 50.0 \n\nto create the model.\n`
    );
}

async function trainNewModel(options: any, sdk: MindSphereSdk) {
    const anomalyDetectionClient = sdk.GetAnomalydetectionClient();
    const tenant = sdk.GetTenant();
    const timeOffset = new Date().getTime();

    const on = options.on || "data";
    const epsilon = options.epsilon;
    const clustersize = options.clustersize || 2;
    const algorithm = options.algorithm || "EUCLIDEAN";
    const modelname = options.modelname || `Generated_by_CLI_${tenant}_${timeOffset}`;

    switch (on) {
        case "data":
            // read the data file content
            const filePath = path.resolve(options.data);
            (!fs.existsSync(filePath)) && errorLog(`the metadata file ${filePath} doesn't exist!`, true);
            const filecontent = fs.readFileSync(filePath);
            const filedata = JSON.parse(filecontent.toString());
            const result = (await retry(options.retry, async () =>
                anomalyDetectionClient.modelsPost(filedata,epsilon,clustersize,algorithm,modelname)
            )) as AnomalyDetectionModels.Model;
            console.log(`Model with modelid ${color(result.id)} and name ${color(result.name)} was created.`);
            break;
        case "asset":
            const assetid = options.assetid;
            const aspectname = options.aspectname;
            const now = new Date();
            const lastMonth = new Date();
            lastMonth.setDate(lastMonth.getDate() - 7);
            const fromLastMonth = new Date(lastMonth.getUTCFullYear(), lastMonth.getUTCMonth(), lastMonth.getUTCDate());
            const toNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
            let from = fromLastMonth;
            try {
                from = (options.from? new Date(options.from): fromLastMonth)
            } catch (error) {}
            let to = toNow;
            try {
                to = (options.to? new Date(options.to): toNow)
            } catch (error) {}
            const result_asset = (await retry(options.retry, async () =>
                anomalyDetectionClient.modelsDirectPost(epsilon,clustersize,assetid,aspectname,from,to,algorithm,modelname)
            )) as AnomalyDetectionModels.Model;

            console.log(`Model with modelid ${color(result_asset.id)} and name ${color(result_asset.name)} was created.`);
        default:
            break;
    }
}

async function detectAnomalies(options: any, sdk: MindSphereSdk) {
    const anomalyDetectionClient = sdk.GetAnomalydetectionClient();
    const modelid = options.modelid;
    const on = options.on || "data";
    let result: AnomalyDetectionModels.Anomaly[] = [];
    switch (on) {
        case "data":
            // read the data file content
            const filePath = path.resolve(options.data);
            (!fs.existsSync(filePath)) && errorLog(`the metadata file ${filePath} doesn't exist!`, true);
            const filecontent = fs.readFileSync(filePath);
            const filedata = JSON.parse(filecontent.toString());
            result = (await retry(options.retry, async () =>
                anomalyDetectionClient.detectanomaliesPost(filedata, modelid)
            )) as Array<AnomalyDetectionModels.Anomaly>;
            break;
        case "asset":
            const assetid = options.assetid;
            const aspectname = options.aspectname;
            const now = new Date();
            const lastMonth = new Date();
            lastMonth.setDate(lastMonth.getDate() - 7);
            const fromLastMonth = new Date(lastMonth.getUTCFullYear(), lastMonth.getUTCMonth(), lastMonth.getUTCDate());
            const toNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
            let from = fromLastMonth;
            try {
                from = (options.from? new Date(options.from): fromLastMonth)
            } catch (error) {}
            let to = toNow;
            try {
                to = (options.to? new Date(options.to): toNow)
            } catch (error) {}
            result = (await retry(options.retry, async () =>
                anomalyDetectionClient.detectanomaliesDirectPost(modelid, assetid, aspectname, from, to)
            )) as Array<AnomalyDetectionModels.Anomaly>;
        default:
            break;
    }
    console.log(`${color((result || [])?.length)} anomalies found.\n`);
    (result || [])?.length > 0 && printDetectedAnomalies(result);
}

function printDetectedAnomalies(anomalies: Array<AnomalyDetectionModels.Anomaly>) {
    console.log("\nDetected anomalies:");
    console.table(anomalies || [], ["_time:", "anomalyExtent"]);
}