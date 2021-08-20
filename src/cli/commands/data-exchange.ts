import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { retry } from "../..";
import { DataExchangeModels, MindSphereSdk } from "../../api/sdk";
import { throwError } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    humanFileSize,
    proxyLog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";
const mime = require("mime-types");

const streamPipeline = util.promisify(require("stream").pipeline);
let color = getColor("blue");

export default (program: Command) => {
    program
        .command("data-exchange")
        .alias("dx")
        .option(
            "-m, --mode [list|info|download|upload|rename|delete|renamedir|mkdir|rmdir]",
            "mode [list | info | download | upload | rename | renamedir | delete | mkdir | rmdir ]",
            "list"
        )
        .option("-f, --file <file>", "file path ")
        .option("-n, --dirname <dirname>", "directory name for --mode mkdir command")
        .option("-w, --newname <newname>", "new file or directory name for --mode rename or renamedir command")
        .option("-d, --dirid <dirid>", `directory id [private | public | <id>]`, "public")
        .option("-i, --fileid <fileid>", `fileid`)
        .option("-r, --recursive", `used for --mode rmdir command, deletes all content in directory`)
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, upload, download and manage data exchange files and directories *"))
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

                        case "download":
                            await downloadFile(options, sdk);
                            break;

                        case "upload":
                            await uploadFile(options, sdk);
                            break;

                        case "delete":
                            await deleteFile(options, sdk);
                            break;

                        case "rename":
                            await renameFile(options, sdk);
                            break;

                        case "renamedir":
                            await renameDir(options, sdk);
                            break;

                        case "mkdir":
                            await makeDirectory(options, sdk);
                            break;

                        case "rmdir":
                            await removeDirectory(options, sdk);
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
            log(`    mc data-exchange --mode list \t\t\t\t\t  list all entries in public data exchange root`);
            log(
                `    mc data-exchange --mode list --dirid private \t\t\t  list all entries in private data exchange root`
            );
            log(`    mc data-exchange --mode info --dirid <dirid> \t\t\t  get full info about the specified directory`);
            log(`    mc data-exchange --mode info --fileid <fileid> \t\t\t  get full info about the specified`);
            log(`    mc data-exchange --mode download --fileid <fileid> \t\t\t  download file with specified id`);
            log(
                `    mc data-exchange --mode upload --file <file> --dirid <dirid> \t  upload file to specified directory`
            );
            log(`    mc data-exchange --mode rename --fileid <fileid> --newname <newname>  rename the specified file`);
            log(
                `    mc data-exchange --mode renamedir --dirid <dirid> --newname <newname> rename the specified directory`
            );
            log(`    mc data-exchange --mode delete --fileid <fileid> \t\t\t  delete file with specified id`);
            log(`    mc data-exchange --mode rmdir --dirid <dirid> \t\t\t  delete directory with specified id`);
            log(
                `    mc data-exchange --mode rmdir --dirid <dirid> --recursive \t\t  delete directory with specified id recrusively`
            );
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
    console.log(
        `the file ${color(result.name)} with size of ${result.sizeInBytes} bytes and type ${result.type} was uploaded.`
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

async function deleteFile(options: any, sdk: MindSphereSdk) {
    const fileInfo = await sdk.GetDataExchangeClient().GetFileProperties(options.fileid);
    await sdk.GetDataExchangeClient().DeleteFile(options.fileid);

    console.log(`File ${color(fileInfo.name)} with id ${options.fileid} was deleted.`);
}

async function renameFile(options: any, sdk: MindSphereSdk) {
    const dxClient = sdk.GetDataExchangeClient();
    const result = await dxClient.PatchFileProperties(options.fileid, { name: options.newname });
    console.log(`The file was renamed`);
    printInfos(result, "File");
    verboseLog(JSON.stringify(result, null, 2), options.verbose);
}

async function renameDir(options: any, sdk: MindSphereSdk) {
    if (options.dirid === DataExchangeModels.Root.Private || options.dirid === DataExchangeModels.Root.Public) {
        throwError(`You can't rename the root directory ${options.dirid}!`);
    }

    const dxClient = sdk.GetDataExchangeClient();
    const result = await dxClient.PatchDirectoryProperties(options.dirid, { name: options.newname });
    console.log(`The directory was renamed`);
    printInfos(result, "Dir");
    verboseLog(JSON.stringify(result, null, 2), options.verbose);
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
        printInfos(fileInfo, "File");
        verboseLog(JSON.stringify(fileInfo, null, 2), options.verbose);
    } else if (options.dirid) {
        const dirInfo = await sdk.GetDataExchangeClient().GetDirectoryProperties(options.dirid);
        printInfos(dirInfo, "Dir");
        verboseLog(JSON.stringify(dirInfo, null, 2), options.verbose);
    } else {
        console.log("Couldn't find the file or dir.");
    }
}

function printInfos(fileInfo: DataExchangeModels.File, type: "File" | "Dir") {
    console.log(`${color(type)} Information:`);
    console.log(`\tid: ${color(fileInfo.id)}`);
    console.log(`\tname: ${color(fileInfo.name)}`);
    console.log(`\ttype: ${fileInfo.type}`);
    console.log(`\tparentId: ${fileInfo.parentId}`);
    console.log(`\tsize: ${humanFileSize(fileInfo.sizeInBytes || 0)}`);
    console.log(`\tmodified date: ${fileInfo.modifiedDate}`);
    console.log(`\tmodified by: ${color(fileInfo.modifiedBy)}`);
}

async function makeDirectory(options: any, sdk: MindSphereSdk) {
    const dxClient = sdk.GetDataExchangeClient();
    const result = await dxClient.PostDirectory({ name: options.dirname, parentId: options.dirid });
    console.log(
        `the directory ${color(result.name)} with dirid ${color(result.id)} was created in ${
            result.parentId
        } directory.`
    );
}

async function removeDirectory(options: any, sdk: MindSphereSdk) {
    const dxClient = sdk.GetDataExchangeClient();
    await dxClient.DeleteDirectory(options.dirid, { recursive: options.recursive || false });
    console.log(
        `the directory with id ${color(options.dirid)} ${options.recursive ? "and all its content" : ""} was deleted.`
    );
}

function checkRequiredParamaters(options: any) {
    //[list|info|download|upload|rename|delete|renamedir|mkdir|rmdir]
    options.mode === "list" &&
        !options.dirid &&
        errorLog("you have to provide the --dirid for --mode list command.", true);

    options.mode === "info" &&
        !(options.dirid || options.fileid) &&
        errorLog("you have to provide the --dirid or --fileid for --mode info command.", true);

    options.mode === "download" &&
        !options.fileid &&
        errorLog("you have to provide the --fileid for --mode download command.", true);

    options.mode === "upload" &&
        !options.file &&
        errorLog("you have to provide the --file for --mode upload command.", true);

    options.mode === "upload" &&
        !options.dirid &&
        errorLog("you have to provide the --dirid for --mode upload command.", true);

    options.mode === "rename" &&
        !options.fileid &&
        errorLog("you have to provide the --fileid for --mode rename command.", true);

    options.mode === "rename" &&
        !options.newname &&
        errorLog("you have to provide the --newname for --mode rename command.", true);

    options.mode === "renamedir" &&
        !options.dirid &&
        errorLog("you have to provide the --dirid for --mode renamedir command.", true);

    options.mode === "renamedir" &&
        !options.newname &&
        errorLog("you have to provide the --newname for --mode renamedir command.", true);

    options.mode === "mkdir" &&
        !options.dirname &&
        errorLog("you have to provide the --dirname for --mode mkdir command.", true);

    options.mode === "mkdir" &&
        !options.dirid &&
        errorLog("you have to provide the --dirid with parent id for --mode mkdir command.", true);

    options.mode === "rmdir" &&
        !options.dirid &&
        errorLog("you have to provide the --dirid with  --mode rmdir command.", true);
}
