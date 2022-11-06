import { Command } from "commander";
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

export default (program: Command) => {
    program
        .command("schedules")
        .alias("js")
        .option(
            "-m, --mode [list|create|start|stop|template|info|delete]",
            "list | create | stop | template | info",
            "list"
        )
        .option("-f, --file <file>", ".mdsp.json file with job schedule definition", "jobmanager.schedule.mdsp.json")
        .option("-i, --scheduleid <scheduleid>", "the schedule id")
        .option("-n, --name <name>", "the name filter (contains) for list command")
        .option("-s, --status <status>", "the status filter (equals, e.g. STOPPED, FAILED...) for list command")
        .option("-d, --modelid <modelid>", "the modelid filter (equals) for list command")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create, start, stop or delete job schedules *"))
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
                            await listSchedules(sdk, options);
                            break;

                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "stop":
                            await stopSchedule(options, sdk);
                            break;
                        case "start":
                            await startSchedule(options, sdk);
                            break;

                        case "delete":
                            await deleteSchedule(options, sdk);
                            break;

                        case "create":
                            await createSchedule(options, sdk);
                            break;

                        case "info":
                            await scheduleInfo(options, sdk);
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
            log(`    mdsp schedules --mode list \t\t\t\t\t list all job schedules`);
            log(`    mdsp schedules --mode list --status RUNNING \t list all RUNNING job schedules`);
            log(`    mdsp schedules --mode list --modelid <modelid> \t\t\t list all job schedules for specified model`);
            log(`    mdsp schedules --mode template \t\t\t\t\t create template file for job schedule creation`);
            log(`    mdsp schedules --mode create --file <templatefile> \t\t create job schedule`);
            log(`    mdsp schedules --mode info --scheduleid <scheduleid> \t\t\t get infos about the job schedule`);
            log(`    mdsp schedules --mode start --scheduleid <scheduleid> \t\t\t start job schedule with job id`);
            log(`    mdsp schedules --mode stop --scheduleid <scheduleid> \t\t\t stop job schedule with job id`);
            serviceCredentialLog();
        });
};

async function createSchedule(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const schedule = JSON.parse(file.toString());

    const result = await sdk.GetJobManagerClient().PostSchedule(schedule);
    console.log(`Created schedule ${color(result.id)} with status ${color(result.status)}.`);
}

function createTemplate(options: any) {
    const templateType = {
        inputFolderId: "<data-exchange-folderid>",
        outputFolderId: "<data-exchange-folderid>",
        configurationId: "<folderid>",
        modelId: "<modelid>",
        name: "<name>",
        maximumExecutionTime: 3600,
        scheduleString: "1 1 * * *",
    };
    verboseLog(JSON.stringify(templateType, null, 2), options.verbose);
    writescheduleToFile(options, templateType);
}

function writescheduleToFile(options: any, job: any) {
    const fileName = options.file || `jobmanager.schedule.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(job, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmdsp schedules --mode create --file ${fileName} \n\nto create the job schedule`
    );
}

async function stopSchedule(options: any, sdk: MindSphereSdk) {
    const id = options.scheduleid;
    const result = await sdk.GetJobManagerClient().StopSchedule(id);

    console.log(`Sent stop signal to job schedule with id ${color(id)}. Schedule status: ${color(result.status)}.`);
}

async function startSchedule(options: any, sdk: MindSphereSdk) {
    const id = options.scheduleid;
    const result = await sdk.GetJobManagerClient().StartSchedule(id);

    console.log(`Sent start signal to job schedule with id ${color(id)}. Schedule status: ${color(result.status)}.`);
}

async function deleteSchedule(options: any, sdk: MindSphereSdk) {
    const id = options.scheduleid;
    await sdk.GetJobManagerClient().DeleteSchedule(id);

    console.log(`Deleted schedule with id ${color(id)}.`);
}

async function listSchedules(sdk: MindSphereSdk, options: any) {
    const jobManagerClient = sdk.GetJobManagerClient();

    let page = 0;
    let schedules;

    const filter = buildFilter(options);
    verboseLog(JSON.stringify(filter, null, 2), options.verbose);

    console.log(`id ${color("status")} [${"scheduleString"}] ${color("name")} createdBy modelId`);

    let scheduleCount = 0;

    do {
        schedules = (await retry(options.retry, () =>
            jobManagerClient.GetSchedules({
                pageNumber: page,
                pageSize: 100,
                filter: Object.keys(filter).length === 0 ? undefined : JSON.stringify(filter),
            })
        )) as JobManagerModels.ScheduleList;

        schedules.schedules = schedules.schedules || [];
        schedules.page = schedules.page || { totalPages: 0 };

        for (const schedule of schedules.schedules || []) {
            scheduleCount++;
            console.log(
                `${schedule.id} ${color(schedule.status)} [${schedule.scheduleString}] ${color(schedule.name)}  ${
                    schedule.createdBy
                }  ${schedule.modelId}`
            );

            verboseLog(JSON.stringify(schedule, null, 2), options.verbose);
        }
    } while (page++ < (schedules.page.totalPages || 0));

    console.log(`${color(scheduleCount)} schedules listed.\n`);
}

function buildFilter(options: any) {
    const filter: any = {};

    if (options.name) {
        filter.name = { contains: `${options.name}` };
    }
    if (options.status) {
        filter.status = { eq: `${options.status}` };
    }
    if (options.modelid) {
        filter.modelId = { eq: `${options.modelid}` };
    }
    return filter;
}

async function scheduleInfo(options: any, sdk: MindSphereSdk) {
    const id = options.scheduleid! as string;
    const schedule = await sdk.GetJobManagerClient().GetSchedule(id);
    console.log(`Id: ${color(schedule.id)}`);
    console.log(`Name: ${color(schedule.name)}`);
    console.log(`Schedule String: ${color(schedule.scheduleString)}`);
    console.log(`Input FolderId: ${schedule.inputFolderId}`);
    console.log(`Output FolderId: ${schedule.outputFolderId}`);
    console.log(`Configuration Id: ${schedule.configurationId}`);
    console.log(`Max execution time: ${schedule.maximumExecutionTime}`);
    console.log(`Model Id: ${schedule.modelId}`);
    console.log(`Status: ${color(schedule.status)}`);
    console.log(`Created by: ${schedule.createdBy} on date ${schedule.creationDate}`);

    verboseLog(JSON.stringify(schedule, null, 2), options.verbose);
}

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with schedule parameters to create a schedule (see mdsp schedules --help for more details)",
            true
        );

    options.mode === "stop" &&
        !options.scheduleid &&
        errorLog(
            "you have to provide the scheduleid of the schedule you want to stop (see mdsp schedules --help for more details)",
            true
        );
    options.mode === "start" &&
        !options.scheduleid &&
        errorLog(
            "you have to provide the scheduleid of the schedule you want to start (see mdsp schedules --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.scheduleid &&
        errorLog(
            "you have to provide the scheduleid to get infos about the schedule (see mdsp schedules --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.scheduleid &&
        errorLog(
            "you have to provide the scheduleid to delete the schedule (see mdsp schedules --help for more details)",
            true
        );
}
