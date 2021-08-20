import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import { retry } from "../..";
import { EdgeAppDeploymentModels, MindSphereSdk } from "../../api/sdk";
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

let color = getColor("magenta");

export default (program: Command) => {
    program
        .command("oe-app-deploy")
        .alias("oead")
        .option(
            "-m, --mode [list|create|update|accept|remove|template|info|check]",
            "list | create | update | accept | remove | template | info | check",
            "list"
        )
        .option("-i, --id <id>", "the installation task id")
        .option("-d, --deviceid <deviceid>", "deviceid to filter")
        .option("-r, --realeaseid <realeaseid>", "software realease id")
        .option("-f, --file <file>", ".mdsp.json file with app data")
        .option("-s, --status <status> [closed|open]", "closed | open")

        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create, update app installation task(s) (open edge) *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    switch (options.mode) {
                        case "list":
                            await listInstalls(sdk, options);
                            break;

                        case "template":
                            await createTemplateInstallationTask(options, sdk);
                            await createTemplateRemovalTask(options, sdk);
                            await createTemplateTaskStatus(options, sdk);
                            console.log("Edit the file(s) before submitting it to MindSphere.");
                            break;

                        case "create":
                            await createInstallationTask(options, sdk);
                            break;
                        case "remove":
                            await createRemovalTask(options, sdk);
                            break;

                        case "update":
                            await updateTaskStatus(options, sdk);
                            break;

                        case "check":
                            await checkTermAndConditions(options, sdk);
                            break;
                        case "accept":
                            await acceptTermAndConditions(options, sdk);
                            break;

                        case "info":
                            await taskInstInfo(options, sdk);
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
            log(
                `    mc oe-app-deploy --mode list --deviceid "7d018c..." \n\tlist all installation and removal tasks of a specified device.`
            );
            log(
                `    mc oe-app-deploy --mode template \n\tcreate template files to define an app installation/removal task.`
            );
            log(
                `    mc oe-app-deploy --mode create --file edge.install.app.mdsp.json \n\tcreates a new installation app taks.`
            );
            log(
                `    mc oe-app-deploy --mode remove --file edge.remove.app.mdsp.json \n\tcreates a new removal app task.`
            );
            log(
                `    mc oe-app-deploy --mode update --id "7d018c..." --file edge.app.status.mdsp.json \n\tupdate an installation/removal task from status template file.`
            );
            log(`    mc oe-app-deploy --mode info --id <id>\n\tget details of an installation task.`);
            log(
                `    mc oe-app-deploy --mode check --deviceid <deviceid> --realeaseid <realeaseid>  \n\tcheck terms and condition of a software realease on a a specific device.`
            );
            log(
                `    mc oe-app-deploy --mode accept --deviceid <deviceid> --realeaseid <realeaseid> \n\taccept terms and condition of a software realease on a a specific device.`
            );

            serviceCredentialLog();
        });
};

function checkRequiredParameters(options: any) {
    options.mode === "list" &&
        !options.deviceid &&
        errorLog(
            "you have to provide the device id to list all the app installation/removal tasks (see mc oe-app-deploy --help for more details)",
            true
        );

    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with the task data to create a new installation task (see mc oe-app-deploy --help for more details)",
            true
        );

    options.mode === "remove" &&
        !options.file &&
        errorLog(
            "you have to provide a file with the task data to create a new deployment workflow (see mc oe-app-deploy --help for more details)",
            true
        );

    options.mode === "update" &&
        !options.id &&
        errorLog(
            "you have to provide the id of the installation/removal task to update it (see mc oe-app-deploy --help for more details)",
            true
        );

    options.mode === "check" &&
        !options.deviceid &&
        errorLog(
            "you have to provide the deviceid to check for terms and conditions (see mc oe-app-deploy --help for more details)",
            true
        );
    options.mode === "check" &&
        !options.realeaseid &&
        errorLog(
            "you have to provide the realeaseid to check for terms and conditions (see mc oe-app-deploy --help for more details)",
            true
        );

    options.mode === "accept" &&
        !options.deviceid &&
        errorLog(
            "you have to provide the deviceid to accept the terms and conditions (see mc oe-app-deploy --help for more details)",
            true
        );
    options.mode === "accept" &&
        !options.realeaseid &&
        errorLog(
            "you have to provide the realeaseid to accept the terms and conditions (see mc oe-app-deploy --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.id &&
        errorLog(
            "you have to provide the id of the installation task (see mc oe-app-deploy --help for more details)",
            true
        );
}

