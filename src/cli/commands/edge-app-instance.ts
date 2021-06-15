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
        .option("-m, --mode [list|create|patch|delete|template|info]", "list | create | patch | delete | template | info", "list")
        .option("-i, --id <id>", "the app instance id")
        .option("-d, --deviceid <id>", "the device id")
        .option("-f, --file <file>", ".mdsp.json file with configuration")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete app instance configurations (open edge) *"))
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
                            await listAppConfigurations(sdk, options);
                            break;

                        case "template":
                            await createTemplate(options, sdk);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "delete":
                            await deleteAppInstConfiguration(options, sdk);
                            break;

                        case "create":
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
            log(`    mc edge-app-inst --mode list --deviceid <deviceid> \t\tlist all app instance configurations of device with deviceId`);
            log(
                `    mc edge-app-inst --mode template \t\t\t\tcreate a template file for new app instance configuration`
            );
            log(
                `    mc edge-app-inst --mode create --file device.app.conf.mdsp.json \n\t creates a new instance configuration from template file`
            );
            log(`    mc edge-app-inst --mode info --id <appinstid>\t\tget details of an app inst configuration`);
            log(
                `    mc edge-app-inst --mode patch --id <appinstid> --file device.app.conf.mdsp.json \n\t patch specified instance configuration from template file`
            );
            log(`    mc edge-app-inst --mode delete --id <appinstid>\t\tdelete app instance configuration`);

            serviceCredentialLog();
        });
};

async function createAppInstance(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const config = JSON.parse(file.toString());

    const name = config.deviceId ? config.deviceId : `${sdk.GetTenant()}.${config.appInstanceId}`;
    await sdk.GetEdgeAppInstanceManagementClient().PostAppInstanceConfigurations(config);
    console.log(`created new configuration for deviceid ${color(name)}`);
}

async function createTemplate(options: any, sdk: MindSphereSdk) {
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
    writeDeviceTypeToFile(options, templateType);
}

function writeDeviceTypeToFile(options: any, templateType: any) {
    const fileName = options.file || `openedge.appinstconfig.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
    !options.overwrite &&
    throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(templateType, null, 2));
    console.log(
        `The data was written into ${color(
            filePath
        )} run \n\n\tmc edge-app-inst --mode create --file ${fileName} \n\nto create a new app inst. configuration`
    );
}

async function deleteAppInstConfiguration(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string) ? options.id : `${options.id}`;
    await sdk.GetEdgeAppInstanceManagementClient().DeleteAppInstanceConfiguration(id);
    console.log(`Application instance configuration with id ${color(id)} deleted.`);
}

async function listAppConfigurations(sdk: MindSphereSdk, options: any) {
    const edgeAppInstanceClient = sdk.GetEdgeAppInstanceManagementClient();

    let page = 0;
    console.log(`deviceId \tappId \tappReleaseId \tappInstanceId \tconfiguration`);

    let configCount = 0;
    let configurationPage;
    do {
        configurationPage = (await retry(options.retry, () =>
            edgeAppInstanceClient.GetAppInstanceConfigurations(options.deviceid, 100, page)
        )) as EdgeAppInstanceModels.PaginatedInstanceConfigurationResource;

        configurationPage.content = configurationPage.content || [];
        configurationPage.page = configurationPage.page || { totalPages: 0 };

        for (const conf of configurationPage.content || []) {
            configCount++;
            console.log(
                `${color(conf.deviceId)}\t${conf.appId}\t${conf.appReleaseId}\t${conf.appInstanceId}\t${JSON.stringify(conf.configuration)}`
            );
            verboseLog(JSON.stringify(conf, null, 2), options.verbose);
        }
    } while (page++ < (configurationPage.page.totalPages || 0));

    console.log(`${color(configCount)} configuration(s) listed.\n`);
}

async function appInstanceInfo(options: any, sdk: MindSphereSdk) {
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
        "you have to provide a file with the app configuration to create a new device configuration (see mc edge-app-inst --help for more details)",
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


    options.mode === "patch" &&
    !options.file &&
    errorLog(
        "you have to provide a file with the app configuration to patch the device configuration (see mc edge-app-inst --help for more details)",
        true
    );

    options.mode === "delete" &&
    !options.id &&
    errorLog(
        "you have to provide the id of app configuration to delete it (see mc edge-app-inst --help for more details)",
        true
    );
}
