import { CommanderStatic } from "commander";
import { log } from "console";
import { deleteAsset } from "./assets";
import { adjustColor, errorLog, getColor, getSdk, homeDirLog, proxyLog, serviceCredentialLog } from "./command-utils";

let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("delete-asset")
        .alias("da")
        .option("-i, --assetid <assetid>", "mindsphere asset id ")
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

                    await deleteAsset(options, sdk);
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
