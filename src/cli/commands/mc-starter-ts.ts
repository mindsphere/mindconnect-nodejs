import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { packageTemplateTs } from "../../../templates/ts/package_template";
import { tsconfigjson, tstemplate } from "../../../templates/ts/ts-template";
import { errorLog, verboseLog } from "../../api/utils";

export default (program: CommanderStatic) => {
    program
        .command("starter-ts")
        .alias("st")
        .option("-d, --dir <directoryname>", "config file with agent configuration", "starterts")
        .option("-v, --verbose", "verbose output")
        .description(chalk.greenBright("creates a starter project in typescript #"))
        .action(options => {
            (async () => {
                try {
                    verboseLog(`Creating directory ${chalk.greenBright(options.dir)}`, options.verbose);
                    if (fs.existsSync(options.dir)) {
                        throw new Error(`the directory ${chalk.greenBright(options.dir)} already exists`);
                    }
                    fs.mkdirSync(options.dir);

                    verboseLog(`Writing index.ts in ${options.dir}`, options.verbose);
                    fs.writeFileSync(options.dir + "/index.ts", tstemplate);

                    let mypackage;
                    try {
                        mypackage = require("../../../package.json");
                    } catch (err) {}

                    // ? for global installation
                    if (!mypackage) {
                        mypackage = require("../../../../package.json");
                    }

                    packageTemplateTs.dependencies["@mindconnect/mindconnect-nodejs"] = "^" + mypackage.version;
                    packageTemplateTs.devDependencies["@types/node"] = mypackage.devDependencies["@types/node"];
                    packageTemplateTs.devDependencies["typescript"] = mypackage.devDependencies["typescript"];
                    verboseLog(`Writing package.json in ${options.dir}`, options.verbose);
                    fs.writeFileSync(options.dir + "/package.json", JSON.stringify(packageTemplateTs, null, 4));
                    verboseLog(`Writing tsconfig.json in ${options.dir}`, options.verbose);
                    fs.writeFileSync(options.dir + "/tsconfig.json", JSON.stringify(tsconfigjson, null, 4));
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
            log(`    mc starter-ts \t\t\t this creates a directory called ${chalk.greenBright("starterts")}`);
            log(
                `    mc st --dir mindconnect-agent \t this creates a directory called ${chalk.greenBright(
                    "mindconnect-agent"
                )}`
            );
        });
};
