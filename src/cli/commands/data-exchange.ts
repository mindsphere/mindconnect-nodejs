import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { retry } from "../..";
import { DataExchangeModels, MindSphereSdk } from "../../api/sdk";
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
        .command("data-exchange")
        .alias("dx")
        .option("-m, --mode [list|info]", "mode [list | info | download | upload | mkdir]", "list")
        .option("-f, --file <file>", "file path ")
        .option("-n, --dirname <dirname>", "directory name")
        .option("-d, --dirid <dirid>", `directory id [private | public | <id>]`, "public")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create and delete files on data-exchange *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options, true);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    options.dirid === "public" && (options.dirid = DataExchangeModels.Root.Public);
                    options.dirid === "private" && (options.dirid = DataExchangeModels.Root.Private);

                    switch (options.mode) {
                        case "list":
                            await listFiles(sdk, options);
                            break;

                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "download":
                            await downloadFile(options, sdk);
                            break;

                        case "upload":
                            await uploadFile(options, sdk);
                            break;

                        case "mkdir":
                            await makeDirectory(options, sdk);
                            break;

                        case "info":
                            await entryInfo(options, sdk);
                            break;

                        default:
                            throw Error(`no such option: ${options.mode}`);
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc jobs --mode list \t\t\t\t\t list all jobs`);
            // log(`    mc jobs --mode list --job Pump\t\t list all jobs which are named Pump`);
            // log(
            //     `    mc jobs --mode template --job Pump \n\tcreate a template file (Enironment.job.mdsp.json) for job Pump`
            // );
            // log(`    mc jobs --mode create --file Pump.job.mdsp.json \n\tcreate job Pump in MindSphere`);

            serviceCredentialLog();
        });
};

async function uploadFile(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);

    const result = await sdk
        .GetDataExchangeClient()
        .PostFile(
            { name: path.basename(options.file), parentId: options.dirid, type: mime.lookup(options.file) },
            file
        );
    verboseLog(JSON.stringify(result, null, 2), options.verbose);
    console.log(`the file ${color(result.name)} with ${result.sizeInBytes} and type ${result.type} was uploaded.`);
}

function createTemplate(options: any) {
    const templateType = {
        modelId: "<modelId>:guid",
        configurationId: "<configurationId:guid>",
        inputFolderId: "<inputFolderIdFromDataExchange:guid>",
        outputFolderId: "<outputFolderIdFromDataExchange:id",
        maximumExecutionTimeInSeconds: "60",
    };
    verboseLog(templateType, options.verbose);
    writejobToFile(options, templateType);
}

function writejobToFile(options: any, job: any) {
    const fileName = options.file || `job.jobmanager.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.writeFileSync(filePath, JSON.stringify(job, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc jobs --mode create --file ${fileName} \n\nto create the job`
    );
}

async function downloadFile(options: any, sdk: MindSphereSdk) {
    const fileInfo = await sdk.GetDataExchangeClient().GetFileProperties(options.fileid);

    const download = (await retry(options.retry, () =>
        sdk.GetDataExchangeClient().GetFile(options.fileid)
    )) as Response;
    !download.ok && errorLog(`Unexpected response ${download.statusText}`, true);

    const downloadPath = path.resolve(options.file || fileInfo.name);
    const file = fs.createWriteStream(downloadPath);
    await streamPipeline(download.body, file);

    console.log(`${color(downloadPath)} was written successfully.`);
}

async function listFiles(sdk: MindSphereSdk, options: any) {
    const dxClient = sdk.GetDataExchangeClient();

    let page = 0;
    let filesOrDirs;

    const filter = buildFilter(options);
    verboseLog(JSON.stringify(filter, null, 2), options.verbose);

    console.log(`${color("type")}  id  ${color("name")}  (modifiedBy)  modifiedDate [size]  [type]`);

    let entryCount = 0;

    do {
        filesOrDirs = (await retry(options.retry, () =>
            dxClient.GetDirectory(options.dirid, {
                pageNumber: page,
                pageSize: 100,
                filter: Object.keys(filter).length === 0 ? undefined : JSON.stringify(filter),
            })
        )) as DataExchangeModels.DirectoriesFilesArray;

        filesOrDirs.page = filesOrDirs.page || { totalPages: 0 };

        for (const dir of filesOrDirs.directories || []) {
            entryCount++;

            console.log(
                `${color("D:")} ${dir.id} ${color(dir.name)} (${dir.modifiedBy}) ${dir.modifiedDate} [-] [${color(
                    "DIR"
                )}]`
            );
            verboseLog(JSON.stringify(dir, null, 2), options.verbose);
        }

        for (const file of filesOrDirs.files || []) {
            entryCount++;

            console.log(
                `F: ${file.id} ${color(file.name)} (${file.modifiedBy}) ${file.modifiedDate} [${file.sizeInBytes}] [${
                    file.type
                }]`
            );
            verboseLog(JSON.stringify(file, null, 2), options.verbose);
        }
    } while (page++ < (filesOrDirs.page.totalPages || 0));

    console.log(`${color(entryCount)} entries listed.\n`);
}

function buildFilter(options: any) {
    const filter = (options.filter && JSON.parse(options.filter)) || {};
    let pointer = filter;
    if (options.jobid !== undefined) {
        filter.and = {};
        pointer = filter.and;
    }
    if (options.jobid) {
        pointer.id = { contains: `${options.jobid}` };
    }
    if (options.typeid) {
        pointer.id = { contains: `${options.typeid}` };
    }
    return filter;
}

async function entryInfo(options: any, sdk: MindSphereSdk) {
    if (options.fileid) {
        const fileInfo = await sdk.GetDataExchangeClient().GetFileProperties(options.fileid);
        console.table(fileInfo);
        verboseLog(JSON.stringify(fileInfo, null, 2), options.verbose);
    } else if (options.dirid) {
        const dirInfo = await sdk.GetDataExchangeClient().GetDirectoryProperties(options.dirid);
        console.table(dirInfo);
        verboseLog(JSON.stringify(dirInfo, null, 2), options.verbose);
    } else {
        console.log("Couldn't find the file or dir.");
    }
}

function checkRequiredParamaters(options: any) {
    // options.mode === "create" &&
    //     !options.file &&
    //     errorLog(
    //         "you have to provide a file with job parameters to create an job (see mc jobs --help for more details)",
    //         true
    //     );
    // options.mode === "stop" &&
    //     !options.jobid &&
    //     errorLog(
    //         "you have to provide the jobid of the job you want to stop (see mc jobs --help for more details)",
    //         true
    //     );
    // options.mode === "info" &&
    //     !options.jobid &&
    //     errorLog(
    //         "you have to provide the jobid to get infos about the job (see mc jobs --help for more details)",
    //         true
    //     );
}
function makeDirectory(options: any, sdk: MindSphereSdk) {
    throw new Error("Function not implemented.");
}
