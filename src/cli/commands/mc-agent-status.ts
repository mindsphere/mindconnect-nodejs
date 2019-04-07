import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindConnectAgent } from "../..";
import { checkCertificate, errorLog, getHomeDotMcDir, homeDirLog, proxyLog, verboseLog } from "../../api/utils";

export default (program: CommanderStatic) => {
    program
        .command("agent-status")
        .alias("as")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option(
            "-r, --cert [privatekey]",
            "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
        )
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-v, --verbose", "verbose output")
        .description(chalk.cyanBright("displays the agent status"))
        .action(options => {
            (async () => {
                try {
                    homeDirLog(options.verbose);
                    proxyLog(options.verbose);

                    const configFile = path.resolve(options.config);
                    verboseLog(
                        `Agent Status for the agent configuration in: ${chalk.cyanBright(configFile)}.`,
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

                    log(`Agent Id: ${chalk.cyanBright(agent.ClientId())}: `);
                    log(
                        `boarding status: ${
                            agent.IsOnBoarded() ? chalk.cyanBright("onboarded") : chalk.redBright("not onboarded")
                        }`
                    );
                    log(
                        `configuration status: ${
                            agent.HasDataSourceConfiguration()
                                ? chalk.cyanBright("configured")
                                : chalk.redBright("not configured")
                        }`
                    );
                    log(
                        `mappings status: ${
                            agent.HasDataMappings() ? chalk.cyanBright("configured") : chalk.redBright("not configured")
                        }`
                    );

                    if (agent.HasDataSourceConfiguration()) {
                        const configuration = await agent.GetDataSourceConfiguration();
                        // TODO: add better display of data
                        verboseLog(JSON.stringify(await agent.GetDataSourceConfiguration(), null, 2), options.verbose);
                    }

                    if (agent.HasDataMappings()) {
                        // TODO: add better display of mappings
                        verboseLog(await agent.GetDataMappings(), options.verbose);
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc agent-status   \t\t\t\tuses default ${chalk.cyanBright("agentconfig.json")}`);
            log(`    mc agent-status --config agent.json \tuses specified configuration file`);
            log(`    mc agent-status --config agent.json --cert private.key \tuses specified key for RSA_3072 profile`);
        });
};
