import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import { retry } from "../..";
import { CommandingModels, MindSphereSdk } from "../../api/sdk";
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
import path = require("path");

let color = getColor("magenta");

export default (program: Command) => {
    program
        .command("delivery-jobs")
        .alias("dj")
        .option(
            "-m, --mode [list|create|delete|template|info|commands|commandinfo]",
            "list | create | delete | template | info | commands | commandinfo",
            "list"
        )
        .option("-f, --file <file>", ".mdsp.json file with job definition", "deliveryjob.mqtt.mdsp.json")
        .option("-i, --jobid <jobid>", "the job id")
        .option("-c, --commandid <commandid>", "the command id")
        .option("-e, --name <name>", "the name filter (contains) for list command")
        .option("-t, --filter <filter>", "the JSON filter as specified in the API documentation")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("manage mqtt delivery jobs to publish MQTT commands to the clients *"))
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
                        case "delete":
                            await deleteJob(options, sdk);
                            break;

                        case "create":
                            await createJob(options, sdk);
                            break;

                        case "info":
                            await jobInfo(options, sdk);
                            break;

                        case "commandinfo":
                            await commandInfo(options, sdk);
                            break;

                        case "commands":
                            await listCommands(sdk, options);
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
            log(`    mc delivery-jobs --mode list \t\t\t\t\t list all jobs`);
            log(
                `    mc delivery-jobs --mode list --status FAILED --message import \t list all mqtt delivery jobs which failed on import`
            );
            log(
                `    mc delivery-jobs --mode list --name <name> \t\t\t\t list all mqtt delivery jobs with the given name`
            );
            log(
                `    mc delivery-jobs --mode list --filter '{"createdAt": {"after": "2021-11-06T13:46:00Z"}}' \ 
                                                                         list all mqtt delivery jobs created after the specified date`
            );
            log(`    mc delivery-jobs --mode template \t\t\t\t\t create template file for job creation`);
            log(`    mc delivery-jobs --mode create --file <templatefile> \t\t create job`);
            log(`    mc delivery-jobs --mode info --jobid <jobid> \t\t\t get infos about the job`);
            log(`    mc delivery-jobs --mode delete --jobid <jobid> \t\t\t delete job with job id`);
            log(`    mc delivery-jobs --mode commands --jobid <jobid> \t\t\t list all commands for specified job id`);
            log(
                `    mc delivery-jobs --mode commandinfo --jobid <jobid> --commandid <commandid> \ 
                                                                         get info for selected command`
            );

            serviceCredentialLog();
        });
};

async function createJob(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const job = JSON.parse(file.toString());

    const result = await sdk.GetCommandingClient().PostDeliveryJob(job);
    console.log(`created job ${color(result.id)} with status ${color(result.status)} and message \n`);
}

function createTemplate(options: any) {
    const templateType = {
        name: "example delivery job",
        clientIds: ["tenantId_device8"],
        data: {
            comment: "see https://developer.mindsphere.io/howto/howto-nativemqtt-commanding.html",
            additionalProp1: "string",
            additionalProp2: "string",
            additionalProp3: "string",
        },
    };
    verboseLog(JSON.stringify(templateType, null, 2), options.verbose);
    writejobToFile(options, templateType);
}

function writejobToFile(options: any, job: any) {
    const fileName = options.file || `deliveryjob.mqtt.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(job, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc delivery-jobs --mode create --file ${fileName} \n\nto create the job`
    );
}

async function deleteJob(options: any, sdk: MindSphereSdk) {
    const id = options.jobid;
    await sdk.GetCommandingClient().DeleteDeliveryJob(id);

    console.log(`deleted job with id ${color(id)}`);
}

