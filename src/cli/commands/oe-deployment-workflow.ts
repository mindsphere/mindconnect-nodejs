import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { retry } from "../..";
import { DeploymentWorkflowModels, MindSphereSdk } from "../../api/sdk";
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

export default (program: CommanderStatic) => {
    program
        .command("oe-deploy-workflow")
        .alias("oedw")
        .option("-m, --mode [list|create|instantiate|update|cancel|delete|template|info]", "list | create | instantiate | update | cancel | delete | template | info", "list")
        .option("-k, --key <key>", "the workflow model key")
        .option("-i, --id <id>", "the deployment model instance id")
        .option("-f, --file <file>", ".mdsp.json file")

        .option("-md, --model", "include the model")
        .option("-u, --history", "include the transition history")
        .option("-c, --currentstate <currentstate>", "current state value to filter")
        .option("-g, --group <group>", "group value to filter")
        .option("-d, --deviceid <deviceid>", "deviceid to filter")

        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create/instantiate, update or delete/cancel workflow deployment model or instance(s) (open edge) *"))
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
                            await listInstances(sdk, options);
                            break;

                        case "template":
                            await createTemplateWorkflowModel(options, sdk);
                            await createTemplateWorkflowInstance(options, sdk);
                            await createTemplateWorkflowStatus(options, sdk);
                            console.log("Edit the file(s) before submitting it to MindSphere.");
                            break;

                        case "delete":
                            await deleteWorflowModel(options, sdk);
                            break;
                        case "cancel":
                            await cancelWorflowInstance(options, sdk);
                            break;

                        case "create":
                            await createWorkflowModel(options, sdk);
                            break;
                        case "instantiate":
                            await createWorkflowInstance(options, sdk);
                            break;

                        case "update":
                            await updateWorkflowInstanceStatus(options, sdk);
                            break;

                        case "info":
                            await workflowDeploymentInstInfo(options, sdk);
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
            log(`    mc oe-deploy-workflow --mode list \t\t\tlist all workflow instances descriptions belonging to the caller's tenant.`);
            log(
                `    mc oe-deploy-workflow --mode template \t\tcreate a template files to define the workflow state machine model.`
            );
            log(
                `    mc oe-deploy-workflow --mode create --file edge.app.model.mdsp.json \n\tcreates a new workflow model from template file.`
            );
            log(
                `    mc oe-deploy-workflow --mode instantiate --file edge.app.instance.mdsp.json \n\tcreates a new workflow instance from template file.`
            );
            log(
                `    mc oe-deploy-workflow --mode update --id "7d018c..." --file edge.app.status.mdsp.json \n\tupdate a workflow instance.`
            );
            log(`    mc oe-deploy-workflow --mode info --id <id>\t\tget details of a deployment workflow instance.`);
            log(`    mc oe-deploy-workflow --mode info --key <key>\tget details of a deployment workflow model.`);
            log(
                `    mc oe-deploy-workflow --mode cancel --id <id> \tcancel a deployment workflow.`
            );
            log(
                `    mc oe-deploy-workflow --mode delete --key <key> \tdelete a deployment workflow model.`
            );

            serviceCredentialLog();
        });
};

function checkRequiredParameters(options: any) {
    options.mode === "create" &&
    !options.file &&
    errorLog(
        "you have to provide a file with the model data to create a new model (see mc oe-deploy-workflow --help for more details)",
        true
    );

    options.mode === "instantiate" &&
    !options.file &&
    errorLog(
        "you have to provide a file with the instance data to create a new deployment workflow (see mc oe-deploy-workflow --help for more details)",
        true
    );

    options.mode === "info" &&
    (!options.id) && (!options.key) &&
    errorLog("you have to provide the id of the workflow instance or the key of the worflow moel (see mc oe-deploy-workflow --help for more details)", true);

    options.mode === "delete" &&
    !options.key &&
    errorLog(
        "you have to provide the key of the workflow model to delete it (see mc oe-deploy-workflow --help for more details)",
        true
    );
    options.mode === "cancel" &&
    !options.id &&
    errorLog(
        "you have to provide the id of the workflow instance to cancel it (see mc oe-deploy-workflow --help for more details)",
        true
    );

    options.mode === "update" &&
    !options.id &&
    errorLog(
        "you have to provide the id of the workflow instance to update it (see mc oe-deploy-workflow --help for more details)",
        true
    );
}

