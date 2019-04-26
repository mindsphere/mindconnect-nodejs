import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as csv from "csvtojson";
import * as fs from "fs";
import * as path from "path";
import { AssetManagement } from "../../api/sdk";
import { decrypt, errorLog, loadAuth, throwError, verboseLog } from "../../api/utils";
import csvtojson = require("csvtojson");

export default (program: CommanderStatic) => {
    program
        .command("iot-bulk-run")
        .alias("ibr")
        .option("-d, --dir <directoryname>", "config file with agent configuration", "bulkupload")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-m, --max <max>", "entries per file ", 3)
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output")
        .description(chalk.magentaBright("runs the bulk upload job from <directoryname> directory *"))
        .action(options => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const asset = await createOrReadAsset(options);
                    const aspects = getAspectsFromDirNames(options);

                    for (const aspect of aspects) {
                        const files = getFiles(options, aspect);

                        for (const file of files) {
                            let data: any = [];
                            let recordCount = 0;
                            let mintime: Date | undefined;
                            let maxtime: Date | undefined;
                            const maxSize = options.max;
                            maxSize > 0 || throwError("the size must be greater than 0");
                            await verboseLog(
                                `reding file: ${options.dir}/csv/${aspect}/${chalk.magentaBright(file)}`,
                                options.verbose
                            );
                            await csv()
                                .fromFile(`${options.dir}/csv/${aspect}/${file}`)
                                .subscribe(async json => {
                                    data.push(json);
                                    const timestamp = new Date(json._time);
                                    ({ mintime, maxtime } = determineMinAndMax(mintime, timestamp, maxtime));

                                    if (data.length >= maxSize) {
                                        writeDataAsJson({
                                            mintime,
                                            maxtime,
                                            options,
                                            aspect,
                                            data
                                        });
                                        data = [];
                                        mintime = undefined;
                                        maxtime = undefined;
                                    }
                                    recordCount++;
                                });

                            if (data.length > 0) {
                                writeDataAsJson({
                                    mintime,
                                    maxtime,
                                    options,
                                    aspect,
                                    data
                                });
                            }

                            verboseLog(
                                `total record count in ${file}: ${chalk.magentaBright(recordCount.toString())}`,
                                options.verbose
                            );
                        }
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc iot-bulk-run runs the upload job from the  ${chalk.magentaBright("bulkimport")} directory`);
            log(
                `    mc ibr --dir asset1 --verbose runs the upload job from the ${chalk.magentaBright(
                    "asset1"
                )} with verbose output`
            );
        });
};

function determineMinAndMax(mintime: Date | undefined, timestamp: Date, maxtime: Date | undefined) {
    if (!mintime || timestamp < mintime) {
        mintime = timestamp;
    }
    if (!maxtime || timestamp > maxtime) {
        maxtime = timestamp;
    }
    return { mintime, maxtime };
}

function writeDataAsJson({
    mintime,
    maxtime,
    options,
    aspect,
    data
}: {
    mintime?: Date;
    maxtime?: Date;
    options: any;
    aspect: string;
    data: any[];
}) {
    mintime || maxtime || throwError("the data is ivalid the timestamps are corrupted");
    const newFileName = `from_${mintime && mintime.toISOString()}_to_${maxtime && maxtime.toISOString()}_${
        data.length
    }_records.json`;
    verboseLog(`writing ${options.dir}/json/${aspect}/${chalk.magentaBright(newFileName)}`, options.verbose);
}

function getFiles(options: any, aspect: string) {
    verboseLog(`reading directory ${options.dir}/csv/${chalk.magentaBright(aspect)}`, options.verbose);
    const files = fs.readdirSync(`${options.dir}/csv/${aspect}`).filter(x => {
        return fs.statSync(`${options.dir}/csv/${aspect}/${x}`).isFile();
    });
    return files;
}

function getAspectsFromDirNames(options: any): string[] {
    const aspects = fs.readdirSync(`${options.dir}/csv/`).filter(x => {
        return fs.statSync(`${options.dir}/csv/${x}`).isDirectory();
    });
    verboseLog(`aspect directories ${JSON.stringify(aspects)} in csv directory`, options.verbose);
    return aspects;
}

async function createOrReadAsset(options: any) {
    let asset = require(path.resolve(`${options.dir}/asset.json`));
    const auth = loadAuth();
    const assetMgmt = new AssetManagement(auth.gateway, decrypt(auth, options.passkey), auth.tenant);
    if (!asset.assetId) {
        verboseLog(`creating new asset ${chalk.magentaBright(asset.name)}`, options.verbose);
        asset = await assetMgmt.PostAsset(asset);
        verboseLog(
            `$asset ${chalk.magentaBright(asset.name)} with id ${chalk.magentaBright(asset.assetId)} created`,
            options.verbose
        );
    } else {
        verboseLog(
            `reading asset ${chalk.magentaBright(asset.name)} ${chalk.magentaBright(asset.assetId)}`,
            options.verbose
        );
        asset = await assetMgmt.GetAsset(asset.assetId);
        verboseLog(
            `asset ${chalk.magentaBright(asset.name)} ${chalk.magentaBright(
                asset.assetId
            )} was read from the MindSphere`,
            options.verbose
        );
    }
    fs.writeFileSync(`${options.dir}/asset.json`, JSON.stringify(asset, null, 2));
    return asset;
}

function checkRequiredParamaters(options: any) {
    verboseLog(`reading directory: ${chalk.magentaBright(options.dir)}`, options.verbose);
    !fs.existsSync(options.dir) && throwError(`the directory ${chalk.magentaBright(options.dir)} doesn't exist!`);

    !fs.existsSync(`${options.dir}/asset.json`) &&
        throwError(
            `the directory ${chalk.magentaBright(
                options.dir
            )} must contain the asset.json file. run mc iot-prepare-bulk-dir command first!`
        );

    !fs.existsSync(`${options.dir}/json/`) &&
        throwError(
            `the directory ${chalk.magentaBright(
                options.dir
            )} must contain the json/ folder. run mc iot-prepare-bulk-dir command first!`
        );

    !fs.existsSync(`${options.dir}/csv/`) &&
        throwError(
            `the directory ${chalk.magentaBright(
                options.dir
            )} must contain the csv/ folder. run mc iot-prepare-bulk-dir command first!`
        );

    !options.passkey &&
        errorLog(
            "you have to provide a passkey to get the service token (run mc ibr --help for full description)",
            true
        );
}
