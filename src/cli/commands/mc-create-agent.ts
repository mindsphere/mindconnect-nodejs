import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { sleep } from "../../../test/test-utils";
import { AgentManagementModels, AssetManagementModels, MindSphereSdk } from "../../api/sdk";
import {
    decrypt,
    errorLog,
    homeDirLog,
    loadAuth,
    proxyLog,
    retry,
    retrylog,
    throwError,
    verboseLog
} from "../../api/utils";
import { agentConfigLog, getColor, serviceCredentialLog } from "./command-utils";

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("create-agent")
        .alias("ca")
        .option("-c, --config <agentconfig>", "config file for agent configuration")
        .option(
            "-r, --cert [privatekey]",
            "required for agents with RSA_3072 profile. create with: openssl genrsa -out private.key 3072"
        )
        .option("-n, --name <name>", "agent name", `Agent${Date.now()}`)
        .option("-p, --parentid <name>", "parent asset id")
        .option("-f, --profile <profile>", "security profile [SHARED_SECRET|RSA_3072]", "SHARED_SECRET")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", 3)
        .option("-v, --verbose", "verbose output")
        .description(color("create an agent in the mindsphere *"))
        .action(options => {
            (async () => {
                try {
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);
                    checkRequiredParamaters(options);

                    const auth = loadAuth();
                    const sdk = new MindSphereSdk({
                        tenant: auth.tenant,
                        gateway: auth.gateway,
                        basicAuth: decrypt(auth, options.passkey)
                    });

                    const am = sdk.GetAssetManagementClient();
                    const ag = sdk.GetAgentManagementClient();
                    const parent = options.parentid ? await am.GetAsset(options.parentid) : await am.GetRootAsset();
                    const asset: AssetManagementModels.Asset = {
                        name: options.name,
                        parentId: parent.assetId,
                        description: "Agent created via mindconnect CLI",
                        typeId: "core.mclib"
                    };

                    verboseLog("creating asset:", options.verbose);
                    const createdAsset = (await retry(
                        options.retry,
                        () => am.PostAsset(asset),
                        500,
                        retrylog("PostAsset", color)
                    )) as AssetManagementModels.AssetResourceWithHierarchyPath;

                    verboseLog("creating agent:", options.verbose);
                    const createdAgent = (await retry(
                        options.retry,
                        () =>
                            ag.PostAgent({
                                name: createdAsset.name,
                                entityId: `${createdAsset.assetId}`,
                                securityProfile: options.profile
                            }),
                        500,
                        retrylog("PostAgent", color)
                    )) as AgentManagementModels.Agent;

                    for (let index = 0; index < options.retry; index++) {
                        const bc = await ag.GetBoardingConfiguration(`${createdAgent.id}`);
                        if (!bc.content) {
                            await sleep((index + 1) * 1000);
                            continue;
                        }

                        verboseLog(JSON.stringify(bc, null, 2), options.verbose);
                        fs.writeFileSync(options.config, JSON.stringify(bc));
                        break;
                    }

                    if (
                        createdAgent.securityProfile === AgentManagementModels.AgentUpdate.SecurityProfileEnum.RSA3072
                    ) {
                        console.log("\nConfigure your certificate by running\n");
                        console.log("\t" + color(`openssl genrsa -out ${options.config}.key 3072`));
                    }
                    agentConfigLog({
                        gateway: sdk.GetGateway(),
                        host: "gateway",
                        tenant: sdk.GetTenant(),
                        agentid: `${createdAgent.id}`,
                        color
                    });
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc create-agent --config agent.json --passkey passkey... \t create agent with default parameters`);
            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    !options.passkey &&
        errorLog(
            "you have to provide a passkey to get the service token (run mc ca --help for full description)",
            true
        );

    !options.config && errorLog("you have to provide a filename for the agent configuration", true);

    options.profile !== "SHARED_SECRET" &&
        options.profile !== "RSA_3072" &&
        errorLog("invalid security profile (SHARED_SECRET, RSA_3072 only)", true);

    fs.existsSync(options.config) && throwError(`the config file ${color(options.config)} already exists.`);
}
