import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindConnectAgent, MindConnectSetup } from "../..";
import { OnboardingStatus, OnlineStatus } from "../../api/mindconnect-models";
import {
    checkCertificate,
    decrypt,
    errorLog,
    getHomeDotMcDir,
    homeDirLog,
    loadAuth,
    proxyLog,
    retry,
    retrylog,
    verboseLog
} from "../../api/utils";
import { serviceCredentialLog } from "./command-utils";

export default (program: CommanderStatic) => {
    program
        .command("agent-status")
        .alias("as")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option("-k, --passkey <passkey>", "passkey")
        .option(
            "-r, --cert [privatekey]",
            "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
        )
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-v, --verbose", "verbose output")
        .description(chalk.magentaBright(`displays the agent status and agent onboarding status *`))
        .action(options => {
            (async () => {
                try {
                    homeDirLog(options.verbose, chalk.magentaBright);
                    proxyLog(options.verbose, chalk.magentaBright);

                    const configFile = path.resolve(options.config);
                    verboseLog(
                        `Agent Status for the agent configuration in: ${chalk.magentaBright(configFile)}.`,
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

                    coloredStatusLog(agent);

                    if (!options.passkey) {
                        errorLog(
                            "you have to provide a passkey to get mindsphere boarding status and online status (run mc as --help for full description)",
                            true
                        );
                    }

                    const auth = loadAuth();
                    const setup = new MindConnectSetup(auth.gateway, decrypt(auth, options.passkey), auth.tenant);
                    let onlinestatus: OnlineStatus | undefined;

                    await retry(
                        options.retry,
                        async () => (onlinestatus = await setup.GetAgentStatus(agent.ClientId())),
                        300,
                        retrylog("GetAgentStatus")
                    );
                    onlineLog(onlinestatus);

                    let boardingstatus: OnboardingStatus | undefined;
                    await retry(
                        options.retry,
                        async () => (boardingstatus = await setup.GetBoardingStatus(agent.ClientId())),
                        300,
                        retrylog("GetBoardingStatus")
                    );
                    if (boardingstatus && boardingstatus.status) {
                        coloredBoardingStatusLog(boardingstatus);
                    }

                    if (agent.HasDataSourceConfiguration()) {
                        verboseLog(chalk.magentaBright("Data Source Configuration\n"), options.verbose);
                        verboseLog(JSON.stringify(await agent.GetDataSourceConfiguration(), null, 2), options.verbose);
                    }

                    if (agent.HasDataMappings()) {
                        verboseLog(chalk.magentaBright("Data Mappings\n"), options.verbose);
                        verboseLog(JSON.stringify(await agent.GetDataMappings(), null, 2), options.verbose);
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc agent-status   \t\t\t\t\tuses default ${chalk.magentaBright("agentconfig.json")}`);
            log(`    mc agent-status --config agent.json \t\tuses specified configuration file`);
            log(`    mc agent-status --cert private.key \t\t\tuses specified key for RSA_3072 profile`);
            log(`    mc agent-status --passkey mypasskey \t\tdisplays also the online agent information`);
            log(
                `    mc agent-status --passkey mypasskey --verbose \tdisplays additionally the mappings and configuration`
            );
            serviceCredentialLog();
        });
};

const coloredStatusLog = (agent: MindConnectAgent) => {
    log(
        `\nAgent status, local information (from .mc folder):\nAgent Id: ${chalk.magentaBright(agent.ClientId())} is ${
            agent.IsOnBoarded() ? chalk.magentaBright("onboarded") : chalk.redBright("not onboarded")
        }, data source is ${
            agent.HasDataSourceConfiguration() ? chalk.magentaBright("configured") : chalk.redBright("not configured")
        }, mappings are ${
            agent.HasDataMappings() ? chalk.magentaBright("configured") : chalk.redBright("not configured")
        }.`
    );
};

const coloredBoardingStatusLog = (boardingstatus: OnboardingStatus) => {
    let color;
    if (boardingstatus.status === OnboardingStatus.StatusEnum.ONBOARDING) {
        color = chalk.yellowBright;
    } else if (boardingstatus.status === OnboardingStatus.StatusEnum.NOTONBOARDED) {
        color = chalk.redBright;
    } else {
        color = chalk.greenBright;
    }
    log(`Agent is ${color("" + boardingstatus.status)}.`);
};

const onlineLog = (onlinestatus: OnlineStatus | undefined) => {
    if (onlinestatus) {
        log(
            `Online Status: ${
                onlinestatus.status === OnlineStatus.StatusEnum.OFFLINE
                    ? chalk.redBright("OFFLINE")
                    : chalk.greenBright("ONLINE")
            } since: ${chalk.magentaBright(onlinestatus.since)}`
        );
    }
};
