import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { jstemplate } from "../../../templates/js/js-template";
import { packageTemplateJs } from "../../../templates/js/package_template";
import { errorLog, verboseLog } from "../../api/utils";

export default (program: CommanderStatic) => {
    program
        .command("starter-js")
        .alias("sj")
        .option("-d, --dir <directoryname>", "config file with agent configuration", "starterjs")
        .option("-v, --verbose", "verbose output")
        .description(chalk.greenBright("creates a starter project in javascript"))
        .action(options => {
            (async () => {
                try {
                    verboseLog(`Creating directory ${chalk.greenBright(options.dir)}`, options.verbose);
                    if (fs.existsSync(options.dir)) {
                        throw new Error(`the directory ${chalk.greenBright(options.dir)} already exists`);
                    }
                    fs.mkdirSync(options.dir);

                    verboseLog(`Writing index.js in ${options.dir}`, options.verbose);
                    fs.writeFileSync(options.dir + "/index.js", jstemplate);

                    let mypackage;
                    try {
                        mypackage = require("../../../package.json");
                    } catch (err) {}

                    // ? for global installation
                    if (!mypackage) {
                        mypackage = require("../../../../package.json");
                    }

                    packageTemplateJs.dependencies["@mindconnect/mindconnect-nodejs"] = "^" + mypackage.version;
                    verboseLog(`Writing package.json in ${options.dir}`, options.verbose);
                    fs.writeFileSync(options.dir + "/package.json", JSON.stringify(packageTemplateJs, null, 4));
                    log(`Starter project in ${chalk.greenBright(options.dir)} has been created.`);
                    log(
                        `Please run npm install in ${chalk.greenBright(options.dir)} directory to install dependecies.`
                    );
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc starter-js \t\t\t this creates a directory called ${chalk.greenBright("starterts")}`);
            log(
                `    mc sj --dir mindconnect-agent \t this creates a directory called ${chalk.greenBright(
                    "mindconnect-agent"
                )}`
            );
        });
};
