import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { DeviceStatusModels, retry } from "../..";
import { DeviceManagementModels, MindSphereSdk } from "../../api/sdk";
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
        .command("device-status")
        .alias("ds")
        .option("-m, --mode [list|info|update|template]", "list | info | update | template", "list")
        .option("-i, --deviceid <deviceid>", "the device id")
        .option(
            "-t, --target [health|health-config-data|inventory|connection-status]",
            "type of status information to retrieve or to update. [ health | health-config-data | inventory | connection-status]",
            "health"
        )
        .option("-w, --softwaretype [APP|FIRMWARE]", "software type [ APP | FIRMWARE ]")
        .option("-s, --softwareid <softwareid>", "software id")
        .option("-f, --file <file>", ".mdsp.json file with update information definition")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, get, or update (open edge) device status information *"))
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
                            await listSoftware(sdk, options);
                            break;

                        case "template":
                            await createTemplate(options, sdk);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;

                        case "update":
                            await createDeviceStatusInfo(options, sdk);
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
            log(
                `    mc device-status --mode list --deviceid 12345...\t\t\t\t\tlist all installed software on the device with the id \"12345...\"`
            );
            log(
                `    mc device-status --mode list --deviceid 12345... --softwaretype APP \t\tlist all software (firmware, apps, etc) installed on the device of type \"APP\" on the device with the id \"12345...\"`
            );
            log(
                `    mc device-status --mode info --target health --deviceid 7ed34q...\t\t\tget the health status information of the device with the id \"7ed34q...\"`
            );
            log(
                `    mc device-status --mode info --target health-config-data --deviceid 7ed34q...\tget the health config data of the device with the id \"7ed34q...\"`
            );
            log(
                `    mc device-status --mode info --target inventory --deviceid 7ed34q...\t\tget the software inventory of the device with the id \"7ed34q...\"`
            );
            log(
                `    mc device-status --mode info --target connection-status --deviceid 7ed34q...\tget the connection status the device with the id \"7ed34q...\"`
            );
            log(
                `    mc device-status --mode template --target inventory \t\t\t\tcreate a template file (inventory.id.mdsp.json) for the software inventory of a device`
            );
            log(
                `    mc device-status --mode update --target inventory --file inventory.id.mdsp.json --deviceid 7ed34q...\n\tpath the software inventory of the device with the device id \"7ed34q...\" using the file inventory.id.mdsp.json`
            );
            log(
                `    mc device-status --mode update --target connection-status --deviceid 7ed34q...\tsend a heatbeat to the device with the device id \"7ed34q...\"`
            );
            serviceCredentialLog();
        });
};

async function createDeviceStatusInfo(options: any, sdk: MindSphereSdk) {
    if (!options.file && options.target === "connection-status") {
        await sdk.GetDeviceStatusManagementClient().PostDeviceHeartbeat(options.deviceid);
        console.log(`connection-status is updated.`);
        return;
    }

    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const statusReport = JSON.parse(file.toString());

    switch (options.target) {
        case "health":
            await sdk.GetDeviceStatusManagementClient().PatchDeviceHealth(options.deviceid, statusReport);
            console.log(`patched device heath status`);
            break;
        case "health-config-data":
            await sdk.GetDeviceStatusManagementClient().PatchDeviceHealthDataConfig(options.deviceid, statusReport);
            console.log(`patched device heath config data`);
            break;
        case "inventory":
            if (options.softwaretype && options.softwaretype === "APP") {
                await sdk
                    .GetDeviceStatusManagementClient()
                    .PatchDeviceApplicationInventory(options.deviceid, statusReport);
                console.log(`patched device application inventory`);
                break;
            } else if (options.softwaretype && options.softwaretype === "FIRMWARE") {
                await sdk
                    .GetDeviceStatusManagementClient()
                    .PatchDeviceFirmwareInventory(options.deviceid, statusReport);
                console.log(`patched device application inventory`);
            } else {
                await sdk
                    .GetDeviceStatusManagementClient()
                    .PatchDeviceSoftwareInventory(options.deviceid, statusReport);
                console.log(`patched device application inventory`);
            }
            break;
        default:
            break;
    }
}

