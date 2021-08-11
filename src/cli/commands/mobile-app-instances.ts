import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindSphereSdk, NotificationModelsV4 } from "../../api/sdk";
import { retry, throwError } from "../../api/utils";
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
        .command("mobile-app-instances")
        .alias("mbi")
        .option(
            "-m, --mode [list|info|create|delete|update|template]",
            "mode [list | info | create | delete | update | template]",
            "list"
        )
        .option("-p, --appid <appid>", "mobile app id ")
        .option("-i, --instanceid <appid>", "mobile app instance id ")
        .option("-f, --file <file>", "mobile app file [mobileapp.instance.mdsp.json]")
        .option("-o, --overwrite", "overwrite template files")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`list, create or delete mobile app instances *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);
                    switch (options.mode) {
                        case "template":
                            await createAppInstanceTemplate(options);
                            console.log("Edit the files before submitting them to mindsphere.");
                            break;
                        case "update":
                        case "create":
                            await createOrUpdateAppInstance(options, sdk);
                            break;
                        case "list":
                            await listInstances(options, sdk);
                            break;

                        case "info":
                            {
                                console.log(`App with ${options.appid}:\n`);
                                await listInstances(options, sdk);
                                console.log(`Mobile App instances:\n`);
                            }
                            break;
                        case "delete":
                            await deleteAppInstance(options, sdk);
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
    log(`    mc mobile-app-instances --appid <appid> --mode list \tlist mobile apps`);
    log(`    mc mobile-app-instances --appid <appid> --mode template \tcreate template file for mobile app instance`);
    log(
        `    mc mobile-app-instances --appid <appid> --mode create --file mobileapp.instance.mdsp.json \n\t\t\t\t\t\tcreate mobile app instance`
    );
    log(
        `    mc mobile-app-instances --appid <appid> --mode info --instanceid <instanceid>\n\t\t\t\t\t\tmobile app instance info`
    );
    log(
        `    mc mobile-app-instances --appid <appid> --mode delete --instanceid <instanceid>\n\t\t\t\t\t\tdelete mobile app instance`
    );
    serviceCredentialLog();
}

export async function listInstances(options: any, sdk: MindSphereSdk) {
    const mobileAppsClient = sdk.GetNotificationClientV4();

    let page = 1; // the mobile apps client is starting paging from 1 for some strange reason
    let mobileAppsInstances;

    console.log(`instanceId  deviceOS deviceModel language pushNotificationToken userEmailAddress`);

    let instanceCount = 0;
    do {
        const params = { page: page, size: 20 };

        mobileAppsInstances = (await retry(options.retry, () =>
            mobileAppsClient.GetMobileAppsInstances(options.appid, params)
        )) as NotificationModelsV4.PagedAppInstanceResponse;

        mobileAppsInstances.instances = mobileAppsInstances.instances || [];
        mobileAppsInstances.page = mobileAppsInstances.page || { totalPages: 0 };

        for (const instance of mobileAppsInstances.instances || []) {
            // there is no info method for GET so we are using this way to do this
            if (options.instanceid && instance.id !== options.instanceid) continue;

            instanceCount++;
            console.log(
                `${instance.id} ${instance.deviceOS}  ${instance.deviceModel} ${instance.language}  ${
                    instance.pushNotificationToken
                } ${color(instance.userEmailAddress)}`
            );

            verboseLog(JSON.stringify(instance, null, 2), options.verbose);
        }
    } while (page++ < (mobileAppsInstances.page.totalPages || 0));

    console.log(`${color(instanceCount)} mobile app instances listed.\n`);
}

async function createAppInstanceTemplate(options: any) {
    const template = {
        deviceModel: "iPhone X",
        deviceOS: "iOS 10",
        language: "de",
        pushNotificationToken: "7abcd558f29d0c1f048083e2134ad8ea4b3d87d8ae9c038b43c132706ff445f0",
    };

    const fileName = options.file || `mobileapp.instance.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) && !options.overwrite && throwError(`the file ${filePath} already exists.`);
    fs.writeFileSync(filePath, JSON.stringify(template, null, 2));
    console.log(`The ${color(options.type)} template file was written into ${color(fileName)}`);
    console.log(`Run:\n\n\
              \tmc mobile-app-instances --mode create --file ${fileName} --appid ${options.appid}
              \nto create mobile app instance in mindsphere.`);
}

async function createOrUpdateAppInstance(options: any, sdk: MindSphereSdk) {
    const mobileAppsClient = sdk.GetNotificationClientV4();
    const filePath = path.resolve(options.file);
    const filecontent = fs.readFileSync(filePath);
    const filedata = JSON.parse(filecontent.toString()) as NotificationModelsV4.AppInstanceRequest;

    if (options.mode === "create") {
        const result = (await retry(options.retry, async () =>
            mobileAppsClient.PostMobileAppInstance(options.appid, filedata as NotificationModelsV4.AppInstanceObject)
        )) as NotificationModelsV4.AppInstanceResponse;
        console.log(
            `Mobile app instance ${color(result.id)} [${result.language} ${result.language} ${result.deviceOS} ${
                result.pushNotificationToken
            }] was created.`
        );
    } else if (options.mode === "update") {
        const result = (await retry(options.retry, async () =>
            mobileAppsClient.PatchMobileAppInstance(
                options.appid,
                options.instanceid,
                filedata as NotificationModelsV4.AppInstancePatchRequest
            )
        )) as NotificationModelsV4.AppInstanceResponse;
        console.log(
            `Mobile app instance ${color(result.id)} [${result.language} ${result.language} ${result.deviceOS} ${
                result.pushNotificationToken
            }] was updated.`
        );
    } else {
        throw Error(`Invalid mode in createOrUpdateMobileApp ${options.mode}`);
    }
}

async function deleteAppInstance(options: any, sdk: MindSphereSdk) {
    const mobileAppsClient = sdk.GetNotificationClientV4();
    await retry(options.retry, () => mobileAppsClient.DeleteMobileAppsInstance(options.appid, options.instanceid));
    console.log(`Mobile app instance with id ${color(options.appid)} was deleted.`);
}

function checkRequiredParameters(options: any) {
    !options.appid && errorLog("You have to specify the mobile app id (--appid)", true);
    options.mode === "create" &&
        !options.file &&
        errorLog("you have to specify the --file for the --mode create command", true);
    options.mode === "update" &&
        !options.file &&
        errorLog("you have to specify the --file for the --mode update command", true);
    (options.mode === "delete" || options.mode === "update" || options.mode === "info") &&
        !options.instanceid &&
        errorLog("you have to specify the instanceid", true);
}
