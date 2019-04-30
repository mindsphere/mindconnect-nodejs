import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { AssetManagementClient, AssetManagementModels } from "../../api/sdk";
import { authJson, checkAssetId, decrypt, errorLog, loadAuth, throwError, verboseLog } from "../../api/utils";
import {
    checkTwinTypeOfAsset,
    createAspectDirs,
    directoryReadyLog,
    generateCsv,
    makeCsvAndJsonDir,
    writeNewAssetJson
} from "./command-utils";
import ora = require("ora");

export default (program: CommanderStatic) => {
    program
        .command("prepare-bulk")
        .alias("pb")
        .option("-d, --dir <directoryname>", "config file with agent configuration", "bulkupload")
        .option("-w, --twintype <mode>", "twintype of asset", "performance")
        .option("-i, --assetid <assetid>", "asset id from the mindsphere ")
        .option("-t, --typeid <typeid>", "typeid e.g. castidev.Engine ")
        .option("-s, --size <size>", "entries per file ", 100)
        .option("-f, --files <files>", "generated files ", 2)
        .option("-o, --offset <days>", "offset in days from current date ", 0)
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output")
        .description(chalk.magentaBright("creates a template directory for timeseries (bulk) upload *"))
        .action(options => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const path = makeCsvAndJsonDir(options);
                    const auth = loadAuth();
                    const { root, asset, aspects } = await getAssetAndAspects(auth, options);

                    checkTwinTypeOfAsset(asset, options);

                    const spinner = ora("generating data...");
                    !options.verbose && spinner.start();

                    aspects.forEach(aspect => {
                        createAspectDirs(path, aspect, options);

                        // * The variables are stored in different spots depenendet if they come from the type or from the asset.
                        const variables = aspect.variables || aspect.aspectType.variables || [];

                        // * The csv generation generates data for every day for performance assets and every hour for simulation assets
                        generateCsv({
                            name: aspect.name,
                            variables: variables,
                            options: options,
                            path: path,
                            mode: options.twintype
                        });
                    });

                    options.typeid
                        ? writeNewAssetJson(options, root, path, options.twintype)
                        : fs.writeFileSync(`${path}/asset.json`, JSON.stringify(asset, null, 2));

                    !options.verbose && spinner.succeed("done.");

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
                `    mc prepare-bulk  --typeid castidev.Engine \t this creates a directory called ${chalk.magentaBright(
                    "bulkimport"
                )} for new asset of type castidev.Engine`
            );
            log(
                `    mc pb --dir asset1 -i 123456...abc \t\t this creates a directory called ${chalk.magentaBright(
                    "asset1"
                )} for existing asset`
            );

            log(`    mc pb -of 3 -t castidev.Engine \t\t start data creation template 3 days before now`);
            log(
                `\n\tuse --mode ${chalk.magentaBright(
                    "performance"
                )} for standard data generation or --mode ${chalk.magentaBright(
                    "simulation"
                )} for high frequency data generation `
            );
            log(
                `\tThe typeid must be derived from ${chalk.magentaBright(
                    "core.basicdevice"
                )} and asset ${chalk.magentaBright("twintype")} must be ${chalk.magentaBright(
                    "simulation"
                )} for high frequency data upload\n`
            );
        });
};

async function getAssetAndAspects(auth: authJson, options: any) {
    const assetMgmt = new AssetManagementClient(auth.gateway, decrypt(auth, options.passkey), auth.tenant);
    let aspects: any[] = [];
    let asset;
    if (options.assetid) {
        asset = await assetMgmt.GetAsset(options.assetid);
        const embAspects = await assetMgmt.GetAspects(options.assetid);
        if (embAspects._embedded && embAspects._embedded.aspects) {
            aspects = embAspects._embedded.aspects.filter(x => {
                return x.category === AssetManagementModels.AspectResource.CategoryEnum.Dynamic;
            });
        }
    }
    if (options.typeid) {
        const assetType = await assetMgmt.GetAssetType(options.typeid);
        if (assetType.aspects) {
            aspects = assetType.aspects.filter(x => {
                return x.aspectType && x.aspectType.category === "dynamic";
            });
        }
        aspects = aspects || [];
    }
    const root = await assetMgmt.GetRootAsset();
    return { root, asset, aspects };
}

function checkRequiredParamaters(options: any) {
    options.twintype !== "performance" &&
        options.twintype !== "simulation" &&
        throwError("you have to specify the twin type");
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