async function listInstances(sdk: MindSphereSdk, options: any) {
    const workflowDeploymentClient = sdk.GetDeploymentWorkflowClient();

    // Parse all options
    const model = (options.model) ? true : false;
    const history = (options.history) ? true : false;
    const currentstate = options.currentstate;
    const group = options.group;
    const deviceid = options.deviceid;
    const modelKey = options.key;

    let page = 0;
    let instanceCount = 0;
    let instancePage;
    let rslt_table: any[] = [];
    do {
        instancePage = (await retry(options.retry, () =>
            workflowDeploymentClient.GetWorkflowInstances(
                model,
                history,
                currentstate,
                group,
                deviceid,
                modelKey
            )
        )) as DeploymentWorkflowModels.PaginatedInstanceList;

        instancePage.content = instancePage.content || [];
        instancePage.page = instancePage.page || { totalPages: 0 };
        rslt_table = rslt_table.concat((instancePage.content || []).map(inst => {
            return model ? {
                id: inst.id,
                deviceId: inst.deviceId,
                createdAt: inst.createdAt,
                currentState: inst.currentState?.state,
                modelKey: inst.model?.key,

            } : {
                id: inst.id,
                deviceId: inst.deviceId,
                createdAt: inst.createdAt,
                currentState: inst.currentState?.state,
            };
        }));
        for (const inst of instancePage.content || []) {
            instanceCount++;
            verboseLog(JSON.stringify(inst, null, 2), options.verbose);
        }
    } while (page++ < (instancePage.page.totalPages || 0));

    // Print out the table
    console.table(rslt_table);
    console.log(`${color(instanceCount)} worflow instance(s) listed.\n`);
}
async function createTemplateWorkflowModel(options: any, sdk: MindSphereSdk) {
    const tenant = sdk.GetTenant();
    const _tempalate = {
        "key": "com.siemens.nano.fwupdate",
        "states": [
            {
                "name": "string",
                "description": "string",
                "initial": true,
                "final": true,
                "cancel": true
            }
        ],
        "transitions": [
            {
                "from": "string",
                "to": "string",
                "type": "INSTANTANEOUS",
                "allowedTypes": [
                    "INSTANTANEOUS"
                ]
            }
        ],
        "groups": [
            {
                "name": "string",
                "states": [
                    "string"
                ]
            }
        ]
    };
    verboseLog(_tempalate, options.verbose);
    writeWFModelTemplateToFile(options, _tempalate);
}
function writeWFModelTemplateToFile(options: any, templateType: any) {
    const fileName = options.file || `edge.workflow.model.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
    !options.overwrite &&
    throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(templateType, null, 2));
    console.log(
        `The deployment workflow template was written into ${color(
            filePath
        )} run \n\n\tmc oe-deploy-workflow --mode create --file ${fileName} \n\nto create a new workflow model.\n`
    );
}
async function createTemplateWorkflowInstance(options: any, sdk: MindSphereSdk) {
    const tenant = sdk.GetTenant();
    const templateType = {
        "deviceId": "string",
        "model": {
            "key": "string",
            "customTransitions": [
                {
                    "from": "string",
                    "to": "string",
                    "type": "INSTANTANEOUS",
                    "details": {
                        "userDefined": {}
                    }
                }
            ]
        },
        "data": {
            "userDefined": {}
        }
    };
    verboseLog(templateType, options.verbose);
    writeWFInstTemplateToFile(options, templateType);
}
function writeWFInstTemplateToFile(options: any, templateType: any) {
    const fileName = options.file || `edge.workflow.instance.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
    !options.overwrite &&
    throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(templateType, null, 2));
    console.log(
        `The workflow instance template was written into ${color(
            filePath
        )} run \n\n\tmc oe-deploy-workflow --mode instantiate --file ${fileName} \n\nto create a workflow instance\n`
    );
}
async function createTemplateWorkflowStatus(options: any, sdk: MindSphereSdk) {
    const tenant = sdk.GetTenant();
    const _tempalate = {
        "progress": 0,
        "message": "string",
        "details": {
            "userDefined": {}
        },
        "state": "DOWNLOAD"
    };
    verboseLog(_tempalate, options.verbose);
    writeWFStatusTemplateToFile(options, _tempalate);
}
function writeWFStatusTemplateToFile(options: any, templateType: any) {
    const fileName = options.file || `edge.workflow.status.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
    !options.overwrite &&
    throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(templateType, null, 2));
    console.log(
        `The workflow status template was written into ${color(
            filePath
        )} run \n\n\tmc oe-deploy-workflow --mode update --id <id> --file ${fileName} \n\nto update a workflow instance.\n`
    );
}
async function workflowDeploymentInstInfo(options: any, sdk: MindSphereSdk) {
    let info = null;
    if (options.id) {
        const id = (options.id! as string) ? options.id : `${options.id}`;
        info = (await retry(options.retry, () =>
            sdk.GetDeploymentWorkflowClient().GetWorkflowInstance(id, options.model, options.history)
        )) as DeploymentWorkflowModels.Instance;
    } else if (options.key) {
        const key = (options.key! as string) ? options.key : `${options.key}`;
        info = (await retry(options.retry, () =>
            sdk.GetDeploymentWorkflowClient().GetWorkflowModel(key)
        )) as DeploymentWorkflowModels.Instance;
    }

    printObjectInfo(
        "Workflow Instance/Model Info",
        (info as any),
        options,
        ["deviceId", "appId", "appReleaseId", "appInstanceId", "configuration"],
        color
    );
}
async function deleteWorflowModel(options: any, sdk: MindSphereSdk) {
    const key = (options.key! as string) ? options.key : `${options.key}`;
    await sdk.GetDeploymentWorkflowClient().DeleteWorkflowModel(key);
    console.log(`Deployment workflow model with the key ${color(key)} deleted.`);
}
async function cancelWorflowInstance(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string) ? options.id : `${options.id}`;
    await sdk.GetDeploymentWorkflowClient().PostToCancelWorkflowInstance(id);
    console.log(`Deployment workflow instance with the id ${color(id)} canceled.`);
}
async function updateWorkflowInstanceStatus(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const data = JSON.parse(file.toString());

    const id = (options.id! as string) ? options.id : `${options.id}`;
    await sdk.GetDeploymentWorkflowClient().PatchWorkflowInstance(id, data, options.model, options.history);
    console.log(`updated the status of the deployment model instance ${color(id)} as specified in ${color(filePath)}`);
}
async function createWorkflowInstance(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const data = JSON.parse(file.toString());

    const deviceId = (data.deviceId! as string) ? data.deviceId : `${data.deviceId}`;
    const inst = await sdk.GetDeploymentWorkflowClient().PostNewWorflowInstance(data, options.model, options.history);
    console.log(`created a new deployment model instance on the device ${color(inst.deviceId)} as specified by the file ${color(filePath)}`);
}
async function createWorkflowModel(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const data = JSON.parse(file.toString());

    const inst = await sdk.GetDeploymentWorkflowClient().PostNewWorkflowModel(data);
    console.log(`created a new deployment model as specified by the file ${color(filePath)}`);
}
