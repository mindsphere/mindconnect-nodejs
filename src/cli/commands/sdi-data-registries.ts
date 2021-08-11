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
        .command("sdi-data-registries")
        .alias("sdr")
        .option(
            "-m, --mode [list|create|update|template|info|delete]",
            "list | create | update | template | info | delete",
            "list"
        )
        .option(
            "-d, --dataregistry <dataregistry>",
            "data registry file with definition for --mode create or update command"
        )
        .option("-i, --registryid <registryid>", "the dataregistry id for --mode info, update or delete command")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("manage data registries for SDI *"))
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
                            await listDataRegistries(sdk, options);
                            break;

                        case "info":
                            await dataRegistryInfo(sdk, options);
                            break;

                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "update":
                            await updateDataRegistry(options, sdk);
                            break;
                        case "create":
                            await createDataRegistry(options, sdk);
                            break;

                        case "delete":
                            await deleteDataRegistry(options, sdk);
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
            log(`    mc sdi-data-registries --mode list \t\t list all sdi dataregistries`);
            log(`    mc sdi-data-registries --mode template \t create template file`);
            log(
                `    mc sdi-data-registries --mode create --dataregistry <dataregistryfile> \t create sdi data registry`
            );
            log(`    mc sdi-data-registries --mode update --dataregistry <dataregistryfile> --registryid <registryid> \
                                                                                             \t\t update sdi data registry`);
            log(`    mc sdi-data-registries --mode info --registryid <registryid>   \t\t get sdi data registry info`);
            log(`    mc sdi-data-registries --mode delete --registryid <registryid> \t\t delete sdi data registry`);

            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.dataregistry &&
        errorLog(
            "you have to provide a dataregistry template file to create a sdi dataregistry (see mc sdi-data-registries --help for more details)",
            true
        );

    options.mode === "update" &&
        !options.registryid &&
        errorLog(
            "you have to provide the registryid of the dataregistry you want to update (see mc sdi-data-registries --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.registryid &&
        errorLog(
            "you have to provide the registryid to get infos about the sdi data registry (see mc sdi-data-registries --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.registryid &&
        errorLog(
            "you have to provide the registryid to delete the sdi data registry (see mc sdi-data-registries --help for more details)",
            true
        );
}

async function listDataRegistries(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    let pageToken = undefined;
    let count = 0;
    console.log(
        `${color(
            "registryId"
        )} ${"sourceName"}  ${"filePattern"}  ${"fileUploadStrategy"}  ${"dataTag"}  ${"defaultRootTag"}`
    );
    do {
        const dataRegistries: SemanticDataInterconnectModels.ListOfRegistryResponse = await sdiClient.GetDataRegistries(
            {
                pageToken: pageToken,
            }
        );
        dataRegistries.dataRegistries?.forEach((registry) => {
            console.log(
                `${color(registry.registryId)}  ${registry.sourceName}  ${registry.filePattern}  ${
                    registry.fileUploadStrategy
                }  ${registry.dataTag}  ${registry.defaultRootTag || "<none>"}`
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

    const dataRegistry = await sdiClient.GetDataRegistry(`${options.registryid}`);
    printDataRegistryInfos(dataRegistry, options);
}

function printDataRegistryInfos(dataRegistry: object, options: any) {
    printObjectInfo("Data Registry:", dataRegistry, options, ["registryId", "category", "filePattern"], color);
}

function createTemplate(options: any) {
    const templateType = {
        dataTag: "string",
        defaultRootTag: "string",
        filePattern: "string",
        fileUploadStrategy: "append",
        metaDataTags: ["string"],
        sourceName: "string",
        xmlProcessRules: ["string"],
        schemaFrozen: false,
    };
    verboseLog(JSON.stringify(templateType, null, 2), options.verbose);
    writeToFile(options, templateType);
}

function writeToFile(options: any, dataRegistry: any) {
    const fileName = options.file || `sdi.dataregistry.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(dataRegistry, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc sdi-data-registries --mode create --dataregistry ${fileName} \n\nto create the sdi data registry`
    );
}
async function createDataRegistry(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.dataregistry);
    const file = fs.readFileSync(filePath);
    const dataRegistry = JSON.parse(file.toString());

    const result = await sdk.GetSemanticDataInterConnectClient().PostDataRegistry(dataRegistry);
    printDataRegistryInfos(result, options);
}

async function updateDataRegistry(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.dataregistry);
    const file = fs.readFileSync(filePath);
    const dataRegistry = JSON.parse(file.toString());

    const result = await sdk
        .GetSemanticDataInterConnectClient()
        .PatchDataRegistry(`${options.registryid}`, dataRegistry);
    printDataRegistryInfos(result, options);
}
async function deleteDataRegistry(options: any, sdk: MindSphereSdk) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();
    await sdiClient.DeleteDataRegistry(`${options.registryid}`);
    console.log(`The sdi data registry with id : ${color(options.registryid)} was deleted.`);
}
