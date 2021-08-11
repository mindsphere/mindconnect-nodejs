import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { DataPointValue, DataSourceConfiguration, MindConnectAgent, MindSphereSdk, TimeStampedDataPoint } from "../..";
import { getAgentDir, retry, throwError } from "../../api/utils";
import {
    adjustColor,
    agentConfigLog,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    proxyLog,
    verboseLog,
} from "./command-utils";
import ora = require("ora");

const cyan = getColor("cyan");
let color = getColor("magenta");

export default (program: Command) => {
    program
        .command("configure-agent")
        .alias("co")
        .option("-c, --config <agentconfig>", "config file with agent configuration")
        .option("-m, --mode [mode]", "command mode [config|map|print|delete|test|func|template]", "config")
        .option("-a, --agentid <agentid>", "agentid")
        .option("-i, --assetid <assetid>", "target assetid for mapping")
        .option("-t, --typeid <typeid>", "asset type for configuration")
        .option("-l, --language [js|python|json]", "target language for conversion function", "js")
        .option("-s, --timespan <timespan>", "timespan between generated timestamps (in ms)", "1000")
        .option("-c, --count <count>", "Number of generated records", "10")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(`${cyan("create data source configuration and mappings")} ${color("(optional: passkey) *")}`)
        .action((options) => {
            (async () => {
                try {
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    checkParameters(options);

                    let agentid = options.agentid;
                    let agent: MindConnectAgent;

                    const sdk = !options.config
                        ? (() => {
                              color = adjustColor(color, options);
                              return getSdk(options);
                          })()
                        : (() => {
                              color = cyan;
                              const configFile = path.resolve(options.config);
                              verboseLog(`agent configuration in: ${color(configFile)}.`, options.verbose);
                              !fs.existsSync(configFile) && throwError(`Can't find file ${configFile}`);

                              const agentFolder = getAgentDir(path.dirname(options.config));
                              verboseLog(`Using .mc folder for agent: ${color(agentFolder)}`, options.verbose);

                              const configuration = require(configFile);
                              agent = new MindConnectAgent(configuration, undefined, agentFolder);
                              agentid = agent.ClientId();

                              return new MindSphereSdk(agent);
                          })();

                    options.mode === "print" && (await print(sdk, agentid, color, options));
                    options.mode === "print" && process.exit(0);
                    options.mode === "func" && (await printFunc(sdk, agentid, color, options));
                    options.mode === "func" && process.exit(0);
                    options.mode === "config" && (await config(sdk, agentid, color, options));
                    options.mode === "delete" && (await deleteMappings(sdk, agentid, color, options));
                    options.mode === "map" && (await map(sdk, agentid, color, options));
                    options.mode === "template" && (await template(sdk, agentid, color, options));
                    options.mode === "template" && process.exit(0);
                    options.mode === "test" && (await inject(agent!, color, options));

                    options.mode !== "test" && (await print(sdk, agentid, color, options));

                    agentConfigLog({
                        gateway: sdk.GetGateway(),
                        host: options.passkey ? "gateway" : "southgate",
                        tenant: sdk.GetTenant(),
                        agentid: agentid,
                        color: color,
                    });
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc configure-agent --config agent.json -assetid 1234567...89 \tconfigures agent for specified assetid`
            );
            log(
                `    mc configure-agent --config agent.json --mode print \t\tprints data source configuration and mappings`
            );
            log(
                `    mc configure-agent --agentid 12345..ef --typeid <tenant>.Engine  \tcreates the data source configuration`
            );
            log(
                `    mc configure-agent --mode map --agentid 12345..ef --assetid 1234567 creates the mappings for assetid`
            );

            log(`    mc configure-agent --mode delete --agentid 12345..ef \t\tdeletes the mappings for agentid`);
            log(`    mc configure-agent --config agent.json --mode test \t\t\tsends test data to mindsphere`);
            log(`    mc configure-agent --mode template \\`);
            log(`    \t--typeid castidev.Pump --language python \t\t\tcreate mapping template and function in python`);
        });
};

async function template(sdk: MindSphereSdk, agentid: any, color: any, options: any) {
    const assetType = await sdk.GetAssetManagementClient().GetAssetType(options.typeid);
    const dataSourceConfig = await sdk.GetMindConnectApiClient().GenerateDataSourceConfiguration(assetType);

    const dataSourceMappings = await sdk
        .GetMindConnectApiClient()
        .GenerateMappings(dataSourceConfig, options.agentid || "<externalid>", options.assetid || "<assetid>");

    fs.writeFileSync(`${options.typeid}.mapping.mdsp.json`, JSON.stringify(dataSourceMappings, null, 2));
    console.log(`The file ${color(`${options.typeid}.mapping.mdsp.json`)} with mapping template was created.`);

    printFunc(sdk, dataSourceConfig, color, options);
}

async function map(sdk: MindSphereSdk, agentid: any, color: any, options: any) {
    const spinner = ora(color("Creating mappings..."));
    !options.verbose && spinner.start("");
    const configuration = await sdk.GetAgentManagementClient().GetDataSourceConfiguration(agentid);
    const generateMappings = await sdk
        .GetMindConnectApiClient()
        .GenerateMappings(configuration, agentid, options.assetid);

    let i = 0;
    for await (const mapping of generateMappings) {
        const result = await sdk.GetMindConnectApiClient().PostDataPointMapping(mapping, { ignoreCodes: [409] });
        verboseLog(
            `[${color(i++)}] ${mapping.dataPointId}-->${mapping.propertyName} ${mapping.propertySetName} (${
                mapping.entityId
            }) ${color(result ? "created" : "already existing")}`,
            options.verbose,
            spinner
        );
    }

    spinner.stop();
}

async function deleteMappings(sdk: MindSphereSdk, agentid: any, color: any, options: any) {
    const filter: any = { agentId: agentid };
    if (options.assetid) {
        filter.entityId = options.assetid;
    }

    const mappings = await sdk
        .GetMindConnectApiClient()
        .GetDataPointMappings({ filter: JSON.stringify(filter), size: 2000 });

    for await (const mapping of mappings.content) {
        await sdk.GetMindConnectApiClient().DeleteDataMapping(mapping.id!, { ignoreCodes: [404] });
    }
}

async function print(sdk: MindSphereSdk, agentid: any, color: any, options: any) {
    const configuration = await sdk.GetAgentManagementClient().GetDataSourceConfiguration(agentid);
    const mappings = await sdk
        .GetMindConnectApiClient()
        .GetDataPointMappings({ filter: JSON.stringify({ agentId: agentid }), size: 2000 });

    console.log(
        `Configuration for ${color(agentid)} ${color(configuration.configurationId)} eTag: ${configuration.eTag}`
    );
    console.log(`Data Sources (${color(configuration.dataSources.length)}) :`);
    configuration.dataSources.forEach((element) => {
        console.log(` - ${color(element.name)} (${color(element.dataPoints.length)})`);
        element.dataPoints.forEach((dataPoint) => {
            console.log(`\t - ${color(dataPoint.id)} ${dataPoint.name} (${color(dataPoint.type)}) ${dataPoint.unit}`);
        });
    });
    console.log(`Mappings count: ${color(mappings.content.length)}`);

    let i = 0;

    mappings.content.forEach((mapping) => {
        console.log(
            `\t - [${color(i++)}] ${mapping.dataPointId}-->${mapping.propertyName} ${mapping.propertySetName} (${
                mapping.entityId
            }) `
        );
    });

    verboseLog(JSON.stringify(configuration, null, 2), options.verbose);
    verboseLog(JSON.stringify(mappings, null, 2), options.verbose);
}

async function printFunc(sdk: MindSphereSdk, agentOrConfig: any, color: any, options: any) {
    let configuration = agentOrConfig;
    if (typeof agentOrConfig === "string") {
        configuration = await sdk.GetAgentManagementClient().GetDataSourceConfiguration(agentOrConfig);
    }

    switch (options.language) {
        case "js":
            await printFuncJs(configuration, color, options);
            break;
        case "python":
            await printFuncPython(configuration, color, options);
            break;
        case "json":
            await printFuncJson(configuration, color, options);
            break;

        default:
            throwError(`invalid language ${options.language}`);
    }
}

async function printFuncJson(configuration: DataSourceConfiguration, color: any, options: any) {
    const result: {
        mappings: any[];
    } = {
        mappings: [],
    };

    configuration.dataSources.forEach((element: any) => {
        if (!element.customData) {
            throw Error("cant create function there is no custom data avaiable, the config was not done via CLI");
        }

        element.dataPoints.forEach((dataPoint: any) => {
            if (!dataPoint.customData) {
                throw Error("cant create function there is no custom data avaiable, the config was not done via CLI");
            }
            result.mappings.push({
                aspect: `${element.customData!.aspect}`,
                variable: `${dataPoint.customData!.variable}`,
                dataPointId: `${dataPoint.id}`,
            });
        });
    });

    fs.writeFileSync(`${options.typeid}.fulltable.mdsp.json`, JSON.stringify(result, null, 2));
    console.log(`The file ${color(`${options.typeid}.fulltable.mdsp.json`)} with full JSON mapping table was created.`);
    verboseLog(result, options.verbose);
}

async function printFuncJs(configuration: DataSourceConfiguration, color: any, options: any) {
    let result = "";
    result += "\nfunction convertToDataPoint (rawVariable, aspect) {";

    result += "\n  let variable = rawVariable;";
    result += "\n  variable = variable.replace(' ', '_');";
    result += "\n  variable = variable.replace('-', '_');";
    result += "\n  variable = variable.replace(/[\\W_]/g, '_');";
    result += "\n  variable = variable.trim();";
    result += "\n  variable = variable.replace(/^[_]/, '');";

    configuration.dataSources.forEach((element: any) => {
        if (!element.customData) {
            throw Error("cant create function there is no custom data avaiable, the config was not done via CLI");
        }
        result += `\n   if (aspect === '${element.customData!.aspect}') { `;
        element.dataPoints.forEach((dataPoint: any) => {
            if (!dataPoint.customData) {
                throw Error("cant create function there is no custom data avaiable, the config was not done via CLI");
            }
            if (dataPoint.id !== `DP-${dataPoint.customData!.variable}`) {
                result += `\n    if (variable === '${dataPoint.customData!.variable}') return '${dataPoint.id}';`;
            }
        });
        result += `\n    return \`DP-\${variable}\`;`;
        result += `\n  }`;
    });

    result += "\n}";

    fs.writeFileSync(`${options.typeid}.map.mdsp.js`, result);
    console.log(`The file ${color(`${options.typeid}.map.mdsp.js`)} with mapping function was created.`);
    verboseLog(result, options.verbose);
}

async function printFuncPython(configuration: DataSourceConfiguration, color: any, options: any) {
    let result = "import re\n";
    result += "\ndef convertToDataPoint (rawVariable, aspect):";
    result += "\n\tvariable = rawVariable";
    result += "\n\tvariable = variable.replace(' ', '_')";
    result += "\n\tvariable = variable.replace('-', '_')";
    result += "\n\tvariable = re.sub(r'[\\W_]', '_', variable)";
    result += "\n\tvariable = variable.strip()";
    result += "\n\tvariable = re.sub(r'^[_]', '', variable)";

    configuration.dataSources.forEach((element: any) => {
        if (!element.customData) {
            throw Error("cant create function there is no custom data avaiable, the config was not done via CLI");
        }
        result += `\n\tif aspect == '${element.customData!.aspect}': `;
        element.dataPoints.forEach((dataPoint: any) => {
            if (!dataPoint.customData) {
                throw Error("cant create function there is no custom data avaiable, the config was not done via CLI");
            }
            if (dataPoint.id !== `DP-${dataPoint.customData!.variable}`) {
                result += `\n\t\tif variable == '${dataPoint.customData!.variable}': return '${dataPoint.id}'`;
            }
        });
        result += `\n\t\treturn "DP-" + variable`;
        result += `\n`;
    });

    result += "\n";

    fs.writeFileSync(`${options.typeid}.map.mdsp.py`, result);
    console.log(`The file ${color(`${options.typeid}.map.mdsp.py`)} with mapping function was created.`);
    verboseLog(result, options.verbose);
}

async function config(sdk: MindSphereSdk, agentid: any, color: any, options: any) {
    let assettypeid = options.typeid;

    if (options.assetid) {
        const asset = sdk.GetAssetManagementClient().GetAsset(options.assetid);
        assettypeid = (await asset).typeId!;
    }

    const assetType = await sdk.GetAssetManagementClient().GetAssetType(assettypeid, { exploded: true });

    const mcapi = sdk.GetMindConnectApiClient();
    const dataSourceConfiguration = mcapi.GenerateDataSourceConfiguration(assetType);
    const oldConfig = sdk.GetAgentManagementClient().GetDataSourceConfiguration(agentid);
    const etag = (await oldConfig).eTag || "0";
    await sdk
        .GetAgentManagementClient()
        .PutDataSourceConfiguration(agentid, dataSourceConfiguration, { ifMatch: etag });

    options.assetid && (await map(sdk, agentid, color, options));
}

function checkParameters(options: any) {
    ["map", "config", "print", "delete", "test", "func", "template"].indexOf(options.mode) < 0 &&
        throwError("The mode must be map | configure | print | delete | test | func | template");

    options.passkey &&
        options.mode === "test" &&
        throwError("test only works with agent configuration not with passkey");
    options.passkey && !options.agentid && throwError("you have to specify agentid when using passkey mode");
    options.mode === "config" &&
        !((options.assetid && !options.typeid) || (!options.assetid && options.typeid)) &&
        throwError("you have to specify either assetid or typeid for config mode but not both");

    options.mode === "test" &&
        !(options.timespan && options.count) &&
        throwError("you have to specify the timespan and the count");

    options.mode === "template" &&
        !options.typeid &&
        throwError("you have to specify the typeid to generate mapping templates");

    (options.mode === "template" || options.mode === "func") &&
        ["js", "json", "python"].indexOf(options.language) < 0 &&
        throwError("the language has to be either js, json or python");
    ["map"].indexOf(options.mode) >= 0 &&
        !options.assetid &&
        throwError(`you have to specify assetid for ${options.mode}`);
}

async function inject(agent: MindConnectAgent, color: any, options: any) {
    const configuration = await agent.GetDataSourceConfiguration();

    const bulkData: TimeStampedDataPoint[] = [];
    const span = parseInt(options.timespan);
    const count = parseInt(options.count);

    let dataPointsCount = 0;
    let startTime = new Date().getTime() - span * count;
    for (let index = 0; index < options.count; index++) {
        const data: DataPointValue[] = [];
        const timeStamp = new Date(startTime);
        configuration.dataSources.forEach((datasource) => {
            datasource.dataPoints.forEach((dp) => {
                data.push({
                    dataPointId: dp.id,
                    qualityCode: "0",
                    value: generateValue(dp.type.toString(), timeStamp),
                });
                dataPointsCount++;
            });
        });

        bulkData.push({ timestamp: timeStamp.toISOString(), values: data });
        startTime += parseInt(options.timespan);
    }

    verboseLog(JSON.stringify(bulkData, null, 2), options.verbose);

    await retry(options.retry, () => agent.BulkPostData(bulkData));
    console.log(
        `Injected a bulk message with ${color(count)} timestamps and total number of ${color(
            dataPointsCount
        )} datapoints.`
    );
}

function generateValue(type: string, timeStamp: Date) {
    let result: number | string | boolean = 100 * Math.sin(timeStamp.getTime());

    if (type === "INT" || type === "LONG") {
        result = Math.floor(result);
    } else if (type === "TIMESTAMP") {
        result = new Date().toISOString();
    } else if (type === "BOOLEAN") {
        result = Math.floor(result) % 2 === 0;
    } else if (type === "STRING" || type === "BIG_STRING") {
        result = `${type}_${result}`;
    }

    return result.toString();
}
