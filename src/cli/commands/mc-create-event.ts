import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { retry } from "../..";
import { MindConnectAgent } from "../../api/mindconnect-agent";
import { EventManagementClient } from "../../api/sdk";
import { adjustColor, errorLog, getColor, getSdk, homeDirLog, proxyLog, retrylog, verboseLog } from "./command-utils";
import { getMindConnectAgent } from "./mc-upload-file";
import ora = require("ora");

let color = getColor("cyan");
let adminColor = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("create-event")
        .alias("ce")
        .option("-c, --config <agentconfig>", "config file with agent configuration")
        .option(
            "-r, --cert [privatekey]",
            "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
        )
        .option("-i, --assetid <assetid>", "asset id from the mindsphere  (default: send event to the agent)")
        .option("-y, --sourceType <sourceType>", "Source Type", "MindConnect-Agent")
        .option("-S, --sourceId <sourceId>", "Source Id", os.hostname() || "")
        .option("-O, --source <source>", "Source", "MindConnect-NodeJs CLI")
        .option("-V, --severity <severity>", "Severity (20:Error, 30:Warning , 40:information)", "20")
        .option("-d, --desc <description>", "Event description", "CLI created event")
        .option("-t, --timestamp <timestamp>", "Timestamp", new Date().toISOString())
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option(
            "-p, --passkey <passkey>",
            `passkey (optional, event creation uses ${adminColor("service credentials *")})`
        )
        .option("-v, --verbose", "verbose output")
        .description(`${color("create an event in the mindsphere")} ${adminColor("(optional: passkey) *")}`)
        .action((options) => {
            (async () => {
                try {
                    adminColor = adjustColor(adminColor, options);
                    color = options.config === undefined ? adminColor : color;
                    checkParameters(options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const spinner = ora("creating event");
                    !options.verbose && spinner.start();

                    if (options.config) {
                        const configFile = path.resolve(options.config);
                        verboseLog(
                            `Event upload using the agent configuration stored in: ${color(configFile)}.`,
                            options.verbose
                        );
                        if (!fs.existsSync(configFile)) {
                            throw new Error(`Can't find file ${configFile}`);
                        }
                    }
                    let uploader: MindConnectAgent | EventManagementClient;
                    let assetid = options.assetid;

                    if (options.config) {
                        ({ assetid, uploader } = await getMindConnectAgent(assetid, options, spinner, color));
                    } else {
                        uploader = getEventManager(options);
                    }

                    const event = {
                        entityId: assetid, // use assetid if you want to send event somewhere else :)
                        sourceType: options.sourceType,
                        sourceId: options.sourceId,
                        source: options.source,
                        severity: parseInt(options.severity), // 0-99 : 20:error, 30:warning, 40: information
                        timestamp: options.timestamp,
                        description: options.desc,
                    };

                    verboseLog(`creating event : ${JSON.stringify(event)}`, options.verbose, spinner);
                    verboseLog(`AssetId ${assetid}`, options.verbose, spinner);
                    verboseLog(
                        options.assetid === undefined ? "Sending event to agent." : "Sending event to another asset.",
                        options.verbose,
                        spinner
                    );

                    await retry(options.retry, () => uploader.PostEvent(event), 300, retrylog("PostEvent"));

                    !options.verbose && spinner.succeed("Done");

                    log(`Your event with severity ${color(event.severity + "")} was succesfully created.`);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc create-event \t\t\t\t create error event with default values and current timestamp`);
            log(`    mc ce --desc Warning! --severity 30 \t create warning with description warning`);
            log(`    mc ce --desc \"custom event\" --i 123....4 \t create error event for asset with id 123....4`);
        });
};

function getEventManager(options: any) {
    const sdk = getSdk(options);
    const uploader = sdk.GetEventManagementClient();
    return uploader;
}
function checkParameters(options: any) {
    options.passkey &&
        !options.assetid &&
        errorLog(" You have to specify assetid when using service credential upload", true);
}
