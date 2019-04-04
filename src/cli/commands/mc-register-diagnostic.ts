import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindConnectSetup } from "../..";
import { decrypt, errorLog, homeDirLog, loadAuth, proxyLog, verboseLog } from "../../api/utils";

export default (program: CommanderStatic) => {
    program
        .command("register-diagnostic")
        .alias("rd")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output")
        .description(chalk.magentaBright("register agent for diagnostic *"))
        .action(options => {
            (async () => {
                try {
                    if (!options.passkey) {
                        errorLog("you have to provide a passkey (run mc rd --help for full description)", true);
                    }
                    homeDirLog(options.verbose);
                    proxyLog(options.verbose);

                    const auth = loadAuth();
                    const setup = new MindConnectSetup(auth.gateway, decrypt(auth, options.passkey), auth.tenant);
                    const configFile = path.resolve(options.config);
                    if (!fs.existsSync(configFile)) {
                        throw new Error(`Can't find file ${configFile}`);
                    }
                    const configuration = require(configFile);
                    verboseLog(
                        `registering for diagnostic with agent id ${chalk.magentaBright(
                            configuration.content.clientId
                        )}`,
                        options.verbose
                    );
                    await setup.RegisterForDiagnostic(configuration.content.clientId);
                    verboseLog(
                        `successfully registered the agent with agent id ${chalk.magentaBright(
                            configuration.content.clientId
                        )} for diagnostic`,
                        true
                    );
                } catch (err) {
                    verboseLog(
                        chalk.magentaBright("This operation requires additionaly the service credentials."),
                        options.verbose
                    );
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log(`\n  Examples:\n`);
            log(`    mc rd -k mypasskey`);
            log(`    mc register-diagnostic --config someagent.json -passkey mypasskey`);
            log(`\n  Important:\n`);
            log(
                `    you need to supply the ${chalk.magentaBright(
                    "service credentials"
                )} for this operation and provide the passkey \n`
            );
            log(`    how to get service credentials:`);
            log(
                chalk.magentaBright(
                    `    https://developer.mindsphere.io/howto/howto-selfhosted-api-access.html#creating-service-credentials`
                )
            );
        });
};
