import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindConnectSetup } from "../..";
import { decrypt, loadAuth } from "../../api/utils";
import { errorLog, getColor, homeDirLog, proxyLog, serviceCredentialLog, verboseLog } from "./command-utils";

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("register-diagnostic")
        .alias("rd")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output")
        .description(color("register agent for diagnostic *"))
        .action(options => {
            (async () => {
                try {
                    if (!options.passkey) {
                        errorLog("you have to provide a passkey (run mc rd --help for full description)", true);
                    }
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const auth = loadAuth();
                    const setup = new MindConnectSetup(auth.gateway, decrypt(auth, options.passkey), auth.tenant);
                    const configFile = path.resolve(options.config);
                    if (!fs.existsSync(configFile)) {
                        throw new Error(`Can't find file ${configFile}`);
                    }
                    const configuration = require(configFile);
                    verboseLog(
                        `registering for diagnostic with agent id ${color(configuration.content.clientId)}`,
                        options.verbose
                    );
                    await setup.RegisterForDiagnostic(configuration.content.clientId);
                    verboseLog(
                        `successfully registered the agent with agent id ${color(
                            configuration.content.clientId
                        )} for diagnostic`,
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
            log(`    mc rd -k mypasskey`);
            log(`    mc register-diagnostic --config someagent.json -passkey mypasskey`);
            serviceCredentialLog();
        });
};
