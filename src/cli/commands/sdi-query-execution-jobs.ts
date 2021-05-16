import { CommanderStatic } from "commander";
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

export default (program: CommanderStatic) => {
    program
        .command("sdi-execution-jobs")
        .alias("sdx")
        .option(
            "-m, --mode [list|create|template|info|delete|result]",
            "list | create | template | info | delete | result",
            "list"
        )
        .option(
            "-d, --executionjob <executionjob>",
            "data execution job file with definition for --mode create command"
        )
        .option("-q, --queryid <queryid>", "the query id")
        .option("-i, --jobid <jobid>", "the executionjob id for --mode info, update or delete command")
        .option("-r, --result <result>", "result file for --mode result", "sdi.jobresult.mdsp.json")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("manage data execution jobs for SDI *"))
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
                            await listDataExecutionJobs(sdk, options);
                            break;

                        case "info":
                            await executionjobInfo(sdk, options);
                            break;

                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "create":
                            await createExecutionJob(options, sdk);
                            break;
                        case "delete":
                            await deleteExecutionJob(options, sdk);
                            break;
                        case "result":
                            await queryResults(options, sdk);
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
            log(`    mc sdi-execution-jobs --mode list \t\t list all sdi data execution jobs`);
            log(`    mc sdi-execution-jobs --mode template \t create template file`);
            log(
                `    mc sdi-execution-jobs --mode create --executionjob <executionjobfile> \t create sdi data execution job`
            );
            log(`    mc sdi-execution-jobs --mode update --executionjob <executionjobfile> --jobid <jobid> \
                                                                                    \t\t update sdi data executionjob`);
            log(`    mc sdi-execution-jobs --mode info --jobid <jobid>   \t\t get sdi data execution job info`);
            log(`    mc sdi-execution-jobs --mode result --jobid <jobid>   \t\t get execution job results`);
            log(`    mc sdi-execution-jobs --mode delete --jobid <jobid> \t\t delete sdi data execution job`);

            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.executionjob &&
        errorLog(
            "you have to provide a executionjob template file to create a sdi execution job (see mc sdi-execution-jobs --help for more details)",
            true
        );

    options.mode === "create" &&
        !options.queryid &&
        errorLog(
            "you have to provide a query id template file to create a sdi execution job (see mc sdi-execution-jobs --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.jobid &&
        errorLog(
            "you have to provide the jobid to get infos about the sdi execution job (see mc sdi-execution-jobs --help for more details)",
            true
        );

    options.mode === "result" &&
        !options.jobid &&
        errorLog(
            "you have to provide the jobid to get the sdi execution job result (see mc sdi-execution-jobs --help for more details)",
            true
        );
    options.mode === "delete" &&
        !options.jobid &&
        errorLog(
            "you have to provide the jobid to delete the sdi execution job (see mc sdi-execution-jobs --help for more details)",
            true
        );
}

async function listDataExecutionJobs(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    let pageToken = undefined;
    let count = 0;
    console.log(`${color("id")} queryId  status  params  aliases `);
    do {
        const jobs: SemanticDataInterconnectModels.ResponseAllDataQueryExecutionResponse =
            await sdiClient.GetExecutionJobs({
                pageToken: pageToken,
            });
        jobs.jobs?.forEach((executionjob) => {
            console.log(
                `${color(executionjob.id)}  ${executionjob.queryId} ${executionjob.status}\t params: [${
                    (executionjob.parameters || [])?.length
                }] aliases: [${(executionjob.aliases || [])?.length}] ${executionjob.description || ""}  `
            );
            verboseLog(JSON.stringify(executionjob, null, 2), options.verbose);
            count++;
        });
        pageToken = jobs.page?.nextToken;
    } while (pageToken);
    console.log(`${color(count)} sdi data execution jobs listed.`);
}

async function executionjobInfo(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    const executionjob = await sdiClient.GetExecutionJob(`${options.jobid}`);
    printExecutionJobInfos(executionjob, options);
}

function printExecutionJobInfos(executionjob: object, options: any) {
    printObjectInfo("Data ExecutionJob:", executionjob, options, ["id", "sqlStatement"], color);
}

function createTemplate(options: any) {
    const templateType = {
        description: "Running query with sample alias and parameters",
        parameters: [
            {
                paramName: "column1",
                paramValue: "abc",
            },
        ],
        aliases: [
            {
                attributeName: "column1",
                aliasValue: "abc",
            },
        ],
    };
    verboseLog(JSON.stringify(templateType, null, 2), options.verbose);
    writeToFile(options, templateType);
}

function writeToFile(options: any, executionjob: any) {
    const fileName = options.file || `sdi.executionjob.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(executionjob, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc sdi-execution-jobs --mode create --executionjob ${fileName} \n\nto create the sdi data executionjob`
    );
}
async function createExecutionJob(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.executionjob);
    const file = fs.readFileSync(filePath);
    const executionjob = JSON.parse(file.toString());

    const result = await sdk.GetSemanticDataInterConnectClient().PostExecutionJob(options.queryid, executionjob);
    printExecutionJobInfos(result, options);
}

async function deleteExecutionJob(options: any, sdk: MindSphereSdk) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();
    await sdiClient.DeleteExecutionJob(`${options.jobid}`);
    console.log(`The sdi data executionjob with id : ${color(options.jobid)} was deleted.`);
}

async function queryResults(options: any, sdk: MindSphereSdk) {
    const fileName = options.results || `sdi.jobresult.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);
    const sdiClient = sdk.GetSemanticDataInterConnectClient();
    const result = await sdiClient.GetExecutionJobResults(`${options.jobid}`);
    verboseLog(JSON.stringify(result, null, 2), options.verbose);

    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
    console.log(`The result data was written into ${color(fileName)}.`);
}
