import { CommanderStatic } from "commander";
import { log } from "console";
import { errorLog, getColor, homeDirLog, proxyLog, serviceCredentialLog } from "./command-utils";
import ora = require("ora");
const mime = require("mime-types");
const color = getColor("blue");

export default (program: CommanderStatic) => {
    program
        .command("signal-validation")
        .alias("sv")
        .option("-f, --file <timeseries>", `timeseries file`, `timeseries.json`)
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-p, --passkey <passkey>", `passkey`)
        .option("-v, --verbose", "verbose output")
        .description(`${color("perform signal validation @")}`)
        .action(options => {
            (async () => {
                try {
                    checkParameters(options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");

            serviceCredentialLog(color);
        });
};

function checkParameters(options: any) {}
