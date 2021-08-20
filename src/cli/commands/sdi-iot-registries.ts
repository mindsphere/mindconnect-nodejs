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
        .command("sdi-iot-registries")
        .alias("sdt")
        .option("-m, --mode [list|create|template|info|delete]", "list | create | template | info | delete", "list")
        .option(
            "-d, --iotregistry <iotregistry>",
            "data registry file with definition for --mode create or update command"
        )
        .option("-i, --registryid <registryid>", "the iotregistry id for --mode info, update or delete command")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("manage iot data registries for SDI *"))
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
                            await listIotRegistries(sdk, options);
                            break;

                        case "info":
                            await dataRegistryInfo(sdk, options);
                            break;

                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "create":
                            await createIotRegistry(options, sdk);
                            break;

                        case "delete":
                            await deleteIotRegistry(options, sdk);
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
            log(`    mc sdi-iot-registries --mode list \t\t list all sdi dataregistries`);
            log(`    mc sdi-iot-registries --mode template \t create template file`);
            log(`    mc sdi-iot-registries --mode create --iotregistry <iotregistryfile> \t create sdi iot registry`);
            log(`    mc sdi-iot-registries --mode update --iotregistry <iotregistryfile> --registryid <registryid> \
                                                                                             \t\t update sdi iot registry`);
            log(`    mc sdi-iot-registries --mode info --registryid <registryid>   \t\t get sdi iot registry info`);
            log(`    mc sdi-iot-registries --mode delete --registryid <registryid> \t\t delete sdi iot registry`);

            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.iotregistry &&
        errorLog(
            "you have to provide a iotregistry template file to create a sdi iotregistry (see mc sdi-iot-registries --help for more details)",
            true
        );

    options.mode === "update" &&
        !options.registryid &&
        errorLog(
            "you have to provide the registryid of the iotregistry you want to update (see mc sdi-iot-registries --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.registryid &&
        errorLog(
            "you have to provide the registryid to get infos about the sdi iot registry (see mc sdi-iot-registries --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.registryid &&
        errorLog(
            "you have to provide the registryid to delete the sdi iot registry (see mc sdi-iot-registries --help for more details)",
            true
        );
}

async function listIotRegistries(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    let pageToken = undefined;
    let count = 0;
    console.log(
        `${color("registryId")} ${"sourceName"}  ${color("assetId")}  ${"aspectName"}  ${"dataTag"}  ${"category"}`
    );
    do {
        const dataRegistries: SemanticDataInterconnectModels.ListOfIoTRegistryResponse =
            await sdiClient.GetIotDataRegistries({
                pageToken: pageToken,
            });
        dataRegistries.iotDataRegistries?.forEach((registry) => {
            console.log(
                `${color(registry.registryId)}  ${registry.sourceName}  ${color(registry.assetId)}  ${
                    registry.aspectName
                }  ${registry.dataTag}  ${registry.category}`
            );
            verboseLog(JSON.stringify(registry, null, 2), options.verbose);
            count++;
        });
        pageToken = dataRegistries.page?.nextToken;
    } while (pageToken);
    console.log(`${color(count)} sdi data registries listed.`);
}

async function dataRegistryInfo(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    const dataRegistry = await sdiClient.GetIotDataRegistry(`${options.registryid}`);
    printIotRegistryInfos(dataRegistry, options);
}

function printIotRegistryInfos(dataRegistry: object, options: any) {
    printObjectInfo("Data Registry:", dataRegistry, options, ["registryId", "category", "filePattern"], color);
}

function createTemplate(options: any) {
    const templateType = {
        assetId: "<assetid>",
        aspectName: "<aspectname>",
    };
    verboseLog(JSON.stringify(templateType, null, 2), options.verbose);
    writeToFile(options, templateType);
}

function writeToFile(options: any, dataRegistry: any) {
    const fileName = options.file || `sdi.iotregistry.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(dataRegistry, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc sdi-iot-registries --mode create --iotregistry ${fileName} \n\nto create the sdi iot registry`
    );
}
async function createIotRegistry(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.iotregistry);
    const file = fs.readFileSync(filePath);
    const dataRegistry = JSON.parse(file.toString());

    const result = await sdk.GetSemanticDataInterConnectClient().PostIotDataRegistry(dataRegistry);
    printIotRegistryInfos(result, options);
}

async function deleteIotRegistry(options: any, sdk: MindSphereSdk) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();
    await sdiClient.DeleteIotRegistry(`${options.registryid}`);
    console.log(`The sdi iot registry with id : ${color(options.registryid)} was deleted.`);
}
