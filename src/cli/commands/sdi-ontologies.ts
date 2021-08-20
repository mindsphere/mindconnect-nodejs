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
        .command("sdi-ontologies")
        .alias("sdo")
        .option(
            "-m, --mode [list|infer|update|template|info|delete]",
            "list | infer | update | template | info | delete",
            "list"
        )
        .option("-d, --ontology <ontology>", "ontology file with definition for --mode infer or update command")
        .option("-i, --ontologyid <ontologyid>", "the ontology id for --mode info, update or delete command")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("manage ontologies for SDI *"))
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
                            await listDataOntologies(sdk, options);
                            break;

                        case "info":
                            await dataOntologyInfo(sdk, options);
                            break;

                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;

                        case "infer":
                            await createDataOntology(options, sdk);
                            break;

                        case "delete":
                            await deleteDataOntology(options, sdk);
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
            log(`    mc sdi-ontologies --mode list \t\t list all sdi ontologies`);
            log(`    mc sdi-ontologies --mode template \t\t create template file`);
            log(`    mc sdi-ontologies --mode infer --ontology <ontologyfile> \t\t infer sdi  ontology`);
            log(`    mc sdi-ontologies --mode info --ontologyid <ontologyid>   \t\t get sdi ontology info`);
            log(`    mc sdi-ontologies --mode delete --ontologyid <ontologyid> \t\t delete sdi ontology`);

            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.ontology &&
        errorLog(
            "you have to provide a ontology template file to create a sdi ontology (see mc sdi-ontologies --help for more details)",
            true
        );

    options.mode === "update" &&
        !options.ontologyid &&
        errorLog(
            "you have to provide the ontologyid of the ontology you want to update (see mc sdi-ontologies --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.ontologyid &&
        errorLog(
            "you have to provide the ontologyid to get infos about the sdi  ontology (see mc sdi-ontologies --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.ontologyid &&
        errorLog(
            "you have to provide the ontologyid to delete the sdi ontology (see mc sdi-ontologies --help for more details)",
            true
        );
}

async function listDataOntologies(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    let pageToken = undefined;
    let count = 0;
    console.log(
        `${color("ontologyId")} ${"ontologyName"}  ${"keyMappingType"}  ${"updatedDate"}  ${"ontologyDescription"}`
    );
    do {
        const ontologies: SemanticDataInterconnectModels.ResponseAllOntologies = await sdiClient.GetOntologies({
            pageToken: pageToken,
        });
        ontologies.ontologies?.forEach((ontology) => {
            console.log(
                `${color(ontology.id)}  ${ontology.ontologyName}  ${ontology.keyMappingType || ""}  ${
                    ontology.updatedDate
                }  ${ontology.ontologyDescription || ""}`
            );
            verboseLog(JSON.stringify(ontology, null, 2), options.verbose);
            count++;
        });
        pageToken = ontologies.page?.nextToken;
    } while (pageToken);
    console.log(`${color(count)} sdi ontologies listed.`);
}

async function dataOntologyInfo(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    const dataOntology = await sdiClient.GetOntology(`${options.ontologyid}`);
    printDataOntologyInfos(dataOntology, options);
}

function printDataOntologyInfos(dataOntology: object, options: any) {
    printObjectInfo("Data Ontology:", dataOntology, options, ["ontologyId", "category", "filePattern"], color);
}

function createTemplate(options: any) {
    const templateType = {
        schemas: [
            {
                dataTag: "string",
                schemaName: "Schema1 (you need at least two schemas to infer ontology)",
                sourceName: "string",
                assetId: "string",
                aspectName: "string",
            },
            {
                dataTag: "string",
                schemaName: "string",
                sourceName: "string",
                assetId: "string",
                aspectName: "string",
            },
        ],
        excludeProperties: ["string"],
    };
    verboseLog(JSON.stringify(templateType, null, 2), options.verbose);
    writeToFile(options, templateType);
}

function writeToFile(options: any, dataOntology: any) {
    const fileName = options.file || `sdi.ontology.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(dataOntology, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc sdi-ontologies --mode create --ontology ${fileName} \n\nto create the sdi ontology`
    );
}
async function createDataOntology(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.ontology);
    const file = fs.readFileSync(filePath);
    const dataOntology = JSON.parse(file.toString());

    const result = await sdk.GetSemanticDataInterConnectClient().InferOntology(dataOntology);
    printDataOntologyInfos(result, options);
}

async function deleteDataOntology(options: any, sdk: MindSphereSdk) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();
    await sdiClient.DeleteOntology(`${options.ontologyid}`);
    console.log(`The sdi ontology with id : ${color(options.ontologyid)} was deleted.`);
}
