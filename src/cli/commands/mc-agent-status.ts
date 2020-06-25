import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindConnectAgent } from "../..";
import { AgentManagementModels } from "../../api/sdk";
import { checkCertificate, getAgentDir, retry } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    proxyLog,
    retrylog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";

let color = getColor("magenta");
const green = getColor("green");
const red = getColor("red");
const yellow = getColor("yellow");

export default (program: CommanderStatic) => {
    program
        .command("agent-status")
        .alias("as")
        .option("-c, --config <agentconfig>", "config file with agent configuration")
        .option("-a, --agentid <agentid>", "agentid")
        .option("-k, --passkey <passkey>", "passkey")
        .option(
            "-r, --cert [privatekey]",
            "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
        )
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`displays the agent status and agent onboarding status *`))
        .action((options) => {
            (async () => {
                try {
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    let agentid = options.agentid;
                    if (options.config) {
                        const configFile = path.resolve(options.config);
                        verboseLog(
                            `Agent Status for the agent configuration in: ${color(configFile)}.`,
                            options.verbose
                        );

                        if (!fs.existsSync(configFile)) {
                            throw new Error(`Can't find file ${configFile}`);
                        }

                        const agentFolder = getAgentDir(path.dirname(options.config));
                        verboseLog(`Using .mc folder for agent: ${color(agentFolder)}`, options.verbose);

                        const configuration = require(configFile);
                        const profile = checkCertificate(configuration, options);
                        const agent = new MindConnectAgent(configuration, undefined, agentFolder);
                        if (profile) {
                            agent.SetupAgentCertificate(fs.readFileSync(options.cert));
                        }

                        agentid = agent.ClientId();
                        coloredStatusLog(agent);
                    }

                    const sdk = getSdk(options);
                    color = adjustColor(color, options);

                    const agentMgmt = sdk.GetAgentManagementClient();

                    const onlinestatus = await retry(
                        options.retry,
                        async () => await agentMgmt.GetAgentOnlineStatus(agentid),
                        300,
                        retrylog("GetAgentStatus")
                    );
                    onlineLog(onlinestatus);

                    const boardingstatus = await retry(
                        options.retry,
                        async () => await agentMgmt.GetOnboardingStatus(agentid),
                        300,
                        retrylog("GetBoardingStatus")
                    );

                    const { status } = boardingstatus;

                    if (status) {
                        coloredBoardingStatusLog(boardingstatus);
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
