import { Command } from "commander";
import { log } from "console";
import * as jwt from "jsonwebtoken";
import { retry } from "../..";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    proxyLog,
    retrylog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";
let color = getColor("magenta");

export default (program: Command) => {
    program
        .command("exchange-token")
        .alias("ate")
        .option("-r, --resource <resource>", "resource (custom API for hich you need the token)")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`displays the exchanged token for use in other tools (e.g. postman) *`))
        .action((options) => {
            (async () => {
                try {
                    // checkRequiredParamaters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    if (options._selected_mode === "cookie") {
                        console.log(`borrowed cookie authentication is using ${color("cookies")} and not using tokens`);
                        verboseLog(`${color("MDSP_SESSION")}=${process.env.MDSP_SESSION}`, options.verbose);
                        verboseLog(`${color("MDSP_XSRF_TOKEN")}=${process.env.MDSP_XSRF_TOKEN}`, options.verbose);
                        verboseLog(`${color("MDSP_HOST")}=${process.env.MDSP_HOST}`, options.verbose);
                    } else {
                        const ate = sdk.GetAdvancedTokenExchangeClient();
                        const token = await retry(
                            options.retry,
                            () => ate.ExchangeToken(options.resource),
                            300,
                            retrylog("GetToken", color)
                        );

                        log(token);
                        verboseLog("decoded token:\n", options.verbose);
                        verboseLog(JSON.stringify(jwt.decode(token, { complete: true }), null, 2), options.verbose);
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mdsp exchange-token --passkey mypasskey \t\tdisplays the exchanged token (encoded only)`);
            log(
                `    mdsp exchange-token --passkey mypasskey --verbose \tdisplays the exchanged token (encoded and decoded)`
            );
            serviceCredentialLog();
        });
};
