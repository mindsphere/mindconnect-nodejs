import { CommanderStatic } from "commander";
import { log } from "console";
import { getColor } from "./command-utils";
import * as updateNotifier from "update-notifier";
import { MC_NAME, MC_VERSION } from "../../version";

const magenta = getColor("magenta");
const cyan = getColor("cyan");
const green = getColor("green");
const red = getColor("red");
const blue = getColor("blue");
const yellow = getColor("yellow");

export default (program: CommanderStatic) => {
    program.version(`MindConnect NodeJS CLI - Version: ${MC_VERSION}`);

    program.on("--help", () => {
        log(`\n  Documentation:\n`);
        log(
            `    the ${magenta(
                "magenta colored commands *"
            )} use app or service credentials or borrowed mindsphere cookies`
        );
        log(`    the ${cyan("cyan colored commands ")}require mindconnectlib (agent) credentials`);
        log(`    the ${blue("blue colored commands @")} use analytical functions of MindSphere`);
        log(`    the ${green("green colored commands #")} are used as setup and utility commands`);
        log(`    the ${yellow("yellow colored commands &")} use borrowed mindsphere application cookies`);
        log(`    the credentials and cookies should only be used in secure environments`);
        log(`    Full documentation: ${cyan("https://opensource.mindsphere.io")}\n`);

        const pkgInfo = {
            pkg: {
                name: `@mindconnect/${MC_NAME}`,
                version: `${MC_VERSION}`,
            },
        };

        const notifier = updateNotifier(pkgInfo);

        if (notifier.update) {
            console.log(
                `\n\t There is an update available: ${magenta(notifier.update.latest + " ")} (${notifier.update.type})`
            );
            console.log(`\t Run ${magenta("npm install -g ")}${magenta(pkgInfo.pkg.name)} to update`);
            console.log(`\t or download the release for your system from`);
            console.log(`\t ${magenta("https://github.com/mindsphere/mindconnect-nodejs/releases")}\n`);
        }
    });

    program.on("command:*", function () {
        console.error(red(`Invalid command: ${program.args.join(" ")}`));
        console.error("Use mc --help for a list of available commands");
        process.exit(1);
    });
};
