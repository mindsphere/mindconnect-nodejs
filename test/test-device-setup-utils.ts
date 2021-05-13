import { AgentManagementModels, AssetManagementModels, DeviceManagementModels, MindSphereSdk } from "../src";
import { sleep } from "./test-utils";

const timeOffset = new Date().getTime();

export async function setupDeviceTestStructure(sdk: MindSphereSdk) {
    const assetMgmt = sdk.GetAssetManagementClient();
    const deviceManagementClient = sdk.GetDeviceManagementClient();
    const agentMgmt = sdk.GetAgentManagementClient();

    const tenant = sdk.GetTenant();
    const rootAssetId = `${(await assetMgmt.GetRootAsset()).assetId}`;
    const folders = unroll<AssetManagementModels.AssetResource>(
        await assetMgmt.GetAssets({
            filter: JSON.stringify({
                name: {
                    eq: "UnitTestFolder",
                },
            }),
        })
    );
    await sleep(2000);
    if (folders.length === 0) {
        const folder = await assetMgmt.PostAsset({
            name: "UnitTestFolder",
            typeId: "core.basicarea",
            parentId: rootAssetId,
        });
        await sleep(1000);
        folders.push(folder);
    }
    const folder = folders[0];
    const folderid = `${folder.assetId}`;

    // Check if we have the asset types setup
    const assetTypes = unroll<AssetManagementModels.AssetTypeResource>(
        await assetMgmt.GetAssetTypes({
            filter: JSON.stringify({
                name: {
                    startsWith: `${tenant}.UnitTestDeviceAssetType`
                }
            }),
        })
    );
    await sleep(2000);
    if (assetTypes.length === 0) {
        const _assetType = await assetMgmt.PutAssetType(
            `${tenant}.UnitTestDeviceAssetType`,
            {
                name: `${tenant}.UnitTestDeviceAssetType.${timeOffset}`,
                description: `${tenant}.UnitTestDeviceAssetType.${timeOffset}`,
                parentTypeId: "core.basicagent",
                instantiable: true,
                scope: AssetManagementModels.AssetTypeBase.ScopeEnum.Private,
                aspects: [
                    {
                        name: "firmwarestatus",
                        aspectTypeId: "core.firmwarestatus"
                    },
                ],
                variables: [
                    {
                        name: "temperature",
                        dataType: AssetManagementModels.VariableDefinition.DataTypeEnum.STRING,
                        unit: "C/F",
                        searchable: true,
                        length: 5,
                        defaultValue: "25/77",
                    },
                ],
                fileAssignments: [],
            },
            {ifNoneMatch: "*"}
        );
        await sleep(1000);
        assetTypes.push(_assetType);
    }
    const deviceAssetType = assetTypes.pop();

    // Check if we have the device types setup
    const deviceTypes =  unroll<DeviceManagementModels.DeviceType>(
        await deviceManagementClient.GetDeviceTypes({
            assetTypeId: (deviceAssetType as any).id,
            owner: `${tenant}`,
            sort: "DESC",
            page: 0,
            size: 10,
        })
    );
    await sleep(2000);
    if (deviceTypes.length === 0) {
        const _deviceType = await deviceManagementClient.PostDeviceType(
            {
                name: `${tenant}.UnitTestDeviceType`,
                code: `${tenant}.V001`,
                assetTypeId: `${tenant}.UnitTestDeviceAssetType`,
                description: " example device type",
                properties: {
                    key1: "value1",
                    key2: "value2"
                }
            }
        );
        await sleep(1000);
        deviceTypes.push(_deviceType);
    }
    const deviceType = deviceTypes.pop();

    // Check if we have the asset setup
    const assets = unroll(
        await assetMgmt.GetAssets({
            filter: JSON.stringify({
                and: {
                    name: {
                        startsWith: `${tenant}.UnitTestDeviceAsset`,
                    },
                    parentId: {
                        eq: folderid,
                    },
                },
            }),
        })
    );
    await sleep(2000);
    if (assets.length === 0) {
        const _asset = await assetMgmt.PostAsset({
            name: `${tenant}.UnitTestDeviceAsset.${timeOffset}`,
            typeId: `${(deviceAssetType as any).id}`,
            parentId: folderid,
        });
        await sleep(1000);
        assets.push(_asset);
    }
    const deviceAsset = assets.pop();

    // Register an agent for this asset
    const agent = await agentMgmt.PostAgent({
        name: `${tenant}.UnitTestDeviceAgent.${timeOffset}`,
        securityProfile: AgentManagementModels.AgentUpdate.SecurityProfileEnum.SHAREDSECRET,
        entityId: `${deviceAsset.assetId}`,
    });
    await sleep(2000);
    const deviceAgentId = `${agent.id}`;

    // Check if we have the asset setup
    const devices = unroll(
        await deviceManagementClient.GetDevices({
            assetId: `${(deviceAsset as any).assetId}`,
            page: 0,
            size: 0
        })
    );
    await sleep(2000);
    if (devices.length === 0) {
        const _device = await deviceManagementClient.PostDevice({
            deviceTypeId: `${(deviceType as any).id}`,
            assetId: `${(deviceAsset as any).assetId}`,
            agents: [`${deviceAgentId}`],
            properties: {
                name: `${tenant}.UnitTestDevice.${timeOffset}`,
                parentId: folderid,
            }
        });
        await sleep(1000);
        devices.push(_device);
    }
    await sleep(2000);
    const device = devices.pop();
    return { device: device, deviceAsset: deviceAsset, deviceType: deviceType, deviceAssetType: deviceAssetType, folderid };
}

