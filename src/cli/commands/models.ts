import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import * as uuid from "uuid";
import { MindSphereSdk, ModelManagementModels } from "../../api/sdk";
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

export default (program: Command) => {
    program
        .command("models")
        .alias("ml")
        .option(
            "-m, --mode [list|create|delete|update|info|download|template]",
            "mode [list | create | delete | update | info | download| template]",
            "list"
        )
        .option("-n, --modelname <modelname>", "modelname")
        .option("-t, --modeltype <modeltype>", "modeltype")
        .option("-d, --modeldesc <modeldesc>", "modeldesc", "created with mindsphere CLI")
        .option("-i, --modelid <modelid>", "mindsphere model id ")
        .option("-f, --metadata <metadata>", "model metadata file", "model.metadata.mdsp.json")
        .option("-r, --version <version>", "model version for download", "last")
        .option("-p, --payload <payload>", "model payload file", "model.payload.mdsp.json")
        .option("-i, --modelid <modelid>", "mindsphere model id ")
        .option("-a, --modelauthor <modelauthor>", "model author", "created by mindsphere CLI")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`list, create or delete analytic models *`))
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
                            await listModels(options, sdk);
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
    log(
        `    mdsp models --mode template --modeltype core.basicmodel --modelname MyModel \t creates a template for model`
    );
    log(
        `    mdsp models --mode create --metadata model.metadata.mdsp.json --payload model.payload.mdsp.json \n\t\t\t\t\t\t\t creates a model from specified files`
    );
    log(`    mdsp models --mode list \t\t\t\t lists all models in mindsphere`);
    log(`    mdsp models --mode delete --modelid 1234567..ef \t deletes model with specified id`);
    log(`    mdsp models --mode info --modelid 123456...ef \t print out infos about model with id 132456...ef`);
    log(`    mdsp models --mode download --modelid 123456...ef \t download model with id 132456...ef`);
    serviceCredentialLog();
}

export async function listModels(options: any, sdk: MindSphereSdk) {
    const modelMgmt = sdk.GetModelManagementClient();

    let page = 0;
    let models;

    console.log(`modelid  name  [type]  author  version`);

    let modelCount = 0;

    do {
        models = (await retry(options.retry, () =>
            modelMgmt.GetModels({
                pageNumber: page,
                pageSize: 100,
                sort: "asc",
            })
        )) as ModelManagementModels.ModelArray;

        models.models = models.models || [];
        models.page = models.page || { totalPages: 0 };

        for (const model of models.models || []) {
            modelCount++;
            console.log(
                `${model.id}  ${color(model.name)}\t${model.type}\t[${model.author}]\t${model.lastVersion?.number}`
            );

            verboseLog(JSON.stringify(model, null, 2), options.verbose);
        }
    } while (page++ < (models.page.totalPages || 0));

    console.log(`${color(modelCount)} models listed.\n`);
}

async function updateModel(options: any, sdk: MindSphereSdk) {
    const tenant = sdk.GetTenant();
    const modelMgmt = sdk.GetModelManagementClient();
    const oModel = (await retry(options.retry, () =>
        modelMgmt.GetModel(options.modelid)
    )) as ModelManagementModels.Model;
    verboseLog(JSON.stringify(oModel, null, 2), options.verbose);

    const type = options.modeltype ? options.modeltype : oModel.type || `${tenant}.CLI`;

    const patch = {
        name: options.modelname || oModel.name,
        type: type,
        description: options.modeldesc || oModel.description,
    };

    const nextModel = (await retry(options.retry, () =>
        modelMgmt.PatchModel(`${oModel.id}`, patch)
    )) as ModelManagementModels.Model;
    console.log(`Model with modelid ${color(nextModel.id)} (${color(nextModel.name)}) have been patched.`);
}

async function createTemplate(options: any, sdk: MindSphereSdk) {
    const metadata = {
        name: options.modelname || `unnamed model (${uuid.v4()})`,
        type: options.modeltype || "core.basicmodel",
        description: options.modeldesc || "created with mindsphere CLI",
        lastVersion: {
            number: 1.0,
            dependencies: [
                {
                    name: "sklearn-theano",
                    type: "Python",
                    version: "2.7",
                },
            ],
            io: {
                consumes: "CSV",
                input: [
                    {
                        name: "variablename1",
                        type: "integer",
                        description: "description for variablename1",
                        value: 5,
                    },
                ],
                output: [
                    {
                        name: "outputname1",
                        type: "integer",
                        description: "description for outputname1",
                        value: 3,
                    },
                ],
                optionalParameters: {
                    freeFormParams: "for the author to use",
                    param1: "value1",
                },
            },
            producedBy: [],
            kpi: [
                {
                    name: "error rate",
                    value: 0.9,
                },
            ],
        },
    };

    const fileName = options.metadata || "model.metadata.mdsp.json";
    fs.writeFileSync(fileName, JSON.stringify(metadata, null, 2));

    const payloadFile = options.payload || "model.payload.mdsp.json";
    fs.writeFileSync(payloadFile, JSON.stringify({ empty: "model" }, null, 2));

    console.log(
        `The model metadata was written into ${color(fileName)} and empty model file ${color(
            payloadFile
        )} was created.\nRun \n\n\tmdsp models --mode create --metadata ${fileName} --payload ${payloadFile} \n\nto create the model.`
    );
}

