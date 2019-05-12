import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { jstemplate } from "../../../templates/js/js-template";
import { packageTemplateJs } from "../../../templates/js/package_template";
import { errorLog, getColor, verboseLog } from "./command-utils";

const color = getColor("green");

export default (program: CommanderStatic) => {
    program
        .command("starter-js")
        .alias("sj")
        .option("-d, --dir <directoryname>", "directory name", "starterjs")
        .option("-v, --verbose", "verbose output")
        .description(color("creates a starter project in javascript #"))
        .action(options => {
            (async () => {
                try {
                    verboseLog(`Creating directory ${color(options.dir)}`, options.verbose);
                    if (fs.existsSync(options.dir)) {
                        throw new Error(`the directory ${color(options.dir)} already exists`);
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
                    log(`Starter project in ${color(options.dir)} has been created.`);
                    log(`Please run npm install in ${color(options.dir)} directory to install dependecies.`);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc starter-js \t\t\t this creates a directory called ${color("starterts")}`);
            log(`    mc sj --dir mindconnect-agent \t this creates a directory called ${color("mindconnect-agent")}`);
        });
};
