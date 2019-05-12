import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindConnectAgent } from "../..";
import { AgentManagementModels, MindSphereSdk } from "../../api/sdk";
import { checkCertificate, decrypt, getHomeDotMcDir, retry, loadAuth } from "../../api/utils";
import {
    errorLog,
    getColor,
    homeDirLog,
    proxyLog,
    retrylog,
    serviceCredentialLog,
    verboseLog
} from "./command-utils";

const color = getColor("magenta");
const green = getColor("green");
const red = getColor("red");
const yellow = getColor("yellow");

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
        .description(color(`displays the agent status and agent onboarding status *`))
        .action(options => {
            (async () => {
                try {
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const configFile = path.resolve(options.config);
                    verboseLog(`Agent Status for the agent configuration in: ${color(configFile)}.`, options.verbose);

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
                    const sdk = new MindSphereSdk(auth.gateway, decrypt(auth, options.passkey), auth.tenant);
                    const agentMgmt = sdk.GetAgentManagementClient();

                    const onlinestatus = await retry(
                        options.retry,
                        async () => await agentMgmt.GetAgentOnlineStatus(agent.ClientId()),
                        300,
                        retrylog("GetAgentStatus")
                    );
                    onlineLog(onlinestatus);

                    const boardingstatus = await retry(
                        options.retry,
                        async () => await agentMgmt.GetOnboardingStatus(agent.ClientId()),
                        300,
                        retrylog("GetBoardingStatus")
                    );

                    const { status } = boardingstatus;

                    if (status) {
                        coloredBoardingStatusLog(boardingstatus);
                    }

                    if (status === "ONBOARDED" && agent.HasDataSourceConfiguration()) {
                        verboseLog(color("Data Source Configuration\n"), options.verbose);
                        verboseLog(JSON.stringify(await agent.GetDataSourceConfiguration(), null, 2), options.verbose);
                    }

                    if (status === "ONBOARDED" && agent.HasDataMappings()) {
                        console.log("BLBB");
                        verboseLog(color("Data Mappings\n"), options.verbose);
                        verboseLog(JSON.stringify(await agent.GetDataMappings(), null, 2), options.verbose);
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc agent-status   \t\t\t\t\tuses default ${color("agentconfig.json")}`);
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
        `\nAgent status, local information (from .mc folder):\nAgent Id: ${color(agent.ClientId())} is ${
            agent.IsOnBoarded() ? green("onboarded") : red("not onboarded")
        }, data source is ${
            agent.HasDataSourceConfiguration() ? green("configured") : red("not configured")
        }, mappings are ${agent.HasDataMappings() ? green("configured") : red("not configured")}.`
    );
};

const coloredBoardingStatusLog = (boardingstatus: AgentManagementModels.OnboardingStatus) => {
    let color;
    if (boardingstatus.status === AgentManagementModels.OnboardingStatus.StatusEnum.ONBOARDING) {
        color = yellow;
    } else if (boardingstatus.status === AgentManagementModels.OnboardingStatus.StatusEnum.NOTONBOARDED) {
        color = red;
    } else {
        color = green;
    }
    log(`Agent is ${color("" + boardingstatus.status)}.`);
};

const onlineLog = (onlinestatus?: AgentManagementModels.OnlineStatus) => {
    if (onlinestatus) {
        log(
            `Online Status: ${
                onlinestatus.status === AgentManagementModels.OnlineStatus.StatusEnum.OFFLINE
                    ? red("OFFLINE")
                    : green("ONLINE")
            } since: ${color("" + onlinestatus.since)}`
        );
    }
};