async function createTemplate(options: any, sdk: MindSphereSdk) {
    const now = new Date();
    let template = {};
    switch (options.target) {
        case "health":
            template = {
                overall: {
                    lastUpdate: now,
                    health: DeviceStatusModels.HealthStatus.OK,
                    message: "Reporting overall health status.",
                },
            };
            break;
        case "health-config-data":
            template = {
                lastUpdate: now,
                configurationId: "5re520...",
                dataSources: [],
            };
            break;
        case "inventory":
            const _template = [
                {
                    softwareId: "a7d6da...",
                    version: "1.3",
                    type: DeviceStatusModels.SoftwareType.FIRMWARE,
                    description: "MyDevice Firmware 1.3 debug build",
                    installedAt: now,
                },
                {
                    softwareId: "a7d6da...",
                    version: "1.5",
                    type: DeviceStatusModels.SoftwareType.APP,
                    description: "MyDevice Edge Application 1.5 debug build",
                    installedAt: now,
                },
            ];
            if (options.softwaretype && options.softwaretype === "APP") {
                _template.slice(0, 0);
            }
            if (options.softwaretype && options.softwaretype === "FIRMWARE") {
                _template.slice(1, 1);
            }
            template = _template;
            break;
        case "connection-status":
            errorLog(
                `option --target ${options.target} is not supported for the mode template (see mc device-status --help for more details)`,
                true
            );
            break;
        default:
            break;
    }
    verboseLog(template, options.verbose);
    writeDeviceTypeToFile(options, template);
}

function writeDeviceTypeToFile(options: any, templateType: any) {
    const fileName = options.file || `${options.target}.id.mdsp.json`;
    fs.writeFileSync(fileName, JSON.stringify(templateType, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc device-status --mode update --deviceid 12345... --target ${options.target} ${
            options.softwaretype ? "--softwaretype " + options.softwaretype : ""
        } --file ${fileName} \n\nto update the device status`
    );
}

async function listSoftware(sdk: MindSphereSdk, options: any) {
    const deviceStatusMgmt = sdk.GetDeviceStatusManagementClient();

    let page = 0;
    console.log(`id \tdeviceId \tsoftwareType \tsoftwareId \tsoftwareReleaseId \tversion \tinstalledAt \tinstalledBy`);

    let softwareCount = 0;
    let installedSoftware;
    do {
        installedSoftware = (await retry(options.retry, () =>
            deviceStatusMgmt.GetDeviceSoftwares(options.deviceid, options.softwaretype, options.softwareid, page, 100)
        )) as DeviceManagementModels.PaginatedDevice;

        installedSoftware.content = installedSoftware.content || [];
        installedSoftware.page = installedSoftware.page || { totalPages: 0 };

        for (const _software of installedSoftware.content || []) {
            const software = _software as DeviceStatusModels.SoftwareInventoryRecord;
            softwareCount++;
            console.log(
                `${color(software.id)}\t${software.deviceId}\t${software.softwareType}\t${software.softwareId}\t${
                    software.softwareReleaseId
                }\t${software.version}\t${software.installedAt}\t${software.installedBy}`
            );
            verboseLog(JSON.stringify(_software, null, 2), options.verbose);
        }
    } while (page++ < (installedSoftware.page.totalPages || 0));

    console.log(`${color(softwareCount)} software(s) listed.\n`);
}

async function deviceInfo(options: any, sdk: MindSphereSdk) {
    const deviceid = (options.deviceid! as string).includes(".") ? options.deviceid : `${options.deviceid}`;
    switch (options.target) {
        case "health":
            const health = await sdk.GetDeviceStatusManagementClient().GetDeviceHealth(deviceid);
            console.log(JSON.stringify(health, null, 2));
            break;
        case "health-config-data":
            const healthConfigData = await sdk.GetDeviceStatusManagementClient().GetDeviceHealthDataConfig(deviceid);
            console.log(JSON.stringify(healthConfigData, null, 2));
            break;
        case "inventory":
            const deviceInventory = await sdk.GetDeviceStatusManagementClient().GetDeviceInventory(deviceid);
            console.log(JSON.stringify(deviceInventory, null, 2));
            break;
        case "connection-status":
            const connectionStatus = await sdk.GetDeviceStatusManagementClient().GetDeviceConnectionStatus(deviceid);
            console.log(JSON.stringify(connectionStatus, null, 2));
            break;
        default:
            break;
    }
}

function checkRequiredParameters(options: any) {
    options.mode !== "template" &&
        !options.deviceid &&
        errorLog(
            "you have to provide the deviceid to get or update the device status information (see mc device-status --help for more details)",
            true
        );

    options.mode === "template" &&
        !options.target &&
        errorLog(
            "you have to provide the status information type to create the corresponding template (see mc device-status --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.target &&
        errorLog(
            "you have to provide the type of information you want to retrieve (see mc device-status --help for more details)",
            true
        );
}
