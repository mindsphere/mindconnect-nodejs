import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { IMindConnectConfiguration } from "../../api/mindconnect-models";
import { MindSphereSdk } from "../../api/sdk";
import { decrypt, errorLog, homeDirLog, loadAuth, proxyLog, throwError, verboseLog } from "../../api/utils";
import { agentConfigLog, getColor, serviceCredentialLog } from "./command-utils";

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("renew-agent")
        .alias("rn")
        .option("-c, --config <agentconfig>", "config file for agent configuration")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-v, --verbose", "verbose output")
        .description(color("renews the agent secrets  *"))
        .action(options => {
            (async () => {
                try {
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);
                    checkRequiredParamaters(options);

                    const auth = loadAuth();
                    const sdk = new MindSphereSdk({
                        tenant: auth.tenant,
                        gateway: auth.gateway,
                        basicAuth: decrypt(auth, options.passkey)
                    });

                    const configFile = path.resolve(options.config);
                    const configuration = require(configFile) as IMindConnectConfiguration;
                    const agentid = configuration.content.clientId;
                    agentid || throwError("invalid configuration in the file");

                    const ag = sdk.GetAgentManagementClient();

                    const bc = await ag.GetBoardingConfiguration(`${agentid}`, { retry: options.retry });

                    verboseLog(JSON.stringify(bc), options.verbose);

                    !bc.content && throwError("Invalid configuration recieved from mindsphere.");

                    console.log(`\nAgent configuration renewed`);

                    fs.writeFileSync(options.config, JSON.stringify(bc));

                    agentConfigLog({
                        gateway: sdk.GetGateway(),
                        host: "gateway",
                        tenant: sdk.GetTenant(),
                        agentid,
                        color
                    });
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc renew-agent --config agent.json --passkey passkey... \t renew agent secrets in agent.json configuration`
            );
            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    !options.passkey &&
        errorLog(
            "you have to provide a passkey to get the service token (run mc rn --help for full description)",
            true
        );
    !options.config && errorLog("you have to provide a filename for the agent configuration", true);
    !fs.existsSync(options.config) && throwError(`the config file ${color(options.config)} doesn't exist.`);
}
