#!/usr/bin/env node
// Copyright (C), Siemens AG 2017
import chalk from "chalk";
import * as program from "commander";
import * as csv from "csvtojson";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { MindConnectAgent, MindsphereStandardEvent } from "..";
import { DiagnosticInformation } from "../api/mindconnect-models";
import { MindConnectSetup } from "../api/mindconnect-setup";
import {
    checkCertificate,
    convertToTdpArray,
    decrypt,
    encrypt,
    errorLog,
    getHomeDotMcDir,
    getPiamUrl,
    homeDirLog,
    isUrl,
    loadAuth,
    proxyLog,
    retry,
    retrylog,
    storeAuth,
    verboseLog
} from "../api/utils";

const mime = require("mime-types");
const log = console.log;

program.version("MindConnect NodeJS CLI - Version: 3.3.0").on("--help", () => {
    log(`\n  Documentation:\n`);
    log(`    the ${chalk.magentaBright("magenta colored commands *")} require service credentials.`);
    log(`    the ${chalk.cyanBright("cyan colored commands ")}require mindconnectlib (agent) credentials`);
    log(`    the service credentials should only be used in secure environments for setup tasks\n`);
});

program.on("command:*", function() {
    console.error(chalk.redBright(`Invalid command: ${program.args.join(" ")}`));
    console.error("Use mc --help for a list of available commands");
    process.exit(1);
});

/**
 * Agent onboarding
 */
program
    .command("onboard")
    .alias("ob")
    .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
    .option(
        "-r, --cert [privatekey]",
        "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
    )
    .option("-y, --retry <number>", "retry attempts before giving up", 3)
    .option("-v, --verbose", "verbose output")
    .description(chalk.cyanBright("onboard the agent with configuration stored in the config file"))
    .action(options => {
        (async () => {
            try {
                homeDirLog(options.verbose);
                proxyLog(options.verbose);

                const configFile = path.resolve(options.config);
                verboseLog(
                    `Onboarding the agent using the configuration stored in: ${chalk.cyanBright(configFile)}.`,
                    options.verbose
                );
                if (!fs.existsSync(configFile)) {
                    throw new Error(`Can't find file ${configFile}`);
                }
                const configuration = require(configFile);
                const profile = checkCertificate(configuration, options);
                const agent = new MindConnectAgent(configuration, undefined, getHomeDotMcDir());
                if (profile) {
                    agent.SetupAgentCertificate(fs.readFileSync(options.cert));
                }

                if (!agent.IsOnBoarded()) {
                    await retry(options.retry, () => agent.OnBoard(), 300, retrylog("OnBoard"));
                    log(`Your agent with id ${chalk.cyanBright(agent.ClientId())} was succesfully onboarded.`);
                } else {
                    log(`Your agent with id ${chalk.cyanBright(agent.ClientId())} was already onboarded.`);
                    verboseLog(
                        `Offboard the agent in the mindsphere UI and delete the .mc/${chalk.cyanBright(
                            agent.ClientId() + ".json"
                        )} file to onboard again.`,
                        options.verbose
                    );
                }
            } catch (err) {
                errorLog(err, options.verbose);
            }
        })();
    })
    .on("--help", () => {
        log("\n  Examples:\n");
        log(`    mc ob   \t\t\t\tuses default ${chalk.cyanBright("agentconfig.json")}`);
        log(`    mc onboard --config agent.json \tuses specified configuration file`);
        log(`    mc onboard --config agent.json --cert private.key \tuses specified key for RSA_3072 profile`);
    });

/**
 *  file upload
 */
