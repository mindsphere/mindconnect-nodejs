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
        .command("oe-firm-deploy")
        .alias("oefd")
        .option(
            "-m, --mode [list|create|update|info|check|accept|template]",
            "list | create | update | info | check | accept |template",
            "list"
        )
        .option("-i, --id <id>", "the installation task id")
        .option("-d, --deviceid <deviceid>", "deviceid to filter")
        .option("-r, --realeaseid <realeaseid>", "firmware realease id")
        .option("-t, --type <type>", "filter for tasks of a specific type (firmware, app, etc)")
        .option("-s, --status <status> [closed|open]", "filter based on task progress, one of “closed” or “open”")
        .option("-f, --file <file>", ".mdsp.json file with app data")

        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create, update firmware deployment task(s) (open edge) *"))
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
                            await createTemplateTaskStatus(options, sdk);
                            console.log("Edit the file(s) before submitting it to MindSphere.");
                            break;

                        case "create":
                            await createInstllationTask(options, sdk);
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
                `    mdsp oe-firm-deploy --mode list --deviceid "7d018c..." \n\tlist all firmware deployment taks on a specified device.`
            );
            log(
                `    mdsp oe-firm-deploy --mode template \n\tcreate template files to define an firmware installation/update task.`
            );
            log(
                `    mdsp oe-firm-deploy --mode create --file edge.install.firmware.mdsp.json \n\tcreates a new firmware installtion tak.`
            );
            log(
                `    mdsp oe-firm-deploy --mode update --id "7d018c..." --file edge.firmware.status.mdsp.json \n\tupdate a firmware installation task from status template file.`
            );
            log(`    mdsp oe-firm-deploy --mode info --id <id>\n\tget details of a firmware installation task.`);
            log(
                `    mdsp oe-firm-deploy --mode check --deviceid <deviceid> --realeaseid <realeaseid>  \n\tcheck terms and condition of a firmware realease on a a specific device.`
            );
            log(
                `    mdsp oe-firm-deploy --mode accept --deviceid <deviceid> --realeaseid <realeaseid> \n\taccept terms and condition of a firmware realease on a a specific device.`
            );

            serviceCredentialLog();
        });
};

function checkRequiredParameters(options: any) {
    options.mode === "list" &&
        !options.deviceid &&
        errorLog(
            "you have to provide the device id to list all the app installation/removal tasks (see mdsp oe-firm-deploy --help for more details)",
            true
        );

    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with the task data to create a new installation task (see mdsp oe-firm-deploy --help for more details)",
            true
        );

    options.mode === "update" &&
        !options.file &&
        errorLog(
            "you have to provide a file with the update data to update the status of the firmware installation task (see mdsp oe-firm-deploy --help for more details)",
            true
        );

    options.mode === "update" &&
        !options.id &&
        errorLog(
            "you have to provide the id of the installation/removal task to update it (see mdsp oe-firm-deploy --help for more details)",
            true
        );

    options.mode === "check" &&
        !options.deviceid &&
        errorLog(
            "you have to provide the deviceid to check for terms and conditions (see mdsp oe-firm-deploy --help for more details)",
            true
        );
    options.mode === "check" &&
        !options.realeaseid &&
        errorLog(
            "you have to provide the realeaseid to check for terms and conditions (see mdsp oe-firm-deploy --help for more details)",
            true
        );

    options.mode === "accept" &&
        !options.deviceid &&
        errorLog(
            "you have to provide the deviceid to accept the terms and conditions (see mdsp oe-firm-deploy --help for more details)",
            true
        );
    options.mode === "accept" &&
        !options.realeaseid &&
        errorLog(
            "you have to provide the realeaseid to accept the terms and conditions (see mdsp oe-firm-deploy --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.id &&
        errorLog(
            "you have to provide the id of the installation task (see mdsp oe-firm-deploy --help for more details)",
            true
        );
}

