import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
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
import _ = require("lodash");

let color = getColor("blue");

export default (program: Command) => {
    program
        .command("kpi-calculation")
        .alias("kp")
        .option("-f, --file <timeseries>", `timeseries file`, `timeseries-sample.json`)
        .option("-c, --calendar <calendar>", `timeseries with planned outages`)
        .option("-e, --events <events>", `timeseries with control system events`)
        .option("-m, --mode [direct|states|kpis]", `mode see ${color("@ Additional Documentation")}`)
        .option("-t, --target <target>", `target variable`)
        .option("-f, --from <from>", "timeseries begin  (used for direct state calculation)")
        .option("-o, --to <to>", "timeseries end  (used for direct state calculation)")
        .option("-i, --assetid <assetid>", "Asset id  (used for direct state calculation)")
        .option("-a, --aspectname <aspectname>", "Aspect name (used for direct state calculation )")
        .option("-n, --initialstate <initialstate>", "Initial state [RSH, SH, POH, FOH]", "RSH")
        .option("-d, --defaultstate <defaultstate>", "Default state [RSH, FOH]", "FOH")
        .option("-h, --threshold <threshold>", `threshold parameter`, "1.0")
        .option("-s, --shutdown <shutdown>", `shutdown threshold parameter in milliseconds`, "5000")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-p, --passkey <passkey>", `passkey`)
        .option("-v, --verbose", "verbose output")
        .description(`${color("calculate kpi states or compute kpis @")}`)
        .action((options) => {
            (async () => {
                try {
                    checkParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options, true);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const kpiClient = sdk.GetKPICalculationClient();

                    switch (options.mode) {
                        case "direct":
                            {
                                verboseLog(
                                    `calculating KPI states for target variable: ${options.input} using data stored in mindsphere`,
                                    options.verbose
                                );

                                const from = new Date(options.from);
                                const to = new Date(options.to);

                                verboseLog(
                                    `timeseries begin: ${from.toISOString()} timeseries end: ${to.toISOString()}`,
                                    options.verbose
                                );

                                const calendar = options.calendar
                                    ? readDataFromFile(options.calendar, options.verbose)
                                    : { plannedOutage: [] };
                                const events = options.events ? readDataFromFile(options.events, options.verbose) : [];

                                const results = await retry(options.retry, () =>
                                    kpiClient.CalculateKpiStatesDirect(
                                        {
                                            calendar: calendar,
                                            ControlSystemEvents: events,
                                        },
                                        {
                                            from: from,
                                            to: to,
                                            variableName: options.target,
                                            initialState: options.initialstate,
                                            defaultState: options.defaultstate,
                                            assetId: options.assetid,
                                            aspectName: options.aspectname,
                                            threshold: options.threshold,
                                            shutdownCorrelationThreshold: options.shutdown,
                                        }
                                    )
                                );

                                // create timeseries from kpi state indications
                                const ts = _.map(results.indications, (item) => {
                                    return { _time: item.timestamp, state: item.state, source: item.source };
                                });

                                console.log(JSON.stringify(ts, null, 2));
                            }
                            break;
                        case "states":
                            {
                                verboseLog(
                                    `calculating kpi state for target variable: ${options.input}`,
                                    options.verbose
                                );

                                const timeSeries = readDataFromFile(options.file, options.verbose);

                                const from = new Date((_.minBy(timeSeries, "_time") as any)["_time"]);
                                const to = new Date((_.maxBy(timeSeries, "_time") as any)["_time"]);

                                const calendar = options.calendar
                                    ? readDataFromFile(options.calendar, options.verbose)
                                    : { plannedOutage: [] };
                                const events = options.events ? readDataFromFile(options.events, options.verbose) : [];

                                const results = await retry(options.retry, () =>
                                    kpiClient.CaclulateKpiStates(
                                        {
                                            calendar: calendar,
                                            timeseries: timeSeries,
                                            ControlSystemEvents: events,
                                        },
                                        {
                                            from: from,
                                            to: to,
                                            variableName: options.target,
                                            initialState: options.initialstate,
                                            defaultState: options.defaultstate,
                                            threshold: options.threshold,
                                            shutdownCorrelationThreshold: options.shutdown,
                                        }
                                    )
                                );

                                // create timeseries from kpi state indications
                                const ts = _.map(results.indications, (item) => {
                                    return { _time: item.timestamp, state: item.state, source: item.source };
                                });

                                console.log(JSON.stringify(ts, null, 2));
                            }
                            break;

                        case "kpis":
                            {
                                const timeSeries = readDataFromFile(options.file, options.verbose);

                                const from = new Date((_.minBy(timeSeries, "_time") as any)["_time"]);
                                const to = new Date((_.maxBy(timeSeries, "_time") as any)["_time"]);

                                const results = await retry(options.retry, () =>
                                    kpiClient.ComputeKPI(timeSeries, {
                                        from: from,
                                        to: to,
                                        variableName: options.target,
                                        initialState: options.initialstate,
                                    })
                                );

                                console.log(JSON.stringify(results, null, 2));
                            }
                            break;
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc kpi-calculation --mode states --file timeseries.mdsp.json --calendar calendar.mdsp.json  --target rpm --threshold 30 \n \t\tcalculate kpi states based on rpm`
            );
            log(
                `    mc kpi-calculation --mode direct --target rpm --assetid 123...ef --aspectname EngineParameters  --from <date> --to <date> \n \t\tcalculate kpi states based on asset data in MindSphere`
            );
            log(
                `    mc kpi-calculation --mode kpis --file states.mdsp.json --target state \n \t\tcalculate kpis for state timeseries`
            );

            log("\n  State KPIs:\n");
            log(
                `    No Data Hours ${color("(NoData)")}, Period Hours ${color("(PH)")}, Available Hours ${color(
                    "(AH)"
                )} Service Hours ${color("(SH)")} `
            );
            log(
                `    Reserve Shutdown Hours ${color("(RSH)")}, Unavailble Hours ${color(
                    "(UH)"
                )}, Planned Outage Hours ${color("(POH)")} Forced Outage Hours ${color("(FOH)")} `
            );
            log("\n  Additional Documentation:\n");
            log(
                `    ${color(
                    "https://developer.mindsphere.io/apis/analytics-kpicalculation/api-kpicalculation-basics-kpi.html"
                )}`
            );
            log("\n  Example Jupyter Notebook:\n");
            log(`    ${color("https://github.com/mindsphere/analytics-examples/blob/master/kpi-calculation.ipynb")}`);
            serviceCredentialLog(color);
        });
};

function readDataFromFile(filename: string, verbose: any) {
    const timeSeriesDataFile = path.resolve(filename);
    verboseLog(`reading data from ${timeSeriesDataFile}`, verbose);
    const buffer = fs.readFileSync(timeSeriesDataFile);
    const data = JSON.parse(buffer.toString());
    return data;
}

function checkParameters(options: any) {
    !options.mode &&
        errorLog("You have to provide the mode for the command. Run mc kp --help for full syntax and examples.", true);

    options.mode !== "direct" &&
        !options.file &&
        errorLog("You have to provide at least the file with timeseries data", true);

    options.mode === "direct" &&
        (!options.assetid || !options.aspectname || !options.from || !options.to) &&
        errorLog(
            "You have to provide asssetid, aspectname, from and to for the direct kpi states calculation mode",
            true
        );

    !options.target && errorLog("You have to provide the target variable", true);

    !options.initialstate && errorLog("You have to provide the initital state", true);

    options.mode === "states" &&
        !options.defaultstate &&
        errorLog("You have to provide the default state for kpi states calculation", true);

    options.mode === "states" &&
        !options.threshold &&
        errorLog("You have to provide the threshold for kpi states calculation", true);

    options.mode === "states" &&
        !options.shutdown &&
        errorLog(
            "You have to provide the shutdown correlation threshold in miliseconds for kpi states calculation",
            true
        );

    !["states", "kpis", "direct"].includes(options.mode) &&
        errorLog(`the mode must be either one of: states or kpis`, true);
}
