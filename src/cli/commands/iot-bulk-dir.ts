import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { BulkImportInput, Data } from "../../api/iot-ts-bulk-models";
import { AspectListResource, AssetManagement, TwinType } from "../../api/sdk";
import { checkAssetId, decrypt, errorLog, loadAuth, retry, retrylog, verboseLog } from "../../api/utils";
export default (program: CommanderStatic) => {
    program
        .command("iot-bulk-dir")
        .alias("ibd")
        .option("-d, --dir <directoryname>", "config file with agent configuration", "bulkupload")
        .option("-i, --assetid <assetid>", "asset id from the mindsphere ")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output")
        .description(chalk.magentaBright("creates a template directory for bulk upload *"))
        .action(options => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const path = options.dir;
                    fs.mkdirSync(path);
                    fs.mkdirSync(`${path}/csv/`);
                    fs.mkdirSync(`${path}/json/`);

                    const auth = loadAuth();
                    const assetMgmt = new AssetManagement(auth.gateway, decrypt(auth, options.passkey), auth.tenant);
                    const aspectList = (await retry(
                        options.retry,
                        () => assetMgmt.GetAspects(options.assetid),
                        300,
                        retrylog("GetAspects")
                    )) as AspectListResource;
                    // console.log(JSON.stringify(asset));

                    const asset = await assetMgmt.GetAsset(options.assetid);
                    asset.twinType = TwinType.Simulation;

                    await assetMgmt.PutAsset(options.assetid, {
                        twinType: "simulation",
                        name: asset.name,
                        etag: asset.etag
                    });

                    if (!aspectList._embedded) throw new Error("no aspects");
                    const aspects = aspectList._embedded.aspects || [];
                    const job: BulkImportInput = {};
                    const jobData = new Array<Data>();

                    aspects.forEach(element => {
                        fs.mkdirSync(`${path}/csv/${element.name}`);
                        fs.mkdirSync(`${path}/json/${element.name}`);

                        jobData.push({ entity: options.assetid, propertySetName: element.name, timeseriesFiles: [] });
                    });

                    job.data = jobData;

                    fs.writeFileSync(`${path}/${options.assetid}.json`, JSON.stringify(job));
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc iot-bulk-dir  --assetid 12356...abc \t this creates a directory called ${chalk.magentaBright(
                    "bulkimport"
                )}`
            );
            log(
                `    mc ibd --dir asset1 -i 123456...abc  \t this creates a directory called ${chalk.magentaBright(
                    "asset1"
                )}`
            );
        });
};
function checkRequiredParamaters(options: any) {
    verboseLog(`Creating directory template for assetid ${chalk.magentaBright(options.assetid)}`, options.verbose);
    checkAssetId(options.assetid);
    verboseLog(`Creating directory ${chalk.magentaBright(options.dir)}`, options.verbose);
    if (fs.existsSync(options.dir)) {
        throw new Error(`the directory ${chalk.magentaBright(options.dir)} already exists`);
    }

    if (!options.passkey) {
        errorLog(
            "you have to provide a passkey to get the service token (run mc stk --help for full description)",
            true
        );
    }
}
