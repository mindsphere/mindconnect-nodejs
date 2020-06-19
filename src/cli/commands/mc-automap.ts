import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import { MindConnectAgent } from "../../api/mindconnect-agent";
import { MindSphereSdk } from "../../api/sdk";
import { decrypt, getAgentDir, loadAuth, throwError } from "../../api/utils";
import { agentConfigLog, errorLog, getColor, homeDirLog, proxyLog, verboseLog } from "./command-utils";
import ora = require("ora");

const cyan = getColor("cyan");
const magenta = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("configure-agent")
        .alias("co")
        .option("-c, --config <agentconfig>", "config file with agent configuration", "agentconfig.json")
        .option("-m, --mode [config | map | print | delete]", "command mode", "config")
        .option("-a, --agentid <agentid>", "agentid")
        .option("-i, --assetid <assetid>", "target assetid for mapping")
        .option("-t, --typeid <typeid>", "asset type for configuration")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(`${cyan("create data source configuration and mappings")} ${magenta("(optional: passkey) *")}`)
        .action((options) => {
            (async () => {
                try {
                    const color = options.passkey ? magenta : cyan;
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    checkParameters(options);

                    const auth = loadAuth();
                    let agentid = options.agentid;

                    const sdk = options.passkey
                        ? new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, options.passkey) })
                        : (() => {
                              const configFile = path.resolve(options.config);
                              verboseLog(`agent configuration in: ${color(configFile)}.`, options.verbose);
                              !fs.existsSync(configFile) && throwError(`Can't find file ${configFile}`);

                              const agentFolder = getAgentDir(path.dirname(options.config));
                              verboseLog(`Using .mc folder for agent: ${color(agentFolder)}`, options.verbose);

                              const configuration = require(configFile);
                              const agent = new MindConnectAgent(configuration, undefined, agentFolder);
                              agentid = agent.ClientId();

                              return new MindSphereSdk(agent);
                          })();

                    options.mode === "print" && (await print(sdk, agentid, color, options));
                    options.mode === "config" && (await config(sdk, agentid, color, options));
                    options.mode === "delete" && (await deleteMappings(sdk, agentid, color, options));
                    options.mode === "map" && (await map(sdk, agentid, color, options));

                    await print(sdk, agentid, color, options);

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
                `    mc configure-agent --config agent.json --assetid 1234567...89 \tconfigures agent automatically to send the data to specified assetid`
            );
            log(
                `    mc configure-agent --config agent.json --mode print \t\tprints data source configuration and mappings`
            );
        });
};

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
    ["map", "config", "print", "delete"].indexOf(options.mode) < 0 &&
        throwError("The mode must be map | configure | print | delete");

    options.passkey && !options.agentid && throwError("you have to specify agentid when using passkey mode");
    options.mode === "config" &&
        !((options.assetid && !options.typeid) || (!options.assetid && options.typeid)) &&
        throwError("you have to specify either assetid or typeid for config mode but not both");

    ["map"].indexOf(options.mode) >= 0 &&
        !options.assetid &&
        throwError(`you have to specify assetid for ${options.mode}`);
}
