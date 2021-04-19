import { CommanderStatic } from "commander";
import { log } from "console";
import * as util from "util";
import { MindSphereSdk, NotificationModelsV4 } from "../../api/sdk";
import { retry } from "../../api/utils";
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
const streamPipeline = util.promisify(require("stream").pipeline);
let color = getColor("blue");

export default (program: CommanderStatic) => {
    program
        .command("mobileapps")
        .alias("mb")
        .option(
            "-m, --mode [list|create|delete|update|apptemplate|instancetemplate]",
            "mode [list | create | delete | update | apptemplate | instancetemplate]",
            "list"
        )
        .option("-t, --type [ios|android]", "type [ios|android]", "ios")
        .option("-a, --appid <appid>", "mobile app id ")
        .option("-i, --instanceid <instanceid>", "mobile app instance id ")
        .option("-f, --file <file>", "mobile app (instance) file [app|instance].mdsp.json")
        .option("-o, --overwrite", "overwrite template files")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`list, create or delete mobile app (instances) *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options, true);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);
                    switch (options.mode) {
                        case "template":
                            await createTemplate(options, sdk);
                            console.log("Edit the files before submitting them to mindsphere.");
                            break;
                        case "create":
                            await createModel(options, sdk);
                            break;
                        case "list":
                            await listmobileapps(options, sdk);
                            break;
                        case "delete":
                            await deleteModel(options, sdk);
                            break;
                        case "update":
                            await updateModel(options, sdk);
                            break;
                        case "info":
                            await modelInfo(options, sdk);
                            break;
                        case "download":
                            await downloadModel(options, sdk);
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
    serviceCredentialLog();
}

export async function listmobileapps(options: any, sdk: MindSphereSdk) {
    const mobileApps = sdk.GetNotificationClientV4();

    let page = 0;
    let mobileapps;

    console.log(`modelid  name  [type]  author  version`);

    let appCount = 0;

    do {
        const params = page === 0 ? undefined : { page: page, size: 20 };

        mobileapps = (await retry(options.retry, () =>
            mobileApps.GetMobileApps(params)
        )) as NotificationModelsV4.PagedAppRegistrationResponse;

        mobileapps.mobileApps = mobileapps.mobileApps || [];
        mobileapps.page = mobileapps.page || { totalPages: 0 };

        for (const mobileApp of mobileapps.mobileApps || []) {
            appCount++;
            console.log(
                `[${mobileApp.type}]  ${color(mobileApp.name)}\t${mobileApp.android?.fcmServerKey}\t[${
                    mobileApp.ios?.apnsAppPrivateKey
                }`
            );

            verboseLog(JSON.stringify(mobileApp, null, 2), options.verbose);
        }
    } while (page++ < (mobileapps.page.totalPages || 0));

    console.log(`${color(appCount)} mobileapps listed.\n`);
}

async function updateModel(options: any, sdk: MindSphereSdk) {
    // const tenant = sdk.GetTenant();
    // const modelMgmt = sdk.GetModelManagementClient();
    // const oModel = (await retry(options.retry, () =>
    //     modelMgmt.GetModel(options.modelid)
    // )) as ModelManagementmobileapps.Model;
    // verboseLog(JSON.stringify(oModel, null, 2), options.verbose);
    // const type = options.modeltype ? options.modeltype : oModel.type || `${tenant}.CLI`;
    // const patch = {
    //     name: options.modelname || oModel.name,
    //     type: type,
    //     description: options.modeldesc || oModel.description,
    // };
    // const nextModel = (await retry(options.retry, () =>
    //     modelMgmt.PatchModel(`${oModel.id}`, patch)
    // )) as ModelManagementmobileapps.Model;
    // console.log(`Model with modelid ${color(nextModel.id)} (${color(nextModel.name)}) have been patched.`);
}

async function createTemplate(options: any, sdk: MindSphereSdk) {
    // const file = {
    //     name: options.modelname || `unnamed model (${uuid.v4()})`,
    //     type: options.modeltype || "core.basicmodel",
    //     description: options.modeldesc || "created with mindsphere CLI",
    //     lastVersion: {
    //         number: 1.0,
    //         dependencies: [
    //             {
    //                 name: "sklearn-theano",
    //                 type: "Python",
    //                 version: "2.7",
    //             },
    //         ],
    //         io: {
    //             consumes: "CSV",
    //             input: [
    //                 {
    //                     name: "variablename1",
    //                     type: "integer",
    //                     description: "description for variablename1",
    //                     value: 5,
    //                 },
    //             ],
    //             output: [
    //                 {
    //                     name: "outputname1",
    //                     type: "integer",
    //                     description: "description for outputname1",
    //                     value: 3,
    //                 },
    //             ],
    //             optionalParameters: {
    //                 freeFormParams: "for the author to use",
    //                 param1: "value1",
    //             },
    //         },
    //         producedBy: [],
    //         kpi: [
    //             {
    //                 name: "error rate",
    //                 value: 0.9,
    //             },
    //         ],
    //     },
    // };
    // const fileName = options.file || "model.file.mdsp.json";
    // fs.writeFileSync(fileName, JSON.stringify(file, null, 2));
    // const payloadFile = options.payload || "model.payload.mdsp.json";
    // fs.writeFileSync(payloadFile, JSON.stringify({ empty: "model" }, null, 2));
    // console.log(
    //     `The model file was written into ${color(fileName)} and empty model file ${color(
    //         payloadFile
    //     )} was created.\nRun \n\n\tmc mobileapps --mode create --file ${fileName} --payload ${payloadFile} \n\nto create the model.`
    // );
}

async function createModel(options: any, sdk: MindSphereSdk) {
    // const modelMgmt = sdk.GetModelManagementClient();
    // const filePath = path.resolve(options.file);
    // const filecontent = fs.readFileSync(filePath);
    // const filedata = JSON.parse(filecontent.toString());
    // const payloadFullPath = path.resolve(options.payload);
    // const filename = path.basename(payloadFullPath);
    // const buff = fs.readFileSync(payloadFullPath);
    // const mimetype = getFileType(options.payload);
    // const result = (await retry(options.retry, async () =>
    //     modelMgmt.PostModel(filedata, { buffer: buff, fileName: filename, mimeType: mimetype })
    // )) as ModelManagementmobileapps.Model;
    // console.log(`Model with modelid ${color(result.id)} and name ${color(result.name)} was created.`);
}

async function deleteModel(options: any, sdk: MindSphereSdk) {
    // const modelMgmt = sdk.GetModelManagementClient();
    // const model = await retry(options.retry, () => modelMgmt.GetModel(options.modelid));
    // verboseLog(JSON.stringify(model, null, 2), options.verbose);
    // await retry(options.retry, () => modelMgmt.DeleteModel(options.modelid));
    // console.log(`Model with modelid ${color(model.id)} (${color(model.name)}) was deleted.`);
}

async function modelInfo(options: any, sdk: MindSphereSdk) {
    // const model = (await retry(options.retry, () =>
    //     sdk.GetModelManagementClient().GetModel(options.modelid)
    // )) as ModelManagementmobileapps.Model;
    // verboseLog(JSON.stringify(model, null, 2), options.verbose);
    // const versions = (await retry(options.retry, () =>
    //     sdk.GetModelManagementClient().GetModelVersions({ modelId: model.id, pageNumber: 0, pageSize: 100 })
    // )) as ModelManagementmobileapps.VersionArray;
    // printModel(model);
    // printLatestModelVersions(versions);
}

async function downloadModel(options: any, sdk: MindSphereSdk) {
    // const filePath = path.resolve(options.file);
    // fs.existsSync(filePath) && errorLog(`the file file ${filePath} already exists!`, true);
    // const payloadPath = path.resolve(options.payload);
    // fs.existsSync(payloadPath) && errorLog(`the payload file ${payloadPath} already exists!`, true);
    // const version = options.version || "last";
    // const file = (await retry(options.retry, () =>
    //     sdk.GetModelManagementClient().GetModelVersion(options.modelid, version)
    // )) as ModelManagementmobileapps.Version;
    // verboseLog(JSON.stringify(file, null, 2), options.verbose);
    // fs.writeFileSync(filePath, JSON.stringify(file, null, 2));
    // console.log(`file file ${color(filePath)} was written successfully.`);
    // const download = (await retry(options.retry, () =>
    //     sdk.GetModelManagementClient().DownloadModelVersion(options.modelid, version)
    // )) as Response;
    // !download.ok && errorLog(`Unexpected response ${download.statusText}`, true);
    // const file = fs.createWriteStream(payloadPath);
    // await streamPipeline(download.body, file);
    // console.log(`payload file ${color(payloadPath)} was written successfully.`);
}

function checkRequiredParameters(options: any) {
    // options.mode === "create" && !options.file && errorLog("you have to specify the file file", true);
    // options.mode === "create" && !options.payload && errorLog("you have to specify the payload file", true);
    // (options.mode === "delete" || options.mode === "update") &&
    //     !options.modelid &&
    //     errorLog("you have to specify the id of the model", true);
    // options.mode === "update" &&
    //     !options.modelname &&
    //     errorLog("you have to specify at least the model name before patching the model", true);
    // options.mode === "info" && !options.modelid && errorLog("you have to provide a modelid", true);
    // options.mode === "download" &&
    //     (!options.modelid || !options.file || !options.payload) &&
    //     errorLog("you have to provide a modelid, file and payload file for download command", true);
}
