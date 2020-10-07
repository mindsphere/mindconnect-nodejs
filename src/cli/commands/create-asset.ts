import { CommanderStatic } from "commander";
import { log } from "console";
import { AssetManagementModels } from "../../api/sdk";
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

let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("create-asset")
        .alias("cs")
        .option("-n, --assetname <assetname>", "assetname")
        .option("-p, --parentid <parentid>", "parentid")
        .option("-t, --typeid <typeid>", "typeid")
        .option("-d, --description <description>", "description", "created with mindsphere CLI")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`create asset with id <assetid> from mindsphere *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const assetMgmt = sdk.GetAssetManagementClient();
                    const asset = await retry(options.retry, () => assetMgmt.GetAsset(options.assetid));
                    verboseLog(JSON.stringify(asset, null, 2), options.verbose);

                    const result = (await retry(options.retry, async () =>
                        assetMgmt.PostAsset({
                            name: options.assetname,
                            parentId: options.parentid || (await assetMgmt.GetRootAsset()).assetId!,
                            typeId: options.typeid,
                        })
                    )) as AssetManagementModels.AssetResourceWithHierarchyPath;

                    console.log(`Asset with assetid ${color(result.assetId)} (${color(result)}) was created.`);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc create-asset --typeid core.area --assetname BasicArea`);
            serviceCredentialLog();
        });
};

function checkRequiredParameters(options: any) {
    !options.assetname || (!options.typeid && errorLog("you have the asset name and typeid", true));
}
