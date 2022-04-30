import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { throwError } from "../../api/utils";
import { errorLog, getColor, serviceCredentialLog } from "./command-utils";

let color = getColor("green");

export default (program: Command) => {
    program
        .command("markdown-help")
        .alias("mdhelp")
        .description(color(`generates folder with markdown help commands for the CLI*`))
        .option("-d, --dir <dir>", "folder folder", "markdown-help")
        .option("-o, --overwrite", "overwrite files if they already exist")
        .action((options) => {
            (async () => {
                try {
                    let index = ``;

                    program.commands.forEach((cmd) => {
                        const name = cmd.name();
                        const description = cmd.description();
                        const help = cmd.helpInformation();
                        const examples = extractExamples(cmd);

                        index += `| [\`mdsp ${name}\`](${name}.md) |  ${stripAnsi(description)} |\n`;
                        writeCommandText(options, name, commandTemplate(name, description, help, examples).trim());
                    });

                    writeCommandText(options, "index", indexTemplate(index).trim());
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc mdhelp`);
            serviceCredentialLog();
        });
};

function writeCommandText(options: any, commandName: string, text: string) {
    const fileName = `${options.dir}/${commandName}.md`;
    const filePath = path.resolve(fileName);

    !fs.existsSync(path.resolve(options.dir)) && fs.mkdirSync(path.resolve(options.dir));

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, text);
    console.log(`The data was written into ${color(filePath)}`);
}

function extractExamples(cmd: Command) {
    const preservedConsoleLog = console.log;

    cmd.configureOutput({ writeOut: (str) => 0 });

    let text = "";
    console.log = (...args: any[]) => {
        text += args.join("") + "\n";
    };
    cmd.outputHelp();

    console.log = preservedConsoleLog;
    return text;
}

const commandTemplate = (name: string, description: string, help: string, examples: string) => {
    return `
---
title: MindSphere CLI -  mdsp ${stripAnsi(name)} Command
next:
    - title: Overview
      link: ../cli/index
    - title: Setting up the CLI
      link: ../cli/setting-up-the-cli
---

# MindSphere CLI: mdsp ${stripAnsi(name)} Command

Syntax:

\`\`\`bash
mdsp ${stripAnsi(name)}
\`\`\`

Help:

\`\`\`bash
mdsp ${stripAnsi(name)} --help
\`\`\`

Alternative form:

\`\`\`bash
mc ${stripAnsi(name)}
\`\`\`

(The CLI was using \`mc\` as default command name in older versions)

## Description

${stripAnsi(description)}

## Usage

Parameter list:

\`\`\`text
${stripAnsi(help)}
\`\`\`

## Examples

Here are some examples of how to use the \`mdsp ${stripAnsi(name)}\` command:

\`\`\`text
${stripAnsi(examples)}
\`\`\`

See [MindSphere API documentation](https://documentation.mindsphere.io/MindSphere/apis/index.html) for more information about MindSphere APIs.

`;
};

const indexTemplate = (index: string) => `
---
title: MindSphere CLI: List of all commands
---
# MindSphere CLI: List of all commands

| Command     | Description |
| ----------- | ----------- |
${index}\n`;

const stripAnsi = (x: string) => {
    return x
        .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "")
        .replace(/(<([^>]+)>)/gi, "");
};