async function createModel(options: any, sdk: MindSphereSdk) {
    const modelMgmt = sdk.GetModelManagementClient();

    const filePath = path.resolve(options.metadata);
    const filecontent = fs.readFileSync(filePath);
    const filedata = JSON.parse(filecontent.toString());

    const payloadFullPath = path.resolve(options.payload);
    const filename = path.basename(payloadFullPath);
    const buff = fs.readFileSync(payloadFullPath);
    const mimetype = getFileType(options.payload);

    const result = (await retry(options.retry, async () =>
        modelMgmt.PostModel(filedata, { buffer: buff, fileName: filename, mimeType: mimetype })
    )) as ModelManagementModels.Model;

    console.log(`Model with modelid ${color(result.id)} and name ${color(result.name)} was created.`);
}

async function deleteModel(options: any, sdk: MindSphereSdk) {
    const modelMgmt = sdk.GetModelManagementClient();
    const model = await retry(options.retry, () => modelMgmt.GetModel(options.modelid));
    verboseLog(JSON.stringify(model, null, 2), options.verbose);

    await retry(options.retry, () => modelMgmt.DeleteModel(options.modelid));

    console.log(`Model with modelid ${color(model.id)} (${color(model.name)}) was deleted.`);
}

async function modelInfo(options: any, sdk: MindSphereSdk) {
    const model = (await retry(options.retry, () =>
        sdk.GetModelManagementClient().GetModel(options.modelid)
    )) as ModelManagementModels.Model;

    verboseLog(JSON.stringify(model, null, 2), options.verbose);
    const versions = (await retry(options.retry, () =>
        sdk.GetModelManagementClient().GetModelVersions({ modelId: model.id, pageNumber: 0, pageSize: 100 })
    )) as ModelManagementModels.VersionArray;

    printModel(model);
    printLatestModelVersions(versions);
}

async function downloadModel(options: any, sdk: MindSphereSdk) {
    const metaDataPath = path.resolve(options.metadata);
    fs.existsSync(metaDataPath) && errorLog(`the metadata file ${metaDataPath} already exists!`, true);

    const payloadPath = path.resolve(options.payload);
    fs.existsSync(payloadPath) && errorLog(`the payload file ${payloadPath} already exists!`, true);

    const version = options.version || "last";

    const metadata = (await retry(options.retry, () =>
        sdk.GetModelManagementClient().GetModelVersion(options.modelid, version)
    )) as ModelManagementModels.Version;

    verboseLog(JSON.stringify(metadata, null, 2), options.verbose);
    fs.writeFileSync(metaDataPath, JSON.stringify(metadata, null, 2));

    console.log(`metadata file ${color(metaDataPath)} was written successfully.`);

    const download = (await retry(options.retry, () =>
        sdk.GetModelManagementClient().DownloadModelVersion(options.modelid, version)
    )) as Response;
    !download.ok && errorLog(`Unexpected response ${download.statusText}`, true);

    const file = fs.createWriteStream(payloadPath);
    await streamPipeline(download.body, file);

    console.log(`payload file ${color(payloadPath)} was written successfully.`);
}

function checkRequiredParameters(options: any) {
    options.mode === "create" && !options.metadata && errorLog("you have to specify the metadata file", true);
    options.mode === "create" && !options.payload && errorLog("you have to specify the payload file", true);

    (options.mode === "delete" || options.mode === "update") &&
        !options.modelid &&
        errorLog("you have to specify the id of the model", true);

    options.mode === "update" &&
        !options.modelname &&
        errorLog("you have to specify at least the model name before patching the model", true);

    options.mode === "info" && !options.modelid && errorLog("you have to provide a modelid", true);

    options.mode === "download" &&
        (!options.modelid || !options.metadata || !options.payload) &&
        errorLog("you have to provide a modelid, metadata and payload file for download command", true);
}

function getFileType(metadata: string | Buffer) {
    return metadata instanceof Buffer
        ? "application/octet-stream"
        : `${mime.lookup(metadata)}` || "application/octet-stream";
}

function printModel(model: ModelManagementModels.Model) {
    console.log(`\nModel Information for Model with Model Id: ${color(model.id)}\n`);
    console.log(`Id: ${color(model.id)}`);
    console.log(`Name: ${color(model.name)}`);
    console.log(`Type: ${color(model.type)} ${color(":")} ${color(model.lastVersion?.number)}`);
    console.log(`Author: ${color(model.author)}`);
    console.log(`Description: ${color(model.description)}`);
    console.log("Last version:");
    console.log(`- Id: ${color(model.lastVersion?.id)}`);
    console.log(`- Version number: ${color(model.lastVersion?.number)}`);
    console.log(`- Author: ${color(model.lastVersion?.author)}`);
    console.log(`- Creation date: ${color(model.lastVersion?.creationDate)}`);
    console.log(`- Expiration date: ${color(model.lastVersion?.expirationDate)}`);
}

function printLatestModelVersions(versions: ModelManagementModels.VersionArray) {
    console.log("\nLastest version entries:");
    console.table(versions.versions?.slice(0, 5) || [], ["number", "author", "creationDate", "expirationDate"]);
}
