import * as fs from "fs";
import { retry } from "../src";
import { AgentManagementModels, AssetManagementModels, MindSphereSdk } from "../src/api/sdk";
import { sleep } from "./test-utils";

export async function unitTestSetup(
    sdk: MindSphereSdk,
    profile: AgentManagementModels.AgentUpdate.SecurityProfileEnum
): Promise<AgentUnitTestConfiguration> {
    const agentMgmt = sdk.GetAgentManagementClient();
    const assetMgmt = sdk.GetAssetManagementClient();

    const { targetAsset, folderid } = await setupStructure(sdk);

    const aspects = await assetMgmt.GetAspects(`${targetAsset.assetId}`);
    targetAsset.aspects = unroll<AssetManagementModels.Aspect>(aspects);

    const agentAsset = await assetMgmt.PostAsset({
        name: `Agent${new Date().getTime()}`,
        parentId: folderid,
        typeId: "core.mclib"
    });

    const agent = await agentMgmt.PostAgent({
        entityId: `${agentAsset.assetId}`,
        name: `${agentAsset.assetId}`,
        securityProfile: profile
    });

    const agentConfig = await agentMgmt.GetBoardingConfiguration(agent.entityId, { retry: 5 });

    return { targetAsset, agentAsset, agent, agentConfig };
}

export async function setupStructure(sdk: MindSphereSdk) {
    const agentMgmt = sdk.GetAgentManagementClient();
    const assetMgmt = sdk.GetAssetManagementClient();
    const tenant = sdk.GetTenant();
    const rootassetid = `${(await assetMgmt.GetRootAsset()).assetId}`;
    const folders = unroll<AssetManagementModels.AssetResource>(
        await assetMgmt.GetAssets({
            filter: JSON.stringify({
                name: {
                    eq: "UnitTestFolder"
                }
            })
        })
    );
    if (folders.length === 0) {
        const folder = await assetMgmt.PostAsset({
            name: "UnitTestFolder",
            typeId: "core.basicarea",
            parentId: rootassetid
        });
        folders.push(folder);
    }
    const folder = folders[0];
    const folderid = `${folder.assetId}`;
    // Check if we have the aspect types setup
    const aspectTypes = unroll<AssetManagementModels.AspectTypeResource>(
        await assetMgmt.GetAspectTypes({
            filter: JSON.stringify({
                id: {
                    in: {
                        value: [`${tenant}.UnitTestEnvironment`, `${tenant}.UnitTestVibration`]
                    }
                }
            })
        })
    );
    if (aspectTypes.length === 0) {
        await assetMgmt.PutAspectType(`${tenant}.UnitTestEnvironment`, {
            name: "UnitTestEnvironment",
            category: AssetManagementModels.AspectType.CategoryEnum.Dynamic,
            scope: AssetManagementModels.AspectType.ScopeEnum.Private,
            variables: [
                {
                    name: "Humidity",
                    dataType: AssetManagementModels.VariableDefinition.DataTypeEnum.INT,
                    qualityCode: true,
                    unit: "%"
                },
                {
                    name: "Pressure",
                    dataType: AssetManagementModels.VariableDefinition.DataTypeEnum.DOUBLE,
                    qualityCode: true,
                    unit: "kPa"
                },
                {
                    name: "Temperature",
                    dataType: AssetManagementModels.VariableDefinition.DataTypeEnum.DOUBLE,
                    qualityCode: true,
                    unit: "°C"
                }
            ]
        });
        await assetMgmt.PutAspectType(`${tenant}.UnitTestVibration`, {
            name: "UnitTestVibration",
            category: AssetManagementModels.AspectType.CategoryEnum.Dynamic,
            scope: AssetManagementModels.AspectType.ScopeEnum.Private,
            variables: [
                {
                    name: "Acceleration",
                    dataType: AssetManagementModels.VariableDefinition.DataTypeEnum.DOUBLE,
                    qualityCode: true,
                    unit: "mm/s^2"
                },
                {
                    name: "Displacement",
                    dataType: AssetManagementModels.VariableDefinition.DataTypeEnum.DOUBLE,
                    qualityCode: true,
                    unit: "mm"
                },
                {
                    name: "Frequency",
                    dataType: AssetManagementModels.VariableDefinition.DataTypeEnum.DOUBLE,
                    qualityCode: true,
                    unit: "Hz"
                },
                {
                    name: "Velocity",
                    dataType: AssetManagementModels.VariableDefinition.DataTypeEnum.DOUBLE,
                    qualityCode: true,
                    unit: "mm/s"
                }
            ]
        });
    }
    const assetType = unroll(
        await assetMgmt.GetAssetTypes({
            filter: JSON.stringify({ name: { eq: `UnitTestEngine` } })
        })
    );
    if (assetType.length === 0) {
        await assetMgmt.PutAssetType(`${tenant}.UnitTestEngine`, {
            name: "UnitTestEngine",
            parentTypeId: "core.BasicAsset",
            aspects: [
                { name: "EnvironmentData", aspectTypeId: `${tenant}.UnitTestEnvironment` },
                { name: "VibrationData", aspectTypeId: `${tenant}.UnitTestVibration` }
            ]
        });
    }
    const asset = unroll(
        await assetMgmt.GetAssets({
            filter: JSON.stringify({
                and: {
                    name: {
                        eq: "UnitTestEngineInstance"
                    },
                    parentId: {
                        eq: folderid
                    }
                }
            })
        })
    );
    if (asset.length === 0) {
        await assetMgmt.PostAsset({
            name: "UnitTestEngineInstance",
            typeId: `${tenant}.UnitTestEngine`,
            parentId: folderid
        });
    }
    const targetAsset = unroll<AssetManagementModels.AssetResource>(
        await assetMgmt.GetAssets({
            filter: JSON.stringify({
                name: {
                    eq: "UnitTestEngineInstance"
                }
            })
        })
    )[0];
    return { targetAsset, folderid };
}

function unroll<T>(obj: { _embedded?: any }) {
    const embedded = obj._embedded;
    if (!embedded) return [];
    const keys = Object.keys(embedded);
    if (keys.length === 0) return [];
    if (keys.length === 1) return embedded[keys[0]] as T[];
    throw new Error("cant unroll object");
}

export async function tearDownAgents(sdk: MindSphereSdk, config: AgentUnitTestConfiguration) {
    const agentMgmt = sdk.GetAgentManagementClient();
    const assetMgmt = sdk.GetAssetManagementClient();

    const status = await agentMgmt.GetOnboardingStatus(`${config.agent.id}`);

    try {
        fs.unlinkSync(`.mc/${config.agent.id}.json`);
    } catch {}

    if (status.status === AgentManagementModels.OnboardingStatus.StatusEnum.ONBOARDED) {
        await retry(5, () => agentMgmt.OffboardAgent(`${config.agent.id}`));
    }
    await sleep(5000);
    const etag = (await assetMgmt.GetAsset(`${config.agentAsset.assetId}`)).etag;
    await retry(5, () => agentMgmt.DeleteAgent(`${config.agent.id}`, { ifMatch: `${config.agent.eTag}` }));
    await retry(5, () => assetMgmt.DeleteAsset(`${config.agentAsset.assetId}`, { ifMatch: `${etag}` }));
}

export interface AgentUnitTestConfiguration {
    targetAsset: AssetManagementModels.AssetResource;
    agentAsset: AssetManagementModels.AssetResourceWithHierarchyPath;
    agent: AgentManagementModels.Agent;
    agentConfig: AgentManagementModels.Configuration;
}
