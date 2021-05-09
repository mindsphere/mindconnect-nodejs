import {AssetManagementModels, DeviceManagementModels, MindSphereSdk } from "../src/api/sdk";
import { sleep } from "./test-utils";

const timeOffset = new Date().getTime();

export async function setupDeviceTestStructure(sdk: MindSphereSdk) {
    const assetMgmt = sdk.GetAssetManagementClient();
    const deviceManagementClient = sdk.GetDeviceManagementClient();

    const tenant = sdk.GetTenant();
    const rootassetid = `${(await assetMgmt.GetRootAsset()).assetId}`;
    const folders = unroll<AssetManagementModels.AssetResource>(
        await assetMgmt.GetAssets({
            filter: JSON.stringify({
                name: {
                    eq: "UnitTestFolder",
                },
            }),
        })
    );
    if (folders.length === 0) {
        const folder = await assetMgmt.PostAsset({
            name: "UnitTestFolder",
            typeId: "core.basicarea",
            parentId: rootassetid,
        });
        folders.push(folder);
    }
    const folder = folders[0];
    const folderid = `${folder.assetId}`;
    
    // Check if we have the asset types setup
    const assetTypes = unroll<AssetManagementModels.AssetTypeResource>(
        await assetMgmt.GetAssetTypes({
            filter: JSON.stringify({ name: { startsWith: `${tenant}.UnitTestDeviceType` } }),
        })
    );
    if (assetTypes.length === 0) {
        const _assetType = await assetMgmt.PutAssetType(`${tenant}.UnitTestDeviceAssetType`, {
            name: `${tenant}.UnitTestDeviceType.${timeOffset}`,
            parentTypeId: "core.BasicAsset",
            instantiable: true,
            scope: AssetManagementModels.AssetTypeBase.ScopeEnum.Private,
            aspects: [
                { name: "firmwarestatus", aspectTypeId: "core.firmwarestatus" },
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
        });
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
    if (assets.length === 0) {
        const _asset = await assetMgmt.PostAsset({
            name: `${tenant}.UnitTestDeviceAsset.${timeOffset}`,
            typeId: `${(deviceAssetType as any).id}`,
            parentId: folderid,
        });
        assets.push(_asset);
    }
    const deviceAsset = assets.pop();

    // Check if we have the asset setup
    const devices = unroll(
        await deviceManagementClient.GetDevices({
            assetId: `${(deviceAsset as any).assetId}`,
            page: 0,
            size:0
        })
    );    
    if (devices.length === 0) {
        const _device = await deviceManagementClient.PostDevice({
            deviceTypeId: `${(deviceType as any).id}`,
            assetId: `${(deviceAsset as any).assetId}`,
            properties:{
                name: `${tenant}.UnitTestDevice.${timeOffset}`,
                parentId: folderid,
            }
        });
        devices.push(_device);
    }
    const device = devices.pop();

    return { device:device, deviceAsset:deviceAsset, deviceType:deviceType, deviceAssetType: deviceAssetType, folderid };
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

export async function tearDownDeviceTestStructure(
    sdk: MindSphereSdk
) {
    await sleep(500);
    const assetMgmt = sdk.GetAssetManagementClient();
    const deviceManagementClient = sdk.GetDeviceManagementClient();
    const tenant = sdk.GetTenant();

    // delete devices
    const devices = (await deviceManagementClient.GetDevices({
            page: 0,
            size:100
        })) as any;
    
    for (const x of devices.content) {
        if(x.properties.name.startsWith( `${tenant}.UnitTestDevice`)){
            await deviceManagementClient.DeleteDevice(x.id);
        }
    }
    // delete assets
    const assets = (await assetMgmt.GetAssets({
        filter: JSON.stringify({
            and: {
                name: {
                    startsWith: `${tenant}.UnitTestDeviceAsset`,
                }
            },
        }),
        })) as any;
    for (const x of assets._embedded.assets) {
        await assetMgmt.DeleteAsset(x.assetId, {ifMatch: `${x.etag}`});
    }    
    
    // delete AssetTypes
    const assetTypes = (await assetMgmt.GetAssetTypes({
        filter: JSON.stringify({
            and: {
                id: {
                    startsWith: `${tenant}`,
                },
                name: {
                    startsWith: `${tenant}.UnitTestDeviceType`,
                },
            },
        }),
        sort: "DESC",
        page: 0,
        size: 0,
    })) as any;
    for (const x of assetTypes._embedded.assetTypes) {
        await assetMgmt.DeleteAssetType(x.id, { ifMatch: x.etag });
    }
}

