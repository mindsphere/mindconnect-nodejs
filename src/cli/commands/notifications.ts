import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { MindSphereSdk } from "../../api/sdk";
import { adjustColor, errorLog, getColor, getSdk, homeDirLog, proxyLog, serviceCredentialLog } from "./command-utils";
const mime = require("mime-types");

let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("notifications")
        .alias("nt")
        .option("-m, --mode [email|sms|push|send]", "mode [email|sms|push|send]", "email")
        .option("-i, --modelid <modelid>", "mindsphere model id ")
        .option("-f, --metadata <metadata>", "model metadata file", "email.metadata.mdsp.json")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`send mindsphere notifications *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options, true);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const notifications = sdk.GetNotificationClientV4();

                    const result = await notifications.PostMulticastEmailNotificationJobs(
                        {
                            subject: "[Status] Machine Data Analysis 123",
                            message: "Machine data analysis completed. Analysis report attached with this email.",
                            fromApplication: "MachineMonitor",
                            priority: "Normal",
                            recipients: ["sn0wcat@mindsphere.io", "igor.milovanovic@siemens.com"],
                        },
                        [
                            {
                                fileName: "blubb.csv",
                                buffer: Buffer.from("1,2,3,4,5"),
                                mimeType: "text/csv",
                            },
                        ]
                    );

                    console.log(JSON.stringify(result, null, 2));
                    // switch (options.mode) {
                    //     case "email":
                    //         await createTemplate(options, sdk);
                    //         console.log("Edit the files before submitting them to mindsphere.");
                    //         break;

                    //     default:
                    //         throw Error(`no such option: ${options.mode}`);
                    // }
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
        `    mc notifications --mode send --metadata <metadata.[mail|sms|push].mdsp.json> \t send notifications (mail, sms, push) from template to recipients`
    );
    serviceCredentialLog();
}

async function createTemplate(options: any, sdk: MindSphereSdk) {
    const metadata = {
        subject: "[Status] Demo Mail from MindSphere CLI",
        message: `This is a demo mail from MindSphere CLI`,
        fromApplication: "CLI",
        priority: "Normal",
        recipients: ["<recipient1>@<email>", "<recipient2>@<email>"],
    };

    const fileName = options.metadata || `${options.mode}.metadata.mdsp.json`;
    fs.writeFileSync(fileName, JSON.stringify(metadata, null, 2));

    console.log(
        `The ${options.mode} metadata was written into ${color(
            fileName
        )}.Run \n\n\t mc notifications --mode send --metadata ${fileName}\n\nto send notifications.`
    );
}

function checkRequiredParameters(options: any) {}

function getFileType(metadata: string | Buffer) {
    return metadata instanceof Buffer
        ? "application/octet-stream"
        : `${mime.lookup(metadata)}` || "application/octet-stream";
}
