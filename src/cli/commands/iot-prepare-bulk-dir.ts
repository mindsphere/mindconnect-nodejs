import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { AssetManagementClient, AssetManagementModels } from "../../api/sdk";
import { checkAssetId, decrypt, errorLog, loadAuth, retry, retrylog, throwError, verboseLog } from "../../api/utils";
import {
    createAspectDirs,
    directoryReadyLog,
    generateCsv,
    makeCsvAndJsonDir,
    writeNewAssetJson
} from "./command-utils";
export default (program: CommanderStatic) => {
    program
        .command("iot-prepare-bulk-dir")
        .alias("pbd")
        .option("-d, --dir <directoryname>", "config file with agent configuration", "bulkupload")
        .option("-i, --assetid <assetid>", "asset id from the mindsphere ")
        .option("-t, --typeid <typeid>", "typeid e.g. castidev.Engine ")
        .option("-s, --size <size>", "entries per file ", 3)
        .option("-f, --files <files>", "generated files ", 2)
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output")
        .description(chalk.magentaBright("creates a template directory for bulk upload *"))
        .action(options => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const path = makeCsvAndJsonDir(options);
                    const auth = loadAuth();
                    const assetMgmt = new AssetManagementClient(
                        auth.gateway,
                        decrypt(auth, options.passkey),
                        auth.tenant
                    );

                    let aspects: any[] = [];
                    let asset;
                    if (options.assetid) {
                        asset = (await retry(
                            options.retry,
                            () => assetMgmt.GetAsset(options.assetid),
                            300,
                            retrylog("GetAsset")
                        )) as AssetManagementModels.AssetResourceWithHierarchyPath;

                        const embAspects = (await retry(
                            options.retry,
                            () => assetMgmt.GetAspects(options.assetid),
                            300,
                            retrylog("GetAspects")
                        )) as AssetManagementModels.AspectListResource;

                        if (embAspects._embedded && embAspects._embedded.aspects) {
                            aspects = embAspects._embedded.aspects.filter(x => {
                                return x.category === AssetManagementModels.AspectResource.CategoryEnum.Dynamic;
                            });
                        }

                        asset.twinType !== AssetManagementModels.TwinType.Simulation &&
                            throwError("The bulk upload only works for simulation assets!");
                    }

                    if (options.typeid) {
                        const assetType = (await retry(
                            options.retry,
                            () => assetMgmt.GetAssetType(options.typeid),
                            300,
                            retrylog("GetAssetType")
                        )) as AssetManagementModels.AssetTypeResource;

                        if (assetType.aspects) {
                            aspects = assetType.aspects.filter(x => {
                                return x.aspectType && x.aspectType.category === "dynamic";
                            });
                        }
                        aspects = aspects || [];
                    }

                    // console.log(aspects);

                    aspects.forEach(aspect => {
                        createAspectDirs(path, aspect, options);

                        // ! The variables are stored in different spots depenendet if they come from type or the asset.
                        const variables: AssetManagementModels.AspectVariable[] =
                            aspect.variables || aspect.aspectType.variables || [];

                        generateCsv(aspect.name, variables, options, path);
                    });

                    const root = (await retry(
                        options.retry,
                        () => assetMgmt.GetRootAsset(),
                        300,
                        retrylog("GetRoot")
                    )) as AssetManagementModels.RootAssetResource;

                    options.typeid
                        ? writeNewAssetJson(options, root, path)
                        : fs.writeFileSync(`${path}/asset.json`, JSON.stringify(asset, null, 2));

                    directoryReadyLog({
                        path: `${path}`,
                        jobCommand: "iot-bulk-check",
                        verifyCommand: "iot-bulk-verify",
                        runCommand: "iot-bulk-run"
                    });
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc iot-prepare-bulk-dir  --typeid castidev.Engine \t this creates a directory called ${chalk.magentaBright(
                    "bulkimport"
                )} for new asset of type castidev.Engine`
            );
            log(
                `    mc pbd --dir asset1 -i 123456...abc \t\t this creates a directory called ${chalk.magentaBright(
                    "asset1"
                )} for existing asset`
            );

            log(
                `The typeid must be derived from core.basicdevice and twintype must be simulation for the bulk upload `
            );
        });
};

function checkRequiredParamaters(options: any) {
    !options.typeid && !options.assetid && throwError("You have to specify either a typeid or assetid");
    !!options.typeid === !!options.assetid && throwError("You can't specify typeid and assetid at the same time");
    verboseLog(
        `creating directory template for: ${chalk.magentaBright(options.typeid || options.assetid)}`,
        options.verbose
    );
    options.assetid && checkAssetId(options.assetid);

    verboseLog(`creating directory: ${chalk.magentaBright(options.dir)}`, options.verbose);
    fs.existsSync(options.dir) && throwError(`the directory ${chalk.magentaBright(options.dir)} already exists`);

    !options.passkey &&
        errorLog(
            "you have to provide a passkey to get the service token (run mc pbk --help for full description)",
            true
        );
}
