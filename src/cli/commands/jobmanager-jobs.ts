import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { retry } from "../..";
import { JobManagerModels, MindSphereSdk } from "../../api/sdk";
import { throwError } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    proxyLog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";
import path = require("path");

let color = getColor("blue");

export default (program: CommanderStatic) => {
    program
        .command("jobs")
        .alias("jb")
        .option("-m, --mode [list|create|stop|template|info]", "list | create | stop | template | info", "list")
        .option("-f, --file <file>", ".mdsp.json file with job definition", "jobmanager.job.mdsp.json")
        .option("-i, --jobid <jobid>", "the job id")
        .option("-e, --message <message>", "the message filter (contains) for list command")
        .option("-s, --status <status>", "the status filter (equals, e.g. STOPPED, FAILED...) for list command")
        .option("-d, --modelid <modelid>", "the modelid filter (equals) for list command")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or stop jobs *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options, true);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    switch (options.mode) {
                        case "list":
                            await listJobs(sdk, options);
                            break;

                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "stop":
                            await stopJob(options, sdk);
                            break;

                        case "create":
                            await createJob(options, sdk);
                            break;

                        case "info":
                            await jobInfo(options, sdk);
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
            log(`    mc jobs --mode list \t\t\t\t\t list all jobs`);
            log(`    mc jobs --mode list --status FAILED --message import \t list all jobs which failed on import`);
            log(`    mc jobs --mode list --modelid <modelid> \t\t\t list all jobs for specified model`);
            log(`    mc jobs --mode list --modelid <modelid> \t\t\t list all jobs for specified model`);
            log(`    mc jobs --mode list --modelid <modelid> \t\t\t list all jobs for specified model`);
            log(`    mc jobs --mode template \t\t\t\t\t create template file for job creation`);
            log(`    mc jobs --mode create --file <templatefile> \t\t create job`);
            log(`    mc jobs --mode info --jobid <jobid> \t\t\t get infos about the job`);
            log(`    mc jobs --mode stop --jobid <jobid> \t\t\t stop job with job id`);
            serviceCredentialLog();
        });
};

async function createJob(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const job = JSON.parse(file.toString());

    const result = await sdk.GetJobManagerClient().PostJob(job);
    console.log(`created job ${color(result.id)} with status ${color(result.status)} and message \n ${result.message}`);
}

function createTemplate(options: any) {
    const templateType = {
        modelId: "<modelId>:guid",
        configurationId: "<configurationId:guid>",
        inputFolderId: "<inputFolderIdFromDataExchange:guid>",
        outputFolderId: "<outputFolderIdFromDataExchange:id",
        maximumExecutionTimeInSeconds: "60",
    };
    verboseLog(templateType, options.verbose);
    writejobToFile(options, templateType);
}

function writejobToFile(options: any, job: any) {
    const fileName = options.file || `job.jobmanager.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(job, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc jobs --mode create --file ${fileName} \n\nto create the job`
    );
}

async function stopJob(options: any, sdk: MindSphereSdk) {
    const id = options.jobid;
    const result = await sdk.GetJobManagerClient().StopJob(id);

    console.log(`sent stop signal to job with id ${color(id)}. Job status: ${color(result.status)}`);
}

async function listJobs(sdk: MindSphereSdk, options: any) {
    const jobManagerClient = sdk.GetJobManagerClient();

    let page = 0;
    let jobs;

    const filter = buildFilter(options);
    verboseLog(JSON.stringify(filter, null, 2), options.verbose);

    console.log(`id ${color("status")} message createdBy modelId`);

    let jobCount = 0;

    do {
        jobs = (await retry(options.retry, () =>
            jobManagerClient.GetJobs({
                pageNumber: page,
                pageSize: 100,
                filter: Object.keys(filter).length === 0 ? undefined : JSON.stringify(filter),
            })
        )) as JobManagerModels.JobList;

        jobs.jobs = jobs.jobs || [];
        jobs.page = jobs.page || { totalPages: 0 };

        for (const job of jobs.jobs || []) {
            jobCount++;
            console.log(
                `${job.id} ${color(job.status)} ${(job.message || "").substr(0, 20)} ${job.createdBy}\t${job.modelId}`
            );

            verboseLog(JSON.stringify(job, null, 2), options.verbose);
        }
    } while (page++ < (jobs.page.totalPages || 0));

    console.log(`${color(jobCount)} jobs listed.\n`);
}

function buildFilter(options: any) {
    const filter: any = {};

    if (options.message) {
        filter.message = { contains: `${options.message}` };
    }
    if (options.status) {
        filter.status = { eq: `${options.status}` };
    }
    if (options.modelid) {
        filter.modelId = { eq: `${options.modelid}` };
    }
    return filter;
}

async function jobInfo(options: any, sdk: MindSphereSdk) {
    const id = options.jobid! as string;
    const job = await sdk.GetJobManagerClient().GetJob(id);
    console.log(`Id: ${color(job.id)}`);
    console.log(`Status: ${color(job.status)}`);
    console.log(`Configuration Id: ${color((job as any).configurationId)}`);
    console.log(`Environment Id: ${job.environmentId}`);
    console.log(`InputFolder Id: ${job.inputFolderId}`);
    console.log(`OutputFolder Id: ${job.inputFolderId}`);
    console.log(`Model Id: ${color(job.modelId)}`);
    console.log(`Created by: ${color(job.createdBy)} on date ${job.creationDate}`);
    console.log(`Message:\n${job.message}`);

    verboseLog(JSON.stringify(job, null, 2), options.verbose);
}

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with job parameters to create an job (see mc jobs --help for more details)",
            true
        );

    options.mode === "stop" &&
        !options.jobid &&
        errorLog(
            "you have to provide the jobid of the job you want to stop (see mc jobs --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.jobid &&
        errorLog(
            "you have to provide the jobid to get infos about the job (see mc jobs --help for more details)",
            true
        );
}
