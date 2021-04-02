import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { AssetManagementModels, MindSphereSdk } from "../../api/sdk";
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

let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("assets")
        .alias("ast")
        .option("-m, --mode [list|create|delete|template]", "mode [list | create | delete | template]", "list")
        .option("-f, --file <file>", ".mdsp.json file with asset definition")
        .option("-n, --assetname <assetname>", "assetname")
        .option("-p, --parentid <parentid>", "parentid")
        .option("-e, --externalid <externalid>", "externalid")
        .option("-i, --assetid <assetid>", "mindsphere asset id ")
        .option("-t, --typeid <typeid>", "typeid")
        .option("-d, --desc <desc>", "description", "created with mindsphere CLI")
        .option("-w, --twintype <twintype>", "digital twin type [performance|simulation]")
        .option("-c, --includeshared", "include shared aspect types")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`list, create or delete assets in mindsphere *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const assetMgmt = sdk.GetAssetManagementClient();
                    const rootAssetId = (await assetMgmt.GetRootAsset()).assetId!;

                    switch (options.mode) {
                        case "create":
                            await createAsset(options, rootAssetId, sdk);
                            break;
                        case "list":
                            await listAssets(options, sdk);
                            break;
                        case "delete":
                            await deleteAsset(options, sdk);
                            break;

                        case "template":
                            createTemplate(options, rootAssetId, sdk.GetTenant());
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
            log(
                `    mc assets --mode create --typeid core.basicarea --assetname MyArea \t creates an asset in mindsphere of type basicarea`
            );
            log(
                `    mc assets --mode create --file MyPump.asset.mdsp.json \t\t creates an asset from specified file template`
            );
            log(`    mc assets --mode list \t\t\t\t\t\t lists all assets in mindsphere`);
            log(`    mc assets --mode list --typeid mclib\t\t\t\t lists all assets in mindsphere of type core.mclib`);
            log(
                `    mc assets --mode delete --assetid 1234567..ef \t\t\t deletes asset with specified id from mindsphere`
            );
            log(
                `    mc assets --mode template --typeid <mytenant>.Pump --assetname MyPump \n\t\tcreates a file template MyPump.asset.mdsp.json which can be use in create command`
            );

            serviceCredentialLog();
        });
};

export async function listAssets(options: any, sdk: MindSphereSdk) {
    const includeShared = options.includeshared;
    const assetMgmt = sdk.GetAssetManagementClient();

    color = adjustColor(color, options);

    let page = 0;
    let assets;

    const filter = buildFilter(options);
    verboseLog(JSON.stringify(filter, null, 2), options.verbose);

    console.log(`assetid  etag  twintype  [typeid]  name  sharing`);

    let assetCount = 0;

    do {
        assets = (await retry(options.retry, () =>
            assetMgmt.GetAssets({
                page: page,
                size: 100,
                filter: Object.keys(filter).length === 0 ? undefined : JSON.stringify(filter),
                sort: "name,asc",
                includeShared: includeShared,
            })
        )) as AssetManagementModels.AssetListResource;

        assets._embedded = assets._embedded || { assets: [] };

        assets.page = assets.page || { totalPages: 0 };

        for (const asset of assets._embedded.assets || []) {
            assetCount++;
            console.log(
                `${asset.assetId}  ${asset.etag}\t${asset.twinType}\t[${asset.typeId}]\t${color(asset.name)} ${
                    asset.sharing?.modes
                }`
            );

            verboseLog(JSON.stringify(asset, null, 2), options.verbose);
        }
    } while (page++ < (assets.page.totalPages || 0));

    console.log(`${color(assetCount)} assets listed.\n`);
}

function createTemplate(options: any, rootid: string, tenant: string) {
    const fileName = options.file || `${options.assetname || "unnamed"}.asset.mdsp.json`;

    const type = `${options.typeid}`.includes(".") ? options.typeid : `${tenant}.${options.typeid}`;

    const asset = {
        name: options.assetname || "unnamed",
        externalId: options.externalid,
        description: options.desc || "created with mindsphere CLI",
        location: {
            country: "Germany",
            region: "Bayern",
            locality: "Erlangen",
            streetAddress: "Schuhstr. 60",
            postalCode: "91052",
            longitude: 49.5894843,
            latitude: 11.0061579,
        },
        variables: [],
        aspects: [],
        fileAssignments: [],
        typeId: type || "please enter typeid",
        parentId: options.parentid || rootid,
        timezone: "Europe/Berlin",
        twinType: options.twintype || "performance",
    };

    fs.writeFileSync(fileName, JSON.stringify(asset, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc aspects --mode create --file ${fileName} \n\nto create the aspect`
    );
}

async function createAsset(options: any, rootAssetId: string, sdk: MindSphereSdk) {
    const assetMgmt = sdk.GetAssetManagementClient();
    let data = {
        name: options.assetname,
        parentId: options.parentid || rootAssetId,
        externalId: options.externalid,
        typeId: options.typeid,
        description: options.desc,
        twinType: options.twintype || AssetManagementModels.TwinType.Performance,
    };

    if (options.file) {
        const filePath = path.resolve(options.file);
        const filecontent = fs.readFileSync(filePath);
        data = JSON.parse(filecontent.toString());

        data.name = options.assetname || data.name;
        data.parentId = options.parentid || data.parentId;
        data.externalId = options.externalid || data.externalId;
        data.typeId = options.typeid || data.typeId;
        data.description = options.desc || data.description;
        data.twinType = options.twinType || data.twinType;
    }

    const result = (await retry(options.retry, async () =>
        assetMgmt.PostAsset(data)
    )) as AssetManagementModels.AssetResourceWithHierarchyPath;

    console.log(`Asset with assetid ${color(result.assetId)} was created.`);
    console.log("\nAsset Manager:");
    console.log(
        "\t" +
            color(`${sdk.GetGateway().replace("gateway", sdk.GetTenant() + "-assetmanager")}/entity/${result.assetId!}`)
    );
}

function buildFilter(options: any) {
    const filter = (options.filter && JSON.parse(options.filter)) || {};
    let pointer = filter;
    if (options.assetname !== undefined && options.typeid !== undefined) {
        filter.and = {};
        pointer = filter.and;
    }
    if (options.assetname) {
        pointer.name = { contains: `${options.assetname}` };
    }
    if (options.typeid) {
        pointer.typeId = { contains: `${options.typeid}` };
    }
    return filter;
}

export async function deleteAsset(options: any, sdk: MindSphereSdk) {
    const includeShared = options.includeshared;
    const assetMgmt = sdk.GetAssetManagementClient();
    const asset = await retry(options.retry, () => assetMgmt.GetAsset(options.assetid));
    verboseLog(JSON.stringify(asset, null, 2), options.verbose);

    await retry(options.retry, () =>
        assetMgmt.DeleteAsset(options.assetid, {
            ifMatch: asset?.etag || "0",
            includeShared: includeShared,
        })
    );

    console.log(`Asset with assetid ${color(asset.assetId)} (${color(asset.name)}) was deleted.`);
}

function checkRequiredParameters(options: any) {
    options.mode === "create" &&
        !options.file &&
        (!options.assetname || !options.typeid) &&
        errorLog("you have to specify at least the asset name and typeid if you are not using file template", true);

    options.twintype &&
        !["performance", "simulation"].includes(options.twintype) &&
        errorLog("the twin type must be either performance or simulation", true);
}
