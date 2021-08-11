import { Command } from "commander";
import { log } from "console";
import { MindSphereSdk, SemanticDataInterconnectModels } from "../../api/sdk";
import { throwError } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    printObjectInfo,
    proxyLog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";
import fs = require("fs");
import path = require("path");

let color = getColor("magenta");

export default (program: Command) => {
    program
        .command("sdi-data-lakes")
        .alias("sdl")
        .option(
            "-m, --mode [list|create|update|template|info|delete]",
            "list | create | update | template | info | delete",
            "list"
        )
        .option("-d, --datalake <datalake>", "data lake file with definition for --mode create or update command")
        .option("-i, --datalakeid <datalakeid>", "the datalake id for --mode info, update or delete command")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("manage data lakes for SDI *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    switch (options.mode) {
                        case "list":
                            await listDataLakes(sdk, options);
                            break;

                        case "info":
                            await dataLakeInfo(sdk, options);
                            break;

                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "update":
                            await updateDataLake(options, sdk);
                            break;
                        case "create":
                            await createDataLake(options, sdk);
                            break;

                        case "delete":
                            await deleteDataLake(options, sdk);
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
            log(`    mc sdi-data-lakes --mode list \t\t list all sdi datalakes`);
            log(`    mc sdi-data-lakes --mode template \t\t create template file`);
            log(`    mc sdi-data-lakes --mode create --datalake <datalakefile> \t\t create sdi data lake`);
            log(`    mc sdi-data-lakes --mode update --datalake <datalakefile> --datalakeid <datalakeid> \
                                                                              \t\t update sdi data lake`);
            log(`    mc sdi-data-lakes --mode info --datalakeid <datalakeid>   \t\t get sdi data lake info`);
            log(`    mc sdi-data-lakes --mode delete --datalakeid <datalakeid> \t\t delete sdi data lake`);

            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.datalake &&
        errorLog(
            "you have to provide a datalake template file to create a sdi datalake (see mc sdi-data-lakes --help for more details)",
            true
        );

    options.mode === "update" &&
        !options.datalakeid &&
        errorLog(
            "you have to provide the datalakeid of the datalake you want to update (see mc sdi-data-lakes --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.datalakeid &&
        errorLog(
            "you have to provide the datalakeid to get infos about the sdi data lake (see mc sdi-data-lakes --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.datalakeid &&
        errorLog(
            "you have to provide the datalakeid to delete the sdi data lake (see mc sdi-data-lakes --help for more details)",
            true
        );
}

async function listDataLakes(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    const dataLakes = await sdiClient.GetDataLakes();

    console.log(`${color("Id")}  Name Type  ${color("basePath")}`);
    dataLakes.dataLakes?.forEach((element: SemanticDataInterconnectModels.DataLakeResponse) => {
        console.log(`${color(element.id)}  ${element.name}  ${element.type}  ${color(element.basePath)}`);
    });
    verboseLog(JSON.stringify(dataLakes, null, 2), options.verbose);
}

async function dataLakeInfo(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    const dataLake = await sdiClient.GetDataLake(`${options.datalakeid}`);

    printDataLakeInfos(dataLake, options);
}

function printDataLakeInfos(
    dataLake: SemanticDataInterconnectModels.DataLakeResponse | SemanticDataInterconnectModels.CreateDataLakeResponse,
    options: any
) {
    printObjectInfo("Data Lake:", dataLake, options, ["id", "name", "basePath"], color);
}

function createTemplate(options: any) {
    const templateType = {
        name: "customDataLake",
        type: "Custom",
        basePath: "your/custom/path/to/datalake",
    };
    verboseLog(JSON.stringify(templateType, null, 2), options.verbose);
    writeToFile(options, templateType);
}

function writeToFile(options: any, dataLake: any) {
    const fileName = options.file || `sdi.datalake.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(dataLake, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc sdi-data-lakes --mode create --datalake ${fileName} \n\nto create the sdi data lake`
    );
}
async function createDataLake(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.datalake);
    const file = fs.readFileSync(filePath);
    const dataLake = JSON.parse(file.toString());

    const result = await sdk.GetSemanticDataInterConnectClient().PostDataLake(dataLake);
    printDataLakeInfos(result, options);
}

async function updateDataLake(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.datalake);
    const file = fs.readFileSync(filePath);
    const dataLake = JSON.parse(file.toString());

    const result = await sdk.GetSemanticDataInterConnectClient().PatchDataLake(`${options.datalakeid}`, dataLake);
    printDataLakeInfos(result, options);
}
async function deleteDataLake(options: any, sdk: MindSphereSdk) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();
    await sdiClient.DeleteDataLake(`${options.datalakeid}`);
    console.log(`The sdi data lake with id : ${color(options.datalakeid)} was deleted.`);
}
