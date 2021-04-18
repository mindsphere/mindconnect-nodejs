import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindSphereSdk, NotificationModelsV4 } from "../../api/sdk";
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
const mime = require("mime-types");

let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("notifications")
        .alias("nt")
        .option("-m, --mode [template|status|send]", "mode [template|send]", "template")
        .option("-t, --type [email|sms|push]", "type [email|sms|push]", "email")
        .option("-i, --jobid <jobid>", "job id for status command")
        .option("-f, --metadata <metadata>", "model metadata file")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`send mindsphere email, sms and push notifications *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options, true);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const notifications = sdk.GetNotificationClientV4();

                    switch (options.mode) {
                        case "template":
                            await createTemplate(options, sdk);
                            console.log("Edit the file before submitting it to mindsphere.");
                            break;

                        case "send":
                            await sendMessage(options, sdk);
                            break;

                        case "status":
                            await getStatus(options, sdk);
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
        `    mc notifications --mode send --metadata <[mail|sms|push].metadata.mdsp.json> \t send notifications (mail, sms, push) from template to recipients`
    );
    serviceCredentialLog();
}

async function createTemplate(options: any, sdk: MindSphereSdk) {
    let metadata:
        | NotificationModelsV4.MulticastEmailNotificationRequestMetadata
        | NotificationModelsV4.MulticastSMSNotificationJobRequest
        | NotificationModelsV4.MulticastPushNotificationJobsRequest;

    switch (options.type) {
        case "email":
            metadata = {
                subject: "[Status] Demo Mail Notificationfrom MindSphere CLI",
                message: `This is a demo mail notification from MindSphere CLI. See more at https://opensource.mindsphere.io`,
                fromApplication: "CLI",
                priority: "Normal",
                recipients: ["<recipient1>@<email>", "<recipient2>@<email>"],
            };
            break;

        case "sms":
            metadata = {
                message: `This is a demo sms notification from MindSphere CLI`,
                fromApplication: "CLI",
                recipients: ["+411xxxxxxx9", "+911xxxxxxx9"],
            };
            break;

        case "push":
            metadata = {
                mobileAppId: "<mobileappid>",
                recipients: {
                    appInstanceIds: ["<appinstanceid>"],
                    userEmailAddresses: ["<user>@<email>"],
                },
                message: {
                    title: '{ "en": "Siemens Mindsphere", "de": "Siemens MindSphere"}',
                    text: '{ "en": "Hi there, Welcome to MindSphere!", "de": "Hallo, Willkommen bei MindSphere!"}',
                },
            };
            break;
        default:
            throw Error(`The type ${options.type} is not supported`);
    }

    const fileName = options.metadata || `${options.type}.metadata.mdsp.json`;
    fs.writeFileSync(fileName, JSON.stringify(metadata, null, 2));

    console.log(
        `The ${options.mode} metadata was written into ${color(
            fileName
        )}. Run \n\n\t mc notifications --mode send --metadata ${fileName} --type ${options.type} \n\nto send ${color(
            options.type
        )} notifications.`
    );
}

async function sendMessage(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.metadata);
    const filecontent = fs.readFileSync(filePath);
    const filedata = JSON.parse(filecontent.toString());

    const notificationClient = sdk.GetNotificationClientV4();

    switch (options.type) {
        case "email":
            // TODO: attachments
            {
                const result = await notificationClient.PostMulticastEmailNotificationJobs(filedata);
                verboseLog(JSON.stringify(result, null, 2), options.verbose);
                console.log(`the ${color(options.type)} notification job with id ${result.id} was created`);
                console.log(
                    `Run \n\n\t mc notifications --mode status --jobid ${result.id} --type ${
                        options.type
                    } \n\nto check the status of the ${color(options.type)} job.`
                );
            }
            break;
        case "sms":
            {
                const result = await notificationClient.PostMulticastSMSNotificationJobs(filedata);
                verboseLog(JSON.stringify(result, null, 2), options.verbose);
                console.log(`the ${color(options.type)} notification job with id ${result.id} was created`);
                console.log(
                    `Run \n\n\t mc notifications --mode status --jobid ${result.id} --type ${
                        options.type
                    } \n\nto check the status of the ${color(options.type)} job.`
                );
            }
            break;

        case "push":
            break;
        default:
            throw Error(`The type ${options.type} is not supported`);
    }
}

async function getStatus(options: any, sdk: MindSphereSdk) {
    const notificationClient = sdk.GetNotificationClientV4();

    switch (options.type) {
        case "email":
            {
                const result = await notificationClient.GetMulticastEmailNotificationJobs(options.jobid);
                verboseLog(JSON.stringify(result, null, 2), options.verbose);
                console.log(`${color(options.type)} job with id ${options.jobid}:`);
                console.log(`\t Status: ${color(result.status)}`);
                console.log(`\t From Application: ${color(result.fromApplication)}`);
                console.log(`\t Malicious attachments: ${color(result.maliciousAttachments?.length)}`);
                console.log(`\t Start time: ${color(result.startTime)}`);
            }
            break;
        case "sms":
            {
                const result = await notificationClient.GetMulticastSMSNotificationJobs(options.jobid);
                verboseLog(JSON.stringify(result, null, 2), options.verbose);
                console.log(`${color(options.type)} job with id ${options.jobid}:`);
                console.log(`\t Status: ${color(result.status)}`);
                console.log(`\t From Application: ${color(result.fromApplication)}`);
                console.log(`\t Start time: ${color(result.startTime)}`);
            }
            break;

        case "push":
            // TODO: check if there is a get for multicast Notification Jobs

            break;
        default:
            throw Error(`The type ${options.type} is not supported`);
    }
}

function checkRequiredParameters(options: any) {}

function getFileType(metadata: string | Buffer) {
    return metadata instanceof Buffer
        ? "application/octet-stream"
        : `${mime.lookup(metadata)}` || "application/octet-stream";
}
