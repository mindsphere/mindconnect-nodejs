import { CommanderStatic } from "commander";
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
import { listInstances } from "./mobile-app-instances";
let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("mobile-apps")
        .alias("mb")
        .option(
            "-m, --mode [list|info|create|delete|update|template]",
            "mode [list | info | create | delete | update | template]",
            "list"
        )
        .option("-t, --type [ios|android]", "type [ios|android]", "android")
        .option("-p, --appid <appid>", "mobile app id ")
        .option("-f, --file <file>", "mobile app file [ios|android].mobileapp.mdsp.json")
        .option("-a, --all", "list full app information")
        .option("-o, --overwrite", "overwrite template files")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`list, create or delete mobile apps *`))
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
                            await createAppTemplate(options);
                            console.log("Edit the files before submitting them to mindsphere.");
                            break;
                        case "update":
                        case "create":
                            await createOrUpdateApp(options, sdk);
                            break;
                        case "list":
                            await listMobileApps(options, sdk);
                            break;

                        case "info":
                            {
                                options.all = true;
                                // hack as there is no parameterized get method
                                console.log(`App with ${options.appid}:\n`);
                                await listMobileApps(options, sdk);
                                console.log(`Mobile App instances:\n`);
                                await listInstances(options, sdk);
                            }
                            break;
                        case "delete":
                            await deleteApp(options, sdk);
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
    log(`    mc mobile-apps --mode list \t\t\t\t\tlist mobile apps`);
    log(`    mc mobile-apps --mode template --type [android|ios] \tcreate template file for mobileapp`);
    log(`    mc mobile-apps --mode create --file [android|ios].mobileapp.mdsp.json\tcreate mobileapp`);
    log(`    mc mobile-apps --mode info --appid <appid>\t\t\tmobile app info`);
    log(`    mc mobile-apps --mode delete --appid <appid>\t\tdelete mobile app`);
    serviceCredentialLog();
}

async function listMobileApps(options: any, sdk: MindSphereSdk) {
    const mobileAppsClient = sdk.GetNotificationClientV4();

    let page = 1; // the mobile apps client is starting paging from 1 for some strange reason
    let mobileapps;

    console.log(`appId  [type]\t${color("name")} [instance count]`);

    let appCount = 0;

    do {
        const params = { page: page, size: 20 };

        mobileapps = (await retry(options.retry, () =>
            mobileAppsClient.GetMobileApps(params)
        )) as NotificationModelsV4.PagedAppRegistrationResponse;

        mobileapps.mobileApps = mobileapps.mobileApps || [];
        mobileapps.page = mobileapps.page || { totalPages: 0 };

        for await (const mobileApp of mobileapps.mobileApps || []) {
            // there is no info method for GET so we are using this way to do this
            if (options.appid && mobileApp.id !== options.appid) continue;
            appCount++;

            const instances = await mobileAppsClient.GetMobileAppsInstances(`${mobileApp.id}`);

            console.log(
                `${mobileApp.id} [${mobileApp.type}]\t${color(mobileApp.name)} [${instances.page?.totalElements || 0}]`
            );

            options.all && console.log(`${color(mobileApp.type)} properties:`);
            options.all &&
                (mobileApp.type === "android" ? console.table(mobileApp.android) : console.table(mobileApp.ios));
            verboseLog(JSON.stringify(mobileApp, null, 2), options.verbose);
        }
    } while (page++ < (mobileapps.page.totalPages || 0));

    console.log(`${color(appCount)} mobileapps listed.\n`);
}

async function createAppTemplate(options: any) {
    const template =
        options.type === "android"
            ? {
                  name: "string",
                  type: "android",
                  android: {
                      fcmServerKey: "string",
                  },
              }
            : {
                  name: "string",
                  type: "iOS",
                  ios: {
                      fcmServerKey: "string",
                      bundleId: "string",
                      apnsSslCertificate: "string",
                      apnsAppPrivateKey: "string",
                      production: false,
                  },
              };

    const fileName = options.file || `${options.type}.mobileapp.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) && !options.overwrite && throwError(`the file ${filePath} already exists.`);
    fs.writeFileSync(filePath, JSON.stringify(template, null, 2));
    console.log(`The ${color(options.type)} template file was written into ${color(fileName)}`);
    console.log(`Run:\n\n\
              \tmc mobile-apps --mode create --file ${fileName}
              \nto create mobile app in mindsphere.`);
}

async function createOrUpdateApp(options: any, sdk: MindSphereSdk) {
    const mobileAppsClient = sdk.GetNotificationClientV4();
    const filePath = path.resolve(options.file);
    const filecontent = fs.readFileSync(filePath);
    const filedata = JSON.parse(filecontent.toString()) as NotificationModelsV4.AppRegistrationRequest;

    if (options.mode === "create") {
        const result = (await retry(options.retry, async () =>
            mobileAppsClient.PostMobileApp(filedata as NotificationModelsV4.AppRegistrationRequest)
        )) as NotificationModelsV4.AppRegistrationResponse;
        console.log(`Mobile app with name ${color(result.name)} and type ${color(result.type)} was created.`);
    } else if (options.mode === "update") {
        const result = (await retry(options.retry, async () =>
            mobileAppsClient.PatchMobileApp(
                options.appid,
                filedata as NotificationModelsV4.AppRegistrationUpdateRequest
            )
        )) as NotificationModelsV4.AppRegistrationResponse;
        console.log(`Mobile app with name ${color(result.name)} and type ${color(result.type)} was updated.`);
    } else {
        throw Error(`Invalid mode in createOrUpdateMobileApp ${options.mode}`);
    }
}

async function deleteApp(options: any, sdk: MindSphereSdk) {
    const mobileAppsClient = sdk.GetNotificationClientV4();
    await retry(options.retry, () => mobileAppsClient.DeleteMobileApp(options.appid));
    console.log(`App with id ${color(options.appid)} was deleted.`);
}

function checkRequiredParameters(options: any) {
    options.mode === "create" &&
        !options.file &&
        errorLog("you have to specify the --file for --mode create command", true);
    options.mode === "update" && !options.file && errorLog("you have to specify the --file for --update command", true);
    (options.mode === "delete" || options.mode === "update" || options.mode === "info") &&
        !options.appid &&
        errorLog("you have to specify the appid of the mobile app", true);
}
