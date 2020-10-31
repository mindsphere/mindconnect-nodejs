import { CommanderStatic } from "commander";
import { log } from "console";
import * as path from "path";
import { DataLakeModels, MindSphereSdk } from "../../api/sdk";
import { removeUndefined, retry } from "../../api/utils";
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
import ora = require("ora");

let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("data-lake")
        .alias("dlk")
        .option(
            "-m, --mode [...]",
            "mode: list | read | write | delete | readtoken | writetoken | uploadurl | downloadurl | upload",
            "list"
        )
        .option("-f, --file <file>", "file to upload")
        .option("-l, --shell [bash|ps|cmd]", "output format for STS token [bash | ps | cmd]", "bash")
        .option("-p, --path <path>", "path for read/write token or uploadUrl downloadUrl comamand")
        .option("-i, --permissionid <permissionid>", "permission id for delete operation")
        .option("-s, --subtenantid <subtenantid>", "subtenant id")
        .option("-d, --duration <duration>", "duration in seconds", "3600")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`manage data lake, data lake access permissions and STS tokens *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    switch (options.mode) {
                        case "list":
                            await listPermissions(options, sdk);
                            break;
                        case "write":
                            await allowWrite(sdk, options);
                            break;
                        case "delete":
                            await deletePermission(sdk, options);
                            break;
                        case "readtoken":
                        case "writetoken":
                            await generateToken(sdk, options);
                            break;
                        case "uploadurl":
                            await uploadUrl(sdk, options);
                            break;
                        case "upload":
                            await uploadFile(sdk, options);
                            break;

                        case "downloadurl":
                            await downloadUrl(sdk, options);
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
            log(`    mc data-lake --mode list \t\t\tlists all configured permissions for data lake`);
            log(`    mc data-lake --mode write \t\t\tallow writing to the data lake`);
            log(`    mc data-lake --mode write --path data/ \tallow writing to the data lake from data/ folder`);
            log(`    mc data-lake --mode readtoken \t\tcreate AWS STS Token with read rights`);
            log(`    mc data-lake --mode writetoken \t\tcreate AWS STS Token with write rights from data lake root`);
            log(
                `    mc data-lake --mode writetoken --path data/ create AWS STS Token with write rights from data/ folder`
            );

            log(
                `    mc data-lake --mode delete --permissionid  <permissionid>\t\t\t delete writing permission with selected permissionid`
            );

            log(
                `    mc data-lake --mode upload --file CHANGELOG.md --path uploads/CHANGELOG.md \t upload file to data lake`
            );

            log(
                `    mc data-lake --mode downloadurl --path uploads/CHANGELOG.md \t\t generate download url for the path`
            );

            log("\n  Additional Information:\n");
            log(
                `    Purchasing Data Lake: ${color(
                    "https://www.dex.siemens.com/mindsphere/applications/integrated-data-lake"
                )}`
            );

            log(
                `    Data Lake APIs: ${color(
                    "https://developer.mindsphere.io/apis/iot-integrated-data-lake/api-integrated-data-lake-overview.html"
                )}`
            );
            serviceCredentialLog();
        });
};

async function downloadUrl(sdk: MindSphereSdk, options: any) {
    const url = await sdk.GetDataLakeClient().GenerateDownloadObjectUrls({
        paths: [{ path: `${options.path}` }],
        subtenantId: options.subtenantid,
    });
    verboseLog(JSON.stringify(url, null, 2), options.verbose);
    console.log(`\nDownload URL for ${color(url.objectUrls![0].path)}`);
    console.log(`\nClick on the URL below to download the file:\n`);
    console.log(color(url.objectUrls![0].signedUrl));
}

async function uploadFile(sdk: MindSphereSdk, options: any) {
    const fullPath = path.resolve(options.file);

    const spinner = ora(`Uploading ${color(fullPath)} to data Lake`);
    !options.verbose && spinner.start();
    verboseLog(`Creating Data Lake upload URL`, options.verbose, spinner);

    const url = await sdk.GetDataLakeClient().GenerateUploadObjectUrls({
        paths: [{ path: `${options.path}` }],
        subtenantId: options.subtenantid,
    });
    verboseLog(
        `Uploading file ${color(fullPath)} as ${color(url.objectUrls![0].path)} to data lake`,
        options.verbose,
        spinner
    );

    verboseLog(JSON.stringify(url, null, 2), options.verbose);
    const result = await sdk.GetDataLakeClient().PutFile(fullPath, url.objectUrls![0].signedUrl!);
    verboseLog(JSON.stringify(result, null, 2), options.verbose);
    spinner.succeed(`Uploaded file ${color(fullPath)} as ${color(url.objectUrls![0].path)} to data lake`);
}

async function uploadUrl(sdk: MindSphereSdk, options: any) {
    const url = await sdk.GetDataLakeClient().GenerateUploadObjectUrls({
        paths: [{ path: `${options.path}` }],
        subtenantId: options.subtenantid,
    });
    verboseLog(JSON.stringify(url, null, 2), options.verbose);
    console.log(`\nUpload URL for ${color(url.objectUrls![0].path)}`);
    console.log(`\nUpload file to the URL below:\n`);
    console.log(color(url.objectUrls![0].signedUrl));
}

async function deletePermission(sdk: MindSphereSdk, options: any) {
    await sdk.GetDataLakeClient().DeleteAccessTokenPermission(options.permissionid);
    console.log(`Permission with id ${options.permissionid} was deleted`);
}

async function allowWrite(sdk: MindSphereSdk, options: any) {
    const result = await sdk.GetDataLakeClient().PostAccessTokenPermissions({
        path: `${options.path || "/"}`,
        subtenantId: options.subtenantid,
        permission: DataLakeModels.AccessPermission.WRITE,
    });

    verboseLog(result, options.verbose);
    console.log(
        `${result.id} ${color(result.path)}\t${result.permission}\t${result.created}\t${color(
            result.subtenantId || ""
        )}`
    );

    console.log(`Write permission with ${result.id} created.`);
}

async function generateToken(sdk: MindSphereSdk, options: any) {
    const dataLake = sdk.GetDataLakeClient();

    const result = await dataLake.GenerateAccessToken(
        removeUndefined({
            path: options.path || "/",
            permission:
                options.mode === "readtoken"
                    ? DataLakeModels.AccessTokenPermission.READ
                    : DataLakeModels.AccessTokenPermission.WRITE,
            subtenantId: options.subtenantid,
            durationSeconds: options.duration ? parseInt(options.duration) : undefined,
        })
    );

    console.log(`\nCopy the following commands to your ${color(options.shell)} shell to enable s3 authorization:`);

    switch (options.shell) {
        case "bash":
            console.log(`\nexport AWS_ACCESS_KEY_ID="${result.credentials.accessKeyId}"`);
            console.log(`export AWS_SECRET_ACCESS_KEY="${result.credentials.secretAccessKey}"`);
            console.log(`export AWS_SESSION_TOKEN="${result.credentials.sessionToken}"`);
            break;
        case "ps":
            console.log(`\n$Env:AWS_ACCESS_KEY_ID="${result.credentials.accessKeyId}"`);
            console.log(`$Env:AWS_SECRET_ACCESS_KEY="${result.credentials.secretAccessKey}"`);
            console.log(`$Env:AWS_SESSION_TOKEN="${result.credentials.sessionToken}"`);
            break;
        case "cmd":
            console.log(`\nset "AWS_ACCESS_KEY_ID=${result.credentials.accessKeyId}"`);
            console.log(`set "AWS_SECRET_ACCESS_KEY=${result.credentials.secretAccessKey}"`);
            console.log(`set "AWS_SESSION_TOKEN=${result.credentials.sessionToken}"`);
            break;
        default:
            break;
    }

    console.log(`\nExample ${color("aws s3 ls")} command:`);
    console.log(`\n\taws s3 ls s3://${result.storageAccount}/${result.storagePath}`);

    console.log(`\nIntegrated Data Lake S3 bucket:`);
    console.log(color(`\n\ts3://${result.storageAccount}/${result.storagePath}\n`));
}

