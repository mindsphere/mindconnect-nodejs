import { CommanderStatic } from "commander";
import { log } from "console";
import { AssetManagementModels, MindSphereSdk } from "../../api/sdk";
import { decrypt, loadAuth, retry } from "../../api/utils";
import { errorLog, getColor, homeDirLog, proxyLog, serviceCredentialLog, verboseLog } from "./command-utils";

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("list-assets")
        .alias("la")
        .option(
            "-f, --filter [filter]",
            `filter (see: ${color(
                "https://developer.mindsphere.io/apis/advanced-assetmanagement/api-assetmanagement-references-filtering.html"
            )}) `
        )
        .option("-a, --assetname [name]", "search for assets with string [name] in asset name")
        .option("-t, --typeid [typeid]", "search for assets with string [typeid] in typeid")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-v, --verbose", "verbose output")
        .description(color(`list assets in the tenant *`))
        .action((options) => {
            (async () => {
                try {
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    checkRequiredParameters(options);
                    const auth = loadAuth();
                    const sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, options.passkey) });

                    const assetMgmt = sdk.GetAssetManagementClient();

                    let page = 0;

                    let assets;

                    const filter = buildFilter(options);
                    verboseLog(JSON.stringify(filter, null, 2), options.verbose);

                    console.log(`assetid  etag  twintype  [typeid]  name`);

                    let assetCount = 0;

                    do {
                        assets = (await retry(options.retry, () =>
                            assetMgmt.GetAssets({
                                page: page,
                                size: 100,
                                filter: Object.keys(filter).length === 0 ? undefined : JSON.stringify(filter),
                                sort: "name,asc",
                            })
                        )) as AssetManagementModels.AssetListResource;

                        assets._embedded = assets._embedded || { assets: [] };

                        assets.page = assets.page || { totalPages: 0 };

                        for (const asset of assets._embedded.assets || []) {
                            assetCount++;
                            console.log(
                                `${asset.assetId}  ${asset.etag}\t${asset.twinType}\t[${asset.typeId}]\t${color(
                                    asset.name
                                )}`
                            );

                            verboseLog(JSON.stringify(asset, null, 2), options.verbose);
                        }
                    } while (page++ < (assets.page.totalPages || 0));

                    console.log(`${color(assetCount)} assets listed.\n`);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc list-assets --passkey mypasskey \t\t\t\t\t\tlist all assets`);
            log(
                `    mc la --typeid core.mclib --assetname nodered --passkey mypasskey \t\tlist all agents (assets of type core.mclib) with nodered in the name`
            );
            log(
                `    mc la --filter '{"name" : {"contains" : "Engine"}}' --passkey mypasskey \tlist all assets where name contains string Engine`
            );
            serviceCredentialLog();
        });
};
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

function checkRequiredParameters(options: any) {
    !options.passkey &&
        errorLog(
            "you have to provide a passkey to get the service token (run mc la --help for full description)",
            true
        );
}
