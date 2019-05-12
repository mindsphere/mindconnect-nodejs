import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import { getColor } from "./command-utils";

const magenta = getColor("magenta");
const cyan = getColor("cyan");
const green = getColor("green");
const red = getColor("red");

export default (program: CommanderStatic) => {
    program.version("MindConnect NodeJS CLI - Version: 3.5.0");

    program.on("--help", () => {
        log(`\n  Documentation:\n`);
        log(`    the ${magenta("magenta colored commands *")} require service credentials.`);
        log(`    the ${cyan("cyan colored commands ")}require mindconnectlib (agent) credentials`);
        log(`    the ${green("green colored commands #")} are used to setup starter projects`);
        log(`    the service credentials should only be used in secure environments for setup tasks`);
        log(`    Full documentation: ${cyan("https://mindconnect-nodejs.github.com")}\n`);
    });

    program.on("command:*", function() {
        console.error(red(`Invalid command: ${program.args.join(" ")}`));
        console.error("Use mc --help for a list of available commands");
        process.exit(1);
    });
};
