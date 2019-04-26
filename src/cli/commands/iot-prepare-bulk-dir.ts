import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import {
    AspectListResource,
    AspectResource,
    AspectVariable,
    Asset,
    AssetManagement,
    AssetResourceWithHierarchyPath,
    AssetTypeResource,
    AssetTypeResourceAspects,
    RootAssetResource,
    TwinType,
    VariableDefinition
} from "../../api/sdk";
import { checkAssetId, decrypt, errorLog, loadAuth, retry, retrylog, throwError, verboseLog } from "../../api/utils";
import { directoryReadyLog, subtractSecond } from "./command-utils";
export default (program: CommanderStatic) => {
    program
        .command("iot-prepare-bulk-dir")
        .alias("pbd")
        .option("-d, --dir <directoryname>", "config file with agent configuration", "bulkupload")
        .option("-i, --assetid <assetid>", "asset id from the mindsphere ")
        .option("-t, --typeid <typeid>", "typeid e.g. castidev.Engine ")
        .option("-m, --max <max>", "entries per file ", 3)
        .option("-f, --files <files>", "entries per file ", 2)
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
                    const assetMgmt = new AssetManagement(auth.gateway, decrypt(auth, options.passkey), auth.tenant);

                    let aspects: any[] = [];
                    let asset;
                    if (options.assetid) {
                        asset = (await retry(
                            options.retry,
                            () => assetMgmt.GetAsset(options.assetid),
                            300,
                            retrylog("GetAsset")
                        )) as AssetResourceWithHierarchyPath;

                        const embAspects = (await retry(
                            options.retry,
                            () => assetMgmt.GetAspects(options.assetid),
                            300,
                            retrylog("GetAspects")
                        )) as AspectListResource;

                        if (embAspects._embedded && embAspects._embedded.aspects) {
                            aspects = embAspects._embedded.aspects.filter(x => {
                                return x.category === AspectResource.CategoryEnum.Dynamic;
                            });
                        }

                        asset.twinType !== TwinType.Simulation &&
                            throwError("The bulk upload only works for simulation assets!");
                    }

                    if (options.typeid) {
                        const assetType = (await retry(
                            options.retry,
                            () => assetMgmt.GetAssetType(options.typeid),
                            300,
                            retrylog("GetAssetType")
                        )) as AssetTypeResource;

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
                        const variables: AspectVariable[] = aspect.variables || aspect.aspectType.variables || [];

                        generateCsv(aspect.name, variables, options, path);
                    });

                    const root = (await retry(
                        options.retry,
                        () => assetMgmt.GetRootAsset(),
                        300,
                        retrylog("GetRoot")
                    )) as RootAssetResource;

                    options.typeid
                        ? writeNewAssetJson(options, root, path)
                        : fs.writeFileSync(`${path}/${options.assetid}.json`, JSON.stringify(asset, null, 2));

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
        });
};

function writeNewAssetJson(options: any, root: RootAssetResource, path: any) {
    const asset: Asset = {
        name: "NewAsset",
        twinType: TwinType.Simulation,
        typeId: options.typeid,
        parentId: root.assetId,
        location: {
            country: "Germany",
            postalCode: "91052",
            region: "Bayern",
            streetAddress: "Schuhstr 60",
            latitude: 49.59099,
            longitude: 11.00783
        }
    };
    const newAssetJson = `${path}/NewAsset.json`;
    verboseLog(`Writing ${chalk.magentaBright(newAssetJson)}`, options.verbose);
    fs.writeFileSync(`${path}/NewAsset.json`, JSON.stringify(asset, null, 2));
}

function createAspectDirs(path: any, element: AssetTypeResourceAspects, options: any) {
    const csvDir = `${path}/csv/${element.name}`;
    verboseLog(`creating directory: ${chalk.magentaBright(csvDir)}`, options.verbose);
    fs.mkdirSync(csvDir);
    const jsonDir = `${path}/json/${element.name}`;
    verboseLog(`creating directory: ${chalk.magentaBright(jsonDir)}`, options.verbose);
    fs.mkdirSync(jsonDir);
}

function makeCsvAndJsonDir(options: any) {
    const path = options.dir;
    fs.mkdirSync(path);
    fs.mkdirSync(`${path}/csv/`);
    fs.mkdirSync(`${path}/json/`);
    return path;
}

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

function generateCsv(name: string, variable: AspectVariable[], options: any, path: string) {
    verboseLog(`Generating ${options.max} entries for ${name}`, options.verbose);

    const startDate = new Date();

    for (let file = options.files; file > 0; file--) {
        const date = new Date(startDate);
        date.setDate(date.getDate() - (file - 1));

        const fileName = `${path}/csv/${name}/${file}.csv`;
        verboseLog(`generating: ${chalk.magentaBright(fileName)}`, options.verbose);
        const stream = fs.createWriteStream(fileName);

        let headers = `_time, `;
        variable.forEach(variable => {
            headers += variable.name + ", ";
            if (variable.qualityCode) headers += variable.name + "_qc, ";
        });
        stream.write(headers.trimRight().slice(0, -1) + "\n");

        variable.forEach(variable => {
            headers += variable.name + ", ";
            if (variable.qualityCode) headers += variable.name + "_qc, ";
        });

        for (let index = options.max; index > 0; index--) {
            let line = subtractSecond(date, index) + ", ";

            variable.forEach(variable => {
                line += generateRandom(variable.dataType) + ", ";
                if (variable.qualityCode) line += "0, ";
            });

            stream.write(line.trimRight().slice(0, -1) + "\n");
        }
        stream.end();
    }
}

function generateRandom(type: VariableDefinition.DataTypeEnum): number | string | boolean {
    let result;

    switch (type) {
        case VariableDefinition.DataTypeEnum.DOUBLE:
            result = (Math.random() * 10).toFixed(2);
            break;
        case VariableDefinition.DataTypeEnum.INT:
        case VariableDefinition.DataTypeEnum.LONG:
            result = Math.floor(Math.random() * 10);
            break;
        case VariableDefinition.DataTypeEnum.BOOLEAN:
            result = true;
            break;
        case VariableDefinition.DataTypeEnum.STRING:
        case VariableDefinition.DataTypeEnum.BIGSTRING:
            result = `${type}_${Math.random()}`;
        default:
            throw new Error(`invalid type ${type}`);
    }
    return result;
}
