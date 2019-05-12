import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { packageTemplateTs } from "../../../templates/ts/package_template";
import { tsconfigjson, tstemplate } from "../../../templates/ts/ts-template";
import { errorLog, verboseLog } from "../../api/utils";
import { getColor } from "./command-utils";

const color = getColor("green");

export default (program: CommanderStatic) => {
    program
        .command("starter-ts")
        .alias("st")
        .option("-d, --dir <directoryname>", "directory name", "starterts")
        .option("-v, --verbose", "verbose output")
        .description(color("creates a starter project in typescript #"))
        .action(options => {
            (async () => {
                try {
                    verboseLog(`Creating directory ${color(options.dir)}`, options.verbose);
                    if (fs.existsSync(options.dir)) {
                        throw new Error(`the directory ${color(options.dir)} already exists`);
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
                    log(`Starter project in ${color(options.dir)} has been created.`);
                    log(`Please run npm install in ${color(options.dir)} directory to install dependecies.`);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc starter-ts \t\t\t this creates a directory called ${color("starterts")}`);
            log(`    mc st --dir mindconnect-agent \t this creates a directory called ${color("mindconnect-agent")}`);
        });
};
