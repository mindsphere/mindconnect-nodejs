import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
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

let color = getColor("blue");

export default (program: CommanderStatic) => {
    program
        .command("models")
        .alias("ml")
        .option("-m, --mode [list|create|delete|update|info]", "mode [list | create | delete | update | info]", "list")
        .option("-n, --modelname <modelname>", "modelname")
        .option("-t, --modeltype <modeltype>", "modeltype")
        .option("-d, --modeldesc <modeldesc>", "modeldesc", "created with mindsphere CLI")
        .option("-i, --modelid <modelid>", "mindsphere model id ")
        .option("-f, --modelfile <modelfile>", ".mdsp.json modelfile with model definition")
        .option("-p, --payload <modelpayload>", "model payload to upload")
        .option("-i, --modelid <modelid>", "mindsphere model id ")
        .option("-a, --modelauthor <modelauthor>", "created by mindsphere CLI")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`list, create or delete analytic models in mindsphere *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options, true);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);
                    switch (options.mode) {
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
        `    mc models --mode create --modeltype core.basicmodel --modelname MyModel \t creates a model in mindsphere of type basicmodel`
    );
    log(
        `    mc models --mode create --modelfile MyPump.model.mdsp.json \t\t creates a model from specified modelfile template`
    );
    log(`    mc models --mode list \t\t\t\t\t\t lists all models in mindsphere`);
    log(`    mc models --mode list --modeltype mclib\t\t\t\t lists all models in mindsphere of type core.mclib`);
    log(
        `    mc models --mode update --modelid 1234567..ef --modeltype core.basicmodel --modelname MyModel \t patches the name and the type of a model with specified id from mindsphere`
    );
    log(`    mc models --mode delete --modelid 1234567..ef \t\t\t deletes model with specified id from mindsphere`);
    log(`    mc models --mode info --modelid 123456...ef \t print out infos about model with id 132456...ef`);
    serviceCredentialLog();
}

export async function listModels(options: any, sdk: MindSphereSdk) {
    const modelMgmt = sdk.GetModelManagementClient();

    let page = 0;
    let models;

    const filter = buildFilter(options);
    verboseLog(JSON.stringify(filter, null, 2), options.verbose);

    console.log(`modelid  name  [type]  author  version`);

    let modelCount = 0;

    do {
        models = (await retry(options.retry, () =>
            modelMgmt.GetModels({
                pageNumber: page,
                pageSize: 100,
                filter: Object.keys(filter).length === 0 ? undefined : JSON.stringify(filter),
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

async function createModel(options: any, sdk: MindSphereSdk) {
    const modelMgmt = sdk.GetModelManagementClient();
    let data = {
        name: options.modelname || "unnamed",
        type: options.modeltype || "please enter type",
        description: options.modeldesc || "created with mindsphere CLI",
        author: options.modelauthor || "created by mindsphere CLI",
        lastVersion: {
            number: 0.0,
            expirationDate: "2021-10-01T12:00:00.001",
            dependencies: [],
            io: {},
            kpi: [],
        },
    };
    if (options.modelfile) {
        const filePath = path.resolve(options.modelfile);
        const filecontent = fs.readFileSync(filePath);
        const filedata = JSON.parse(filecontent.toString());

        filedata.name = options.modelname || filedata.name;
        filedata.type = options.modeltype || filedata.type;
        filedata.description = options.modeldesc || filedata.description;
        filedata.author = options.modelauthor || filedata.author;

        data = filedata;
    }

    let buff = Buffer.alloc(0);
    let filename = "empty_payload.txt";
    let mimetype = "application/octet-stream";

    if (options.modelpayload) {
        const payloadFullPath = path.resolve(options.payload);
        filename = path.basename(payloadFullPath);
        buff = fs.readFileSync(payloadFullPath);
        mimetype = getFileType(options.payload);
    }

    const result = (await retry(options.retry, async () =>
        modelMgmt.postModel(data, { buffer: buff, fileName: filename, mimeType: mimetype })
    )) as ModelManagementModels.Model;

    console.log(`Model with modelid ${color(result.id)} and name ${color(result.name)} was created.`);
}

function buildFilter(options: any) {
    const filter = (options.filter && JSON.parse(options.filter)) || {};
    const pointer = filter;
    if (options.modelname) {
        pointer.name = `${options.modelname}`;
    }
    if (options.modeltype) {
        pointer.type = `${options.modeltype}`;
    }
    return filter;
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

    const versions = (await retry(options.retry, () =>
        sdk.GetModelManagementClient().GetModelVersions({ modelId: model.id, pageNumber: 0, pageSize: 100 })
    )) as ModelManagementModels.VersionArray;

    printModel(model);
    printLatestModelVersions(versions);
}

function checkRequiredParameters(options: any) {
    options.mode === "create" &&
        !options.modelfile &&
        (!options.modelname || !options.modeltype) &&
        errorLog("you have to specify at least the model name and type if you are not using modelfile template", true);

    (options.mode === "delete" || options.mode === "update") &&
        !options.modelid &&
        errorLog("you have to specify the id of the model", true);

    options.mode === "update" &&
        !options.modelname &&
        errorLog("you have to specify at least the model name before patching the model", true);

    options.mode === "info" && !options.modelid && errorLog("you have to provide a modelid", true);
}

function getFileType(modelfile: string | Buffer) {
    return modelfile instanceof Buffer
        ? "application/octet-stream"
        : `${mime.lookup(modelfile)}` || "application/octet-stream";
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
    console.log(`- Version nummer: ${color(model.lastVersion?.number)}`);
    console.log(`- Author: ${color(model.lastVersion?.author)}`);
    console.log(`- Creation date: ${color(model.lastVersion?.creationDate)}`);
    console.log(`- Expiation date: ${color(model.lastVersion?.expirationDate)}`);
}

function printLatestModelVersions(versions: ModelManagementModels.VersionArray) {
    console.log("\nLastest version entries:");
    console.table(versions.versions?.slice(0, 5) || [], ["number", "author", "creationDate", "expirationDate"]);
}
