import { Command } from "commander";
import { log } from "console";
import { IotFileModels } from "../../api/sdk";
import { retry } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    humanFileSize,
    proxyLog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";

let color = getColor("magenta");

export default (program: Command) => {
    program
        .command("list-files")
        .alias("ls")
        .option("-i, --assetid <assetid>", "mindsphere asset id ")
        .option(
            "-f, --filter [filter]",
            `filter (see: ${color(
                "https://developer.mindsphere.io/apis/iot-iotfile/api-iotfile-references-filtering.html"
            )}) `
        )
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`list files stored with the asset *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const iotFile = sdk.GetIoTFileClient();

                    let offset = 0;
                    let files;

                    console.log(`timestamp etag  size  path`);

                    do {
                        files = (await retry(options.retry, () =>
                            iotFile.GetFiles(`${options.assetid}`, {
                                offset: offset,
                                limit: 500,
                                count: true,
                                filter: options.filter,
                            })
                        )) as IotFileModels.File[];
                        for (const file of files) {
                            console.log(
                                `${file.timestamp}  ${file.etag!.toString().padStart(4)}  ${humanFileSize(
                                    file.size || 0
                                ).padStart(10)}\t${file.path || ""}${color(file.name)}`
                            );

                            verboseLog(`${JSON.stringify(file, null, 2)}`, options.verbose);
                        }
                        offset += 500;
                        if (files.length <= 500) break;
                    } while (files && files.length > 0);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mdsp ls --assetid 1234...ef --passkey mypasskey \t\t\t\tlist all files for assetid`);
            log(
                `    mdsp ls --assetid 1234...ef --filter "path=upload*" --passkey mypasskey \tlist all files where path contains upload`
            );
            serviceCredentialLog();
        });
};
function checkRequiredParameters(options: any) {
    !options.assetid && errorLog("You have to provide an assetid.", true);
}
