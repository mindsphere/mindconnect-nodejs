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
        .command("device-types")
        .alias("dt")
        .option("-m, --mode [list|create|delete|template | info]", "list | create | delete | template | info", "list")
        .option("-f, --file <file>", ".mdsp.json file with device type definition")
        .option("-o, --owner <owner>", "owner tenant of the device type definition")
        .option("-c, --code <code>", "device type code")
        .option("-a, --assettype <assettype>", "the device type associated asset type id")
        .option("-s, --schema <schema>", "JSON Schema")
        .option("-i, --id <id>", "the device type id")
        .option("-n, --devicetype <devicetype>", "the asset type name")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete device types *"))
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
                            await listdeviceTypes(sdk, options);
                            break;

                        case "template":
                            await createTemplate(options, sdk);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "delete":
                            await deletedeviceType(options, sdk);
                            break;

                        case "create":
                            await createdeviceType(options, sdk);
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
            log(`    mc device-types --mode list \t\t\t list all device types`);
            log(`    mc device-types --mode list --owner siemens\t\t list all device types which belongs to \"siemens\"`);
            log(`    mc device-types --mode info --id 7ed34q...\t\t get details of device type with the id \"7ed34q...\"`);
            log(
                `    mc device-types --mode template --devicetype Pump \n\tcreate a template file (Enironment.id.mdsp.json) for id Pump`
            );
            log(
                `    mc device-types --mode create --file Pump.id.mdsp.json \n\tcreate device type Pump in MindSphere`
            );
            log(`    mc device-types --mode delete --id 7ed34q...\t delete the device type with the id \"7ed34q...\"`);
            serviceCredentialLog();
        });
};

async function createdeviceType(options: any, sdk: MindSphereSdk) {
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
        name: `${tenant}.${options.devicetype}`,
        description: "",
        owner: `${sdk.GetTenant()}`,
        code: options.code || `${tenant}.${options.devicetype}`,
        assetTypeId: "7ed34q...",
        properties: {
            key1: "value1",
            key2: "value2",
        },
    };
    verboseLog(templateType, options.verbose);
    writedeviceTypeToFile(options, templateType);
}

function writedeviceTypeToFile(options: any, templateType: any) {
    const fileName = options.file || `${options.devicetype}.id.mdsp.json`;
    fs.writeFileSync(fileName, JSON.stringify(templateType, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc device-types --mode create --file ${fileName} \n\nto create the device type`
    );
}

async function deletedeviceType(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string) ? options.id : `${options.id}`;
    const deviceType = await sdk.GetDeviceManagementClient().GetDeviceType(id);
    await sdk.GetDeviceManagementClient().DeleteDeviceType(id);
    console.log(`id with id ${color(id)} deleted.`);
}

async function listdeviceTypes(sdk: MindSphereSdk, options: any) {
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
            owner: options.owner,
            assetTypeId: options.assettype
        };
        deviceTypes = (await retry(options.retry, () =>
            deviceMgmt.GetDeviceTypes(filter)
        )) as DeviceManagementModels.PaginatedDeviceType;

        deviceTypes.content = deviceTypes.content || [];
        deviceTypes.page = deviceTypes.page || { totalPages: 0 };

        for (const id of deviceTypes.content || []) {
            deviceCount++;
            console.log(
                `${color(
                    id.id)
                }\t${id.owner}\t${id.code}\t${id.assetTypeId}\t${color(
                    id.name
                )}\t${id.createdAt}`
            );
            verboseLog(JSON.stringify(id, null, 2), options.verbose);
        }
    } while (page++ < (deviceTypes.page.totalPages || 0));

    console.log(`${color(deviceCount)} device type(s) listed.\n`);
}

async function deviceTypeInfo(options: any, sdk: MindSphereSdk) {
    const id = (options.id! as string).includes(".")
        ? options.id
        : `${options.id}`;
    const deviceType = await sdk.GetDeviceManagementClient().GetDeviceType(id);
    console.log(JSON.stringify(deviceType, null, 2));
}

function checkRequiredParamaters(options: any) {
    options.mode === "template" &&
        !options.devicetype &&
        errorLog(
            "you have to provide device type to create a template (see mc device-types --help for more details)",
            true
        );

    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with device type to create device type (see mc device-types --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.id &&
        errorLog("you have to provide the id of the device type to delete (see mc device-types --help for more details)", true);

    options.mode === "info" &&
        !options.id &&
        errorLog("you have to provide the id of the device type (see mc device-types --help for more details)", true);
}
