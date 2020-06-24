import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { IMindConnectConfiguration } from "../..";
import { throwError } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    proxyLog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";

let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("unregister-diagnostic")
        .alias("ud")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option("-i, --agentid <agentid>", "agent id")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output")
        .description(color("unregister agent from diagnostic *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    let agentid = options.agentid;
                    const mcApiClient = sdk.GetMindConnectApiClient();
                    if (options.config) {
                        const configFile = path.resolve(options.config);
                        const configuration = require(configFile) as IMindConnectConfiguration;
                        agentid = configuration.content.clientId;
                        agentid || throwError("invalid configuration in the file");
                    }

                    verboseLog(`unregistering from diagnostic with agent id ${color(agentid)}`, options.verbose);

                    await mcApiClient.DeleteDiagnosticActivation(agentid);
                    verboseLog(
                        `successfully unregistered the agent with agent id ${color(agentid)} from diagnostic`,
                        true
                    );
                } catch (err) {
                    verboseLog(color("This operation requires additionaly the service credentials."), options.verbose);
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log(`\n  Examples:\n`);
            log(`    mc ud -k mypasskey`);
            log(`    mc unregister-diagnostic --config someagent.json -passkey mypasskey`);
            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    !options.agentid &&
        !options.config &&
        errorLog("you have to provide a filename for the agent configuration or assetid of the agent", true);

    !options.agentid &&
        options.config &&
        !fs.existsSync(options.config) &&
        throwError(`the config file ${color(options.config)} doesn't exist.`);
}
