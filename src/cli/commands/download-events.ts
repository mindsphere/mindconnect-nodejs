import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { sleep } from "../../../test/test-utils";
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
import ora = require("ora");

let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("download-events")
        .alias("dn")
        .option("-m, --mode [download|template]", "mode [download | template]", "download")
        .option("-d, --dir <directoryname>", "directory for the download (shouldn't exist)", "eventdownload")
        .option("-i, --assetid <assetid>", "asset id from the mindsphere ")
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
        .description(`${color("download the events from mindsphere *")}`)
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
            log(`    mc download-events --asssetid 1234567..ef  \t\t\t download events from specified asset`);
            log(`    mc download-events --dir newdir  \t\t\t\t download last 7 days of events to directory <dir>`);
            log(
                `    mc download-events --mode template --assetid 1234576..ef  \t create template file event.filter.mdsp.json for specified asset`
            );
            log(`    mc download-events --filter event.filter.mdsp.json \t\t download events using configured filter`);
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

function createFilter(options: any) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const template = {
        timestamp: {
            between: `[${sevenDaysAgo.toISOString()},${now.toISOString()})`,
        },
        entityId: options.assetid || "<enter asset id>",
        acknowledged: false,
        typeId: "com.siemens.mindsphere.eventmgmt.event.type.MindSphereStandardEvent",
    };

    const pathString = options.filter || `event.filter.mdsp.json`;
    const resolvedPath = path.resolve(pathString);

    fs.writeFileSync(resolvedPath, JSON.stringify(template, null, 2));

    console.log(
        `The filter was written into ${color(
            resolvedPath
        )} run \n\n\tmc download-events --mode download --filter ${pathString} \n\nto download events using this filter`
    );
    console.log("Edit the filter before downloading the events.");
}

function checkParameters(options: any) {
    !options.dir &&
        errorLog("Missing dir name for download-events command. Run mc dn --help for full syntax and examples.", true);

    // errorLog("Please use either the filter or the from, to and typeid parameters but not both.", true);
}
