import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindConnectAgent, retry } from "../../";
import { checkCertificate, getAgentDir, throwError } from "../../api/utils";
import { errorLog, getColor, homeDirLog, proxyLog, retrylog, verboseLog } from "./command-utils";

const color = getColor("cyan");

export default (program: CommanderStatic) => {
    program
        .command("configure-agent")
        .alias("co")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option(
            "-r, --cert [privatekey]",
            "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
        )
        .option("-m, --mode [configure | print]", "command mode", "configure")
        .option("-i, --assetid <assetid>", "target assetid")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(
            color("create data source configuration and mappings automatically for the specified agent and asset")
        )
        .action((options) => {
            (async () => {
                try {
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const configFile = path.resolve(options.config);
                    verboseLog(`agent configuration in: ${color(configFile)}.`, options.verbose);
                    if (!fs.existsSync(configFile)) {
                        throw new Error(`Can't find file ${configFile}`);
                    }
                    const configuration = require(configFile);
                    const profile = checkCertificate(configuration, options);
                    const agentFolder = getAgentDir(path.dirname(options.config));
                    verboseLog(`Using .mc folder for agent: ${color(agentFolder)}`, options.verbose);

                    const agent = new MindConnectAgent(configuration, undefined, agentFolder);
                    if (profile) {
                        agent.SetupAgentCertificate(fs.readFileSync(options.cert));
                    }

                    if (!agent.IsOnBoarded()) {
                        await retry(options.retry, () => agent.OnBoard(), 300, retrylog("OnBoard"));
                        log(`Your agent with id ${color(agent.ClientId())} was succesfully onboarded.`);
                    } else {
                        log(`Your agent with id ${color(agent.ClientId())} was already onboarded.`);
                        verboseLog(
                            `Offboard the agent in the mindsphere UI and delete the .mc/${color(
                                agent.ClientId() + ".json"
                            )} file to onboard again.`,
                            options.verbose
                        );
                    }

                    if (options.mode === "configure") {
                        !options.assetid &&
                            throwError("you have to specifiy the assetid for the automatic configuration");

                        await agent.ConfigureAgentForAssetId(options.assetid, "DESCRIPTIVE", true);

                        verboseLog(JSON.stringify(await agent.GetDataSourceConfiguration(), null, 2), options.verbose);
                        verboseLog(JSON.stringify(await agent.GetDataMappings(), null, 2), options.verbose);
                        console.log(
                            `Agent with ${color(agent.ClientId())} was successfully mapped to ${color(options.assetid)}`
                        );
                    } else if (options.mode === "print") {
                        console.log(JSON.stringify(await agent.GetDataSourceConfiguration(), null, 2));
                        console.log(JSON.stringify(await agent.GetDataMappings(), null, 2));
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc configure-agent --config agent.json --assetid 1234567...89 \tconfigures agent automatically to send the data to specified assetid`
            );
            log(
                `    mc configure-agent --config agent.json --mode print \t\tprints data source configuration and mappings`
            );
        });
};
