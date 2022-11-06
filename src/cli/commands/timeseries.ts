import { Command } from "commander";
import { log } from "console";
import { MindSphereSdk } from "../../api/sdk";
import { retry } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    proxyLog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";
import fs = require("fs");
import ora = require("ora");

let color = getColor("magenta");
const magenta = getColor("magenta");
const blue = getColor("blue");
const yellow = getColor("yellow");
const red = getColor("red");
const green = getColor("green");
const cyan = getColor("cyan");

const rotatingColors = [magenta, blue, yellow, red, green, cyan];

const today = new Date();
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

export default (program: Command) => {
    program
        .command("timeseries")
        .alias("ts")
        .option("-i, --assetid <assetid>", "mindsphere asset id ")
        .option("-n, --aspectname <aspectname>", "mindsphere aspect name")
        .option("-f, --from <from>", "begining of the time range to read", yesterday.toISOString())
        .option("-t, --to <to>", "end of the time range to read", today.toISOString())
        .option("-s, --select <select>", "comma separated list of variable names")
        .option("-d, --download", "download timeseries to a set of files")
        .option("-a, --all", "include also quality codes not just variable values")
        .option("-r, --raw", "don't strip the nextRecord URLs from downloaded JSON")
        .option("-h, --formatted", "write JSON strings with indentation")
        .option("-l, --local", "use local time in timeseries list")
        .option("-c, --count <count>", "number of timeseries entries per request", "2000")
        .option("-p, --passkey <passkey>", `passkey`)
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(`${color("list timeseries data *")}`)
        .action((options) => {
            (async () => {
                try {
                    checkParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    await listTimeSeries(options, sdk);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mdsp timeseries --asssetid 1234567..ef --aspectname Environment   \tlist recent timeseries for aspect Environment`
            );
            log(
                `    mdsp timeseries --asssetid 1234567..ef --aspectname Environment --select Temperature \n\t\t\t\t\t\t\t\t\tlist recent temperature timeseries `
            );
            log(
                `    mdsp timeseries --asssetid 1234567..ef --aspectname Environment --select Temperature --all \n\t\t\t\t\t\t\t\t\tlist all recent temperature timeseries`
            );

            log(
                `    mdsp timeseries --asssetid 1234567..ef --aspectname Environment --select Temperature --all \n\t\t\t\t\t\t\t\t\tlist all recent temperature timeseries`
            );

            log(
                `    mdsp timeseries --asssetid 1234567..ef --aspectname Environment --download \n\t\t\t\t\t\t\t\t\tdownload the recent timeseries data for the Environment aspect`
            );

            log("\n  Important:\n");

            log(`    Please use ${color("bulk commands")} if you want to download a lot of data.\n`);

            serviceCredentialLog();
        });
};

async function listTimeSeries(options: any, sdk: MindSphereSdk) {
    const timeSeriesClient = sdk.GetTimeSeriesClient();
    const fromDate = new Date(options.from);
    const toDate = new Date(options.to);

    let timeseries = await retry(options.retry, () =>
        timeSeriesClient.GetTimeSeriesBulkStyle(options.assetid, options.aspectname, {
            from: fromDate,
            to: toDate,
            select: options.select,
            limit: options.count || 2000,
        })
    );

    const propertyColors: any = {};
    let colorIndex = 0;
    let totalRecords = 0;
    const spinner = ora("downloading timeseries data");

    do {
        if (options.download) {
            const asset = await sdk.GetAssetManagementClient().GetAsset(options.assetid);
            !options.verbose && spinner.start();
            const fileName = `${asset.name}-${options.aspectname}-${totalRecords}-${
                totalRecords + timeseries.records.length - 1
            }.mdsp.json`;
            verboseLog(`Downloading timeseries data to: ${fileName}`, options.verbose, spinner);

            const jsonToSerialize = options.raw ? timeseries : timeseries.records;
            fs.writeFileSync(
                fileName,
                options.formatted ? JSON.stringify(jsonToSerialize, null, 2) : JSON.stringify(jsonToSerialize)
            );
            totalRecords += timeseries.records.length;
        } else {
            for (const timeseriesRecord of timeseries.records) {
                let line = !options.local
                    ? `${timeseriesRecord._time} `
                    : `${new Date(timeseriesRecord._time).toLocaleString()} `;
                for (const key of Object.keys(timeseriesRecord).sort()) {
                    if (key === "_time") continue;

                    const propertyName = key.replace(/(_qc$)/, "");
                    if (!propertyColors[propertyName]) {
                        propertyColors[propertyName] = rotatingColors[colorIndex++ % rotatingColors.length];
                    }
                    const currentColor = propertyColors[propertyName];

                    if (options.all || !key.endsWith("_qc")) {
                        line += ` ${currentColor(key)}: ${timeseriesRecord[key]}`;
                    }
                }
                console.log(line);
                totalRecords++;
            }
        }

        if (!timeseries.nextRecord) break;
        timeseries = await retry(options.retry, () => timeSeriesClient.GetNextRecordsBulkStyle(timeseries.nextRecord));
    } while (timeseries);

    options.download && !options.verbose && spinner.succeed("Download of the timeseries data is done.");

    console.log(
        `There were ${color(totalRecords)} timeseries entries in the specified interval [${
            options.local ? fromDate.toLocaleString() : fromDate.toISOString()
        } - ${options.local ? toDate.toLocaleString() : toDate.toISOString()}]`
    );
}

function checkParameters(options: any) {
    !options.assetid &&
        errorLog(
            "Missing assetid for timeseries command. Run mdsp timeseries --help for full syntax and examples.",
            true
        );
    !options.aspectname &&
        errorLog(
            "Missing aspectname for timeseries command. Run mdsp timeseries --help for full syntax and examples.",
            true
        );
}
