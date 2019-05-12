import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { sleep } from "../../../test/test-utils";
import { AssetManagementModels, TimeSeriesBulkClient } from "../../api/sdk";
import { decrypt, errorLog, loadAuth, retry, throwError, verboseLog } from "../../api/utils";
import { colorizeStatus, getColor } from "./command-utils";
import { jobState } from "./iot-bulk-run";
import _ = require("lodash");
import ora = require("ora");

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("check-bulk")
        .alias("cb")
        .option("-d, --dir <directoryname>", "config file with agent configuration", "bulkupload")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output")
        .description(color("checks the progress of the upload jobs from <directoryname> directory *"))
        .action(options => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const jobState = require(path.resolve(`${options.dir}/jobstate.json`)) as jobState;

                    const asset = jobState.options.asset;
                    if (asset.twinType === AssetManagementModels.TwinType.Performance) {
                        const totalMessages = jobState.uploadFiles.length;
                        const postedMessages = jobState.timeSeriesFiles.length;

                        console.log(`Statistics for perormance asset ${color(asset.name)}`);
                        console.log(`total timeseries messages: ${totalMessages}`);
                        console.log(`posted timeseries messages: ${postedMessages}`);
                        process.exit(0);
                    }

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
                        const js = await retry(options.retry, () => jobClient.GetJobStatus(jobid), 2000);
                        await sleep(500);
                        newStatus.push(js);
                        verboseLog(
                            `Job with id ${color(jobid)} is in status : ${colorizeStatus(`${js.status}`)} [${
                                js.message
                            }]`,
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
            log(`    mc bulk-check \t displays job progress of ${color("bulkimport")} directory`);
            log(
                `    mc br --dir asset1 --verbose \tdisplays job progress of ${color(
                    "asset1"
                )} directory with verbose output`
            );
        });
};

function checkRequiredParamaters(options: any) {
    if (`${options.dir}`.endsWith("/") || `${options.dir}`.endsWith("\\")) {
        options.dir = `${options.dir}`.slice(0, -1);
    }

    verboseLog(`reading directory: ${color(options.dir)}`, options.verbose);
    !fs.existsSync(options.dir) && throwError(`the directory ${color(options.dir)} doesn't exist!`);

    !fs.existsSync(`${options.dir}/asset.json`) &&
        throwError(
            `the directory ${color(options.dir)} must contain the asset.json file. run mc prepare-bulk command first!`
        );

    !fs.existsSync(`${options.dir}/json/`) &&
        throwError(
            `the directory ${color(options.dir)} must contain the json/ folder. run mc prepare-bulk command first!`
        );

    !fs.existsSync(`${options.dir}/csv/`) &&
        throwError(
            `the directory ${color(options.dir)} must contain the csv/ folder. run mc prepare-bulk command first!`
        );

    !fs.existsSync(`${options.dir}/jobstate.json`) &&
        throwError(
            `the directory ${color(
                options.dir
            )} must contain the jobstate.json file. run mc run-bulk --start command first!`
        );

    !options.passkey &&
        errorLog(
            "you have to provide a passkey to get the service token (run mc ibr --help for full description)",
            true
        );
}
