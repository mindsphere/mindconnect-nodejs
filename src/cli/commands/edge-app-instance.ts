import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { retry } from "../..";
import { EdgeAppInstanceModels, MindSphereSdk } from "../../api/sdk";
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
        .command("edge-app-inst")
        .alias("eai")
        .option("-m, --mode [list|create|config|delete|template|info]", "list | create | config | delete | template | info", "list")
        .option("-i, --id <id>", "the app instance id")
        .option("-d, --deviceid <id>", "the device id")
        .option("-f, --file <file>", ".mdsp.json file with app inst data")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create, configure or delete app instance (open edge) *"))
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
                            await listApps(sdk, options);
                            break;

                        case "template":
                            await createTemplateApp(options, sdk);
                            await createTemplateAppConfig(options, sdk);
                            console.log("Edit the file(s) before submitting it to MindSphere.");
                            break;
                        case "delete":
                            await deleteAppInst(options, sdk);
                            break;

                        case "create":
                            await createAppInstance(options, sdk);
                            break;

                        case "config":
                            await createAppInstance(options, sdk);
                            break;

                        case "info":
                            await appInstanceInfo(options, sdk);
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
            log(`    mc edge-app-inst --mode list --deviceid <deviceid> \t\tlist all app instances of device with deviceId.`);
            log(
                `    mc edge-app-inst --mode template \t\t\t\tcreate a template file for new app instance data.`
            );
            log(
                `    mc edge-app-inst --mode create --file edge.app.mdsp.json \tcreates a new app instance from template file.`
            );
            log(
                `    mc edge-app-inst --mode config --id <appinstid> --file edge.appconfig.mdsp.json \n\tconfigure an app instance from template file.`
            );
            log(`    mc edge-app-inst --mode info --id <appinstid>\t\tget details of an app instance.`);
            log(`    mc edge-app-inst --mode delete --id <appinstid>\t\tdelete app instance configuration.`);

            serviceCredentialLog();
        });
};

async function createAppInstance(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const data = JSON.parse(file.toString());

    const name = data.deviceId ? data.deviceId : `${sdk.GetTenant()}.${data.appInstanceId}`;
    await sdk.GetEdgeAppInstanceManagementClient().PostAppInstance(data);
    console.log(`created new app instance for deviceid ${color(name)}`);
}

async function createAppInstanceConfiguration(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const config = JSON.parse(file.toString());

    const name = config.deviceId ? config.deviceId : `${sdk.GetTenant()}.${config.appInstanceId}`;
    await sdk.GetEdgeAppInstanceManagementClient().PostAppInstanceConfigurations(config);
    console.log(`created new configuration for deviceid ${color(name)}`);
}

async function createTemplateApp(options: any, sdk: MindSphereSdk) {
    const tenant = sdk.GetTenant();
    const _tempalate = {
        name: `${tenant}.myAppName`,
        appInstanceId: "718ca5ad0...",
        deviceId: "718ca5ad0...",
        releaseId: "718ca5ad0...",
        applicationId: "718ca5ad0..."
    };
    verboseLog(_tempalate, options.verbose);
    writeAppTemplateToFile(options, _tempalate);
}

async function createTemplateAppConfig(options: any, sdk: MindSphereSdk) {
    const tenant = sdk.GetTenant();
    const templateType = {
        deviceId: "718ca5ad0...",
        appId: "718ca5ad0...",
        appReleaseId: "718ca5ad0...",
        appInstanceId: "718ca5ad0...",
        configuration: {
            sampleKey1: "sampleValue1",
            sampleKey2: "sampleValue2"
        }
    };
    verboseLog(templateType, options.verbose);
    writeAppInstConfigToFile(options, templateType);
}

function writeAppTemplateToFile(options: any, templateType: any) {
    const fileName = options.file || `edge.app.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
    !options.overwrite &&
    throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(templateType, null, 2));
    console.log(
        `The app data template was written into ${color(
            filePath
        )} run \n\n\tmc edge-app-inst --mode create --file ${fileName} \n\nto create a new app instance.\n`
    );
}

function writeAppInstConfigToFile(options: any, templateType: any) {
    const fileName = options.file || `edge.appconfig.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
    !options.overwrite &&
    throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(templateType, null, 2));
    console.log(
        `The app config template was written into ${color(
            filePath
        )} run \n\n\tmc edge-app-inst --mode config --id <appinstid> --file ${fileName} \n\nto create a new app inst. configuration\n`
    );
}

