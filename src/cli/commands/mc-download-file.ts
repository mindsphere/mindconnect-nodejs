import { CommanderStatic } from "commander";
import { log } from "console";
import { errorLog, getColor } from "./command-utils";

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("download-file")
        .alias("df")
        .option("-f, --file <fileToDownload>", "file to download from the file service")
        .option("-h, --filepath [filepath]", "file path in the mindsphere", "")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-l, --parallel <number>", "parallel chunked downloads", 3)
        .option("-i, --assetid <assetid>", "asset id from the mindsphere")
        .option("-p, --passkey <passkey>", `passkey`)
        .option("-y, --retry <number>", "retry attempts before giving up", 3)

        .option("-v, --verbose", "verbose output")
        .description(`${color("download the file from mindsphere file service *")}`)
        .action(options => {
            (async () => {
                try {
                    checkParameters(options);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc download-file -f CHANGELOG.md  --assetid 5..f  \t\t\t\t download file CHANGELOG.md from specified asset`
            );
            log(
                `    mc download-file --file  CHANGELOG.md  --assetid 5...f --filepath upload \t download file upload/CHANGELOG.md from specified asset`
            );
        });
};

function checkParameters(options: any) {
    !options.passkey &&
        errorLog(
            "you have to provide a passkey to get the service token (run mc df --help for full description)",
            true
        );
    !options.file &&
        errorLog("Missing file name for download-file command. Run mc df --help for full syntax and examples.", true);

    !options.assetid && errorLog(" You have to specify assetid. Run  mc df --help for full syntax and examples.", true);
}
