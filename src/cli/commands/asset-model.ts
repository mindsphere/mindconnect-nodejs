import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { arrayToTree } from "performant-array-to-tree";
import * as util from "util";
import { AssetManagementModels, MindSphereSdk } from "../../api/sdk";
import { printTree } from "../../api/utils";
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
const streamPipeline = util.promisify(require("stream").pipeline);

let color = getColor("magenta");

interface ModelDefinition {
    assetTypes: string[];
    aspectTypes: string[];
    assets: string[];
    files: any;
}

export default (program: Command) => {
    program
        .command("asset-model")
        .alias("asm")
        .option("-m, --mode [export|import]", "export | import", "export")
        .option("-d, --directory [directory]", "download to specified folder (default: <tenantname.mdsp.model>)")
        .option("-i, --assetid [assetid]", "mindsphere asset id  (default: root asset id)")
        .option("-o, --overwrite", "overwrite directory with the model if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete asset types *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const sdk = getSdk(options);

                    const tenantName = sdk.GetUserTenant() || sdk.GetTenant();
                    options.directory = options.directory || `${tenantName}.mdsp.model`;
                    options.assetid = options.assetid || (await sdk.GetAssetManagementClient().GetRootAsset()).assetId;
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    getAssetTreeStructure(sdk);
                    // console.log("HER");
                    // process.exit(0);

                    // const model: ModelDefinition = {
                    //     assetTypes: [],
                    //     aspectTypes: [],
                    //     assets: [],
                    //     files: {},
                    // };
                    // const spinner = ora(`Downloading asset model of ${color(tenantName)} tenant`);
                    // !options.verbose && spinner.start();

                    // const directoryName = path.resolve(options.directory);
                    // fs.existsSync(directoryName) &&
                    //     !options.overwrite &&
                    //     throwError(`The folder ${directoryName} already exists. (use --overwrite to overwrite) `);

                    // !fs.existsSync(directoryName) && fs.mkdirSync(directoryName);

                    // await addAssetTypes(sdk, options, model, spinner);
                    // await addAspectTypes(sdk, options, model, spinner);
                    // await addAssets(sdk, options, model, spinner);

                    // console.log(arrayToTree(model.assets as unknown as TreeItem[]));

                    // fs.writeFileSync(
                    //     path.resolve(`${directoryName}/${tenantName}}.model.mdsp.json`),
                    //     JSON.stringify(model, null, 2)
                    // );

                    // spinner.succeed(`Done. The asset model is in ${color(directoryName)} folder.`);
                    // switch (options.mode) {
                    //     default:
                    //         throw Error(`no such option: ${options.mode}`);
                    // }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            // log(`    mc asset-types --mode list \t\t\t\t\t list all asset types`);
            // log(`    mc asset-types --mode list --assettype Pump\t\t list all asset types which are named Pump`);
            // log(
            //     `    mc asset-types --mode template --assettype Pump \n\tcreate a template file (Enironment.assettype.mdsp.json) for assettype Pump`
            // );
            // log(
            //     `    mc asset-types --mode create --file Pump.assettype.mdsp.json \n\tcreate asset type Pump in MindSphere`
            // );

            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    // options.mode === "template" &&
    //     !options.assettype &&
    //     errorLog(
    //         "you have to provide asset type to create a template (see mc asset-types --help for more details)",
    //         true
    //     );
    // options.mode === "create" &&
    //     !options.file &&
    //     errorLog(
    //         "you have to provide a file with asset type to create an asset type (see mc asset-types --help for more details)",
    //         true
    //     );
    // options.mode === "delete" &&
    //     !options.assettype &&
    //     errorLog("you have to provide the asset type to delete (see mc asset-types --help for more details)", true);
    // options.mode === "info" &&
    //     !options.assettype &&
    //     errorLog("you have to provide the asset type (see mc asset-types --help for more details)", true);
}
async function addAspectTypes(sdk: MindSphereSdk, options: any, model: ModelDefinition, spinner: ora.Ora) {
    const assetMgmt = sdk.GetAssetManagementClient();

    let aspectTypes: AssetManagementModels.AspectTypeListResource;
    let page = 0;
    do {
        aspectTypes = await assetMgmt.GetAspectTypes({ page: page, size: 2000 });

        aspectTypes._embedded?.aspectTypes?.forEach((aspectType) => {
            // ignore types coming from core or from shared tenants
            if (aspectType.id?.startsWith(sdk.GetTenant())) {
                const filename = `${aspectType.id}.aspect-type.mdsp.json`;
                model.assetTypes.push(filename);
                verboseLog(`Downloading ${color(filename)}`, options.verbose, spinner);

                fs.writeFileSync(path.resolve(`${options.directory}/${filename}`), JSON.stringify(aspectType, null, 2));
            }
        });

        page++;
    } while (page < aspectTypes!.page!.totalPages!);
}

async function addAssetTypes(sdk: MindSphereSdk, options: any, model: ModelDefinition, spinner: ora.Ora) {
    const assetMgmt = sdk.GetAssetManagementClient();

    let assetTypes: AssetManagementModels.AssetTypeListResource;
    let page = 0;
    do {
        assetTypes = await assetMgmt.GetAssetTypes({ page: page, size: 2000 });

        assetTypes._embedded?.assetTypes?.forEach((assetType) => {
            // ignore types coming from core or from shared tenants
            if (assetType.id?.startsWith(sdk.GetTenant())) {
                const filename = `${assetType.id}.asset-type.mdsp.json`;
                model.assetTypes.push(filename);
                verboseLog(`Downloading ${color(filename)}`, options.verbose, spinner);

                fs.writeFileSync(path.resolve(`${options.directory}/${filename}`), JSON.stringify(assetType, null, 2));

                assetType.fileAssignments?.forEach(async (file) => {
                    if (!model.files[assetType.id!]) {
                        model.files[assetType.id!] = [];
                    }
                    const downloadFileName = `${file.fileId}.${assetType.id}.png`;
                    model.files[assetType.id!].push(downloadFileName);

                    verboseLog(`Downloading ${color(downloadFileName)}`, options.verbose, spinner);

                    const download = await assetMgmt.DownloadFile(file.fileId!);
                    !download.ok && errorLog(`Unexpected response ${download.statusText}`, true);

                    const downloadPath = path.resolve(`${options.directory}/${downloadFileName}`);
                    const fileStream = fs.createWriteStream(downloadPath);
                    streamPipeline(download.body, fileStream);
                });
            }
        });

        page++;
    } while (page < assetTypes!.page!.totalPages!);
}

async function addAssets(sdk: MindSphereSdk, options: any, model: ModelDefinition, spinner: ora.Ora) {
    const assetList: AssetManagementModels.AssetListResource[] = [];
    const assetMgmt = sdk.GetAssetManagementClient();
    let assets: AssetManagementModels.AssetListResource;
    let page = 0;
    do {
        assets = await assetMgmt.GetAssets({ page: page, size: 2000 });

        assets._embedded?.assets?.forEach((asset) => {
            // ignore types coming from core or from shared tenants
            assetList.push(asset);
            const filename = `${asset.assetId}-${asset.typeId}.asset.mdsp.json`;
            model.assets.push(filename);
            verboseLog(`Downloading ${color(filename)}`, options.verbose, spinner);

            fs.writeFileSync(path.resolve(`${options.directory}/${filename}`), JSON.stringify(asset, null, 2));

            asset.fileAssignments?.forEach(async (file) => {
                if (!model.files[asset.assetId!]) {
                    model.files[asset.assetId!] = [];
                }
                const downloadFileName = `${file.fileId}.${asset.assetId}.png`;
                model.files[asset.assetId!].push(downloadFileName);

                verboseLog(`Downloading ${color(downloadFileName)}`, options.verbose, spinner);

                const download = await assetMgmt.DownloadFile(file.fileId!);
                !download.ok && errorLog(`Unexpected response ${download.statusText}`, true);

                const downloadPath = path.resolve(`${options.directory}/${downloadFileName}`);
                const fileStream = fs.createWriteStream(downloadPath);
                streamPipeline(download.body, fileStream);
            });
        });

        page++;
    } while (page < assets!.page!.totalPages!);
}

async function getAssetTreeStructure(sdk: MindSphereSdk, assetId?: string) {
    const assetList: AssetManagementModels.AssetListResource[] = [];
    const assetMgmt = sdk.GetAssetManagementClient();
    let assets: AssetManagementModels.AssetListResource;
    let page = 0;
    do {
        assets = await assetMgmt.GetAssets({ page: page, size: 2000 });

        assets._embedded?.assets?.forEach((asset) => {
            // ignore types coming from core or from shared tenants
            assetList.push(asset);
        });

        page++;
    } while (page < assets!.page!.totalPages!);

    const tree = arrayToTree(assetList, { id: "assetId" });

    console.log(tree[0]);
    printTree(tree[0], 0, color);
}
