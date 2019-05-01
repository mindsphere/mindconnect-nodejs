import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { TimeSeriesBulkClient } from "../../api/sdk";
import { decrypt, errorLog, loadAuth, throwError, verboseLog } from "../../api/utils";
import { colorizeStatus } from "./command-utils";
import { jobState } from "./iot-bulk-run";
import _ = require("lodash");
import ora = require("ora");

export default (program: CommanderStatic) => {
    program
        .command("check-bulk")
        .alias("cb")
        .option("-d, --dir <directoryname>", "config file with agent configuration", "bulkupload")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-p, --poll", "poll status every 2 seconds until all are successfull or failed")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output")
        .description(chalk.magentaBright("checks the progress of the upload jobs from <directoryname> directory *"))
        .action(options => {
            (async () => {
                try {
                    checkRequiredParamaters(options);

                    const jobState = require(path.resolve(`${options.dir}/jobstate.json`)) as jobState;

                    const auth = loadAuth();
                    const jobClient = new TimeSeriesBulkClient(
                        auth.gateway,
                        decrypt(auth, options.passkey),
                        auth.tenant
                    );

                    const spinner = ora("checkingJobs");
                    !options.verbose && spinner.start();
                    const newStatus = [];
                    for (const job of jobState.bulkImports) {
                        const jobid = (job as any).jobid;
                        const js = await jobClient.GetJobStatus(jobid);
                        newStatus.push(js);
                        verboseLog(
                            `Job with id ${chalk.magentaBright(jobid)} is in status : ${colorizeStatus(
                                `${js.status}`
                            )} [${js.message}]`,
                            options.verbose,
                            spinner
                        );
                    }
                    !options.verbose && spinner.succeed("checking is done.");
                    const result = _(newStatus)
                        .groupBy("status")
                        .value();
                    Object.keys(result).forEach((key: string) => {
                        console.log(`${result[key].length} job(s) in status ${colorizeStatus(key)}.`);
                    });
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc bulk-check \t displays job progress of ${chalk.magentaBright("bulkimport")} directory`);
            log(
                `    mc br --dir asset1 --verbose \tdisplays job progress of ${chalk.magentaBright(
                    "asset1"
                )} directory with verbose output`
            );
        });
};

function checkRequiredParamaters(options: any) {
    if (`${options.dir}`.endsWith("/") || `${options.dir}`.endsWith("/")) {
        options.dir = `${options.dir}`.slice(0, -1);
    }

    verboseLog(`reading directory: ${chalk.magentaBright(options.dir)}`, options.verbose);
    !fs.existsSync(options.dir) && throwError(`the directory ${chalk.magentaBright(options.dir)} doesn't exist!`);

    !fs.existsSync(`${options.dir}/asset.json`) &&
        throwError(
            `the directory ${chalk.magentaBright(
                options.dir
            )} must contain the asset.json file. run mc prepare-bulk command first!`
        );

    !fs.existsSync(`${options.dir}/json/`) &&
        throwError(
            `the directory ${chalk.magentaBright(
                options.dir
            )} must contain the json/ folder. run mc prepare-bulk command first!`
        );

    !fs.existsSync(`${options.dir}/csv/`) &&
        throwError(
            `the directory ${chalk.magentaBright(
                options.dir
            )} must contain the csv/ folder. run mc prepare-bulk command first!`
        );

    !fs.existsSync(`${options.dir}/jobstate.json`) &&
        throwError(
            `the directory ${chalk.magentaBright(
                options.dir
            )} must contain the jobstate.json file. run mc run-bulk --start command first!`
        );

    !options.passkey &&
        errorLog(
            "you have to provide a passkey to get the service token (run mc ibr --help for full description)",
            true
        );
}
