import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { MindConnectAgent, MindsphereStandardEvent, retry } from "../..";
import { checkCertificate, getHomeDotMcDir } from "../../api/utils";
import { errorLog, getColor, homeDirLog, proxyLog, retrylog, verboseLog } from "./command-utils";

const color = getColor("cyan");

export default (program: CommanderStatic) => {
    program
        .command("create-event")
        .alias("ce")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option(
            "-r, --cert [privatekey]",
            "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
        )
        .option("-i, --assetid <assetid>", "asset id from the mindsphere  (default: send event to the agent)")
        .option("-y, --sourceType <sourceType>", "Source Type", "MindConnect-Agent")
        .option("-S, --sourceId <sourceId>", "Source Id", os.hostname() || "")
        .option("-O, --source <source>", "Source", "MindConnect-NodeJs CLI")
        .option("-V, --severity <severity>", "Severity (20:Error, 30:Warning , 40:information)", 20)
        .option("-d, --desc <description>", "Event description", "CLI created event")
        .option("-t, --timestamp <timestamp>", "Timestamp", new Date().toISOString())
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-v, --verbose", "verbose output")
        .description(color("create an event in the mindsphere"))
        .action(options => {
            (async () => {
                try {
                    homeDirLog(options.verbose);
                    proxyLog(options.verbose);

                    const configFile = path.resolve(options.config);
                    verboseLog(
                        `Event upload using the agent configuration stored in: ${color(configFile)}.`,
                        options.verbose
                    );
                    if (!fs.existsSync(configFile)) {
                        throw new Error(`Can't find file ${configFile}`);
                    }

                    const configuration = require(configFile);
                    const profile = checkCertificate(configuration, options);
                    const agent = new MindConnectAgent(configuration, undefined, getHomeDotMcDir());
                    if (profile) {
                        agent.SetupAgentCertificate(fs.readFileSync(options.cert));
                    }

                    if (!agent.IsOnBoarded()) {
                        await retry(options.retry, () => agent.OnBoard(), 300, retrylog("OnBoard"));
                        log(color(`Your agent with id ${agent.ClientId()} was succesfully onboarded.`));
                    }

                    if (!agent.HasDataSourceConfiguration()) {
                        await retry(
                            options.retry,
                            () => agent.GetDataSourceConfiguration(),
                            300,
                            retrylog("GetDataSourceConfiguration")
                        );
                        verboseLog("Getting client configuration", options.verbose);
                    }

                    const assetid = options.assetid || agent.ClientId();

                    const event: MindsphereStandardEvent = {
                        entityId: assetid, // use assetid if you want to send event somewhere else :)
                        sourceType: options.sourceType,
                        sourceId: options.sourceId,
                        source: options.source,
                        severity: parseInt(options.severity), // 0-99 : 20:error, 30:warning, 40: information
                        timestamp: options.timestamp,
                        description: options.desc
                    };

                    verboseLog(`creating event : ${JSON.stringify(event)}`, options.verbose);

                    await retry(options.retry, () => agent.PostEvent(event), 300, retrylog("PostEvent"));

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
