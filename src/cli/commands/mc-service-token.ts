import { CommanderStatic } from "commander";
import { log } from "console";
import * as jwt from "jsonwebtoken";
import { retry } from "../..";
import { MindSphereSdk } from "../../api/sdk";
import { decrypt, loadAuth } from "../../api/utils";
import { errorLog, getColor, homeDirLog, proxyLog, retrylog, serviceCredentialLog, verboseLog } from "./command-utils";
const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("service-token")
        .alias("stk")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-v, --verbose", "verbose output")
        .description(color(`displays the service token for use in other tools (e.g. postman) *`))
        .action((options) => {
            (async () => {
                try {
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    if (!options.passkey) {
                        errorLog(
                            "you have to provide a passkey to get the service token (run mc stk --help for full description)",
                            true
                        );
                    }
                    const auth = loadAuth();

                    const sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, options.passkey) });

                    verboseLog("encoded token:\n", options.verbose);
                    let token: string = "";
                    await retry(options.retry, async () => (token = await sdk.GetToken()), 300, retrylog("GetToken"));

                    log(token);
                    verboseLog("decoded token:\n", options.verbose);
                    verboseLog(JSON.stringify(jwt.decode(token, { complete: true }), null, 2), options.verbose);
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
