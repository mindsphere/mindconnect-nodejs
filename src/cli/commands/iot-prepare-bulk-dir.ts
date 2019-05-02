import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { AssetManagementClient, AssetManagementModels } from "../../api/sdk";
import { authJson, checkAssetId, decrypt, errorLog, loadAuth, throwError, verboseLog } from "../../api/utils";
import { directoryReadyLog, subtractSecond } from "./command-utils";
import ora = require("ora");

export default (program: CommanderStatic) => {
    program
        .command("prepare-bulk")
        .alias("pb")
        .option("-d, --dir <directoryname>", "config file with agent configuration", "bulkupload")
        .option("-w, --twintype <mode>", "twintype of asset [performance|simulation]")
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

                    for (const aspect of aspects) {
                        createAspectDirs(path, aspect, options);

                        // * The variables are stored in different spots depenendet if they come from the type or from the asset.
                        const variables = aspect.variables || aspect.aspectType.variables || [];

                        // * The csv generation generates data for every day for performance assets and every hour for simulation assets
                        await generateCsv(
                            {
                                name: aspect.name,
                                variables: variables,
                                options: options,
                                path: path,
                                mode: options.twintype
                            },
                            spinner
                        );
                    }

                    options.typeid
                        ? writeNewAssetJson(options, root, path, options.twintype)
                        : fs.writeFileSync(`${path}/asset.json`, JSON.stringify(asset, null, 2));

                    !options.verbose && spinner.succeed("done.");

                    directoryReadyLog({
                        path: `${path}`,
                        jobCommand: "check-bulk",
                        runCommand: "run-bulk"
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
        throwError("you have to specify the twin type performance or simulation");
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
            "you have to provide a passkey to get the service token (run mc pb --help for full description)",
            true
        );
}

const generateRandom = (() => {
    const variables: string[] = [];
    return (timestamp: Date, type: AssetManagementModels.VariableDefinition.DataTypeEnum, variableName: string) => {
        !variables.includes(variableName) && variables.push(variableName);
        let result;

        // multiply the sine curves with factor to have every variable visible
        const factor = variables.indexOf(variableName) + 1;
        switch (type) {
            case AssetManagementModels.VariableDefinition.DataTypeEnum.DOUBLE:
                result = (Math.sin(timestamp.getTime()) * factor * 10).toFixed(2) + 20;
                break;
            case AssetManagementModels.VariableDefinition.DataTypeEnum.INT:
            case AssetManagementModels.VariableDefinition.DataTypeEnum.LONG:
                result = Math.floor(Math.sin(timestamp.getTime()) * factor * 20) + 40;
                break;
            case AssetManagementModels.VariableDefinition.DataTypeEnum.BOOLEAN:
                result = true;
                break;
            case AssetManagementModels.VariableDefinition.DataTypeEnum.STRING:
            case AssetManagementModels.VariableDefinition.DataTypeEnum.BIGSTRING:
                result = `${type}_${Math.random()}`;
            default:
                throw new Error(`invalid type ${type}`);
        }
        return result;
    };
})();

async function generateCsv(
    {
        name,
        variables,
        options,
        path,
        mode
    }: {
        name: string;
        variables: AssetManagementModels.AspectVariable[];
        options: any;
        path: string;
        mode: AssetManagementModels.TwinType;
    },
    spinner?: any
) {
    verboseLog(`Generating ${options.size} entries for ${name}`, options.verbose, spinner);
    verboseLog(`Asset TwinType: ${mode}`, options.verbose, spinner);

    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - parseInt(options.offset));

    for (let file = options.files; file > 0; file--) {
        const date = new Date(startDate);

        if (mode === AssetManagementModels.TwinType.Performance) {
            // * generate one file per day
            date.setUTCDate(date.getUTCDate() - (file - 1));
            date.setUTCHours(0, 0, 0, 0);
        } else {
            // * generate one file per hour
            date.setUTCHours(file - 1, 0, 0, 0);
        }

        const fileName = `${path}/csv/${name}/${file}.csv`;
        verboseLog(`generating: ${chalk.magentaBright(fileName)}`, options.verbose, spinner);
        const stream = fs.createWriteStream(fileName, { highWaterMark: 12 * 16384 } as any);

        let headers = `_time, `;
        variables.forEach(variable => {
            headers += variable.name + ", ";
            if (variable.qualityCode) headers += variable.name + "_qc, ";
        });

        stream.write(headers.trimRight().slice(0, -1) + "\n");

        variables.forEach(variable => {
            headers += variable.name + ", ";
            if (variable.qualityCode) headers += variable.name + "_qc, ";
        });

        for (let index = options.size; index > 0; index--) {
            const currentDate =
                mode === AssetManagementModels.TwinType.Performance
                    ? subtractSecond(date, (86400 / options.size) * index)
                    : subtractSecond(date, (3600 / options.size) * index);
            let line = currentDate.toISOString() + ", ";

            variables.forEach(variable => {
                line += generateRandom(currentDate, variable.dataType, `${variable.name}`) + ", ";
                if (variable.qualityCode) line += "0, ";
            });

            const result = stream.write(line.trimRight().slice(0, -1) + "\n");
            if (!result) {
                await new Promise(resolve => stream.once("drain", resolve));
            }
        }

        stream.end();
    }
}

function writeNewAssetJson(options: any, root: AssetManagementModels.RootAssetResource, path: any, twintype: string) {
    const asset: AssetManagementModels.Asset = {
        name: `${twintype}Asset`,
        twinType:
            twintype === "performance"
                ? AssetManagementModels.TwinType.Performance
                : AssetManagementModels.TwinType.Simulation,
        typeId: options.typeid,
        parentId: root.assetId,
        location: {
            country: "Germany",
            postalCode: "91052",
            region: "Bayern",
            streetAddress: "Schuhstr. 60",
            locality: "Erlangen",
            latitude: 49.59099,
            longitude: 11.00783
        }
    };
    const newAssetJson = `${path}/asset.json`;
    verboseLog(`Writing ${chalk.magentaBright(newAssetJson)}`, options.verbose);
    fs.writeFileSync(`${path}/asset.json`, JSON.stringify(asset, null, 2));
}

function createAspectDirs(path: any, element: AssetManagementModels.AssetTypeResourceAspects, options: any) {
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

function checkTwinTypeOfAsset(asset: AssetManagementModels.AssetResourceWithHierarchyPath | undefined, options: any) {
    asset &&
        asset.twinType !== options.twintype &&
        throwError(
            `You can't use the twintype mode ${chalk.magentaBright(options.twintype)} for ${asset.twinType} asset`
        );
}
