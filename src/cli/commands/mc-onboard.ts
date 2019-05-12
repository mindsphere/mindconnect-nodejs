import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindConnectAgent, retry } from "../../";
import {
    checkCertificate,
    errorLog,
    getHomeDotMcDir,
    homeDirLog,
    proxyLog,
    retrylog,
    verboseLog
} from "../../api/utils";
import { getColor } from "./command-utils";

const color = getColor("cyan");

export default (program: CommanderStatic) => {
    program
        .command("onboard")
        .alias("ob")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option(
            "-r, --cert [privatekey]",
            "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
        )
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-v, --verbose", "verbose output")
        .description(color("onboard the agent with configuration stored in the config file"))
        .action(options => {
            (async () => {
                try {
                    homeDirLog(options.verbose);
                    proxyLog(options.verbose);

                    const configFile = path.resolve(options.config);
                    verboseLog(
                        `Onboarding the agent using the configuration stored in: ${color(configFile)}.`,
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
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc ob   \t\t\t\tuses default ${color("agentconfig.json")}`);
            log(`    mc onboard --config agent.json \tuses specified configuration file`);
            log(`    mc onboard --config agent.json --cert private.key \tuses specified key for RSA_3072 profile`);
        });
};
