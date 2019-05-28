import { CommanderStatic } from "commander";
import { log } from "console";
import { errorLog, getColor } from "./command-utils";
import ora = require("ora");
const mime = require("mime-types");

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("spectrum-analysis")
        .alias("sp")
        .option("-f, --file <fileToUpload>", "wav file to upload or json to analyze")
        .option("-m, --mime [mime-type]", "mime type of the file (default: automatic recognition)")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-p, --passkey <passkey>", `passkey (optional, file upload uses ${color("service credentials *")})`)
        .option("-v, --verbose", "verbose output")
        .description(`${color("perform spectrum analysis on a sound file *")}`)
        .action(options => {
            (async () => {
                try {
                    // checkParameters(options);
                    // homeDirLog(options.verbose);
                    // proxyLog(options.verbose);
                    // const spinner = ora("uploadingFile");
                    // !options.verbose && spinner.start();
                    // const uploadFile = path.resolve(options.file);
                    // verboseLog(`File to upload: ${color(uploadFile)}.`, options.verbose, spinner);
                    // if (!fs.existsSync(uploadFile)) {
                    //     throw new Error(`Can't find file ${uploadFile}`);
                    // }
                    // let uploader: any;
                    // let assetid = options.assetid;
                    // const chunked = options.chunked ? true : false;
                    // if (options.passkey === undefined) {
                    //     ({ assetid, uploader } = await getMindConnectAgent(assetid, options, spinner, color));
                    // } else {
                    //     uploader = getIotFileUploader(options);
                    // }
                    // const mimeType = options.mime || mime.lookup(uploadFile) || "application/octet-stream";
                    // const description =
                    //     options.desc || `File uploaded on ${new Date().toUTCString()} using mindconnect CLI`;
                    // if (!fs.existsSync(uploadFile)) {
                    //     throw new Error(`Can't find file ${uploadFile}`);
                    // }
                    // verboseLog(
                    //     `Uploading the file: ${color(uploadFile)} with mime type ${mimeType}.`,
                    //     options.verbose,
                    //     spinner
                    // );
                    // verboseLog(`Description ${description}`, options.verbose, spinner);
                    // verboseLog(`AssetId ${assetid}`, options.verbose, spinner);
                    // verboseLog(
                    //     options.assetid === undefined ? "Uploading to agent." : "Uploading to another asset.",
                    //     options.verbose,
                    //     spinner
                    // );
                    // verboseLog(chunked ? `Using chunked upload` : `No chunked upload`, options.verbose, spinner);
                    // const startDate = new Date();
                    // const filePath = options.filepath ? options.filepath : path.basename(uploadFile);
                    // const result = await retry(options.retry, () =>
                    //     uploader.UploadFile(
                    //         assetid,
                    //         filePath,
                    //         uploadFile,
                    //         {
                    //             description: description,
                    //             chunk: chunked,
                    //             retry: options.retry,
                    //             type: mimeType,
                    //             parallelUploads: options.parallel,
                    //             logFunction: (p: string) => {
                    //                 verboseLog(p, options.verbose, spinner);
                    //             },
                    //             verboseFunction: (p: string) => {
                    //                 verboseLog(p, options.verbose, spinner);
                    //             }
                    //         },
                    //         300,
                    //         retrylog("retrying")
                    //     )
                    // );
                    // const endDate = new Date();
                    // !options.verbose && spinner.succeed("Done");
                    // log(`Upload time: ${(endDate.getTime() - startDate.getTime()) / 1000} seconds`);
                    // log(`\nYour file ${color(uploadFile)} with ${color(result)} md5 hash was succesfully uploaded.\n`);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc uf -f CHANGELOG.md   \t\t\t\t\t\t\t upload file CHANGELOG.md to the agent`);
            log(
                `    mc upload-file --file  CHANGELOG.md  --assetid 5...f --mime text/plain \t upload file to a specified asset with custom mime type`
            );
            log(
                `    mc upload-file --file  CHANGELOG.md  --chunked \t\t\t\t upload file using experimental chunked upload`
            );
        });
};

function checkParameters(options: any) {
    !options.file &&
        errorLog(
            "Missing file name for spectrum-analytics command. Run mc sp --help for full syntax and examples.",
            true
        );
    !options.passkey && errorLog(" You have to provide the passkey for spectrum -analytics command", true);
}
