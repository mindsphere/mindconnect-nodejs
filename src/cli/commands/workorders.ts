import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import { MindSphereSdk } from "../../api/sdk";
import { retry, throwError } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    printObjectInfo,
    proxyLog,
    serviceCredentialLog,
    verboseLog
} from "./command-utils";
import path = require("path");

let color = getColor("magenta");
const green = getColor("green");
const red = getColor("red");

export default (program: Command) => {
    program
        .command("workorder")
        .alias("wo")
        .option(
            "-m, --mode [list|create|update|delete|template|info]",
            "list | create | update | delete | template | info",
            "list"
        )
        .option("-f, --file <file>", ".mdsp.json file with workorder definition", "workorder.mdsp.json")
        .option("-n, --workorder <workorder>", "the workorder name")
        .option("-i, --workorderid <workorderid>", "the workorder id")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete workorders *"))
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
                            await listWorkOrders(sdk, options);
                            break;

                        case "template":
                            createTemplate(options, sdk.GetTenant());
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "delete":
                            await deleteWorkOrder(options, sdk);
                            break;

                        case "update":
                            await updateWorkOrder(options, sdk);
                            break;

                        case "create":
                            await createWorkOrder(options, sdk);
                            break;

                        case "info":
                            await workorderInfo(options, sdk);
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
            log(`    mc workorder --mode list \t\t\t\tlist all workorders`);
            log(`    mc workorder --mode template --workorder <workorder> \tcreate a template file for <workorder>`);
            log(`    mc workorder --mode create --file <workorder> \t\tcreate workorder `);
            log(`    mc workorder --mode update --file <workorder> --workorderid <workorderid> \t update workorder `);
            log(`    mc workorder --mode info --workorderid <workorderid> \tworkorder info for specified id`);
            log(`    mc workorder --mode delete --workorderid <workorderid> \tdelete workorder with specified id`);

            serviceCredentialLog();
        });
};

async function createWorkOrder(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const workorder = JSON.parse(file.toString());
    const result = await sdk.GetWorkOrderManagementClient().PostWorkOrder(workorder);
    console.log(`creted workorder : ${color(result.woHandle)} message: ${color(result.message)}`);
}

async function updateWorkOrder(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const workorder = JSON.parse(file.toString());
    const oldWorkOrder = await sdk.GetWorkOrderManagementClient().GetWorkOrder(options.workorderid);
    const result = await sdk.GetWorkOrderManagementClient().PutWorkOrder(options.workorderid!, workorder);
    console.log(`updated workorder : ${color(result.woHandle)} message: ${color(result.message)}`);
}

function createTemplate(options: any, tenant: string) {
    const workorder = {
        name: "WorkOrder",
        description: "Created with MindSphere CLI",
        active: true,
        subjects: [`mdsp:core:identitymanagement:eu1:${tenant}:user:test@example.com`],
        rules: [
            {
                name: "Rule1",
                comment:
                    "see https://developer.mindsphere.io/apis/core-resourceaccessmanagement/api-resourceaccessmanagement-actions-list.html for actions",
                actions: ["mdsp:core:assetmanagement:asset:read"],

                resources: [`mdsp:core:assetmanagement:eu1:${tenant}:asset:dfb0d2961a224a259c44d8c3f76204fe`],
                propagationDepth: -1,
            },
        ],
    };

    verboseLog(workorder, options.verbose);
    writeworkorderToFile(options, workorder);
}

function writeworkorderToFile(options: any, workorder: any) {
    const fileName = options.file || `workorder.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(fileName, JSON.stringify(workorder, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc workorder --mode create --file ${fileName} \n\nto create the workorder`
    );
}

async function deleteWorkOrder(options: any, sdk: MindSphereSdk) {
    const id = options.workorderid;
    await retry(options.retry, () => sdk.GetWorkOrderManagementClient().DeleteWorkOrder(id));
    console.log(`workorder with id ${color(id)} deleted.`);
}

async function listWorkOrders(sdk: MindSphereSdk, options: any) {
    const workorders = [];
    let startIndex = 0;
    let count = 500;
    let workorderPage;

    do {
        workorderPage = await retry(options.retry, () => sdk.GetWorkOrderManagementClient().GetWorkOrders());
        workorders.push(...workorderPage.workorders!);
        startIndex += count;
    } while (startIndex < (workorderPage.page?.totalElements || 1));

    workorders.forEach((workorder) => {
        console.log(
            `${color(workorder.id)} ${color(workorder.name)} [${workorder.eTag}] ${
                workorder.active ? green("active") : red("inactive")
            }`
        );
    });

    console.log(`${color(workorders.length)} workorders listed.\n`);
}

async function workorderInfo(options: any, sdk: MindSphereSdk) {
    const workorder = (await retry(options.retry, () =>
        sdk.GetWorkOrderManagementClient().GetWorkOrder(options.workorderid)
    ));
    verboseLog(JSON.stringify(workorder, null, 2), options.verbose);

    printObjectInfo("WorkOrder", workorder, options, ["owner", "id", "active"], color);
}

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with workorder definition to create an workorder (see mc workorder --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.workorderid &&
        errorLog("you have to provide the workorderid to delete (see mc workorder --help for more details)", true);

    options.mode === "delete" &&
        !options.workorderid &&
        errorLog("you have to provide the workorderid to delete (see mc workorder --help for more details)", true);

    options.mode === "info" &&
        !options.workorderid &&
        errorLog("you have to provide the workorderid (see mc workorder --help for more details)", true);
}
