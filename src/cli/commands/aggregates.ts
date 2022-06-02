import { Command } from "commander";
import { log } from "console";
import { MindSphereSdk, TimeSeriesAggregateModelsV4 } from "../../api/sdk";
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
import path = require("path");
import fs = require("fs");

let color = getColor("magenta");
const magenta = getColor("magenta");
const blue = getColor("blue");
const yellow = getColor("yellow");
const red = getColor("red");
const green = getColor("green");
const cyan = getColor("cyan");

const today = new Date();
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

export default (program: Command) => {
    program
        .command("aggregates")
        .alias("ag")
        .option("-i, --assetid <assetid>", "mindsphere asset id ")
        .option("-n, --aspectname <aspectname>", "mindsphere aspect name")
        .option("-f, --from <from>", "begining of the time range to read", yesterday.toISOString())
        .option("-t, --to <to>", "end of the time range to read")
        .option("-r, --intervalvalue <intervalvalue>", "interval duration for the aggregates in interval units")
        .option("-u, --intervalunit <intervalunit>", "interval duration unit [minute |hour |day |week | month]")
        .option("-s, --select <select>", "comma separated list of variable names")
        .option("-d, --download [download]", "download aggregates to specified file")
        .option("-a, --all", "show all aggregates not just average, min, max, sum and sd")
        .option("-l, --local", "use localtime in aggregate list")
        .option("-c, --count <count>", "number of aggregates in response ")
        .option("-h, --formatted", "write JSON strings with indentation")
        .option("-p, --passkey <passkey>", `passkey`)
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(`${color("list timeseries aggregates *")}`)
        .action((options) => {
            (async () => {
                try {
                    checkParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    await listAggregates(options, sdk);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc aggregates --asssetid 1234567..ef --aspectname Environment   \tlist recent aggregates for aspect Environment`
            );
            log(
                `    mc aggregates --asssetid 1234567..ef --aspectname Environment --select Temperature \n\t\t\t\t\t\t\t\t\tlist recent temperature aggregates `
            );
            log(
                `    mc aggregates --asssetid 1234567..ef --aspectname Environment --select Temperature --all \n\t\t\t\t\t\t\t\t\tlist all recent temperature aggregates`
            );

            log(
                `    see https://documentation.mindsphere.io/MindSphere/apis/iot-iottsaggregates/api-iottsaggregates-samples-v4.html for documentation about the aggregate parameters`
            );

            serviceCredentialLog();
        });
};

async function listAggregates(options: any, sdk: MindSphereSdk) {
    const aggregatesV4Client = sdk.GetTimeSeriesAggregateClientV4();

    const fromDate = new Date(options.from).toISOString();
    const toDate: string | undefined = options.to ? new Date(options.to).toISOString() : undefined;

    const aggregates = (await retry(options.retry, () =>
        aggregatesV4Client.GetAggregates({
            assetId: options.assetid,
            aspectName: options.aspectname,
            from: fromDate,
            to: toDate,
            intervalValue: options.intervalvalue,
            intervalUnit: options.intervalunit,
            select: options.select,
            count: options.count,
        })
    )) as TimeSeriesAggregateModelsV4.Aggregates;

    if (options.download) {
        const download = options.download === true ? "aggregates.mdsp.json" : options.download;
        const downloadPath = path.resolve(download);
        fs.writeFileSync(
            downloadPath,
            options.formatted ? JSON.stringify(aggregates, null, 2) : JSON.stringify(aggregates)
        );
        console.log(`The aggregates were downloaded to ${color(downloadPath)}.`);
        return;
    }

    !options.all &&
        console.log(
            `[from - to]  ${color("variable")}  ${green("average")}  ${yellow("sum")}  ${blue("min")}  ${red(
                "max"
            )}  ${cyan("sd")}  ${magenta("count")}`
        );

    for (const aggregate of aggregates.aggregates || []) {
        let line;
        for (const key of Object.keys(aggregate).sort()) {
            if (key !== "starttime" && key !== "endtime") {
                line = `${color(key)}  ${green(aggregate[key].average.toFixed(3))}  ${yellow(
                    aggregate[key].sum.toFixed(3)
                )}  ${blue(aggregate[key].minvalue.toFixed(3))}  ${red(aggregate[key].maxvalue.toFixed(3))}  ${cyan(
                    aggregate[key].sd.toFixed(3)
                )}  ${magenta(
                    0 + aggregate[key].countgood + aggregate[key].countbad + aggregate[key].countuncertain
                )} `;
                options.all &&
                    console.log(
                        `from: ${
                            options.local ? new Date(aggregate.starttime).toLocaleString() : aggregate.starttime
                        } to: ${
                            options.local ? new Date(aggregate.endtime).toLocaleString() : aggregate.endtime
                        } variable: ${color(key)}`
                    );
                options.all && console.table(aggregate[key]);
                !options.all &&
                    console.log(
                        `[${options.local ? new Date(aggregate.starttime).toLocaleString() : aggregate.starttime} - ${
                            options.local ? new Date(aggregate.endtime).toLocaleString() : aggregate.endtime
                        }] ${line}`
                    );
            }
        }

        verboseLog(JSON.stringify(aggregate, null, 2), options.verbose);
    }

    console.log(`${color(aggregates.aggregates?.length)} aggregates listed.\n`);
}

function checkParameters(options: any) {
    !options.assetid &&
        errorLog("Missing assetid for aggregates command. Run mc ag --help for full syntax and examples.", true);
    !options.aspectname &&
        errorLog("Missing aspectname for aggregates command. Run mc ag --help for full syntax and examples.", true);
}
