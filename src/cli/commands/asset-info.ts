import { Command } from "commander";
import { log } from "console";
import { AssetManagementModels } from "../../api/sdk";
import { retry } from "../../api/utils";
import { adjustColor, errorLog, getColor, getSdk, homeDirLog, proxyLog, serviceCredentialLog } from "./command-utils";

let color = getColor("magenta");

export default (program: Command) => {
    program
        .command("asset-info")
        .alias("ai")
        .option("-i, --assetid <assetid>", "mindsphere asset id ")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`get infos about asset *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const assetMgmt = sdk.GetAssetManagementClient();
                    const asset = (await retry(options.retry, () =>
                        assetMgmt.GetAsset(options.assetid)
                    )) as AssetManagementModels.AssetResourceWithHierarchyPath;

                    const assetType = (await retry(options.retry, () =>
                        assetMgmt.GetAssetType(`${asset.typeId}`)
                    )) as AssetManagementModels.AssetTypeResource;

                    let path = "";
                    asset.hierarchyPath?.forEach((entry) => {
                        path = `${path} ${color(">")} ${entry.name}`;
                    });

                    console.log(`\nAsset Information for Asset with Asset Id: ${color(asset.assetId)}\n`);
                    console.log(`Path: ${path}`);
                    console.log(`Type: ${asset.typeId} ${color(":")} ${assetType.parentTypeId}`);
                    console.log(`Name: ${color(asset.name)}`);
                    console.log(`TimeZone: ${asset.timezone}`);
                    console.log(`TwinType: ${asset.twinType}`);
                    console.log(`Description: ${asset.description}`);
                    console.log(
                        `Location: ${asset.location?.streetAddress} ${asset.location?.postalCode} ${asset.location?.locality} ${asset.location?.region} ${asset.location?.country} ${asset.location?.region}`
                    );

                    const map = `https://www.google.com/maps/search/?api=1&query=${asset.location?.latitude},${asset.location?.longitude}`;
                    console.log(`Google Maps: ${color(map)}`);

                    console.log("Variables:");
                    assetType.variables?.forEach((variable) => {
                        console.log(`- ${color(variable.name)} ${variable.unit} ${variable.dataType}`);
                    });

                    console.log("Aspects:");
                    for await (const entry of assetType.aspects || []) {
                        console.log(`- ${color(entry.name)}: ${entry.aspectType?.id}`);
                        entry.aspectType?.variables?.forEach((variable) => {
                            console.log(`\t - ${color(variable.name)} ${variable.unit} ${variable.dataType}`);
                        });

                        const ts = await retry(options.retry, () =>
                            sdk.GetTimeSeriesClient().GetTimeSeries(asset.assetId!, entry.name!)
                        );
                        console.log("\nLast Timeseries Entry:");
                        console.table(ts);
                    }
                    console.log("\nLast Event Entries:");
                    const events = await retry(options.retry, () =>
                        sdk
                            .GetEventManagementClient()
                            .GetEvents({ sort: "timestamp,desc", filter: JSON.stringify({ entityId: asset.assetId! }) })
                    );
                    console.table(events._embedded?.events?.slice(0, 10) || [], [
                        "timestamp",
                        "source",
                        "severity",
                        "description",
                    ]);

                    console.log("\n Last uploaded Files:");
                    const files = await retry(options.retry, () =>
                        sdk.GetIoTFileClient().GetFiles(asset.assetId!, { order: "updated desc" })
                    );
                    console.table(files.slice(0, 10), ["name", "path", "type", "timestamp"]);

                    console.log("\nAsset Manager:");
                    console.log(
                        "\t" +
                            color(
                                `${sdk
                                    .GetGateway()
                                    .replace("gateway", sdk.GetTenant() + "-assetmanager")}/entity/${asset.assetId!}`
                            )
                    );
                    console.log("\nOperations Insight:");
                    console.log(
                        "\t" +
                            color(
                                `${sdk
                                    .GetGateway()
                                    .replace(
                                        "gateway",
                                        sdk.GetTenant() + "-operationsinsight"
                                    )}/explore-assets/info?asset=${asset.assetId!}`
                            )
                    );
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc asset-info --assetid 123456...ef \t print out infos about asset with id 132456...ef`);
            serviceCredentialLog();
        });
};

function checkRequiredParameters(options: any) {
    !options.assetid && errorLog("you have to provide an assetid", true);
}
