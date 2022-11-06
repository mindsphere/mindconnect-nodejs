import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { errorLog, getColor, getSdk, homeDirLog, proxyLog, serviceCredentialLog, verboseLog } from "./command-utils";
import ora = require("ora");
const mime = require("mime-types");

let color = getColor("magenta");

export default (program: Command) => {
    program
        .command("sdi-file-upload")
        .alias("sdu")
        .option("-f, --file <file>", "file to upload to SDI")
        .option("-h, --filepath <filepath>", "file path in SDI")
        .option("-m, --mime [mime-type]", "mime type of the file (default: automatic recognition)")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output")
        .description(`${color("upload file to SDI *")}`)
        .action((options) => {
            (async () => {
                try {
                    checkParameters(options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const spinner = ora("uploading file to SDI");
                    !options.verbose && spinner.start();

                    const uploadFile = path.resolve(options.file);
                    verboseLog(`File to upload: ${color(uploadFile)}.`, options.verbose, spinner);

                    if (!fs.existsSync(uploadFile)) {
                        throw new Error(`Can't find file ${uploadFile}`);
                    }

                    const sdk = getSdk(options);
                    const mimeType = options.mime || mime.lookup(uploadFile) || "application/octet-stream";
                    if (!fs.existsSync(uploadFile)) {
                        throw new Error(`Can't find file ${uploadFile}`);
                    }

                    verboseLog(
                        `Uploading the file: ${color(uploadFile)} with mime type ${mimeType}.`,
                        options.verbose,
                        spinner
                    );
                    const startDate = new Date();

                    const filePath = options.filepath ? options.filepath : path.basename(uploadFile);

                    const result = await sdk
                        .GetSemanticDataInterConnectClient()
                        .DataUpload(filePath, fs.readFileSync(uploadFile), mimeType);

                    const endDate = new Date();

                    !options.verbose && spinner.succeed("Done");

                    log(`Upload time: ${(endDate.getTime() - startDate.getTime()) / 1000} seconds`);
                    log(
                        `\nYour file ${color(uploadFile)} (SDI Name: ${color(
                            result.filePath
                        )}) was succesfully uploaded.\n`
                    );
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mdsp sdi-file-upload --file <file> \t\t\t upload file to SDI`);
            log(`\n  Restriction:\n`);
            log(`    This works only for SDI only tenants (without Integrated Data Lake)`);
            log(
                `    If you are MindSphere Integrated Data Lake Customer use mdsp data-lake --mode upload command instead. `
            );
            serviceCredentialLog();
        });
};

function checkParameters(options: any) {
    !options.file &&
        errorLog(
            "Missing file name for sdi-file-upload command. Run mdsp sdi-file-upload --help for full syntax and examples.",
            true
        );
}
