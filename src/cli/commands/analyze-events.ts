import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import { isArray } from "lodash";
import * as path from "path";
import { EventAnalyticsClient } from "../../api/sdk";
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

let color = getColor("blue");

export default (program: Command) => {
    program
        .command("event-analytics")
        .alias("ea")
        .option("-m, --mode [count|filter|duplicate|top]", `mode see ${color("@ Additional Documentation")}`, "top")
        .option("-f, --file <file>", `events file`)
        .option("-o, --output <output>", `result ${color("mode")}.ea.mdsp.json`)
        .option(
            "-t, --type [timeseries|event]",
            `event analytics can be used on both timeseries (with string properties as event names) and event formats`,
            "event"
        )
        .option("-p, --property <property>", `property name used for grouping and counting`, "description")
        .option("-l, --filterlist <filterlist>", `filter events`, "[]")
        .option("-x, --top <top>", "number of events (for top mode)", "10")
        .option("-s, --split <split>", "split interval (for count, duplicate)", "5000")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-p, --passkey <passkey>", `passkey`)
        .option("-v, --verbose", "verbose output")
        .description(`${color("analyze mindsphere events @")}`)
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options, true);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);
                    const fileName = path.resolve(options.file);
                    const data = fs.readFileSync(fileName).toString();
                    const events = JSON.parse(data);

                    let newEvents: any[] = events;

                    if (options.type === "event") {
                        newEvents = [];

                        events.events.forEach((element: any) => {
                            const newObject: any = { _time: element.timestamp };
                            newObject[options.property] = element[options.property];
                            newEvents.push(newObject);
                        });
                    }
                    const ea = sdk.GetEventAnalyticsClient();

                    const output = options.output || `${options.mode}.ea.mdsp.json`;

                    switch (options.mode) {
                        case "top":
                            await getTopEvents(ea, options, newEvents, output);
                            break;

                        case "count":
                            await countEvents(ea, options, newEvents, output);
                            break;

                        case "duplicate":
                            await removeDuplicates(ea, options, newEvents, output);
                            break;

                        case "filter":
                            await filterEvents(ea, options, newEvents, output);
                            break;

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
            log(
                `    mc event-analytics --mode top --file events.json --property description \t\t find the top 10 events in events.json`
            );
            log(
                `    mc event-analytics --mode duplicate --file events.json --property description --split 5000 \t\t remove all duplicate events`
            );
            log("\n  Additional Documentation:\n");
            log(
                `    ${color(
                    "https://developer.mindsphere.io/apis/analytics-eventanalytics/api-eventanalytics-overview.html"
                )}`
            );

            log(
                `    ${color(
                    "https://developer.mindsphere.io/apis/analytics-eventanalytics/api-eventanalytics-samples.html"
                )}`
            );

            serviceCredentialLog(color);
        });
};

async function getTopEvents(ea: EventAnalyticsClient, options: any, newEvents: any[], output: any) {
    const result = await retry(options.retry, () =>
        ea.FindTopEvents({
            numberOfTopPositionsRequired: parseInt(options.top),
            eventsMetadata: { eventTextPropertyName: options.property },
            events: newEvents,
        })
    );
    fs.writeFileSync(output, JSON.stringify(result, null, 2));
    verboseLog(JSON.stringify(result, null, 2), options.verbose);
    console.log(`wrote results to ${color(output)}`);
}

async function countEvents(ea: EventAnalyticsClient, options: any, newEvents: any[], output: any) {
    const result = await retry(options.retry, () =>
        ea.CountEvents({
            eventsMetadata: {
                eventTextPropertyName: options.property,
                splitInterval: parseInt(options.split),
            },
            events: newEvents,
        })
    );
    fs.writeFileSync(output, JSON.stringify(result, null, 2));
    verboseLog(JSON.stringify(result, null, 2), options.verbose);
    console.log(`wrote results to ${color(output)}`);
}

async function removeDuplicates(ea: EventAnalyticsClient, options: any, newEvents: any[], output: any) {
    const result = await retry(options.retry, () =>
        ea.RemoveDuplicateEvents({
            eventsMetadata: {
                eventTextPropertyName: options.property,
                splitInterval: parseInt(options.split),
            },
            events: newEvents,
        })
    );
    fs.writeFileSync(output, JSON.stringify(result, null, 2));
    verboseLog(JSON.stringify(result, null, 2), options.verbose);
    console.log(`wrote results to ${color(output)}`);
}

async function filterEvents(ea: EventAnalyticsClient, options: any, newEvents: any[], output: any) {
    const resultFilter = await retry(options.retry, () =>
        ea.FilterEvents({
            eventsMetadata: {
                eventTextPropertyName: options.property,
            },
            events: newEvents,
            filterList: options.filterlist ? JSON.parse(options.filterlist) : [],
        })
    );
    fs.writeFileSync(output, JSON.stringify(resultFilter, null, 2));
    verboseLog(JSON.stringify(resultFilter, null, 2), options.verbose);
    console.log(`wrote results to ${color(output)}`);
}

function checkRequiredParameters(options: any) {
    !["timeseries", "event"].includes(options.type) &&
        errorLog(`invalid type ${options.type}; type must be timeseries or event`, true);

    !options.file && errorLog(`you have to specify the file name in the --file option`, true);

    if (options.filterlist) {
        try {
            const obj = JSON.parse(options.filterlist);
            if (!isArray(obj)) {
                errorLog(
                    "invalid filter, you have to pass an array with event names. example --filterlist '[\"Flow to low\"]' ",
                    true
                );
            }
        } catch (error) {
            errorLog(
                "invalid filter, you have to pass an array with event names. example --filterlist '[\"Flow to low\"]' ",
                true
            );
        }
    }
}
