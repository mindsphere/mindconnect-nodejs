import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindConnectSetup } from "../..";
import { decrypt, errorLog, homeDirLog, loadAuth, proxyLog, verboseLog } from "../../api/utils";
import { getColor, serviceCredentialLog } from "./command-utils";

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("unregister-diagnostic")
        .alias("ud")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output")
        .description(color("unregister agent from diagnostic *"))
        .action(options => {
            (async () => {
                try {
                    if (!options.passkey) {
                        errorLog("you have to provide a passkey (run mc ud --help for full description)", true);
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
                        `unregistering from diagnostic with agent id ${color(configuration.content.clientId)}`,
                        options.verbose
                    );
                    await setup.DeleteDiagnostic(configuration.content.clientId);
                    verboseLog(
                        `successfully unregistered the agent with agent id ${color(
                            configuration.content.clientId
                        )} from diagnostic`,
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
