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
        .command("sdi-ingest-jobs")
        .alias("sdj")
        .option("-m, --mode [list|create|template|info]", "list | create | template | info ", "list")
        .option("-j, --ingestjob <ingestjob>", "the job information for --mode create command")
        .option("-i, --jobid <jobid>", "the job id for --mode info command")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("manage ingest jobs for SDI *"))
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
                            await listJobStatuses(sdk, options);
                            break;

                        case "info":
                            await ingestJobInfo(sdk, options);
                            break;

                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "create":
                            await createIngestJob(options, sdk);
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
            log(`    mdsp sdi-ingest-jobs --mode list \t\t\t\t\t list all sdi data ingest jobs`);
            log(`    mdsp sdi-ingest-jobs --mode template \t\t\t\t create template file`);
            log(`    mdsp sdi-ingest-jobs --mode create --ingestjob <ingestjobfile> \t create sdi ingest job`);
            log(`    mdsp sdi-ingest-jobs --mode info --jobid <jobid>   \t\t\t get sdi ingest job info`);

            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.ingestjob &&
        errorLog(
            "you have to provide a ingestjob template file to create a sdi ingestjob (see mdsp sdi-ingest-jobs --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.jobid &&
        errorLog(
            "you have to provide the jobid to get infos about the sdi ingest job (see mdsp sdi-ingest-jobs --help for more details)",
            true
        );
}

async function listJobStatuses(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    let pageToken = undefined;
    let count = 0;
    console.log(`${color("jobid")} ${"fileName"} ${color("status")}  ${"message"} [startDate - finishedDate]`);
    do {
        const jobs: SemanticDataInterconnectModels.ListOfJobIds = await sdiClient.GetIngestJobs({
            pageToken: pageToken,
        });
        jobs.ingestJobStatus?.forEach((job) => {
            console.log(
                `${color(job.jobId)}  ${job.fileName || "<empty>"}  ${color(job.status)} ${(job.message || "").substr(
                    0,
                    50
                )}...  [${job.startedDate || ""} - ${job.finishedDate || ""}]`
            );
            verboseLog(JSON.stringify(job, null, 2), options.verbose);
            count++;
        });
        pageToken = jobs.page?.nextToken;
    } while (pageToken);
    console.log(`${color(count)} sdi ingest jobs listed.`);
}

async function ingestJobInfo(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    const ingestJob = await sdiClient.GetIngestJobStatus(`${options.jobid}`);
    printIngestJobInfos(ingestJob, options);
}

function printIngestJobInfos(ingestJob: object, options: any) {
    printObjectInfo("Data Ingest Job:", ingestJob, options, ["jobId", "status"], color);
}

function createTemplate(options: any) {
    const templateType = {
        dataTag: "<string, data registr tag>",
        filePath: "<string, valid file path in SDI or IDL, required>",
        rootTag: "<string, The roottag is optional and applies to XML formatted files.>",
        sourceName: "<string, data registry source name>",
    };
    verboseLog(JSON.stringify(templateType, null, 2), options.verbose);
    writeToFile(options, templateType);
}

function writeToFile(options: any, ingestJob: any) {
    const fileName = options.file || `sdi.ingestjob.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(ingestJob, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmdsp sdi-ingest-jobs --mode create --ingestjob ${fileName} \n\nto create the sdi ingest job`
    );
}
async function createIngestJob(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.ingestjob);
    const file = fs.readFileSync(filePath);
    const ingestJob = JSON.parse(file.toString());

    const result = await sdk.GetSemanticDataInterConnectClient().PostIngestJob(ingestJob);
    printIngestJobInfos(result, options);
}