program
    .command("upload-file")
    .alias("uf")
    .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
    .option(
        "-r, --cert [privatekey]",
        "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
    )
    .option("-f, --file <fileToUpload>", "file to upload to the file service")
    .option("-i, --assetid [assetid]", "asset id from the mindsphere  (default: upload to the agent)")
    .option("-m, --mime [mime-type]", "mime type of the file (default: automatic recognition)")
    .option("-d, --desc [description]", "description")
    .option("-k, --chunked", "Use chunked upload")
    .option("-y, --retry <number>", "retry attempts before giving up", 3)
    .option("-v, --verbose", "verbose output")
    .description(chalk.cyanBright("upload the file to the mindsphere file service"))
    .action(options => {
        (async () => {
            try {
                if (!options.file) {
                    errorLog(
                        "Missing file name for upload-file command. Run mc uf --help for full syntax and examples.",
                        true
                    );
                    process.exit(1);
                }

                homeDirLog(options.verbose);
                proxyLog(options.verbose);

                const configFile = path.resolve(options.config);
                verboseLog(
                    `Upload using the agent configuration stored in: ${chalk.cyanBright(configFile)}.`,
                    options.verbose
                );

                if (!fs.existsSync(configFile)) {
                    throw new Error(`Can't find file ${configFile}`);
                }

                const uploadFile = path.resolve(options.file);
                if (!fs.existsSync(uploadFile)) {
                    throw new Error(`Can't find file ${uploadFile}`);
                }

                verboseLog(`File to upload: ${chalk.cyanBright(uploadFile)}.`, options.verbose);

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

                const mimeType = options.mime || mime.lookup(uploadFile) || "application/octet-stream";
                const description =
                    options.desc || `File uploaded on ${new Date().toUTCString()} using mindconnect CLI`;

                const assetid = options.assetid || agent.ClientId();
                const chunked = options.chunked ? true : false;

                log(`Uploading the file: ${chalk.cyanBright(uploadFile)} with mime type ${mimeType}.`);
                verboseLog(`Description ${description}`, options.verbose);
                verboseLog(`AssetId ${assetid}`, options.verbose);
                verboseLog(
                    assetid === agent.ClientId() ? "Uploading to agent." : "Uploading to another asset.",
                    options.verbose
                );
                verboseLog(chunked ? `Using chunked upload` : `No chunked upload`, options.verbose);

                await retry(
                    options.retry,
                    () => agent.Upload(uploadFile, mimeType, description, chunked, assetid),
                    300,
                    retrylog("FileUpload")
                );
                log(`Your file ${chalk.cyanBright(uploadFile)} was succesfully uploaded.`);
            } catch (err) {
                errorLog(err, options.verbose);
            }
        })();
    })
    .on("--help", () => {
        log("\n  Examples:\n");
        log(`    mc uf -f CHANGELOG.md   \t\t\t\t\t\t\t upload file CHANGELOG.md to the agent`);
        log(
            `    mc upload-file --file  CHANGELOG.md  --assetid 5...f --mime text/plain \t upload file to a specified asset with custom mime type`
        );
        log(
            `    mc upload-file --file  CHANGELOG.md  --chunked \t\t\t\t upload file using experimental chunked upload`
        );
    });

/**
 *   time series
 */
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
    .description(chalk.cyanBright("parse .csv file with timeseriesdata and upload the timeseries data to mindsphere"))
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
            `  timestamp, ${chalk.cyanBright("dataPointId")}, ${chalk.greenBright("qualityCode")}, ${chalk.yellowBright(
                "value"
            )}`
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

/**
 *   create event
 */
