import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { retry } from "../..";
import { IMindConnectConfiguration } from "../../api/mindconnect-models";
import { MindSphereSdk } from "../../api/sdk";
import { decrypt, loadAuth, throwError } from "../../api/utils";
import {
    agentConfigLog,
    errorLog,
    getColor,
    homeDirLog,
    proxyLog,
    retrylog,
    serviceCredentialLog,
} from "./command-utils";

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("offboard-agent")
        .alias("of")
        .option("-c, --config <agentconfig>", "config file for agent configuration")
        .option("-i, --agentid <agentid>", "agent id")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-v, --verbose", "verbose output")
        .description(color("offboards the agent in the mindsphere *"))
        .action((options) => {
            (async () => {
                try {
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);
                    checkRequiredParamaters(options);

                    const auth = loadAuth();
                    const sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, options.passkey) });

                    let agentid = options.agentid;

                    if (options.config) {
                        const configFile = path.resolve(options.config);
                        const configuration = require(configFile) as IMindConnectConfiguration;
                        agentid = configuration.content.clientId;
                        agentid || throwError("invalid configuration in the file");
                    }

                    const ag = sdk.GetAgentManagementClient();

                    await retry(
                        options.retry,
                        () => ag.OffboardAgent(`${agentid}`),
                        500,
                        retrylog("OffboardAgent", color)
                    );

                    console.log(`\nAgent offboarded`);
                    console.log(`Run ${color("mc agent-status")} command to see the status of your agent`);
                    console.log(
                        `You have to run ${color("mc renew-agent")} command before you can onboard this agent again!`
                    );

                    agentConfigLog({
                        gateway: sdk.GetGateway(),
                        host: "gateway",
                        tenant: sdk.GetTenant(),
                        agentid,
                        color,
                    });
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc offboard-agent --config agent.json --passkey passkey... \t offboard agent with agent.json configuration`
            );
            log(
                `    mc offboard-agent --agentid 12345..ef --passkey passkey... \t offboard agent with 12345..ef agentid`
            );
            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    !options.passkey &&
        errorLog("you have to provide a passkey to offboard an agent (run mc of --help for full description)", true);

    !options.agentid &&
        !options.config &&
        errorLog("you have to provide a filename for the agent configuration or assetid of the agent", true);

    !options.agentid &&
        options.config &&
        !fs.existsSync(options.config) &&
        throwError(`the config file ${color(options.config)} doesn't exist.`);
}
