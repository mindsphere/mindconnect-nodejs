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
        .description(chalk.magentaBright("creates a template directory for bulk upload *"))
        .action(options => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    fs.mkdirSync(options.dir);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc iot-bulk-dir  --assetid 12356...abc \t this creates a directory called ${chalk.magentaBright(
                    "bulkimport"
                )}`
            );
            log(
                `    mc ibd --dir asset1 -i 123456...abc  \t this creates a directory called ${chalk.magentaBright(
                    "asset1"
                )}`
            );
        });
};
function checkRequiredParamaters(options: any) {
    verboseLog(`Creating directory template for assetid ${chalk.magentaBright(options.assetid)}`, options.verbose);
    checkAssetId(options.assetid);
    verboseLog(`Creating directory ${chalk.magentaBright(options.dir)}`, options.verbose);
    if (fs.existsSync(options.dir)) {
        throw new Error(`the directory ${chalk.magentaBright(options.dir)} already exists`);
    }
}
