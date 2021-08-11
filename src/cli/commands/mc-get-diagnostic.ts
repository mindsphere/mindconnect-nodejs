import * as chalk from "chalk";
import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { DiagnosticInformation } from "../..";
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

export default (program: Command) => {
    program
        .command("get-diagnostic")
        .alias("gd")
        .option("-c, --config <agentconfig>", "config file with agent configuration")
        .option("-a, --agentid <agentid>", "agent id")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-l, --all", "display all entries not just the last page")
        .option("-j, --json", "json output")
        .option("-t, --text", "text (raw) output")
        .option("-v, --verbose", "verbose output")
        .description(color("get diagnostic information *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const mcApiclient = sdk.GetMindConnectApiClient();
                    let agentid = options.agentid;

                    const configFile = path.resolve(options.config);

                    if (fs.existsSync(configFile)) {
                        const configuration = require(configFile);
                        agentid = configuration.content.clientId;
                        verboseLog(
                            `getting diagnostic data for agent with agent id ${color(agentid)}`,
                            options.verbose
                        );
                    }
                    const activations = await mcApiclient.GetDiagnosticActivations();
                    log(`There are ${color(activations.content.length + " agent(s)")} registered for diagnostic`);
                    verboseLog(JSON.stringify(activations.content), options.verbose);

                    function printDiagnosticInformation(diag: DiagnosticInformation[], options: any) {
                        for (const iterator of diag) {
                            const element = <any>iterator;

                            if (options.json) {
                                log(element);
                            } else if (options.text) {
                                log(
                                    `${element.timestamp},${element.severity},${element.agentId},${element.correlationId},${element.state},${element.source},${element.message}`
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

                    const information = await mcApiclient.GetAllDiagnosticInformation(
                        agentid,
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
function checkRequiredParamaters(options: any) {
    !options.agentid &&
        !options.config &&
        errorLog("you have to provide a filename for the agent configuration or assetid of the agent", true);

    !options.agentid &&
        options.config &&
        !fs.existsSync(options.config) &&
        throwError(`the config file ${color(options.config)} doesn't exist.`);
}
