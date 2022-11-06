import { Command } from "commander";
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

export default (program: Command) => {
    program
        .command("oe-devices")
        .alias("oed")
        .option("-m, --mode [list|create|delete|template|info]", "list | create | delete | template | info", "list")
        .option("-f, --file <file>", ".mdsp.json file with device definition")
        .option("-n, --devicename <devicename>", "device name")
        .option("-a, --assetid <assetid>", "the id of the asset linked to the device")
        .option("-t, --typeid <typeid>", "the device type id")
        .option("-d, --desc <desc>", "description", "created with mindsphere CLI")
        .option("-s, --serialnumber <serialnumber>", "the id of the asset linked to the device")
        .option("-i, --id <id>", "the device id")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete (open edge) devices *"))
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
                            await listDevices(sdk, options);
                            break;

                        case "template":
                            await createTemplate(options, sdk);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "delete":
                            await deleteDevice(options, sdk);
                            break;

                        case "create":
                            await createDevice(options, sdk);
                            break;

                        case "info":
                            await deviceInfo(options, sdk);
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
            log(`    mdsp oe-devices --mode list --assetid <assetid>\tlist all devices linked to the asset`);
            log(`    mdsp oe-devices --mode info --id <deviceid>\t\tget device details`);
            log(`    mdsp oe-devices --mode template \t\t\tcreate a template file for a new device`);
            log(`    mdsp oe-devices --mode delete --id <devieceid>\tdelete the device with the specified id`);
            log(
                `    mdsp oe-devices --mode create --file openedge.device.mdsp.json \n \
                            create new device using the file openedge.device.mdsp.json`
            );

            serviceCredentialLog();
        });
};

async function createDevice(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const deviceType = JSON.parse(file.toString());

    const name = deviceType.name!.includes(".") ? deviceType.name : `${sdk.GetTenant()}.${deviceType.name}`;
    const device = await sdk.GetDeviceManagementClient().PostDevice(deviceType);
    printObjectInfo("Device:", device, options, ["id"], color);
    console.log(`created device ${color(name)}`);
}

async function createTemplate(options: any, sdk: MindSphereSdk) {
    const tenant = sdk.GetTenant();
    const template = {
        name: `${tenant}.${options.devicename || "<devicename>"}`,
        description: options.desc,
        deviceTypeId: options.typeid || `12345...`,
        serialNumber: options.serialnumber || `7d018c...`,
        assetId: options.assetid || `7d018c...`,
        agents: [],
        properties: {
            key1: "value1",
            key2: "value2",
        },
    };
    verboseLog(template, options.verbose);
    writeDeviceTypeToFile(options, template);
}

function writeDeviceTypeToFile(options: any, templateType: any) {
    const fileName = options.file || `openedge.device.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(templateType, null, 2));
    console.log(
        `The data was written into ${color(
            filePath
        )} run \n\n\tmdsp oe-devices --mode create --file ${fileName} \n\nto create the device`
    );
}

async function deleteDevice(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string) ? options.id : `${options.id}`;
    await sdk.GetDeviceManagementClient().DeleteDevice(id);
    console.log(`Device with id ${color(id)} deleted.`);
}

async function listDevices(sdk: MindSphereSdk, options: any) {
    const deviceMgmt = sdk.GetDeviceManagementClient();

    let page = 0;
    console.log(`id \ttype \tserialNumber \tassetId \tagent(s) \tcreatedAt`);

    let deviceCount = 0;
    let devices;
    do {
        const filter: any = {
            page: page,
            size: 100,
            sort: "id,asc",
        };
        devices = (await retry(options.retry, () =>
            deviceMgmt.GetDevices(filter)
        )) as DeviceManagementModels.PaginatedDevice;

        devices.content = devices.content || [];
        devices.page = devices.page || { totalPages: 0 };

        for (const device of devices.content || []) {
            deviceCount++;
            console.log(
                `${color(device.id)}\t${device.deviceTypeId}\t${device.serialNumber}\t${device.assetId}\t${
                    device.agents?.length
                }\t${device.createdAt}`
            );
            verboseLog(JSON.stringify(device, null, 2), options.verbose);
        }
    } while (page++ < (devices.page.totalPages || 0));

    console.log(`${color(deviceCount)} device(s) listed.\n`);
}

async function deviceInfo(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string).includes(".") ? options.id : `${options.id}`;
    const device = await sdk.GetDeviceManagementClient().GetDevice(id);
    printObjectInfo("Device:", device, options, ["id"], color);
}

function checkRequiredParameters(options: any) {
    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with device type to create device type (see mdsp oe-devices --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.id &&
        errorLog(
            "you have to provide the id of the device type to delete (see mdsp oe-devices --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.id &&
        errorLog("you have to provide the id of the device type (see mdsp oe-devices --help for more details)", true);
}