function unroll<T>(obj: { _embedded?: any, content?: any }) {
    if (obj.content) return obj.content;
    const embedded = obj._embedded;
    if (!embedded) return [];
    const keys = Object.keys(embedded);
    if (keys.length === 0) return [];
    if (keys.length === 1) return embedded[keys[0]] as T[];
    throw new Error("cant unroll object");
}

export async function tearDownDeviceTestStructure(sdk: MindSphereSdk) {
    await sleep(1000);
    const assetMgmt = sdk.GetAssetManagementClient();
    const deviceManagementClient = sdk.GetDeviceManagementClient();
    const agentMgmt = sdk.GetAgentManagementClient();
    const tenant = sdk.GetTenant();

    // delete devices
    const devices: DeviceManagementModels.PaginatedDevice = (await deviceManagementClient.GetDevices({
            page: 0,
            size: 100
        }));
    await sleep(2000);
    for await (const x of devices.content || []) {
        if ((x as any)?.properties?.name?.startsWith( `${tenant}.UnitTestDevice`)) {
            await deviceManagementClient.DeleteDevice(x.id!);
        }
        await sleep(1000);
    }

    // delete agents
    const agents: AgentManagementModels.PagedAgent = (await agentMgmt.GetAgents({
        sort: "DESC",
        page: 0,
        size: 100
    }));
    await sleep(2000);
    for await (const x of agents.content || []) {
        if ((x as any)?.name?.startsWith( `${tenant}.UnitTestDeviceAgent`)) {
            await agentMgmt.DeleteAgent(x.id!, { ifMatch: `${x.eTag}` });
        }
        await sleep(1000);
    }
    // delete assets
    const assets: AssetManagementModels.AssetListResource = (await assetMgmt.GetAssets({
        filter: JSON.stringify({
            name: {
                startsWith: `${tenant}.UnitTestDeviceAsset`,
            }
        }),
        sort: "DESC",
        size: 100
    }));
    await sleep(2000);
    for await (const x of assets?._embedded?.assets || []) {
        await assetMgmt.DeleteAsset(x.assetId!, {ifMatch: `${x.etag}`});
        await sleep(1000);
    }

    // delete asset types
    const assetTypes: AssetManagementModels.AssetTypeListResource = (await assetMgmt.GetAssetTypes({
        filter: JSON.stringify({
            name: {
                startsWith: `${tenant}.UnitTestDeviceAssetType`,
            },
        }),
        sort: "DESC",
        size: 100
    }));
    await sleep(2000);
    for await (const x of assetTypes?._embedded?.assetTypes || []) {
        await assetMgmt.DeleteAssetType(x.id!, { ifMatch: `${x.etag}` });
        await sleep(1000);
    }
}

