import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindConnectAgent, retry } from "../..";
import {
    checkCertificate,
    errorLog,
    getHomeDotMcDir,
    homeDirLog,
    proxyLog,
    retrylog,
    verboseLog
} from "../../api/utils";
const mime = require("mime-types");

export default (program: CommanderStatic) => {
    program
        .command("upload-file")
        .alias("uf")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option(
            "-r, --cert [privatekey]",
            "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
        )
        .option("-f, --file <fileToUpload>", "file to upload to the file service")
        .option("-i, --assetid [assetid]", "asset id from the mindsphere  (default: upload to the agent)")
        .option("-m, --mime [mime-type]", "mime type of the file (default: automatic recognition)")
        .option("-d, --desc [description]", "description")
        .option("-k, --chunked", "Use chunked upload")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-v, --verbose", "verbose output")
        .description(chalk.cyanBright("upload the file to the mindsphere file service"))
        .action(options => {
            (async () => {
                try {
                    if (!options.file) {
                        errorLog(
                            "Missing file name for upload-file command. Run mc uf --help for full syntax and examples.",
                            true
                        );
                        process.exit(1);
                    }

                    homeDirLog(options.verbose);
                    proxyLog(options.verbose);

                    const configFile = path.resolve(options.config);
                    verboseLog(
                        `Upload using the agent configuration stored in: ${chalk.cyanBright(configFile)}.`,
                        options.verbose
                    );

                    if (!fs.existsSync(configFile)) {
                        throw new Error(`Can't find file ${configFile}`);
                    }

                    const uploadFile = path.resolve(options.file);
                    if (!fs.existsSync(uploadFile)) {
                        throw new Error(`Can't find file ${uploadFile}`);
                    }

                    verboseLog(`File to upload: ${chalk.cyanBright(uploadFile)}.`, options.verbose);

                    if (!fs.existsSync(uploadFile)) {
                        throw new Error(`Can't find file ${uploadFile}`);
                    }
                    const configuration = require(configFile);
                    const profile = checkCertificate(configuration, options);
                    const agent = new MindConnectAgent(configuration, undefined, getHomeDotMcDir());
                    if (profile) {
                        agent.SetupAgentCertificate(fs.readFileSync(options.cert));
                    }

                    if (!agent.IsOnBoarded()) {
                        await retry(options.retry, () => agent.OnBoard(), 300, retrylog("OnBoard"));
                        log(chalk.cyanBright(`Your agent with id ${agent.ClientId()} was succesfully onboarded.`));
                    }

                    const mimeType = options.mime || mime.lookup(uploadFile) || "application/octet-stream";
                    const description =
                        options.desc || `File uploaded on ${new Date().toUTCString()} using mindconnect CLI`;

                    const assetid = options.assetid || agent.ClientId();
                    const chunked = options.chunked ? true : false;

                    log(`Uploading the file: ${chalk.cyanBright(uploadFile)} with mime type ${mimeType}.`);
                    verboseLog(`Description ${description}`, options.verbose);
                    verboseLog(`AssetId ${assetid}`, options.verbose);
                    verboseLog(
                        assetid === agent.ClientId() ? "Uploading to agent." : "Uploading to another asset.",
                        options.verbose
                    );
                    verboseLog(chunked ? `Using chunked upload` : `No chunked upload`, options.verbose);

                    await agent.UploadFile(assetid, path.basename(uploadFile), uploadFile, {
                        description: description,
                        chunk: chunked,
                        retry: options.retry
                    });

                    log(`Your file ${chalk.cyanBright(uploadFile)} was succesfully uploaded.`);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc uf -f CHANGELOG.md   \t\t\t\t\t\t\t upload file CHANGELOG.md to the agent`);
            log(
                `    mc upload-file --file  CHANGELOG.md  --assetid 5...f --mime text/plain \t upload file to a specified asset with custom mime type`
            );
            log(
                `    mc upload-file --file  CHANGELOG.md  --chunked \t\t\t\t upload file using experimental chunked upload`
            );
        });
};
