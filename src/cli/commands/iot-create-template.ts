import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { checkAssetId, errorLog, verboseLog } from "../../api/utils";
export default (program: CommanderStatic) => {
    program
        .command("iot-bulk-dir")
        .alias("ibd")
        .option("-d, --dir <directoryname>", "config file with agent configuration", "bulkupload")
        .option("-i, --assetid <assetid>", "asset id from the mindsphere ")
        .option("-v, --verbose", "verbose output")
        .description(chalk.greenBright("creates a sample directory name for bulk upload #"))
        .action(options => {
            (async () => {
                try {
                    verboseLog(`Creating directory ${chalk.greenBright(options.dir)}`, options.verbose);
                    if (fs.existsSync(options.dir)) {
                        throw new Error(`the directory ${chalk.greenBright(options.dir)} already exists`);
                    }
                    fs.mkdirSync(options.dir);

                    checkAssetId(options.assetid);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc starter-ts \t\t\t this creates a directory called ${chalk.greenBright("starterts")}`);
            log(
                `    mc st --dir mindconnect-agent \t this creates a directory called ${chalk.greenBright(
                    "mindconnect-agent"
                )}`
            );
        });
};
