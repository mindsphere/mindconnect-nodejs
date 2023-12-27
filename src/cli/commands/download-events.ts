import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { sleep } from "../../../test/test-utils";
import { EventManagementModels, MindSphereSdk } from "../../api/sdk";
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
import ora = require("ora-classic");

let color = getColor("magenta");

export default (program: Command) => {
    program
        .command("events-bulk")
        .alias("dn")
        .alias("download-events")
        .option(
            "-m, --mode [download|template|delete|check]",
            "mode [download | template | delete | check]",
            "download"
        )
        .option("-d, --dir <dir>", "download folder", "eventdownload")
        .option("-i, --assetid <assetid>", "mindsphere asset id ")
        .option("-j, --jobid <jobid>", "check deletion process of jobs with jobid")
        .option(
            "-f, --filter [filter]",
            `JSON file with filter (see: ${color(
                "https://developer.mindsphere.io/apis/advanced-eventmanagement/api-eventmanagement-best-practices.html"
            )}) `
        )
        .option("-s, --size <size>", "max entries per file ", "100")
        .option("-t, --sort <sort>", "sort events ", "timestamp,asc")
        .option("-p, --passkey <passkey>", `passkey`)
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(`${color("download or delete the events in bulk *")}`)
        .action((options) => {
            (async () => {
                try {
                    checkParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    switch (options.mode) {
                        case "download":
                            await downloadEvents(options, sdk);
                            break;

                        case "template":
                            createFilter(options);
                            break;

                        case "delete":
                            await deleteEvents(options, sdk);
                            break;

                        case "check":
                            await checkDeleteJob(options, sdk);
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
                `    mdsp events-bulk --mode download  --asssetid 1234567..ef  \t download events from specified asset`
            );
            log(
                `    mdsp events-bulk --mode download --dir newdir  \t\t download last 7 days of events to <dir> folder`
            );
            log(
                `    mdsp events-bulk --mode template --assetid 1234576..ef  \t create template file event.filter.mdsp.json`
            );
            log(
                `    mdsp events-bulk --mode download --filter event.filter.mdsp.json \t\t download events using configured filter`
            );
            log(
                `    mdsp events-bulk --mode delete --filter event.filter.mdsp.json \t\t delete events using configured filter`
            );
            log(`    mdsp events-bulk --mode check --jobid <jobid> \t\t check the state of bulk deleting job`);
            serviceCredentialLog();
        });
};

async function downloadEvents(options: any, sdk: MindSphereSdk) {
    fs.mkdirSync(path.resolve(options.dir));

    const eventManagement = sdk.GetEventManagementClient();

    const spinner = ora("downloading mindsphere events");
    !options.verbose && spinner.start();

    let filter: string;

    if (options.filter) {
        const filterPath = path.resolve(options.filter);
        filter = fs.readFileSync(filterPath).toString();
    }

    if (!options.filter && options.assetid) {
        filter = JSON.stringify({ entityId: options.assetid });
    }

    const result = await retry(options.retry, () =>
        eventManagement.GetEvents({ size: options.size, filter: filter, sort: options.sort })
    );
    verboseLog(`downloading events_0.json`, options.verbose, spinner);
    fs.writeFileSync(`${path.resolve(options.dir)}/events_0.json`, JSON.stringify(result._embedded));
    await sleep(500);

    for (let index = 1; index < (result.page?.totalPages || 0); index++) {
        const next = await retry(options.retry, () =>
            eventManagement.GetEvents({ size: result!.page!.size, page: index })
        );
        verboseLog(`downloading events_${index}.json`, options.verbose, spinner);
        fs.writeFileSync(`${path.resolve(options.dir)}/events_${index}.json`, JSON.stringify(next._embedded));
        await sleep(500);
    }

    !options.verbose && spinner.succeed("Done");
    console.log(`Files with event data are in ${color(path.resolve(options.dir))} directory`);
}

async function deleteEvents(options: any, sdk: MindSphereSdk) {
    const eventManagement = sdk.GetEventManagementClient();

    let filter: object;

    if (options.filter) {
        const filterPath = path.resolve(options.filter);
        filter = JSON.parse(fs.readFileSync(filterPath).toString());
    }

    if (!options.filter && options.assetid) {
        filter = { entityId: options.assetid };
    }

    const result = await retry(options.retry, () => eventManagement.PostDeleteEventsJob({ filter: filter }));
    console.log(`Deletion job with id ${color(result.id)} is in state ${color(result.state)}.`);
    result.details && console.log(`Details: ${JSON.stringify(result.details)}.`);
    console.log(`Run\n\n\tmdsp events-bulk --mode check --jobid ${result.id}\n\nto check the state of the job.\n `);
}

async function checkDeleteJob(options: any, sdk: MindSphereSdk) {
    const eventManagement = sdk.GetEventManagementClient();

    const result = (await retry(options.retry, () =>
        eventManagement.GetDeleteEventsJob(options.jobid)
    )) as EventManagementModels.DeleteJobResource;
    console.log(`Deletion job with id ${color(result.id)} is in state ${color(result.state)}.`);
    result.details && console.log(`Details: ${JSON.stringify(result.details)}.\n`);
}

export function createFilter(options: any) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const template = {
        timestamp: {
            between: `[${sevenDaysAgo.toISOString()},${now.toISOString()})`,
        },
        entityId: options.assetid || "<enter asset id>",
        typeId: options.eventtype || "com.siemens.mindsphere.eventmgmt.event.type.MindSphereStandardEvent",
    };

    const pathString = options.filter || `event.filter.mdsp.json`;
    const resolvedPath = path.resolve(pathString);

    fs.writeFileSync(resolvedPath, JSON.stringify(template, null, 2));

    console.log(
        `The filter was written into ${color(
            resolvedPath
        )} run \n\n\tmdsp events-bulk --mode download --filter ${pathString} \t ${color(" to download events")}`
    );
    console.log(`\tmdsp events-bulk --mode delete --filter ${pathString} \t ${color(" to delete events")}`);
    console.log(`\tmdsp events --mode list --filter ${pathString} \t\t ${color(" to list events")}`);
    console.log("\nEdit the filter before downloading or deleting the events.");
}

function checkParameters(options: any) {
    !options.dir &&
        errorLog("Missing dir name for events-bulk command. Run mdsp dn --help for full syntax and examples.", true);

    options.mode === "delete" &&
        !options.filter &&
        errorLog(
            "You must specifify a filter when deleting the events. Create one with  mdsp events-bulk --mode template.",
            true
        );

    options.mode === "check" &&
        !options.jobid &&
        errorLog("You have to specify the jobid for the delete command", true);
}
