import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as csv from "csvtojson";
import * as fs from "fs";
import * as _ from "lodash";
import * as path from "path";
import { sleep } from "../../../test/test-utils";
import {
    AssetManagementClient,
    AssetManagementModels,
    TimeSeriesBulkClient,
    TimeSeriesBulkModels
} from "../../api/sdk";
import { IotFileClient } from "../../api/sdk/iotfile/iot-file";
import { decrypt, errorLog, loadAuth, retry, retrylog, throwError, verboseLog } from "../../api/utils";
import ora = require("ora");

interface ExtendedFileInfo extends TimeSeriesBulkModels.FileInfo {}

type fileInfo = {
    entity: string;
    propertyset: string;
    path: string;
    filepath: string;
    mintime: Date;
    maxtime: Date;
    etag?: string;
};

type jobState = {
    options: {
        size: any;
        twintype: AssetManagementModels.TwinType | undefined;
        asset: AssetManagementModels.AssetResourceWithHierarchyPath;
    };

    uploadFiles: fileInfo[];
    bulkImports: TimeSeriesBulkModels.BulkImportInput[];
};

export default (program: CommanderStatic) => {
    program
        .command("bulk-run")
        .alias("br")
        .option("-d, --dir <directoryname>", "config file with agent configuration", "bulkupload")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-s, --size <size>", "entries per file ", Number.MAX_SAFE_INTEGER)
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output")
        .option("-st, --start", "start sending data to mindsphere")
        .description(chalk.magentaBright("runs the (bulk) upload job from <directoryname> directory *"))
        .action(options => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const asset = (await createOrReadAsset(
                        options
                    )) as AssetManagementModels.AssetResourceWithHierarchyPath;
                    const aspects = getAspectsFromDirNames(options);
                    const spinner = ora("creating files");
                    verboseLog(
                        `Starting bulk-import of timeseries data for twintype : ${asset.twinType}`,
                        options.verbose,
                        spinner
                    );

                    const files: fileInfo[] = await getUploadJobs({ aspects, options, spinner, asset });

                    const jobstate: jobState = {
                        options: { size: options.size, twintype: asset.twinType, asset: asset },
                        uploadFiles: files,
                        bulkImports: []
                    };
                    fs.writeFileSync(`${options.dir}/jobstate.json`, JSON.stringify(jobstate, null, 2));

                    asset.twinType === AssetManagementModels.TwinType.Simulation &&
                        verifySimulationFiles(jobstate.uploadFiles) &&
                        verboseLog("All files verified", options.verbose, spinner);

                    await sleep(1000);
                    !options.verbose && spinner.succeed("done converting files to json");
                    console.log(
                        `\nrun mc bulk-run with ${chalk.magentaBright(
                            "--start"
                        )} option to start sending data to mindsphere\n`
                    );
                    if (options.start) {
                        await uploadFiles(options, jobstate);

                        fs.writeFileSync(`${options.dir}/jobstate.json`, JSON.stringify(jobstate, null, 2));

                        const results = _(jobstate.uploadFiles)
                            .groupBy(x => {
                                const date = new Date(x.mintime);
                                date.setMinutes(0, 0, 0);
                                return JSON.stringify({ propertySet: x.propertyset, fullHourDate: date });
                            })
                            .map()
                            .value();

                        for (const fileInfos of results) {
                            const first = (_(fileInfos).first() as fileInfo) || throwError("no data in results");
                            const data: TimeSeriesBulkModels.Data = {
                                entity: first.entity,
                                propertySetName: first.propertyset,
                                timeseriesFiles: fileInfos.map(x => {
                                    return { filepath: x.filepath, from: x.mintime, to: x.maxtime };
                                })
                            };
                            console.log(data);
                            jobstate.bulkImports.push({ data: [data] });
                            console.log("\n");
                        }

                        console.log(jobstate.bulkImports);

                        const auth = loadAuth();
                        const bulkupload = new TimeSeriesBulkClient(
                            auth.gateway,
                            decrypt(auth, options.passkey),
                            auth.tenant
                        );

                        for (const bulkImport of jobstate.bulkImports) {
                            const jobid = await bulkupload.PostImportJob(bulkImport);
                            (bulkImport as any).jobid = jobid;
                            console.log(jobid);
                        }

                        fs.writeFileSync(`${options.dir}/jobstate.json`, JSON.stringify(jobstate, null, 2));

                        // const result = await bulkupload.PostImportJob({ data: [jobsInput.data[0]] });
                        // console.log(JSON.stringify(result));

                        // for (let index = 0; index < 100; index++) {
                        //     await sleep(2000);
                        //     const current = await bulkupload.GetJobStatus(`${result.jobId}`);
                        //     console.log(JSON.stringify(current));
                        // }

                        // const allfiles = await fileUploadClient.GetFiles(asset.assetId);
                        // console.log(JSON.stringify(allfiles, null, 2));
                        console.log("Done.");
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc bulk-run runs the upload job from the  ${chalk.magentaBright("bulkimport")} directory`);
            log(
                `    mc br --dir asset1 --verbose runs the upload job from the ${chalk.magentaBright(
                    "asset1"
                )} with verbose output`
            );
        });
};

async function uploadFiles(options: any, jobstate: jobState) {
    const auth = loadAuth();
    const fileUploadClient = new IotFileClient(auth.gateway, decrypt(auth, options.passkey), auth.tenant);
    for (const entry of jobstate.uploadFiles) {
        const result = await retry(
            options.retry,
            () =>
                fileUploadClient.PutFile(`${jobstate.options.asset.assetId}`, entry.filepath, entry.path, {
                    type: "application/json",
                    timestamp: fs.statSync(entry.path).mtime,
                    description: "bulk upload"
                }),
            500,
            retrylog("PutFile")
        );
        entry.etag = result.get("etag") || "0";
    }
}

async function getUploadJobs({
    aspects,
    options,
    spinner,
    asset
}: {
    aspects: string[];
    options: any;
    spinner: ora.Ora;
    asset: any;
}) {
    const uploadJobs: fileInfo[] = [];
    for (const aspect of aspects) {
        const files = getFiles(options, aspect);
        !options.verbose && spinner.start("");
        for (const file of files) {
            let data: any = [];
            let recordCount = 0;
            let mintime: Date | undefined;
            let maxtime: Date | undefined;
            const maxSize = options.size;
            maxSize > 0 || throwError("the size must be greater than 0");
            await verboseLog(
                `reading file: ${options.dir}/csv/${aspect}/${chalk.magentaBright(file)}`,
                options.verbose,
                spinner
            );
            await csv()
                .fromFile(`${options.dir}/csv/${aspect}/${file}`)
                .subscribe(async json => {
                    data.push(json);
                    const timestamp = new Date(json._time);
                    ({ mintime, maxtime } = determineMinAndMax(mintime, timestamp, maxtime));
                    if (data.length >= maxSize) {
                        const [path, newname] = writeDataAsJson({
                            mintime,
                            maxtime,
                            options,
                            aspect,
                            data
                        });
                        uploadJobs.push({
                            entity: asset.assetId,
                            propertyset: aspect,
                            filepath: `bulk/${newname}.json`,
                            path: path,
                            mintime: mintime,
                            maxtime: maxtime
                        });
                        data = [];
                        mintime = maxtime = undefined;
                    }
                    recordCount++;
                });
            if (data.length > 0) {
                const [path, newname] = writeDataAsJson({
                    mintime,
                    maxtime,
                    options,
                    aspect,
                    data
                });
                uploadJobs.push({
                    entity: asset.assetId,
                    propertyset: aspect,
                    filepath: `bulk/${newname}.json`,
                    path: path,
                    mintime: mintime as Date,
                    maxtime: maxtime as Date
                });
            }
            verboseLog(
                `total record count in ${file}: ${chalk.magentaBright(recordCount.toString())}`,
                options.verbose,
                spinner
            );
        }
    }
    return uploadJobs;
}

function verifySimulationFiles(uploadJobs: fileInfo[]) {
    const incompatibleFiles = uploadJobs.filter(fileInfo => {
        const minFullHour = new Date(fileInfo.mintime);
        minFullHour.setMinutes(0, 0, 0);
        const maxFullHour = new Date(fileInfo.maxtime);
        maxFullHour.setMinutes(0, 0, 0);
        return minFullHour.valueOf() !== maxFullHour.valueOf();
    });

    incompatibleFiles.length > 0 &&
        (() => {
            incompatibleFiles.forEach(f => console.log(f.path));
            throwError(
                `there are ${incompatibleFiles.length} files which contain data which are not from the same hour!`
            );
        })();

    return true;
}

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
    const newFileName = `${aspect}_from_${mintime && mintime.toISOString()}_to_${maxtime && maxtime.toISOString()}_${
        data.length
    }_records`.replace(/[^a-z0-9]/gi, "_");
    verboseLog(`writing ${options.dir}/json/${aspect}/${chalk.magentaBright(newFileName + ".json")}`, options.verbose);
    const newPath = `${options.dir}/json/${aspect}/${newFileName}.json`;
    fs.writeFileSync(newPath, JSON.stringify(data));
    return [newPath, newFileName];
}

function getFiles(options: any, aspect: string, csvorjson: "csv" | "json" = "csv") {
    verboseLog(`reading directory ${options.dir}/${csvorjson}/${chalk.magentaBright(aspect)}`, options.verbose);
    const files = fs.readdirSync(`${options.dir}/${csvorjson}/${aspect}`).filter(x => {
        return fs.statSync(`${options.dir}/${csvorjson}/${aspect}/${x}`).isFile();
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
    const assetMgmt = new AssetManagementClient(auth.gateway, decrypt(auth, options.passkey), auth.tenant);
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
    if (`${options.dir}`.endsWith("/") || `${options.dir}`.endsWith("/")) {
        options.dir = `${options.dir}`.slice(0, -1);
    }

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
