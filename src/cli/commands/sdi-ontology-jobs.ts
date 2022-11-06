import { Command } from "commander";
import { log } from "console";
import { MindSphereSdk } from "../../api/sdk";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    printObjectInfo,
    proxyLog,
    serviceCredentialLog,
} from "./command-utils";
import fs = require("fs");
import path = require("path");
const mime = require("mime-types");
let color = getColor("magenta");

export default (program: Command) => {
    program
        .command("sdi-ontology-jobs")
        .alias("sdb")
        .option("-m, --mode [submit|info]", "submit|info", "submit")
        .option("-o, --ontology <ontology>", "ontology file (json or owl)")
        .option("-n, --name <name>", "the ontology name", "myontology")
        .option("-i, --ontologyid <ontologyid>", "the ontology id (for update)")
        .option("-k, --keymappingtype <keymappingtype>", "key mapping type", "INNER JOIN")
        .option("-s, --description <description>", "the ontology description", "created-by-mindsphere-cli")
        .option("-j, --jobid <ontologyid>", "the jobid for --info command")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("manage ontology jobs for SDI *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    switch (options.mode) {
                        case "info":
                            await dataOntologyJobInfo(sdk, options);
                            break;

                        case "submit":
                            await submitOntology(sdk, options);
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
            log(`    mdsp sdi-ontology-jobs --mode submit --ontology <ontologyfile>\t upload ontology`);
            log(`    mdsp sdi-ontology-jobs --mode info --jobid <jobid>   \t\t\t get sdi ontology upload job info`);

            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    options.mode === "submit" &&
        !options.ontology &&
        errorLog(
            "you have to provide a ontology file to submit a sdi ontology upload job (see mdsp sdi-ontology-jobs --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.jobid &&
        errorLog(
            "you have to provide the jobid to get infos about the sdi ontology upload job (see mdsp sdi-ontology-jobs --help for more details)",
            true
        );
}

async function dataOntologyJobInfo(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    const dataOntologyJob = await sdiClient.GetOntologyJobStatus(`${options.jobid}`);
    printDataOntologyJob(dataOntologyJob, options);
}

function printDataOntologyJob(dataOntology: object, options: any) {
    printObjectInfo("Submit Ontology Job:", dataOntology, options, ["id", "status"], color);
}

async function submitOntology(sdk: MindSphereSdk, options: any) {
    const filePath = path.resolve(options.ontology);

    const file = fs.readFileSync(filePath);

    const mimeType = mime.lookup(filePath);
    const uploadedName = path.basename(filePath);

    const result = await sdk
        .GetSemanticDataInterConnectClient()
        .PostOntologyJob(
            uploadedName,
            file,
            mimeType,
            options.name,
            options.ontologyid,
            options.description || "created by mindsphere.cli",
            options.keymapping
        );
    printDataOntologyJob(result, options);
}
