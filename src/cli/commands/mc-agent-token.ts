import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindConnectAgent } from "../..";
import {
    checkCertificate,
    errorLog,
    getHomeDotMcDir,
    homeDirLog,
    proxyLog,
    retry,
    retrylog,
    verboseLog
} from "../../api/utils";

export default (program: CommanderStatic) => {
    program
        .command("agent-token")
        .alias("at")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option("-k, --passkey <passkey>", "passkey")
        .option(
            "-r, --cert [privatekey]",
            "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
        )
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-v, --verbose", "verbose output")
        .description(chalk.cyanBright(`displays agent token for use in other tools e.g. postman`))
        .action(options => {
            (async () => {
                try {
                    homeDirLog(options.verbose, chalk.cyanBright);
                    proxyLog(options.verbose, chalk.cyanBright);

                    const configFile = path.resolve(options.config);
                    verboseLog(
                        `Agent Token for the agent configuration in: ${chalk.cyanBright(configFile)}.`,
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
                    await retry(
                        options.retry,
                        async () => log(await agent.GetAgentToken()),
                        300,
                        retrylog("GetAgentToken")
                    );
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc agent-token   \t\t\t\tuses default ${chalk.cyanBright("agentconfig.json")}`);
            log(`    mc agent-token --config agent.json \t\tuses specified configuration file`);
            log(`    mc agent-token --cert private.key \t\tuses specified key for RSA_3072 profile`);
                 
        });
};