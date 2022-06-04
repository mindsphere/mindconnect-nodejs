import { Command } from "commander";
import { log } from "console";
import { AssetManagementModels, MindSphereSdk } from "../../api/sdk";
import { adjustColor, errorLog, getColor, getSdk, homeDirLog, proxyLog, serviceCredentialLog } from "./command-utils";
import path = require("path");

let color = getColor("magenta");

export default (program: Command) => {
    program
        .command("asset-model")
        .alias("asm")
        .option("-m, --mode [export|import]", "export | import", "export")
        .option("-d, --directory <directory>", "")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete asset types *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    await listAssetTypes(sdk, options);

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
            log(`    mc asset-types --mode list \t\t\t\t\t list all asset types`);
            log(`    mc asset-types --mode list --assettype Pump\t\t list all asset types which are named Pump`);
            log(
                `    mc asset-types --mode template --assettype Pump \n\tcreate a template file (Enironment.assettype.mdsp.json) for assettype Pump`
            );
            log(
                `    mc asset-types --mode create --file Pump.assettype.mdsp.json \n\tcreate asset type Pump in MindSphere`
            );

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
async function listAspectTypes(sdk: MindSphereSdk, options: any) {
    const assetMgmt = sdk.GetAssetManagementClient();

    let aspectTypes: AssetManagementModels.AspectTypeListResource;
    let count = 0;
    let page = 0;
    do {
        aspectTypes = await assetMgmt.GetAspectTypes({ page: page, size: 2000 });

        aspectTypes._embedded?.aspectTypes?.forEach((x) => {
            // ignore types coming from core or from shared tenants
            if (x.id?.startsWith(sdk.GetTenant())) {
                const filename = `${x.id}.aspect-type.mdsp.json`;
                console.log(filename);
                // //delete stuff
                // delete (x._links);
                console.log(x);
            }
        });

        count += aspectTypes._embedded!.aspectTypes!.length;
        page++;
    } while (page < aspectTypes!.page!.totalPages!);

    console.log(count, page);
}

async function listAssetTypes(sdk: MindSphereSdk, options: any) {
    const assetMgmt = sdk.GetAssetManagementClient();

    let assetTypes: AssetManagementModels.AssetTypeListResource;
    let count = 0;
    let page = 0;
    do {
        assetTypes = await assetMgmt.GetAssetTypes({ page: page, size: 2000 });

        assetTypes._embedded?.assetTypes?.forEach((x) => {
            // ignore types coming from core or from shared tenants
            if (x.id?.startsWith(sdk.GetTenant())) {
                const filename = `${x.id}.asset-type.mdsp.json`;
                console.log(JSON.stringify(x.fileAssignments));
            }
        });

        count += assetTypes._embedded!.assetTypes!.length;
        page++;
    } while (page < assetTypes!.page!.totalPages!);

    console.log(count, page);
}
