import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { retry } from "../..";
import { DeviceManagementModels, MindSphereSdk } from "../../api/sdk";
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
        .command("oe-device-status")
        .alias("oedt")
        .option("-m, --mode [list|create|delete|template|info]", "list | create | delete | template | info", "list")
        .option("-f, --file <file>", ".mdsp.json file with device type definition")
        .option("-t, --tenant <tenant>", "tenant tenant of the device type definition")
        .option("-n, --devicetype <devicetype>", "the device type name")
        .option("-c, --code <code>", "device type code")
        .option("-a, --assettype <assettype>", "the device type associated asset type id")
        .option("-i, --id <id>", "the device type id")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete device types (open edge) *"))
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
                            await listDeviceTypes(sdk, options);
                            break;

                        case "template":
                            await createTemplate(options, sdk);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "delete":
                            await deleteDeviceType(options, sdk);
                            break;

                        case "create":
                            await createDeviceType(options, sdk);
                            break;

                        case "info":
                            await deviceTypeInfo(options, sdk);
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
            log(`    mc oe-device-status --mode list \t\t\t list all device types`);
            log(
                `    mc oe-device-status --mode list --tenant siemens\t list all device types which belongs to the tenant \"siemens\"`
            );
            log(`    mc oe-device-status --mode info --id <deviceid>\t get details of device type with the specified device id`);
            log(
                `    mc oe-device-status --mode template --devicetype board \n\tcreate a template file for specified device type`
            );
            log(
                `    mc oe-device-status --mode create --file board.devicetype.mdsp.json \n\tcreate device type board in MindSphere`
            );
            log(`    mc oe-device-status --mode delete --id <devicetype>\t delete the device type with the device id`);
            serviceCredentialLog();
        });
};

async function createDeviceType(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const deviceType = JSON.parse(file.toString());

    const name = deviceType.name!.includes(".") ? deviceType.name : `${sdk.GetTenant()}.${deviceType.name}`;
    await sdk.GetDeviceManagementClient().PostDeviceType(deviceType);
    console.log(`created device type ${color(name)}`);
}

async function createTemplate(options: any, sdk: MindSphereSdk) {
    const tenant = sdk.GetTenant();
    const templateType = {
        name: `${tenant}.${options.devicetype || "<devicetype>"}`,
        description: "created by mindsphere CLI",
        owner: `${sdk.GetTenant()}`,
        code: options.code || `${tenant}.${options.devicetype || "<devicetype>"}`,
        assetTypeId: options.assettype || "<your assetid>",
        properties: {
            key1: "value1",
            key2: "value2",
        },
    };
    verboseLog(templateType, options.verbose);
    writeDeviceTypeToFile(options, templateType);
}

function writeDeviceTypeToFile(options: any, templateType: any) {
    const fileName = options.file || `openedge.devicetype.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(templateType, null, 2));
    console.log(
        `The data was written into ${color(
            filePath
        )} run \n\n\tmc oe-device-status --mode create --file ${fileName} \n\nto create the device type`
    );
}

async function deleteDeviceType(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string) ? options.id : `${options.id}`;
    // !important! this will not work (no support in mindsphere)
    // !but we are leaving it here for future
    await sdk.GetDeviceManagementClient().DeleteDeviceType(id);
    console.log(`Device type with id ${color(id)} deleted.`);
}

async function listDeviceTypes(sdk: MindSphereSdk, options: any) {
    const deviceMgmt = sdk.GetDeviceManagementClient();

    let page = 0;
    console.log(`id \towner \tcode \tassetTypeId \tname \tcreatedAt`);

    let deviceCount = 0;
    let deviceTypes;
    do {
        const filter = {
            page: page,
            size: 100,
            sort: "id,asc",
            owner: options.tenant,
            code: options.code,
            assetTypeId: options.assettype,
        };
        deviceTypes = (await retry(options.retry, () =>
            deviceMgmt.GetDeviceTypes(filter)
        )) as DeviceManagementModels.PaginatedDeviceType;

        deviceTypes.content = deviceTypes.content || [];
        deviceTypes.page = deviceTypes.page || { totalPages: 0 };

        for (const id of deviceTypes.content || []) {
            deviceCount++;
            console.log(
                `${color(id.id)}\t${id.owner}\t${id.code}\t${id.assetTypeId}\t${color(id.name)}\t${id.createdAt}`
            );
            verboseLog(JSON.stringify(id, null, 2), options.verbose);
        }
    } while (page++ < (deviceTypes.page.totalPages || 0));

    console.log(`${color(deviceCount)} device type(s) listed.\n`);
}

async function deviceTypeInfo(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string).includes(".") ? options.id : `${options.id}`;
    const deviceType = await sdk.GetDeviceManagementClient().GetDeviceType(id);
    printObjectInfo("Device Type", deviceType, options, ["id", "code", "name", "status"], color);
}

function checkRequiredParameters(options: any) {
    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with device type to create device type (see mc oe-device-status --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.id &&
        errorLog(
            "you have to provide the id of the device type to delete (see mc oe-device-status --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.id &&
        errorLog("you have to provide the id of the device type (see mc oe-device-status --help for more details)", true);
}
