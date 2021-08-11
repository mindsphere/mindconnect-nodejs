import { Command } from "commander";
import { log } from "console";
import * as csv from "csvtojson";
import * as fs from "fs";
import * as _ from "lodash";
import * as path from "path";
import { sleep } from "../../../test/test-utils";
import { AssetManagementModels, MindSphereSdk, TimeSeriesBulkModels } from "../../api/sdk";
import { retry, throwError } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    modeInformation,
    proxyLog,
    verboseLog,
} from "./command-utils";
import ora = require("ora");

let color = getColor("magenta");
const warn = getColor("yellow");

export default (program: Command) => {
    program
        .command("run-bulk")
        .alias("rb")
        .option("-d, --dir <directoryname>", "config file with agent configuration", "bulkupload")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-l, --parallel <number>", "parallel chunk uploads", "3")
        .option("-s, --size <size>", "entries per file ", `${Number.MAX_SAFE_INTEGER}`)
        .option("-f, --force", "force generation of json files, file upload and creation of jobs")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-i, --timeseries", `use ${warn("(deprecated)")} timeseries upload`)
        .option("-v, --verbose", "verbose output")
        .option("-t, --start", "start sending data to mindsphere")
        .description(color("runs the timeseries (bulk) upload job from <directoryname> directory *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);
                    const asset = (await createOrReadAsset(
                        sdk,
                        options
                    )) as AssetManagementModels.AssetResourceWithHierarchyPath;

                    modeInformation(asset, options, color);

                    const aspects = getAspectsFromDirNames(options);
                    const spinner = ora("creating files");
                    !options.verbose && spinner.start("");
                    verboseLog(
                        `Starting bulk-import of timeseries data for twintype : ${asset.twinType}`,
                        options.verbose,
                        spinner
                    );

                    const startDate = new Date();

                    let jobstate: jobState = {
                        options: {
                            size: options.size,
                            twintype: asset.twinType,
                            asset: asset,
                        },
                        uploadFiles: [],
                        bulkImports: [],
                        timeSeriesFiles: [],
                    };

                    if (fs.existsSync(path.resolve(`${options.dir}/jobstate.json`))) {
                        jobstate = require(path.resolve(`${options.dir}/jobstate.json`)) as jobState;
                    }

                    options.force &&
                        verboseLog(
                            `${warn(
                                "\nWARNING"
                            )} forcing the generation of json files can lead to conflicts if files have been already uploaded.\n`,
                            options.verbose,
                            spinner
                        );

                    if (!jobstate.uploadFiles || jobstate.uploadFiles.length === 0 || options.force) {
                        const files: fileInfo[] = await createJsonFilesForUpload({
                            aspects,
                            options,
                            spinner,
                            asset,
                        });
                        jobstate.uploadFiles = files;
                        saveJobState(options, jobstate);
                    } else {
                        verboseLog(`${color("skipping")} generation of json files..`, options.verbose, spinner);
                        await sleep(500);
                    }

                    asset.twinType === AssetManagementModels.TwinType.Simulation &&
                        verifySimulationFiles(jobstate.uploadFiles) &&
                        verboseLog("All files verified", options.verbose, spinner);

                    await sleep(500);
                    !options.verbose && spinner.succeed("Done converting files to json.");
                    !options.start &&
                        console.log(
                            `\nrun mc run-bulk with ${color("--start")} option to start sending data to mindsphere\n`
                        );

                    // *
                    // * this is called only with the start - option
                    // *

                    if (options.start) {
                        const spinner = ora("running");
                        !options.verbose && spinner.start("");
                        if (asset.twinType === AssetManagementModels.TwinType.Simulation) {
                            await runSimulationUpload(sdk, options, jobstate, spinner);
                        } else if (
                            asset.twinType === AssetManagementModels.TwinType.Performance &&
                            !options.timeseries
                        ) {
                            await runSimulationUpload(sdk, options, jobstate, spinner);
                        } else {
                            await runTimeSeriesUpload(sdk, options, jobstate, spinner);
                        }

                        !options.verbose && spinner.succeed("Done");
                        const endDate = new Date();
                        log(`Run time: ${(endDate.getTime() - startDate.getTime()) / 1000} seconds`);

                        asset.twinType === AssetManagementModels.TwinType.Simulation &&
                            console.log(`\t run mc ${color("check-bulk")} command to check the progress of the job`);
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc run-bulk runs the upload job from the  ${color("bulkimport")} directory`);
            log(
                `    mc run-bulk --dir asset1 --verbose runs the upload job from the ${color(
                    "asset1"
                )} with verbose output`
            );
        });
};

async function runTimeSeriesUpload(sdk: MindSphereSdk, options: any, jobstate: jobState, spinner: ora.Ora) {
    const SLEEP_ON_429 = 5000; // wait 5s on 429
    const SLEEP_BETWEEN = 2000; // wait 1 sec between posts
    const pause = Math.max((options.size / 500) * SLEEP_BETWEEN, 2000); // wait at least two second, two second per 1000 records
    const tsClient = sdk.GetTimeSeriesClient();
    for (const file of jobstate.uploadFiles) {
        const timeSeries = require(path.resolve(file.path));

        if (jobstate.timeSeriesFiles.indexOf(file.path) >= 0 && !options.force) {
            verboseLog(
                `${color(timeSeries.length)} records from ${formatDate(file.mintime)} to ${formatDate(
                    file.maxtime
                )} were already posted`,
                options.verbose,
                spinner
            );
            await sleep(100);
            continue;
        }

        await retry(
            options.retry,
            () => tsClient.PutTimeSeries(file.entity, file.propertyset, timeSeries),
            SLEEP_ON_429
        );
        verboseLog(
            `posted ${color(timeSeries.length)} records from ${formatDate(file.mintime)} to ${formatDate(
                file.maxtime
            )} with pause of ${(pause / 1000).toFixed(2)}s between records`,
            options.verbose,
            spinner
        );
        jobstate.timeSeriesFiles.push(file.path);
        saveJobState(options, jobstate);
        await sleep(pause); // sleep 1 sec per 100 messages
    }
}

function formatDate(date: string | Date) {
    if (date instanceof Date) {
        return `${color(date.toISOString())}`;
    } else return `${color(date)}`;
}

async function runSimulationUpload(sdk: MindSphereSdk, options: any, jobstate: jobState, spinner: ora.Ora) {
    await uploadFiles(sdk, options, jobstate, spinner);
    saveJobState(options, jobstate);
    if (!jobstate.bulkImports || jobstate.bulkImports.length === 0) {
        await createUploadJobs(sdk, jobstate, options, spinner);
        saveJobState(options, jobstate);
    } else {
        verboseLog(`the jobs for ${options.dir} have already been created.`, options.verbose, spinner);
        await sleep(2000);
    }
}

async function createUploadJobs(sdk: MindSphereSdk, jobstate: jobState, options: any, spinner: ora.Ora) {
    const results = _(jobstate.uploadFiles)
        .groupBy((x) => {
            const date = new Date(x.mintime);
            date.setMinutes(0, 0, 0);
            return JSON.stringify({ propertySet: x.propertyset, fullHourDate: date });
        })
        .map()
        .value();
    for (const fileInfos of results as any) {
        const first = (_(fileInfos).first() as fileInfo) || throwError("no data in results");
        const data: TimeSeriesBulkModels.Data = {
            entity: first.entity,
            propertySetName: first.propertyset,
            timeseriesFiles: fileInfos.map((x: { filepath: any; mintime: any; maxtime: any }) => {
                return { filepath: x.filepath, from: x.mintime, to: x.maxtime };
            }),
        };
        jobstate.bulkImports.push({ data: [data] });
    }
    const bulkupload = sdk.GetTimeSeriesBulkClient();
    for (const bulkImport of jobstate.bulkImports) {
        const job = await bulkupload.PostImportJob(bulkImport);
        (bulkImport as any).jobid = job.id;
        verboseLog(
            `Job with ${color("" + job.jobId)} is in status : ${job.status} [${job.message}]`,
            options.verbose,
            spinner
        );
    }
}

function saveJobState(options: any, jobstate: jobState) {
    fs.writeFileSync(`${options.dir}/jobstate.json`, JSON.stringify(jobstate, null, 2));
}

async function uploadFiles(sdk: MindSphereSdk, options: any, jobstate: jobState, spinner?: any) {
    const fileUploadClient = sdk.GetIoTFileClient();
    for (const entry of jobstate.uploadFiles) {
        let etag: number | undefined;

        if (entry.etag === undefined || options.force) {
            // force upload of files
            const fileInfo = await fileUploadClient.GetFiles(entry.entity, {
                filter: `name eq ${path.basename(entry.filepath)} and path eq ${path.dirname(entry.filepath)}/`,
            });

            if (fileInfo.length === 1) {
                etag = fileInfo[0].etag;
            }
        } else {
            verboseLog(`The file  ${color(entry.filepath)} was already uploaded`, options.verbose, spinner);
            await sleep(500);
            continue;
        }

        const result = await retry(options.retry, () =>
            fileUploadClient.UploadFile(`${jobstate.options.asset.assetId}`, entry.filepath, entry.path, {
                type: "application/json",
                timestamp: fs.statSync(entry.path).mtime,
                description: "bulk upload",
                chunk: true,
                retry: options.retry,
                parallelUploads: options.parallel,
                logFunction: (p: string) => {
                    verboseLog(p, options.verbose, spinner);
                },
                verboseFunction: (p: string) => {
                    verboseLog(p, options.verbose, spinner);
                },
                ifMatch: etag,
            })
        );

        entry.etag = etag === undefined ? "0" : `${etag + 1}`;
        await saveJobState(options, jobstate);

        verboseLog(`uploaded ${entry.filepath} with md5 checksum: ${result}`, options.verbose, spinner);
        const fileInfo = await fileUploadClient.GetFiles(`${jobstate.options.asset.assetId}`, {
            filter: `name eq ${path.basename(entry.filepath)} and path eq ${path.dirname(entry.filepath)}/`,
        });

        entry.etag = `${fileInfo[0]?.etag ?? "0"}`;
        verboseLog(`Entry etag:  ${entry.etag}`, options.verbose, spinner);
    }
}

async function createJsonFilesForUpload({
    aspects,
    options,
    spinner,
    asset,
}: {
    aspects: string[];
    options: any;
    spinner: ora.Ora;
    asset: any;
}) {
    const uploadJobs: fileInfo[] = [];
    for (const aspect of aspects) {
        const files = getFiles(options, aspect);
        for (const file of files) {
            let data: any = [];
            let recordCount = 0;
            let mintime: Date | undefined;
            let maxtime: Date | undefined;
            const maxSize = options.size;
            maxSize > 0 || throwError("the size must be greater than 0");
            await verboseLog(`reading file: ${options.dir}/csv/${aspect}/${color(file)}`, options.verbose, spinner);
            await csv()
                .fromFile(`${options.dir}/csv/${aspect}/${file}`)
                .subscribe(async (json) => {
                    data.push(json);
                    const timestamp = new Date(json._time);
                    ({ mintime, maxtime } = determineMinAndMax(mintime, timestamp, maxtime));
                    if (data.length >= maxSize) {
                        const [path, newname] = writeDataAsJson({
                            mintime,
                            maxtime,
                            options,
                            aspect,
                            data,
                        });
                        uploadJobs.push({
                            entity: asset.assetId,
                            propertyset: aspect,
                            filepath: `bulk/${newname}.json`,
                            path: path,
                            mintime: mintime,
                            maxtime: maxtime,
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
                    data,
                });
                uploadJobs.push({
                    entity: asset.assetId,
                    propertyset: aspect,
                    filepath: `bulk/${newname}.json`,
                    path: path,
                    mintime: mintime as Date,
                    maxtime: maxtime as Date,
                });
            }
            verboseLog(`total record count in ${file}: ${color(recordCount.toString())}`, options.verbose, spinner);
        }
    }
    return uploadJobs;
}

function verifySimulationFiles(uploadJobs: fileInfo[]) {
    const incompatibleFiles = uploadJobs.filter((fileInfo) => {
        const minFullHour = new Date(fileInfo.mintime);
        minFullHour.setMinutes(0, 0, 0);
        const maxFullHour = new Date(fileInfo.maxtime);
        maxFullHour.setMinutes(0, 0, 0);
        return minFullHour.valueOf() !== maxFullHour.valueOf();
    });

    incompatibleFiles.length > 0 &&
        (() => {
            incompatibleFiles.forEach((f) => console.log(f.path));
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
    data,
}: {
    mintime?: Date;
    maxtime?: Date;
    options: any;
    aspect: string;
    data: any[];
}) {
    mintime || maxtime || throwError("the data is ivalid the timestamps are corrupted");
    const newFileName = `${aspect}_${mintime && mintime.toISOString()}`.replace(/[^a-z0-9]/gi, "_");
    verboseLog(`writing ${options.dir}/json/${aspect}/${color(newFileName + ".json")}`, options.verbose);
    const newPath = `${options.dir}/json/${aspect}/${newFileName}.json`;

    fs.writeFileSync(newPath, JSON.stringify(data));
    return [newPath, newFileName];
}

function getFiles(options: any, aspect: string, csvorjson: "csv" | "json" = "csv") {
    verboseLog(`reading directory ${options.dir}/${csvorjson}/${color(aspect)}`, options.verbose);
    const files = fs.readdirSync(`${options.dir}/${csvorjson}/${aspect}`).filter((x) => {
        return fs.statSync(`${options.dir}/${csvorjson}/${aspect}/${x}`).isFile();
    });
    return files;
}

function getAspectsFromDirNames(options: any): string[] {
    const aspects = fs.readdirSync(`${options.dir}/csv/`).filter((x) => {
        return fs.statSync(`${options.dir}/csv/${x}`).isDirectory();
    });
    verboseLog(`aspect directories ${JSON.stringify(aspects)} in csv directory`, options.verbose);
    return aspects;
}

async function createOrReadAsset(sdk: MindSphereSdk, options: any) {
    let asset = require(path.resolve(`${options.dir}/asset.json`));
    const assetMgmt = sdk.GetAssetManagementClient();
    if (!asset.assetId) {
        verboseLog(`creating new asset ${color(asset.name)}`, options.verbose);
        asset = await assetMgmt.PostAsset(asset);
        verboseLog(`$asset ${color(asset.name)} with id ${color(asset.assetId)} created`, options.verbose);
    } else {
        verboseLog(`reading asset ${color(asset.name)} ${color(asset.assetId)}`, options.verbose);
        asset = await assetMgmt.GetAsset(asset.assetId);
        verboseLog(`asset ${color(asset.name)} ${color(asset.assetId)} was read from the MindSphere`, options.verbose);
    }
    fs.writeFileSync(`${options.dir}/asset.json`, JSON.stringify(asset, null, 2));
    return asset;
}

function checkRequiredParamaters(options: any) {
    if (`${options.dir}`.endsWith("/") || `${options.dir}`.endsWith("\\")) {
        options.dir = `${options.dir}`.slice(0, -1);
    }

    verboseLog(`reading directory: ${color(options.dir)}`, options.verbose);
    !fs.existsSync(options.dir) && throwError(`the directory ${color(options.dir)} doesn't exist!`);

    !fs.existsSync(`${options.dir}/asset.json`) &&
        throwError(
            `the directory ${color(options.dir)} must contain the asset.json file. run mc prepare-bulk command first!`
        );

    !fs.existsSync(`${options.dir}/json/`) &&
        throwError(
            `the directory ${color(options.dir)} must contain the json/ folder. run mc prepare-bulk command first!`
        );

    !fs.existsSync(`${options.dir}/csv/`) &&
        throwError(
            `the directory ${color(options.dir)} must contain the csv/ folder. run mc prepare-bulk command first!`
        );
}

export type fileInfo = {
    entity: string;
    propertyset: string;
    path: string;
    filepath: string;
    mintime: Date;
    maxtime: Date;
    etag?: string;
};

export type jobState = {
    options: {
        size: any;
        twintype: AssetManagementModels.TwinType | undefined;
        asset: AssetManagementModels.AssetResourceWithHierarchyPath;
    };

    uploadFiles: fileInfo[];
    bulkImports: TimeSeriesBulkModels.BulkImportInput[];
    timeSeriesFiles: string[];
};
