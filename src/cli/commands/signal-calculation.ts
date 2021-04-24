import { CommanderStatic } from "commander";
import { log } from "console";
import { adjustColor, errorLog, getColor, getSdk, homeDirLog, proxyLog, serviceCredentialLog } from "./command-utils";
import path = require("path");

let color = getColor("blue");

export default (program: CommanderStatic) => {
    program
        .command("signal-calculation")
        .alias("cal")
        .option("-m, --mode [template|calculate]", "template | calculate", "template")
        .option("-f, --file <file>", ".mdsp.json template file", "signal.calculation.mdsp.json")
        .option("-t, --timeseries <timeseries>", `time series file for the operation`)
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("process timeseries data *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options, true);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    switch (options.mode) {
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
            // log(`    mc jobs --mode list \t\t\t\t\t list all jobs`);
            // log(`    mc jobs --mode list --status FAILED --message import \t list all jobs which failed on import`);
            // log(`    mc jobs --mode list --modelid <modelid> \t\t\t list all jobs for specified model`);
            // log(`    mc jobs --mode list --modelid <modelid> \t\t\t list all jobs for specified model`);
            // log(`    mc jobs --mode list --modelid <modelid> \t\t\t list all jobs for specified model`);
            // log(`    mc jobs --mode template \t\t\t\t\t create template file for job creation`);
            // log(`    mc jobs --mode create --file <templatefile> \t\t create job`);
            // log(`    mc jobs --mode info --jobid <jobid> \t\t\t get infos about the job`);
            // log(`    mc jobs --mode stop --jobid <jobid> \t\t\t stop job with job id`);
            log(`\n  Operation List: \n`);
            log(
                `    ${color(
                    "https://developer.mindsphere.io/apis/analytics-signalcalculation/api-signalcalculation-overview.html"
                )}\n`
            );
            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {}
