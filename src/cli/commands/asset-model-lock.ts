import { CommanderStatic } from "commander";
import { log } from "console";
import { AssetManagementModels, MindSphereSdk } from "../../api/sdk";
import { retry } from "../../api/utils";
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

const mime = require("mime-types");

let color = getColor("magenta");
let green = getColor("green");
let red = getColor("red");

export default (program: CommanderStatic) => {
    program
        .command("asset-lock")
        .alias("lck")
        .option("-m, --mode [info|lock|unlock]", "mode [info | lock | unlock]", "info")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`lock/unlock asset model modifications *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const assetManagement = sdk.GetAssetManagementClient();

                    switch (options.mode) {
                        case "info":
                            {
                                const info = (await retry(options.retry, () =>
                                    assetManagement.GetModelLock()
                                )) as AssetManagementModels.AssetModelLock;
                                printStatus(sdk, info, options);
                            }
                            break;
                        case "lock":
                            {
                                const info = (await retry(options.retry, () =>
                                    assetManagement.PutModelLock({ enabled: true })
                                )) as AssetManagementModels.AssetModelLock;
                                printStatus(sdk, info, options);
                            }
                            break;
                        case "unlock":
                            {
                                const info = (await retry(options.retry, () =>
                                    assetManagement.PutModelLock({ enabled: false })
                                )) as AssetManagementModels.AssetModelLock;
                                printStatus(sdk, info, options);
                            }
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
            log(`    mc asset-lock --mode info \t\t\t\t print out the asset model lock state`);
            log(`    mc asset-lock --mode lock \t\t\t\t lock the asset model and disable modifications`);
            log(`    mc asset-lock --mode unlock \t\t\t unlock the asset model and enable modifications`);
            serviceCredentialLog();
        });
};

function printStatus(sdk: MindSphereSdk, info: AssetManagementModels.AssetModelLock, options: any) {
    verboseLog(JSON.stringify(info, null, 2), options.verbose);
    console.log(
        `The asset model for ${color(sdk.GetTenant())} is ${
            info.enabled
                ? red("locked") + ". Modifications are blocked."
                : green("unlocked") + ". Modifications are allowed."
        }`
    );
}

function checkRequiredParameters(options: any) {}
