import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { retry } from "../..";
import { MindSphereSdk } from "../../api/sdk";
import { DeviceManagementModels } from "../../api/sdk";
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

export default (program: CommanderStatic) => {
    program
        .command("devices")
        .alias("dv")
        .option("-m, --mode [list|create|delete|template | info]", "list | create | delete | template | info", "list")
        .option("-f, --file <file>", ".mdsp.json file with device definition")
        .option("-n, --devicename <devicename>", "device name")
        .option("-a, --assetid <assetid>", "the id of the asset linked to the device")
        .option("-t, --typeid <typeid>", "the device type id")
        .option("-d, --desc <desc>", "description", "created with mindsphere CLI")
        .option("-s, --serianumber <serianumber>", "the id of the asset linked to the device")
        .option("-i, --id <id>", "the device id")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete device types *"))
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
            log(`    mc devices --mode list --assetid 12345...\t\tlist all devices linked to the asset with the id \"12345...\"`);
            log(`    mc devices --mode info --id 7ed34q...\t\tget details of device with the id \"7ed34q...\"`);
            log(
                `    mc devices --mode template --devicename Pump01\tcreate a template file (Pump01.id.mdsp.json) for a new device with the name \"Pump01\"`
            );
            log(
                `    mc devices --mode create --file Pump01.id.mdsp.json \n\tcreate device Pump in MindSphere using the file Pump01.id.mdsp.json`
            );
            log(`    mc devices --mode delete --id 7ed34q...\t\tdelete the device with the id \"7ed34q...\"`);
            serviceCredentialLog();
        });
};

async function createDevice(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const deviceType = JSON.parse(file.toString());

    const name = deviceType.name!.includes(".") ? deviceType.name : `${sdk.GetTenant()}.${deviceType.name}`;
    await sdk.GetDeviceManagementClient().PostDevice(deviceType);
    console.log(`created device ${color(name)}`);
}

async function createTemplate(options: any, sdk: MindSphereSdk) {
    const tenant = sdk.GetTenant();
    const template = {
        name: `${tenant}.${options.devicename}`,
        description: options.desc,
        deviceTypeId: options.typeid || `12345...`,
        serialNumber: options.serianumber || `Dummy7d018c...`,
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
    const fileName = options.file || `${options.devicename}.id.mdsp.json`;
    fs.writeFileSync(fileName, JSON.stringify(templateType, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc devices --mode create --file ${fileName} \n\nto create the device`
    );
}

async function deleteDevice(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string) ? options.id : `${options.id}`;
    const device = await sdk.GetDeviceManagementClient().GetDevice(id);
    await sdk.GetDeviceManagementClient().DeleteDeviceType(id);
    console.log(`Device with id ${color(id)} deleted.`);
}

async function listDevices(sdk: MindSphereSdk, options: any) {
    const deviceMgmt = sdk.GetDeviceManagementClient();

    let page = 0;
    console.log(`id \ttype \tserialNumber \tassetId \tagent(s) \tcreatedAt`);

    let deviceCount = 0;
    let devices;
    do {
        const filter = {
            assetId: options.assetid,
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
                `${color(
                    device.id
                )}\t${device.deviceTypeId}\t${device.serialNumber}\t${device.assetId}\t${device.agents?.length}\t${device.createdAt}`
            );
            verboseLog(JSON.stringify(device, null, 2), options.verbose);
        }
    } while (page++ < (devices.page.totalPages || 0));

    console.log(`${color(deviceCount)} device(s) listed.\n`);
}

async function deviceInfo(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string).includes(".")
        ? options.id
        : `${options.id}`;
    const device = await sdk.GetDeviceManagementClient().GetDevice(id);
    console.log(JSON.stringify(device, null, 2));
}

function checkRequiredParameters(options: any) {
    options.mode === "list" &&
    !options.assetid &&
    errorLog(
        "you have to provide the asset id to list the devices linked to it (see mc devices --help for more details)",
        true
    );

    options.mode === "template" &&
    !options.devicename &&
    errorLog(
        "you have to provide device type to create a template (see mc devices --help for more details)",
        true
    );

    options.mode === "create" &&
    !options.file &&
    errorLog(
        "you have to provide a file with device type to create device type (see mc devices --help for more details)",
        true
    );

    options.mode === "delete" &&
    !options.id &&
    errorLog(
        "you have to provide the id of the device type to delete (see mc devices --help for more details)",
        true
    );

    options.mode === "info" &&
    !options.id &&
    errorLog(
        "you have to provide the id of the device type (see mc devices --help for more details)",
        true
    );
}
