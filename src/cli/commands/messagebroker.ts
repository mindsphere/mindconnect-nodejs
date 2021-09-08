import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { throwError } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    proxyLog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";
let color = getColor("magenta");

export default (program: Command) => {
    program
        .command("message-broker")
        .alias("mbk")
        .option(
            "-m, --mode [info|modify|delete|template|send]",
            "mode [info | modify | delete | template | send]",
            "info"
        )
        .option("-s, --subscriptionid <subscriptionid>", "subscription id")
        .option("-e, --versionid <versionid>", "version id")
        .option("-t, --topicid <topicid>", "topic id (example: mdsp.core.am.v1.postbox.asset.deleted)")
        .option("-w, --webhook <webhook>", "webhook url")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-f, --file <file>", ".mdsp.json file with message definition", "messagebroker.message.mdsp.json")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`manage message broker subscriptions and webhooks *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    switch (options.mode) {
                        case "info":
                            {
                                const result = await sdk
                                    .GetMessageBrokerClient()
                                    .GetSubscription(options.subscriptionid, options.versionid, options.topicid);
                                console.log(
                                    `subscription id ${options.subscriptionid} in version ${options.versionid} for topic ${options.topicid}`
                                );
                                console.log(`configured webhook: ${color(result.uri)}`);
                            }
                            break;

                        case "modify":
                            {
                                const result = await sdk
                                    .GetMessageBrokerClient()
                                    .PutSubscription(options.subscriptionid, options.versionid, options.topicid, {
                                        uri: options.webhook,
                                    });

                                console.log(
                                    `subscription id ${options.subscriptionid} in version ${
                                        options.versionid
                                    } for topic ${options.topicid} was ${color("modified")}`
                                );
                                console.log(`configured webhook: ${color(result.uri)}`);
                            }
                            break;
                        case "delete":
                            {
                                await sdk
                                    .GetMessageBrokerClient()
                                    .DeleteSubscription(options.subscriptionid, options.versionid, options.topicid);

                                console.log(
                                    `subscription id ${options.subscriptionid} in version ${
                                        options.versionid
                                    } for topic ${options.topicid} was ${color("modified")}`
                                );
                            }
                            break;
                        case "template":
                            {
                                createTemplate(options);
                                console.log("Edit the file before submitting it to MindSphere.");
                            }
                            break;

                        case "send":
                            {
                                const filePath = path.resolve(options.file);
                                const file = fs.readFileSync(filePath);
                                const message = JSON.parse(file.toString());

                                await sdk.GetMessageBrokerClient().SendMessage(options.topicid, message);

                                console.log("Edit the file before submitting it to MindSphere.");
                            }
                            break;

                        default:
                            throw Error(`no such option: ${options.mode}`);
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => printHelp());
};

function printHelp() {
    log("\n  Examples:\n");
    log(
        `    mc message-broker --mode info   --subscriptionid <subscriptionid> --versionid <versionid> --topicid <topicid> \t get subscription webhook uri`
    );
    log(
        `    mc message-broker --mode delete --subscriptionid <subscriptionid> --versionid <versionid> --topicid <topicid> \t delete webhook `
    );
    log(
        `    mc message-broker --mode modify --subscriptionid <subscriptionid> --versionid <versionid> --topicid <topicid> --webhook <uri> \t configure webhook `
    );
    log(
        `    mc message-broker --mode template --file messagebroker.message.mdsp.json \t\t\t create template message file `
    );

    log(
        `    mc message-broker --mode send --file messagebroker.message.mdsp.json --topicid <topicid> \t send message to the topic `
    );

    // log(`    mc mobile-apps --mode create --file [android|ios].mobileapp.mdsp.json\tcreate mobileapp`);
    // log(`    mc mobile-apps --mode info --appid <appid>\t\t\tmobile app info`);
    // log(`    mc mobile-apps --mode delete --appid <appid>\t\tdelete mobile app`);
    serviceCredentialLog();
}

function createTemplate(options: any) {
    const templateType = { content: "You can use any valid JSON as message" };
    verboseLog(JSON.stringify(templateType, null, 2), options.verbose);
    writeTemplateToFile(options, templateType);
}

function writeTemplateToFile(options: any, job: any) {
    const fileName = options.file || `messagebroker.message.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The file ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(job, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc message-broker --mode send --file ${fileName} \n\nto send the message`
    );
}
function checkRequiredParameters(options: any) {
    ["info", "modify", "delete"].indexOf(options.mode) > 0 &&
        !options.topicid &&
        errorLog("you have to specify the --topicid option", true);
    ["info", "modify", "delete"].indexOf(options.mode) > 0 &&
        !options.versionid &&
        errorLog("you have to specify the --versionid option", true);
    ["info", "modify", "delete"].indexOf(options.mode) > 0 &&
        !options.subscriptionid &&
        errorLog("you have to specify the --subscriptionid option", true);

    options.mode === "modify" && !options.webhook && errorLog("you have to specify the --webhook option", true);

    options.mode === "send" && !options.file && errorLog("you have to specify the --file option", true);
    options.mode === "send" && !options.topicid && errorLog("you have to specify the --topicid option", true);
}
