import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { sleep } from "../../../test/test-utils";
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
        .option("-d, --dir <directoryname>", "directory for the download (shouldn't exist)", "eventdownload")
        .option(
            "-f, --filter [filter]",
            `filter (see: ${color(
                "https://developer.mindsphere.io/apis/advanced-eventmanagement/api-eventmanagement-best-practices.html"
            )}) `
        )
        .option("-t, --typeid [typeid]", "event type")
        .option("-f, --from <from>", "from date")
        .option("-t, --to <to>", "to date")
        .option("-s, --size <size>", "max entries per file ", "100")
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

                    fs.mkdirSync(path.resolve(options.dir));

                    const eventManagement = sdk.GetEventManagementClient();

                    const spinner = ora("downloading mindsphere events");
                    !options.verbose && spinner.start();

                    const result = await retry(options.retry, () => eventManagement.GetEvents({ size: options.size }));
                    verboseLog(`downloading events_0.json`, options.verbose, spinner);
                    fs.writeFileSync(`${path.resolve(options.dir)}/events_0.json`, JSON.stringify(result._embedded));
                    await sleep(500);

                    for (let index = 1; index < (result.page?.totalPages || 0); index++) {
                        const next = await retry(options.retry, () =>
                            eventManagement.GetEvents({ size: result!.page!.size, page: index })
                        );
                        verboseLog(`downloading events_${index}.json`, options.verbose, spinner);
                        fs.writeFileSync(
                            `${path.resolve(options.dir)}/events_${index}.json`,
                            JSON.stringify(next._embedded)
                        );
                        await sleep(500);
                    }

                    !options.verbose && spinner.succeed("Done");
                    console.log(`Files with event data are in ${color(path.resolve(options.dir))} directory`);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc download-events --assetid 12345..ef --from 12/10/2019 --to 12/16/2019  \t\t download events from specified asset`
            );
            serviceCredentialLog();
        });
};

function checkParameters(options: any) {
    !options.dir &&
        errorLog("Missing dir name for download-events command. Run mc dn --help for full syntax and examples.", true);

    // !options.assetid && errorLog(" You have to specify assetid. Run  mc de --help for full syntax and examples.", true);

    // !options.from && errorLog(" You have to specify from date. Run  mc de --help for full syntax and examples.", true);

    // !options.to && errorLog(" You have to specify to date. Run  mc de --help for full syntax and examples.", true);
}
