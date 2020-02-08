import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { sleep } from "../../../test/test-utils";
import { MindSphereSdk, TimeSeriesModels } from "../../api/sdk/";
import { decrypt, loadAuth, retry } from "../../api/utils";
import { errorLog, getColor, serviceCredentialLog, verboseLog } from "./command-utils";
import ora = require("ora");

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("download-bulk")
        .alias("db")
        .option("-d, --dir <directoryname>", "directory for the download (shouldn't exist)", "bulkdownload")
        .option("-i, --assetid <assetid>", "asset id from the mindsphere")
        .option("-a, --aspectname <aspectname>", "aspectname")
        .option("-f, --from <from>", "from date")
        .option("-t, --to <to>", "to date")
        .option("-s, --size <size>", "max entries per file ", 200)
        .option("-p, --passkey <passkey>", `passkey`)
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-v, --verbose", "verbose output")
        .description(`${color("download the timeseries from mindsphere")}`)
        .action(options => {
            (async () => {
                try {
                    checkParameters(options);

                    const auth = loadAuth();
                    const sdk = new MindSphereSdk({
                        gateway: auth.gateway,
                        basicAuth: decrypt(auth, options.passkey),
                        tenant: auth.tenant
                    });

                    fs.mkdirSync(path.resolve(options.dir));

                    const iotTs = sdk.GetTimeSeriesClient();

                    let file = 0;
                    const spinner = ora(`downloading ${options.aspectname} data`);
                    !options.verbose && spinner.start();
                    let ts = await retry(
                        options.retry,
                        () =>
                            (iotTs.GetTimeSeriesBulkStyle(options.assetid, options.aspectname, {
                                from: new Date(options.from),
                                to: new Date(options.to),
                                limit: options.size
                            }) as unknown) as TimeSeriesModels.BulkTimeseries
                    );

                    fs.writeFileSync(
                        `${path.resolve(options.dir)}/${options.aspectname}_${file++}.json`,
                        JSON.stringify(ts.records)
                    );

                    verboseLog(`downloaded ${ts.records.length} records`, options.verbose, spinner);

                    await sleep(500);
                    for (;;) {
                        if (ts.nextRecord) {
                            const url: string = `${ts.nextRecord}`;
                            ts = await retry(options.retry, () => iotTs.GetNextRecordsBulkStyle(url));
                            fs.writeFileSync(
                                `${path.resolve(options.dir)}/${options.aspectname}_${file++}.json`,
                                JSON.stringify(ts.records)
                            );
                            verboseLog(`downloaded ${ts.records.length} records`, options.verbose, spinner);
                            await sleep(500);
                        } else {
                            break;
                        }
                    }

                    !options.verbose && spinner.succeed("Done");
                    console.log(`Files with timeseries data are in ${color(path.resolve(options.dir))} directory`);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc download-bulk --assetid 12345..ef --from 12/10/2019 --to 12/16/2019 --passkey <yourpasskey> \t\t download timeseries from specified asset`
            );
            serviceCredentialLog();
        });
};

function checkParameters(options: any) {
    !options.passkey &&
        errorLog(
            "you have to provide a passkey to get the service token (run mc db --help for full description)",
            true
        );
    !options.dir &&
        errorLog("Missing dir name for download-bulk command. Run mc db --help for full syntax and examples.", true);

    !options.assetid && errorLog(" You have to specify assetid. Run  mc df --help for full syntax and examples.", true);

    !options.from && errorLog(" You have to specify from date. Run  mc df --help for full syntax and examples.", true);

    !options.to && errorLog(" You have to specify to date. Run  mc df --help for full syntax and examples.", true);
}
