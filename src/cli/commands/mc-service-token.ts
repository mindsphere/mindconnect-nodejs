import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as jwt from "jsonwebtoken";
import { MindConnectSetup } from "../..";
import { decrypt, errorLog, homeDirLog, loadAuth, proxyLog, retry, retrylog, verboseLog } from "../../api/utils";
import { serviceCredentialLog } from "./command-utils";

export default (program: CommanderStatic) => {
    program
        .command("service-token")
        .alias("stk")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-v, --verbose", "verbose output")
        .description(chalk.magentaBright(`displays the service token for use in other tools (e.g. postman) `))
        .action(options => {
            (async () => {
                try {
                    homeDirLog(options.verbose, chalk.magentaBright);
                    proxyLog(options.verbose, chalk.magentaBright);

                    if (!options.passkey) {
                        errorLog(
                            "you have to provide a passkey to get the service token (run mc stk --help for full description)",
                            true
                        );
                    }
                    const auth = loadAuth();
                    const setup = new MindConnectSetup(auth.gateway, decrypt(auth, options.passkey), auth.tenant);

                    verboseLog("encoded token:\n", options.verbose);
                    let token: string = "";
                    await retry(
                        options.retry,
                        async () => (token = await setup.GetServiceToken()),
                        300,
                        retrylog("GetServiceToken")
                    );

                    log(token);
                    verboseLog("decoded token:\n", options.verbose);
                    verboseLog(JSON.stringify(jwt.decode(token), null, 2), options.verbose);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc service-token --passkey mypasskey \t\tdisplays the service token (encoded only)`);
            log(
                `    mc service-token --passkey mypasskey --verbose \tdisplays the service token (encoded and decoded)`
            );
            serviceCredentialLog();
        });
};