async function configureAppInstance(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string) ? options.id : `${options.id}`;

    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const data = JSON.parse(file.toString());

    await sdk.GetEdgeAppInstanceManagementClient().PatchAppInstanceConfigurationData(id, data);
    console.log(`configured app instance with id ${color(id)}`);
}

async function deleteAppInst(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string) ? options.id : `${options.id}`;
    await sdk.GetEdgeAppInstanceManagementClient().DeleteAppInstance(id);
    console.log(`Application instance with id ${color(id)} deleted.`);
}

async function deleteAppInstConfiguration(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string) ? options.id : `${options.id}`;
    await sdk.GetEdgeAppInstanceManagementClient().DeleteAppInstanceConfiguration(id);
    console.log(`Application instance configuration with id ${color(id)} deleted.`);
}

async function listApps(sdk: MindSphereSdk, options: any) {
    const edgeAppInstanceClient = sdk.GetEdgeAppInstanceManagementClient();

    let page = 0;
    console.log(`name \tStatus \tappInstanceId \tdeviceId \treleaseId \tapplicationId \tconfiguration`);

    let appCount = 0;
    let appPage;
    do {
        appPage = (await retry(options.retry, () =>
            edgeAppInstanceClient.GetAppInstances(options.deviceid, 100, page)
        )) as EdgeAppInstanceModels.PaginatedApplicationInstance;

        appPage.content = appPage.content || [];
        appPage.page = appPage.page || { totalPages: 0 };

        for (const app of appPage.content || []) {
            appCount++;
            // read the configuration of these app
            try {
                const config = (await retry(options.retry, () =>
                    edgeAppInstanceClient.GetAppInstanceConfiguration(app.appInstanceId)
                )) as EdgeAppInstanceModels.InstanceConfigurationResource;

                const status = (await retry(options.retry, () =>
                    edgeAppInstanceClient.GetAppInstanceLifecycle(app.appInstanceId)
                )) as EdgeAppInstanceModels.ApplicationInstanceLifeCycleResource;

                console.log(
                    `${color(app.name)} \t${color(status.status)} \t${app.appInstanceId} \t${app.deviceId} \t${app.applicationId} \t${app.releaseId} \t${JSON.stringify(config)}`
                );
                verboseLog(JSON.stringify(app, null, 2), options.verbose);
            } catch (e) {}
        }
    } while (page++ < (appPage.page.totalPages || 0));

    console.log(`${color(appCount)} app instance(s) listed.\n`);
}

async function appInstanceInfo(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string) ? options.id : `${options.id}`;

    const appInstConfig = (await retry(options.retry, () =>
        sdk.GetEdgeAppInstanceManagementClient().GetAppInstanceConfiguration(id)
    )) as EdgeAppInstanceModels.InstanceConfigurationResource;

    printObjectInfo(
        "App Instance Configuration",
        appInstConfig,
        options,
        ["deviceId", "appId", "appReleaseId", "appInstanceId", "configuration"],
        color
    );
}

async function appInstanceConfigInfo(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string) ? options.id : `${options.id}`;
    const appInstConfig = await sdk.GetEdgeAppInstanceManagementClient().GetAppInstanceConfiguration(id);
    printObjectInfo(
        "App Instance Configuration",
        appInstConfig,
        options,
        ["deviceId", "appId", "appReleaseId", "appInstanceId", "configuration"],
        color
    );
}

function checkRequiredParameters(options: any) {
    options.mode === "create" &&
    !options.file &&
    errorLog(
        "you have to provide a file with the app data to create a new application instance (see mc edge-app-inst --help for more details)",
        true
    );

    options.mode === "list" &&
    !options.deviceid &&
    errorLog(
        "you have to provide the deviceid of the target device (see mc edge-app-inst --help for more details)",
        true
    );

    options.mode === "info" &&
    !options.id &&
    errorLog("you have to provide the id app instance (see mc edge-app-inst --help for more details)", true);

    options.mode === "delete" &&
    !options.id &&
    errorLog(
        "you have to provide the id of the app instance to delete it (see mc edge-app-inst --help for more details)",
        true
    );

    options.mode === "config" &&
    !options.file &&
    errorLog(
        "you have to provide a file with the config data to configure the application instance (see mc edge-app-inst --help for more details)",
        true
    );

    options.mode === "config" &&
    !options.id &&
    errorLog(
        "you have to provide the id of the app instance to configure (see mc edge-app-inst --help for more details)",
        true
    );
}