async function listJobs(sdk: MindSphereSdk, options: any) {
    const commandingClient = sdk.GetCommandingClient();

    let page = 0;
    let jobs;

    const filter = buildFilter(options);
    verboseLog(JSON.stringify(filter, null, 2), options.verbose);

    console.log(`id  ${color("status")}  name  createdAt `);

    let jobCount = 0;

    do {
        jobs = (await retry(options.retry, () =>
            commandingClient.GetDeliveryJobs({
                page: page,
                size: 100,
                filter: Object.keys(filter).length === 0 ? undefined : JSON.stringify(filter),
            })
        )) as CommandingModels.DeliveryJobsResponse;

        jobs._embedded = jobs._embedded || [];
        jobs.page = jobs.page || { totalPages: 0 };

        for (const job of jobs._embedded.deliveryJobs || []) {
            jobCount++;
            console.log(`${job.id}  ${color(job.status)}  ${job.name || ""} ${job.createdAt}`);

            verboseLog(JSON.stringify(job, null, 2), options.verbose);
        }
    } while (page++ < (jobs.page.totalPages || 0));

    console.log(`${color(jobCount)} mqtt delivery jobs listed.\n`);
}

async function listCommands(sdk: MindSphereSdk, options: any) {
    const commandingClient = sdk.GetCommandingClient();

    let page = 0;
    let commands;

    const filter = buildFilter(options);
    verboseLog(JSON.stringify(filter, null, 2), options.verbose);

    console.log(`id  ${color("status")}  clientId  updatedAt  tenantId `);

    let jobCount = 0;

    do {
        commands = (await retry(options.retry, () =>
            commandingClient.GetDeliveryJobCommands(options.jobid, {
                page: page,
                size: 100,
                filter: Object.keys(filter).length === 0 ? undefined : JSON.stringify(filter),
            })
        )) as CommandingModels.CommandsResponse;

        commands._embedded = commands._embedded || [];
        commands.page = commands.page || { totalPages: 0 };

        for (const command of commands._embedded.commands || []) {
            jobCount++;
            console.log(
                `${command.id} ${color(command.status)}  ${command.clientId || ""}  ${command.updatedAt}  ${
                    command.tenantId
                }`
            );

            verboseLog(JSON.stringify(command, null, 2), options.verbose);
        }
    } while (page++ < (commands.page.totalPages || 0));

    console.log(`${color(jobCount)} mqtt delivery jobs listed.\n`);
}

function buildFilter(options: any) {
    let filter: any = {};

    if (options.name) {
        filter.name = { contains: `${options.name}` };
    }
    if (options.status) {
        filter.status = { eq: `${options.status}` };
    }
    if (options.filter) {
        filter = JSON.parse(options.filter);
    }
    verboseLog(JSON.stringify(filter, null, 2), options.verbose);
    return filter;
}

async function jobInfo(options: any, sdk: MindSphereSdk) {
    const id = options.jobid! as string;
    const job = await sdk.GetCommandingClient().GetDeliveryJob(id);

    printObjectInfo("MQTT Delivery Job", job, options, ["id", "status"], color);

    verboseLog(JSON.stringify(job, null, 2), options.verbose);
}

async function commandInfo(options: any, sdk: MindSphereSdk) {
    const id = options.jobid! as string;
    const commandid = options.commandid! as string;
    const command = await sdk.GetCommandingClient().GetDeliveryJobCommand(id, commandid);

    printObjectInfo(`MQTT Delivery Job Command [for job ${color(id)}]`, command, options, ["id", "status"], color);

    verboseLog(JSON.stringify(command, null, 2), options.verbose);
}

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with job parameters to create an job (see mc delivery-jobs --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.jobid &&
        errorLog(
            "you have to provide the jobid of the job you want to delete (see mc delivery-jobs --help for more details)",
            true
        );

    options.mode === "commands" &&
        !options.jobid &&
        errorLog(
            "you have to provide the jobid of the job to see the list of commands (see mc delivery-jobs --help for more details)",
            true
        );

    options.mode === "commandinfo" &&
        !options.jobid &&
        errorLog(
            "you have to provide the jobid of the job for commandifo command (see mc delivery-jobs --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.jobid &&
        errorLog(
            "you have to provide the jobid to get infos about the job (see mc delivery-jobs --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.commandid &&
        errorLog(
            "you have to provide the commandid to get infos about the command (see mc delivery-jobs --help for more details)",
            true
        );
}
