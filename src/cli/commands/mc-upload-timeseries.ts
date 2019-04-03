import chalk from "chalk";
import { CommanderStatic } from "commander";
import { log } from "console";
import * as csv from "csvtojson";
import * as fs from "fs";
import * as path from "path";
import { MindConnectAgent, retry } from "../..";
import {
    checkCertificate,
    convertToTdpArray,
    errorLog,
    getHomeDotMcDir,
    homeDirLog,
    proxyLog,
    retrylog,
    verboseLog
} from "../../api/utils";
const mime = require("mime-types");

export default (program: CommanderStatic) => {
    program
        .command("upload-timeseries")
        .alias("ts")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option(
            "-r, --cert [privatekey]",
            "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
        )
        .option("-f, --file <timeseriesdata.csv>", "csv file containing the timeseries data to upload to mindsphere")
        .option("-s, --size <size>", "max elements per http post", 200)
        .option("-n, --no-validation", "switch validation off (only if you are sure that the timeseries upload works)")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-v, --verbose", "verbose output")
        .description(
            chalk.cyanBright("parse .csv file with timeseriesdata and upload the timeseries data to mindsphere")
        )
        .action(options => {
            (async () => {
                try {
                    if (!options.file) {
                        errorLog(
                            "Missing file name for upload-timeseries command. Run mc ts --help for full syntax and examples.",
                            true
                        );
                        process.exit(1);
                    }

                    homeDirLog(options.verbose);
                    proxyLog(options.verbose);

                    const configFile = path.resolve(options.config);
                    verboseLog(
                        `Timeseries upload using the agent configuration stored in: ${chalk.cyanBright(configFile)}.`,
                        options.verbose
                    );
                    if (!fs.existsSync(configFile)) {
                        throw new Error(`Can't find file ${configFile}`);
                    }

                    const uploadFile = path.resolve(options.file);
                    if (!fs.existsSync(uploadFile)) {
                        throw new Error(`Can't find file ${uploadFile}`);
                    }

                    verboseLog(`Timeseries file to upload: ${chalk.cyanBright(uploadFile)}.`, options.verbose);

                    if (!fs.existsSync(uploadFile)) {
                        throw new Error(`Can't find file ${uploadFile}`);
                    }
                    const configuration = require(configFile);
                    const profile = checkCertificate(configuration, options);
                    const agent = new MindConnectAgent(configuration, undefined, getHomeDotMcDir());
                    if (profile) {
                        agent.SetupAgentCertificate(fs.readFileSync(options.cert));
                    }

                    if (!agent.IsOnBoarded()) {
                        await retry(options.retry, () => agent.OnBoard(), 300, retrylog("OnBoard"));
                        log(chalk.cyanBright(`Your agent with id ${agent.ClientId()} was succesfully onboarded.`));
                    }

                    if (!agent.HasDataSourceConfiguration()) {
                        await retry(
                            options.retry,
                            () => agent.GetDataSourceConfiguration(),
                            300,
                            retrylog("GetDataSourceConfiguration")
                        );
                        verboseLog("Getting client configuration", options.verbose);
                    }

                    const mimeType = options.mime || mime.lookup(uploadFile) || "application/octet-stream";
                    verboseLog(`Mime type of the file is: ${mimeType}. it should be text/csv.`, options.verbose);

                    let data: any[] = [];

                    const maxSize = parseInt(options.size, 10);
                    verboseLog(`Using ${chalk.cyanBright("" + maxSize)} http post size.`, options.verbose);
                    if (isNaN(maxSize) || maxSize < 1) {
                        throw new Error("the size parameter must be a number > 0");
                    }
                    verboseLog(
                        `Using ${chalk.cyanBright(options.validation ? "validation" : "no validation")}`,
                        options.verbose
                    );

                    let i = 0;
                    await csv()
                        .fromFile(uploadFile)
                        .subscribe(async json => {
                            data.push(json);
                            if (data.length >= maxSize) {
                                verboseLog(
                                    `posting timeseries message Nr. ${chalk.cyanBright(
                                        ++i + ""
                                    )} with ${chalk.cyanBright(data.length + "")} records `,
                                    true
                                );
                                await retry(
                                    options.retry,
                                    () =>
                                        agent.BulkPostData(convertToTdpArray(data), options.validation ? true : false),
                                    300,
                                    retrylog("TimeSeriesBulkUpload")
                                );
                                data = [];
                            }
                        });

                    if (data.length >= 1) {
                        verboseLog(
                            `posting timeseries message Nr. ${chalk.cyanBright(++i + "")} with ${chalk.cyanBright(
                                data.length + ""
                            )} records `,
                            true
                        );
                        await retry(
                            options.retry,
                            () => agent.BulkPostData(convertToTdpArray(data), options.validation ? true : false),
                            300,
                            retrylog("TimeSeriesBulkUpload")
                        );
                        data = [];
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc ts -f timeseries.csv \t\t\t\t\t upload timeseries from the csv file to mindsphere `);
            log(`    mc upload-timeseries --file timeseries.csv  --size 100  \t use http post size of 100 `);

            log(`\n  ${chalk.cyanBright("Data Format:")} (use your own data point ids from mindsphere)\n`);
            log(
                `  timestamp, ${chalk.cyanBright("dataPointId")}, ${chalk.greenBright(
                    "qualityCode"
                )}, ${chalk.yellowBright("value")}`
            );
            log(
                `  2018-08-23T09:18:21.809Z, ${chalk.cyanBright("DP-Temperature")} ,${chalk.greenBright(
                    "0"
                )}, ${chalk.yellowBright("20.34")}`
            );
            log(
                `  2018-08-23T09:18:21.809Z, ${chalk.cyanBright("DP-Humidity")}, ${chalk.greenBright(
                    "0"
                )}, ${chalk.yellowBright("70.4")}`
            );
            log(
                `  2018-08-23T09:18:21.809Z, ${chalk.cyanBright("DP-Pressure")}, ${chalk.greenBright(
                    "0"
                )}, ${chalk.yellowBright("1012.3")}`
            );

            log(
                `\n  Make sure that the timestamp is in ISO format. The headers and the casing (timestamp, dataPointId) are important.`
            );

            log(`\n  ${chalk.cyanBright("Important:")}\n`);
            log(
                `    You have to configure the data source and data mappings in mindsphere asset manager before you can upload the data`
            );
            log(
                `    See also: ${chalk.cyanBright(
                    "https://documentation.mindsphere.io/resources/html/getting-connected/en-US/index.html"
                )}`
            );
        });
};