async function listInstalls(sdk: MindSphereSdk, options: any) {
    const firmDeploymentClient = sdk.GetFirmwareDeploymentClient();

    // Parse all options
    const deviceid = options.deviceid;

    let page = 0;
    let iTaskPage;
    let rslt_table: any[] = [];
    do {
        iTaskPage = (await retry(options.retry, () =>
            firmDeploymentClient.GetInstallationTasks(
                deviceid,
                options.type,
                options.status,
                100,
                page,
                undefined,
                options.history
            )
        )) as EdgeAppDeploymentModels.PaginatedTaskResource;

        iTaskPage.content = iTaskPage.content || [];
        iTaskPage.page = iTaskPage.page || { totalPages: 0 };
        rslt_table = rslt_table.concat(iTaskPage.content);
    } while (page++ < (iTaskPage.page.totalPages || 0));

    // Print out the table
    console.log("Firmware installation tasks");
    console.table(rslt_table, [
        "id",
        "createdAt",
        "softwareType",
        "softwareId",
        "softwareReleaseId",
        "actionType",
        "currentState",
    ]);
    console.log(`${color(rslt_table.length)} firmware installation/update task(s) listed.\n`);
}
async function createTemplateInstallationTask(options: any, sdk: MindSphereSdk) {
    const template = {
        deviceId: "7d018c...",
        softwareType: "FIRMWARE",
        softwareId: "7d018c...",
        softwareReleaseId: "7d018c...",
        transitions: [
            {
                type: "string",
                from: "DOWNLOAD",
                to: "INSTALL",
                details: {},
            },
        ],
        customData: {
            userDefined: {},
        },
    };
    verboseLog(template, options.verbose);
    writeInstallTaskTemplateToFile(options, template);
}
function writeInstallTaskTemplateToFile(options: any, templateType: any) {
    const fileName = options.file || `edge.install.firmware.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(templateType, null, 2));
    console.log(
        `The firmware installation task template was written into ${color(
            filePath
        )} run \n\n\tmdsp oe-firm-deploy --mode create --file ${fileName} \n\nto create a new instalation task.\n`
    );
}
async function createTemplateTaskStatus(options: any, sdk: MindSphereSdk) {
    const template = {
        state: "CREATED",
        progress: 0,
        message: "string",
        details: {},
    };
    verboseLog(template, options.verbose);
    writeTaskStatusTemplateToFile(options, template);
}
function writeTaskStatusTemplateToFile(options: any, templateType: any) {
    const fileName = options.file || `edge.firmware.status.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(templateType, null, 2));
    console.log(
        `The firmware installation task status template was written into ${color(
            filePath
        )} run \n\n\tmdsp oe-firm-deploy --mode update --id <id> --file ${fileName} \n\nto update the instalation task.\n`
    );
}
async function taskInstInfo(options: any, sdk: MindSphereSdk) {
    let info = null;
    const id = (options.id! as string) ? options.id : `${options.id}`;
    info = (await retry(options.retry, () =>
        sdk.GetFirmwareDeploymentClient().GetInstallationTask(id)
    )) as EdgeAppDeploymentModels.TaskResource;
    console.log(`Task with id "${id}":`);
    console.log(JSON.stringify(info, null, 4));
}
async function updateTaskStatus(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const data = JSON.parse(file.toString());

    const id = (options.id! as string) ? options.id : `${options.id}`;
    await sdk.GetFirmwareDeploymentClient().PatchInstallationTask(id, data);
    console.log(
        `updated the status of the firmware installation task "${color(id)}" as specified in ${color(filePath)}`
    );
}
async function checkTermAndConditions(options: any, sdk: MindSphereSdk) {
    let info = null;
    const deviceid = (options.deviceid! as string) ? options.deviceid : `${options.deviceid}`;
    const realeaseid = (options.realeaseid! as string) ? options.realeaseid : `${options.realeaseid}`;
    info = (await retry(options.retry, () =>
        sdk.GetFirmwareDeploymentClient().GetTermsAndConditions(deviceid, realeaseid)
    )) as EdgeAppDeploymentModels.TermsAndConditionsResource;
    if (info.firstAccepted) {
        console.log(`Terms and conditions accepted on ${color(info.firstAccepted)}.\n`);
    } else {
        console.log(`Terms and conditions are not accepted for deviceid: ${deviceid} and realeaseid: ${realeaseid}.\n`);
    }
}
async function acceptTermAndConditions(options: any, sdk: MindSphereSdk) {
    let info = null;
    const deviceid = (options.deviceid! as string) ? options.deviceid : `${options.deviceid}`;
    const realeaseid = (options.realeaseid! as string) ? options.realeaseid : `${options.realeaseid}`;
    info = (await retry(options.retry, () =>
        sdk.GetFirmwareDeploymentClient().PostAcceptTermsAndConditions({
            deviceId: deviceid,
            releaseId: realeaseid,
        })
    )) as EdgeAppDeploymentModels.TermsAndConditionsResource;

    verboseLog(JSON.stringify(info, null, 2), options.verbose);
}

async function createInstllationTask(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const data = JSON.parse(file.toString());

    const inst = await sdk.GetFirmwareDeploymentClient().PostInstallationTask(data);
    verboseLog(JSON.stringify(inst, null, 2), options.verbose);
    console.log(`created a new firmware installation task as specified by the file ${color(filePath)}`);
}
