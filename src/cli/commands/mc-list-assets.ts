import { CommanderStatic } from "commander";
import { log } from "console";
import { listAssets } from "./assets";
import { adjustColor, errorLog, getColor, getSdk, homeDirLog, proxyLog, serviceCredentialLog } from "./command-utils";

let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("list-assets")
        .alias("la")
        .option(
            "-f, --filter [filter]",
            `filter (see: ${color(
                "https://developer.mindsphere.io/apis/advanced-assetmanagement/api-assetmanagement-references-filtering.html"
            )}) `
        )
        .option("-a, --assetname [name]", "search for assets with string [name] in asset name")
        .option("-t, --typeid [typeid]", "search for assets with string [typeid] in typeid")
        .option("-c, --includeshared", "include shared assets")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`list assets in the tenant *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    await listAssets(options, sdk);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc list-assets --passkey mypasskey \t\t\t\t\t\tlist all assets`);
            log(
                `    mc la --typeid core.mclib --assetname nodered --passkey mypasskey \t\tlist all agents (assets of type core.mclib) with nodered in the name`
            );
            log(
                `    mc la --filter '{"name" : {"contains" : "Engine"}}' --passkey mypasskey \tlist all assets where name contains string Engine`
            );
            serviceCredentialLog();
        });
};

function checkRequiredParameters(options: any) {}
