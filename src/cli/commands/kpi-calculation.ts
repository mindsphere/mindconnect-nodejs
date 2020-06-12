import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindSphereSdk } from "../../api/sdk";
import { decrypt, loadAuth, retry } from "../../api/utils";
import { errorLog, getColor, homeDirLog, proxyLog, serviceCredentialLog, verboseLog } from "./command-utils";
import _ = require("lodash");

const color = getColor("blue");

export default (program: CommanderStatic) => {
    program
        .command("kpi-calculation")
        .alias("kp")
        .option("-f, --file <timeseries>", `timeseries file`, `timeseries-sample.json`)
        .option("-c, --calendar <calendar>", `timeseries with planned outages`)
        .option("-e, --events <events>", `timeseries with control system events`)
        .option("-m, --mode [states|kpis]", `mode see ${color("@ Additional Documentation")}`)
        .option("-t, --target <target>", `target variable`)
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
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const auth = loadAuth();
                    const sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, options.passkey) });

                    const kpiClient = sdk.GetKPICalculationClient();
                    const timeSeries = readDataFromFile(options.file, options.verbose);

                    const from = new Date((_.minBy(timeSeries, "_time") as any)["_time"]);
                    const to = new Date((_.maxBy(timeSeries, "_time") as any)["_time"]);

                    switch (options.mode) {
                        case "states":
                            {
                                verboseLog(
                                    `calculating kpi state for target variable: ${options.input}`,
                                    options.verbose
                                );

                                const calendar = options.calendar
                                    ? readDataFromFile(options.calendar, options.verbose)
                                    : { plannedOutage: [] };
                                const events = options.events ? readDataFromFile(options.events, options.verbose) : [];

                                const results = await retry(options.retry, () =>
                                    kpiClient.CaclulateKpiStates(
                                        {
                                            calendar: calendar,
                                            timeseries: timeSeries,
                                            controlSystemEvents: events,
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
                `    mc kpi-calculation --mode states --file timeseries.json --calendar calendar.json  --target Temperature --threshold 30 \t calculate kpi states based on temperature`
            );
            log(
                `    mc kpi-calculation --mode kpis --file blubb.json --target state  \t calculate kpis for state timeseries`
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
    !options.passkey && errorLog(" You have to provide the passkey for the kpi-calculation command.", true);
    !options.mode &&
        errorLog("You have to provide the mode for the command. Run mc kp --help for full syntax and examples.", true);

    !options.file && errorLog("You have to provide at least the file with timeseries data", true);

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

    !["states", "kpis"].includes(options.mode) && errorLog(`the mode must be either one of: states or kpis`, true);
}
