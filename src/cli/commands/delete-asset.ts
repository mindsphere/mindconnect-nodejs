import { CommanderStatic } from "commander";
import { log } from "console";
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
        .command("delete-asset")
        .alias("da")
        .option("-i, --assetid <assetid>", "asset id from the mindsphere ")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`delete asset with id <assetid> from mindsphere *`))
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

                    await retry(options.retry, () =>
                        assetMgmt.DeleteAsset(options.assetid, {
                            ifMatch: asset?.etag || "0",
                        })
                    );

                    console.log(`Asset with assetid ${color(asset.assetId)} (${color(asset.name)}) was deleted.`);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc delete-asset --assetid 123456...ef \t\tdelete asset with id 132456...ef`);
            serviceCredentialLog();
        });
};

function checkRequiredParameters(options: any) {
    !options.assetid && errorLog("you have to provide a assetid", true);
}
