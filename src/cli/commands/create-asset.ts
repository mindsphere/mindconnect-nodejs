import { CommanderStatic } from "commander";
import { log } from "console";
import { AssetManagementModels } from "../../api/sdk";
import { retry } from "../../api/utils";
import { adjustColor, errorLog, getColor, getSdk, homeDirLog, proxyLog, serviceCredentialLog } from "./command-utils";

let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("create-asset")
        .alias("cs")
        .option("-n, --assetname <assetname>", "assetname")
        .option("-p, --parentid <parentid>", "parentid")
        .option("-e, --externalid <externalid>", "externalid")
        .option("-t, --typeid <typeid>", "typeid")
        .option("-d, --desc <desc>", "description", "created with mindsphere CLI")
        .option("-w, --twintype <twintype>", "digital twin type [performance|simulation]")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`create asset in mindsphere *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const assetMgmt = sdk.GetAssetManagementClient();

                    const result = (await retry(options.retry, async () =>
                        assetMgmt.PostAsset({
                            name: options.assetname,
                            parentId: options.parentid || (await assetMgmt.GetRootAsset()).assetId!,
                            externalId: options.externalid,
                            typeId: options.typeid,
                            description: options.desc,
                            twinType: options.twintype || AssetManagementModels.TwinType.Performance,
                        })
                    )) as AssetManagementModels.AssetResourceWithHierarchyPath;

                    console.log(`Asset with assetid ${color(result.assetId)} was created.`);
                    console.log("\nAsset Manager:");
                    console.log(
                        "\t" +
                            color(
                                `${sdk
                                    .GetGateway()
                                    .replace("gateway", sdk.GetTenant() + "-assetmanager")}/entity/${result.assetId!}`
                            )
                    );
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc create-asset --typeid core.basicarea --assetname MyArea`);
            serviceCredentialLog();
        });
};

function checkRequiredParameters(options: any) {
    (!options.assetname || !options.typeid) && errorLog("you have to specify at least the asset name and typeid", true);
    options.twintype &&
        !["performance", "simulation"].includes(options.twintype) &&
        errorLog("the twin type must be either performance or simulation", true);
}
