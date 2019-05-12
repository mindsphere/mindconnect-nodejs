import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { DiagnosticInformation, MindConnectSetup } from "../..";
import { decrypt, errorLog, homeDirLog, loadAuth, proxyLog, verboseLog } from "../../api/utils";
import { getColor, serviceCredentialLog } from "./command-utils";

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("get-diagnostic")
        .alias("gd")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-a, --all", "display all entries not just the last page")
        .option("-j, --json", "json output")
        .option("-t, --text", "text (raw) output")
        .option("-v, --verbose", "verbose output")
        .description(color("get diagnostic information *"))
        .action(options => {
            (async () => {
                try {
                    if (!options.passkey) {
                        errorLog("you have to provide a passkey (run mc gd --help for full description)", true);
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
                        `getting diagnostic data for agent with agent id ${color(configuration.content.clientId)}`,
                        options.verbose
                    );

                    const activations = await setup.GetDiagnosticActivations();
                    log(`There are ${color(activations.content.length + " agent(s)")} registered for diagnostic`);
                    verboseLog(JSON.stringify(activations.content), options.verbose);

                    function printDiagnosticInformation(diag: DiagnosticInformation[], options: any) {
                        for (const iterator of diag) {
                            const element = <any>iterator;

                            if (options.json) {
                                log(element);
                            } else if (options.text) {
                                log(
                                    `${element.timestamp},${element.severity},${element.agentId},${
                                        element.correlationId
                                    },${element.state},${element.source},${element.message}`
                                );
                            } else {
                                log(
                                    `${chalk.cyanBright(element.timestamp)} ${chalk.greenBright(
                                        element.severity
                                    )} ${color(element.source)} ${element.message}`
                                );
                            }
                        }
                    }
                    const information = await setup.GetDiagnosticInformation(
                        configuration.content.clientId,
                        printDiagnosticInformation,
                        options,
                        !options.all
                    );
                    log(`There are ${color(information.totalElements + " ")}total log entries`);
                } catch (err) {
                    verboseLog(color("This operation requires additionaly the service credentials."), options.verbose);
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log(`\n  Examples: \n`);
            log(`    mc gd -k mypasskey`);
            log(`    mc get-diagnostic --config someagent.json --passkey mypasskey`);
            log(`    mc get-diagnostic --passkey mypasskey --text --all > log.csv`);
            serviceCredentialLog();
        });
};
