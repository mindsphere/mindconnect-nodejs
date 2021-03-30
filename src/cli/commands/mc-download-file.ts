import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { checksumFile, retry, throwError } from "../../api/utils";
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
import ora = require("ora");
const streamPipeline = util.promisify(require("stream").pipeline);

let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("download-file")
        .alias("df")
        .option("-f, --file <fileToDownload>", "file to download from the file service")
        .option("-h, --filepath [filepath]", "file path in the mindsphere", "")
        .option("-i, --assetid <assetid>", "mindsphere asset id")
        .option("-p, --passkey <passkey>", `passkey`)
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(`${color("download the file from mindsphere file service *")}`)
        .action((options) => {
            (async () => {
                try {
                    checkParameters(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);
                    const sdk = getSdk(options);
                    const iotFileClient = sdk.GetIoTFileClient();
                    let fullpath = options.filepath ? `${options.filepath}/${options.file}` : `${options.file}`;
                    fullpath = fullpath.replace("//", "/");

                    let filter = `name eq ${path.basename(fullpath)}`;
                    if (path.dirname(fullpath) !== ".") filter += ` and path eq ${path.dirname(fullpath)}/`;

                    const fileInfo = await iotFileClient.GetFiles(options.assetid, {
                        filter: filter,
                    });

                    fileInfo.length !== 1 &&
                        errorLog(`There were ${color(fileInfo.length)} files found with that name and path.`, true);

                    const spinner = ora("downloading file");
                    !options.verbose && spinner.start();

                    verboseLog(JSON.stringify(fileInfo, null, 2), options.verbose);
                    verboseLog(
                        `Downloading file ${color(fileInfo[0].name)} with size of ${color(
                            humanFileSize(fileInfo[0].size || 0)
                        )} from MindSphere.`,
                        options.verbose,
                        spinner
                    );

                    const startDate = new Date();

                    const download = await retry(options.retry, () => iotFileClient.GetFile(options.assetid, fullpath));
                    !download.ok && throwError(`Unexpected response ${download.statusText}`);
                    const outputfile = fileInfo[0].name || "output.bin";
                    const file = fs.createWriteStream(outputfile);
                    await streamPipeline(download.body, file);

                    const endDate = new Date();

                    !options.verbose && spinner.succeed("Done");

                    const hash = await checksumFile("md5", outputfile);

                    log(`Download time: ${(endDate.getTime() - startDate.getTime()) / 1000} seconds`);
                    log(`\nYour file ${color(outputfile)} with md5 hash ${hash} was successfully downloaded`);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc download-file -f CHANGELOG.md  --assetid 5..f  \t\t\t\t download file ${color(
                    "CHANGELOG.md"
                )} from specified asset`
            );
            log(
                `    mc download-file --file  CHANGELOG.md  --assetid 5...f --filepath upload \t download file ${color(
                    "upload/CHANGELOG.md"
                )} from specified asset`
            );
            log(
                `    mc download-file --file  upload/CHANGELOG.md  --assetid 5...f \t\t download file ${color(
                    "upload/CHANGELOG.md"
                )} from specified asset`
            );
            serviceCredentialLog();
        });
};

function checkParameters(options: any) {
    !options.file &&
        errorLog("Missing file name for download-file command. Run mc df --help for full syntax and examples.", true);

    !options.assetid && errorLog(" You have to specify assetid. Run  mc df --help for full syntax and examples.", true);
}
