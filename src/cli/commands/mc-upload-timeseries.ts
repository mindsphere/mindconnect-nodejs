import { Command } from "commander";
import { log } from "console";
import * as csv from "csvtojson";
import * as fs from "fs";
import * as path from "path";
import { MindConnectAgent, retry } from "../..";
import { checkCertificate, convertToTdpArray, getAgentDir } from "../../api/utils";
import { displayCsvHelp, errorLog, getColor, homeDirLog, proxyLog, retrylog, verboseLog } from "./command-utils";
const mime = require("mime-types");

const color = getColor("cyan");

export default (program: Command) => {
    program
        .command("upload-timeseries")
        .alias("uts")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option(
            "-r, --cert [privatekey]",
            "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
        )
        .option("-f, --file <timeseriesdata.csv>", "csv file containing the timeseries data to upload to mindsphere")
        .option("-s, --size <size>", "max records per http post", "200")
        .option("-n, --no-validation", "switch validation off (only if you are sure that the timeseries upload works)")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("parse .csv file with timeseriesdata and upload the timeseries data to mindsphere"))
        .action((options) => {
            (async () => {
                try {
                    if (!options.file) {
                        errorLog(
                            "Missing file name for upload-timeseries command. Run mc ts --help for full syntax and examples.",
                            true
                        );
                        process.exit(1);
                    }

                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const configFile = path.resolve(options.config);
                    verboseLog(
                        `Timeseries upload using the agent configuration stored in: ${color(configFile)}.`,
                        options.verbose
                    );
                    if (!fs.existsSync(configFile)) {
                        throw new Error(`Can't find file ${configFile}`);
                    }

                    const uploadFile = path.resolve(options.file);
                    if (!fs.existsSync(uploadFile)) {
                        throw new Error(`Can't find file ${uploadFile}`);
                    }

                    verboseLog(`Timeseries file to upload: ${color(uploadFile)}.`, options.verbose);

                    if (!fs.existsSync(uploadFile)) {
                        throw new Error(`Can't find file ${uploadFile}`);
                    }
                    const configuration = require(configFile);
                    const profile = checkCertificate(configuration, options);
                    const agentFolder = getAgentDir(path.dirname(options.config));
                    verboseLog(`Using .mc folder for agent: ${color(agentFolder)}`, options.verbose);

                    const agent = new MindConnectAgent(configuration, undefined, agentFolder);
                    if (profile) {
                        agent.SetupAgentCertificate(fs.readFileSync(options.cert));
                    }

                    if (!agent.IsOnBoarded()) {
                        await retry(options.retry, () => agent.OnBoard(), 300, retrylog("OnBoard"));
                        log(color(`Your agent with id ${agent.ClientId()} was succesfully onboarded.`));
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
                    verboseLog(`Using ${color("" + maxSize)} http post size.`, options.verbose);
                    if (isNaN(maxSize) || maxSize < 1) {
                        throw new Error("the size parameter must be a number > 0");
                    }
                    verboseLog(`Using ${color(options.validation ? "validation" : "no validation")}`, options.verbose);

                    let messageCount = 0;
                    await csv()
                        .fromFile(uploadFile)
                        .subscribe(async (json) => {
                            data.push(json);
                            if (data.length >= maxSize) {
                                messageCount = await postChunk(messageCount, data, options, agent);
                                data = [];
                            }
                        });

                    if (data.length >= 1) {
                        messageCount = await postChunk(messageCount, data, options, agent);
                        data = [];
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            displayCsvHelp(color);
        });
};

async function postChunk(messageCount: number, data: any[], options: any, agent: MindConnectAgent) {
    verboseLog(
        `posting timeseries message Nr. ${color(++messageCount + "")} with ${color(data.length + "")} records `,
        true
    );
    const tdpArray = convertToTdpArray(data);
    await retry(
        options.retry,
        () => agent.BulkPostData(tdpArray, options.validation ? true : false),
        300,
        retrylog("TimeSeriesBulkUpload")
    );
    return messageCount;
}