async function listInstalls(sdk: MindSphereSdk, options: any) {
    const appDeploymentClient = sdk.GetEdgeDeploymentClient();

    // Parse all options
    const deviceid = options.deviceid;

    let page = 0;
    let iTaskPage;
    let rslt_table: any[] = [];
    do {
        iTaskPage = (await retry(options.retry, () =>
            appDeploymentClient.GetInstallationTasks(deviceid, options.status, 100, page)
        )) as EdgeAppDeploymentModels.PaginatedTaskResource;

        iTaskPage.content = iTaskPage.content || [];
        iTaskPage.page = iTaskPage.page || { totalPages: 0 };
        rslt_table = rslt_table.concat(iTaskPage.content);
    } while (page++ < (iTaskPage.page.totalPages || 0));

    // Print out the table
    console.log("App installation tasks");
    console.table(rslt_table, ["id", "createdAt", "softwareType", "softwareId", "softwareReleaseId", "currentState"]);
    console.log(`${color(rslt_table.length)} app installation task(s) listed.\n`);

    page = 0;
    let rTaskPage;
    let rslt_table_2: any[] = [];
    do {
        rTaskPage = (await retry(options.retry, () =>
            appDeploymentClient.GetRemovalTasks(deviceid, options.status, 100, page)
        )) as EdgeAppDeploymentModels.PaginatedTaskResource;

        rTaskPage.content = rTaskPage.content || [];
        rTaskPage.page = rTaskPage.page || { totalPages: 0 };
        rslt_table_2 = rslt_table_2.concat(rTaskPage.content);
    } while (page++ < (rTaskPage.page.totalPages || 0));

    // Print out the table
    console.log("Removal Tasks");
    console.table(rslt_table, ["id", "createdAt", "softwareType", "softwareId", "softwareReleaseId", "currentState"]);
    console.log(`${color(rslt_table_2.length)} app removal task(s) listed.\n`);
}
async function createTemplateInstallationTask(options: any, sdk: MindSphereSdk) {
    const template = {
        deviceId: "7d018c...",
        softwareId: "7d018c...",
        softwareReleaseId: "7d018c...",
        customData: {
            sampleKey1: "sampleValue1",
            sampleKey2: "sampleValue2",
        },
    };
    verboseLog(template, options.verbose);
    writeInstallTaskTemplateToFile(options, template);
}
function writeInstallTaskTemplateToFile(options: any, templateType: any) {
    const fileName = options.file || `edge.install.app.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(templateType, null, 2));
    console.log(
        `The app installation task template was written into ${color(
            filePath
        )} run \n\n\tmc oe-app-deploy --mode create --file ${fileName} \n\nto create a new instalation task.\n`
    );
}
async function createTemplateRemovalTask(options: any, sdk: MindSphereSdk) {
    const templateType = {
        deviceId: "7d018c...",
        softwareId: "7d018c...",
        softwareReleaseId: "7d018c...",
        customData: {
            sampleKey1: "sampleValue1",
            sampleKey2: "sampleValue2",
        },
    };
    verboseLog(templateType, options.verbose);
    writeRemovalTaskTemplateToFile(options, templateType);
}
function writeRemovalTaskTemplateToFile(options: any, templateType: any) {
    const fileName = options.file || `edge.remove.app.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(templateType, null, 2));
    console.log(
        `The workflow instance template was written into ${color(
            filePath
        )} run \n\n\tmc oe-app-deploy --mode remove --file ${fileName} \n\nto create a new removal task.\n`
    );
}
async function createTemplateTaskStatus(options: any, sdk: MindSphereSdk) {
    const template = {
        state: "DOWNLOAD",
        progress: 0.4,
        message: "Task status updated as DOWNLOAD",
        details: {
            sampleKey1: "sampleValue1",
            sampleKey2: "sampleValue2",
        },
    };
    verboseLog(template, options.verbose);
    writeTaskStatusTemplateToFile(options, template);
}
function writeTaskStatusTemplateToFile(options: any, templateType: any) {
    const fileName = options.file || `edge.app.status.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(templateType, null, 2));
    console.log(
        `The app installation task status template was written into ${color(
            filePath
        )} run \n\n\tmc oe-app-deploy --mode update --id <id> --file ${fileName} \n\nto update the instalation task.\n`
    );
}
async function taskInstInfo(options: any, sdk: MindSphereSdk) {
    let info = null;
    const id = (options.id! as string) ? options.id : `${options.id}`;
    info = (await retry(options.retry, () =>
        sdk.GetEdgeDeploymentClient().GetInstallationTask(id)
    )) as EdgeAppDeploymentModels.TaskResource;
    console.log(`Task with id ${id}:`);
    console.log(JSON.stringify(info, null, 4));
}
async function updateTaskStatus(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const data = JSON.parse(file.toString());

    const id = (options.id! as string) ? options.id : `${options.id}`;
    await sdk.GetEdgeDeploymentClient().PatchInstallationTask(id, data);
    console.log(`updated the status of the installation task ${color(id)} as specified in ${color(filePath)}`);
}
async function checkTermAndConditions(options: any, sdk: MindSphereSdk) {
    let info = null;
    const deviceid = (options.deviceid! as string) ? options.deviceid : `${options.deviceid}`;
    const realeaseid = (options.realeaseid! as string) ? options.realeaseid : `${options.realeaseid}`;
    info = (await retry(options.retry, () =>
        sdk.GetEdgeDeploymentClient().GetTermsAndConditions(deviceid, realeaseid)
    )) as EdgeAppDeploymentModels.TermsAndConditionsResource;
    if (info.firstAccepted) {
        console.log(`Terms and conditions accepted on ${color(info.firstAccepted)}.\n`);
    } else {
        console.log(`Terms and conditions are not ccepted for deviceid: ${deviceid} and realeaseid: ${realeaseid}.\n`);
    }
}
async function acceptTermAndConditions(options: any, sdk: MindSphereSdk) {
    const deviceid = (options.deviceid! as string) ? options.deviceid : `${options.deviceid}`;
    const realeaseid = (options.realeaseid! as string) ? options.realeaseid : `${options.realeaseid}`;
    await retry(options.retry, () =>
        sdk.GetEdgeDeploymentClient().PostAcceptTermsAndConditions({
            deviceId: deviceid,
            releaseId: realeaseid,
        })
    );
}
async function createRemovalTask(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const data = JSON.parse(file.toString());

    const inst = await sdk.GetEdgeDeploymentClient().PostRemovalTask(data);
    verboseLog(JSON.stringify(inst, null, 2), options.verbose);
    console.log(
        `created a new app removal task on the device ${color(inst.deviceId)} as specified by the file ${color(
            filePath
        )}`
    );
}
async function createInstallationTask(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const data = JSON.parse(file.toString());

    const inst = await sdk.GetEdgeDeploymentClient().PostInstallationTask(data);
    verboseLog(JSON.stringify(inst, null, 2), options.verbose);
    console.log(`created a new app installation task as specified by the file ${color(filePath)}`);
}
