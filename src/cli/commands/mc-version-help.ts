import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";

export default (program: CommanderStatic) => {
    program.version("MindConnect NodeJS CLI - Version: 3.4.0");

    program.on("--help", () => {
        log(`\n  Documentation:\n`);
        log(`    the ${chalk.magentaBright("magenta colored commands *")} require service credentials.`);
        log(`    the ${chalk.cyanBright("cyan colored commands ")}require mindconnectlib (agent) credentials`);
        log(`    the ${chalk.greenBright("green colored commands ")} are used to setup starter projects`);
        log(`    the service credentials should only be used in secure environments for setup tasks\n`);
    });

    program.on("command:*", function() {
        console.error(chalk.redBright(`Invalid command: ${program.args.join(" ")}`));
        console.error("Use mc --help for a list of available commands");
        process.exit(1);
    });
};