export async function listPermissions(options: any, sdk: MindSphereSdk) {
    const dataLake = sdk.GetDataLakeClient();

    let page = 0;
    let paths;
    let pathCount = 0;

    console.log(`permissionid\t${color("path")}\tmode\tcreated\tsubtentantid`);
    do {
        paths = (await retry(options.retry, () =>
            dataLake.GetAccessTokenPermissions({
                page: page,
                size: 100,
            })
        )) as DataLakeModels.AccessTokenPermissionResources;

        paths.page = paths.page || { totalPages: 0 };

        for (const path of paths.accessTokenPermissions || []) {
            pathCount++;
            console.log(
                `${path.id} ${color(path.path)}\t${path.permission}\t${path.created}\t${color(path.subtenantId || "")}`
            );

            verboseLog(JSON.stringify(path, null, 2), options.verbose);
        }
    } while (page++ < (paths.page.totalPages || 0));

    console.log(`${color(pathCount)} permissions listed.\n`);
}

function checkRequiredParameters(options: any) {
    ["upload", "uploadurl", "downloadurl"].includes(options.mode) &&
        !options.path &&
        errorLog(`You have to specify --path for mc data-lake --mode ${options.mode} command.`, true);

    ["upload", "uploadurl"].includes(options.mode) &&
        !options.file &&
        errorLog(`You have to specify --file for mc data-lake --mode ${options.mode} command.`, true);

    options.mode === "delete" &&
        !options.permissionid &&
        errorLog("You have to specify the permissionid for delete command.", true);

    options.shell &&
        !["bash", "ps", "cmd"].includes(options.shell) &&
        errorLog("The shell can only be bash, ps (Windows PowerShell) or cmd (Windows cmd).", true);
}