program
    .command("create-event")
    .alias("ce")
    .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
    .option(
        "-r, --cert [privatekey]",
        "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
    )
    .option("-i, --assetid <assetid>", "asset id from the mindsphere  (default: send event to the agent)")
    .option("-y, --sourceType <sourceType>", "Source Type", "MindConnect-Agent")
    .option("-S, --sourceId <sourceId>", "Source Id", os.hostname() || "")
    .option("-O, --source <source>", "Source", "MindConnect-NodeJs CLI")
    .option("-V, --severity <severity>", "Severity (20:Error, 30:Warning , 40:information)", 20)
    .option("-d, --desc <description>", "Event description", "CLI created event")
    .option("-t, --timestamp <timestamp>", "Timestamp", new Date().toISOString())
    .option("-y, --retry <number>", "retry attempts before giving up", 3)
    .option("-v, --verbose", "verbose output")
    .description(chalk.cyanBright("create an event in the mindsphere"))
    .action(options => {
        (async () => {
            try {
                homeDirLog(options.verbose);
                proxyLog(options.verbose);

                const configFile = path.resolve(options.config);
                verboseLog(
                    `Event upload using the agent configuration stored in: ${chalk.cyanBright(configFile)}.`,
                    options.verbose
                );
                if (!fs.existsSync(configFile)) {
                    throw new Error(`Can't find file ${configFile}`);
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

                const assetid = options.assetid || agent.ClientId();

                const event: MindsphereStandardEvent = {
                    entityId: assetid, // use assetid if you want to send event somewhere else :)
                    sourceType: options.sourceType,
                    sourceId: options.sourceId,
                    source: options.source,
                    severity: parseInt(options.severity), // 0-99 : 20:error, 30:warning, 40: information
                    timestamp: options.timestamp,
                    description: options.desc
                };

                verboseLog(`creating event : ${JSON.stringify(event)}`, options.verbose);

                await retry(options.retry, () => agent.PostEvent(event), 300, retrylog("PostEvent"));

                log(`Your event with severity ${chalk.cyanBright(event.severity + "")} was succesfully created.`);
            } catch (err) {
                errorLog(err, options.verbose);
            }
        })();
    })
    .on("--help", () => {
        log("\n  Examples:\n");
        log(`    mc create-event \t\t\t\t create error event with default values and current timestamp`);
        log(`    mc ce --desc Warning! --severity 30 \t create warning with description warning`);
        log(`    mc ce --desc \"custom event\" --i 123....4 \t create error event for asset with id 123....4`);
    });

program
    .command("service-credentials")
    .alias("sc")
    .option("-u, --user <username>", "service credentials: username")
    .option("-p, --password <password>", "service credendials: password")
    .option(
        "-g, --gateway <gateway>",
        "region string or full gateway url (e.g. eu1, eu2 or https://gateway.eu1.mindsphere.io)"
    )
    .option("-t, --tenant <tenant>", "your tenant name")
    .option("-k, --passkey <passkey>", "passkey (you will use this in the commands which require service credentials)")
    .option("-v, --verbose", "verbose output")
    .description(chalk.magentaBright("provide login for commands which require technical user credentials *"))
    .action(options => {
        (async () => {
            try {
                if (!options.gateway || !options.user || !options.tenant || !options.passkey) {
                    errorLog(
                        "Invalid/missing parameters for service-credentials command. Run mc sc --help for full syntax and examples.",
                        true
                    );
                    process.exit(1);
                }
                const gateway = isUrl(options.gateway)
                    ? options.gateway
                    : `https://gateway.${options.gateway}.mindsphere.io`;
                log(getPiamUrl(gateway, options.tenant));
                const encrypted = encrypt(options.user, options.password, options.passkey, gateway, options.tenant);
                storeAuth(encrypted);
                const decrypted = decrypt(encrypted, options.passkey);
                console.log(decrypted);
            } catch (err) {
                errorLog(err, options.verbose);
            }
        })();
    })
    .on("--help", () => {
        log(`\n  Example:\n`);
        log(
            `    mc service-credentials --user tenantx001 --password xxxx-xxx-x-x --gateway eu1 --tenant tenantx --passkey mypasskey`
        );
        log(`\n  Important:\n`);
        log(`    this should be used only in secure environments for setup tasks\n`);
        log(`    how to get service credentials:`);
        log(chalk.magentaBright(`    https://developer.mindsphere.io/howto/howto-selfhosted-api-access.html#creating-service-credentials`));
    });

program
    .command("register-diagnostic")
    .alias("rd")
    .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
    .option("-k, --passkey <passkey>", "passkey")
    .option("-v, --verbose", "verbose output")
    .description(chalk.magentaBright("register agent for diagnostic *"))
    .action(options => {
        (async () => {
            try {
                if (!options.passkey) {
                    errorLog("you have to provide a passkey (run mc rd --help for full description)", true);
                }
                homeDirLog(options.verbose);
                proxyLog(options.verbose);

                const auth = loadAuth();
                const setup = new MindConnectSetup(auth.gateway, decrypt(auth, options.passkey), auth.tenant);
                const configFile = path.resolve(options.config);
                if (!fs.existsSync(configFile)) {
                    throw new Error(`Can't find file ${configFile}`);
                }
                const configuration = require(configFile);
                verboseLog(
                    `registering for diagnostic with agent id ${chalk.magentaBright(configuration.content.clientId)}`,
                    options.verbose
                );
                await setup.RegisterForDiagnostic(configuration.content.clientId);
                verboseLog(
                    `successfully registered the agent with agent id ${chalk.magentaBright(
                        configuration.content.clientId
                    )} for diagnostic`,
                    true
                );
            } catch (err) {
                verboseLog(
                    chalk.magentaBright("This operation requires additionaly the service credentials."),
                    options.verbose
                );
                errorLog(err, options.verbose);
            }
        })();
    })
    .on("--help", () => {
        log(`\n  Examples:\n`);
        log(`    mc rd -k mypasskey`);
        log(`    mc register-diagnostic --config someagent.json -passkey mypasskey`);
        log(`\n  Important:\n`);
        log(
            `    you need to supply the ${chalk.magentaBright(
                "service credentials"
            )} for this operation and provide the passkey \n`
        );
        log(`    how to get service credentials:`);
        log(chalk.magentaBright(`    https://developer.mindsphere.io/howto/howto-selfhosted-api-access.html#creating-service-credentials`));
    });

program
    .command("get-diagnostic")
    .alias("gd")
    .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
    .option("-k, --passkey <passkey>", "passkey")
    .option("-a, --all", "display all entries not just the last page")
    .option("-j, --json", "json output")
    .option("-t, --text", "text (raw) output")
    .option("-v, --verbose", "verbose output")
    .description(chalk.magentaBright("get diagnostic information *"))
    .action(options => {
        (async () => {
            try {
                if (!options.passkey) {
                    errorLog("you have to provide a passkey (run mc ud --help for full description)", true);
                }
                homeDirLog(options.verbose);
                proxyLog(options.verbose);

                const auth = loadAuth();
                const setup = new MindConnectSetup(auth.gateway, decrypt(auth, options.passkey), auth.tenant);
                const configFile = path.resolve(options.config);
                if (!fs.existsSync(configFile)) {
                    throw new Error(`Can't find file ${configFile}`);
                }
                const configuration = require(configFile);
                verboseLog(
                    `getting diagnostic data for agent with agent id ${chalk.magentaBright(
                        configuration.content.clientId
                    )}`,
                    options.verbose
                );

                const activations = await setup.GetDiagnosticActivations();
                log(
                    `There are ${chalk.magentaBright(
                        activations.content.length + " agent(s)"
                    )} registered for diagnostic`
                );
                verboseLog(JSON.stringify(activations.content), options.verbose);

                function printDiagnosticInformation(diag: DiagnosticInformation[], options: any) {
                    for (const iterator of diag) {
                        const element = <any>iterator;

                        if (options.json) {
                            log(element);
                        } else if (options.text) {
                            log(
                                `${element.timestamp},${element.severity},${element.agentId},${element.correlationId},${
                                    element.state
                                },${element.source},${element.message}`
                            );
                        } else {
                            log(
                                `${chalk.cyanBright(element.timestamp)} ${chalk.greenBright(
                                    element.severity
                                )} ${chalk.magentaBright(element.source)} ${element.message}`
                            );
                        }
                    }
                }
                const information = await setup.GetDiagnosticInformation(
                    configuration.content.clientId,
                    printDiagnosticInformation,
                    options,
                    !options.all
                );
                log(`There are ${chalk.magentaBright(information.totalElements + " ")}total log entries`);
            } catch (err) {
                verboseLog(
                    chalk.magentaBright("This operation requires additionaly the service credentials."),
                    options.verbose
                );
                errorLog(err, options.verbose);
            }
        })();
    })
    .on("--help", () => {
        log(`\n  Examples: \n`);
        log(`    mc gd -k mypasskey`);
        log(`    mc get-diagnostic --config someagent.json --passkey mypasskey`);
        log(`    mc get-diagnostic --passkey mypasskey --text --all > log.csv`);
        log(`\n  Important: \n`);
        log(
            `    you need to supply the ${chalk.magentaBright(
                "service credentials"
            )} for this operation and provide the passkey \n`
        );
        log(`    how to get service credentials: `);
        log(chalk.magentaBright(`    https://developer.mindsphere.io/howto/howto-selfhosted-api-access.html#creating-service-credentials`));
    });

program
    .command("unregister-diagnostic")
    .alias("ud")
    .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
    .option("-k, --passkey <passkey>", "passkey")
    .option("-v, --verbose", "verbose output")
    .description(chalk.magentaBright("unregister agent from diagnostic *"))
    .action(options => {
        (async () => {
            try {
                if (!options.passkey) {
                    errorLog("you have to provide a passkey (run mc ud --help for full description)", true);
                }

                homeDirLog(options.verbose);
                proxyLog(options.verbose);

                const auth = loadAuth();
                const setup = new MindConnectSetup(auth.gateway, decrypt(auth, options.passkey), auth.tenant);
                const configFile = path.resolve(options.config);
                if (!fs.existsSync(configFile)) {
                    throw new Error(`Can't find file ${configFile}`);
                }
                const configuration = require(configFile);
                verboseLog(
                    `unregistering from diagnostic with agent id ${chalk.magentaBright(
                        configuration.content.clientId
                    )}`,
                    options.verbose
                );
                await setup.DeleteDiagnostic(configuration.content.clientId);
                verboseLog(
                    `successfully unregistered the agent with agent id ${chalk.magentaBright(
                        configuration.content.clientId
                    )} from diagnostic`,
                    true
                );
            } catch (err) {
                verboseLog(
                    chalk.magentaBright("This operation requires additionaly the service credentials."),
                    options.verbose
                );
                errorLog(err, options.verbose);
            }
        })();
    })
    .on("--help", () => {
        log(`\n  Examples:\n`);
        log(`    mc ud -k mypasskey`);
        log(`    mc unregister-diagnostic --config someagent.json -passkey mypasskey`);
        log(`\n  Important:\n`);
        log(
            `    you need to supply the ${chalk.magentaBright(
                "service credentials"
            )} for this operation and provide the passkey \n`
        );
        log(`    how to get service credentials:`);
        log(chalk.magentaBright(`    https://developer.mindsphere.io/howto/howto-selfhosted-api-access.html#creating-service-credentials`));
    });

program.parse(process.argv);

if (!program.args.length) program.help();

export default program;
