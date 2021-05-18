import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src";
import { decrypt, loadAuth, throwError } from "../src/api/utils";
import { setupDeviceTestStructure, tearDownDeviceTestStructure } from "./test-device-setup-utils";
import { getPasskeyForUnitTest} from "./test-utils";
chai.should();

const timeOffset = new Date().getTime();
describe("[SDK] DeviceManagementClient.Devices", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const deviceManagementClient = sdk.GetDeviceManagementClient();
    const assetMgmt = sdk.GetAssetManagementClient();
    const tenant = sdk.GetTenant();

    const testDevice = {
        deviceTypeId: `${tenant}.UnitTestDeviceType`,
        assetId: `myAssetId`,
        serialNumber: `UnitTestserialNumber_A`,
        agents: [],
        properties: {
            key1: "value1",
            key2: "value2"
        }
    };

    let deviceTypeId = "aee2e37f-f562-4ed6-b90a-c43208dc054a";
    let assetTypeId = `${tenant}.UnitTestDeviceAssetType`;
    let assetId = "";
    let deviceId = "";
    let gFolderid = "";

    before(async () => {
        // tear Down test infrastructure
        await tearDownDeviceTestStructure(sdk);

        // Setup the testing architecture
        const {device, deviceAsset, deviceType, deviceAssetType, folderid } = await setupDeviceTestStructure(sdk);
        assetTypeId = `${(deviceAssetType as any).id}`;
        deviceTypeId = `${(deviceType as any).id}`;
        assetId = `${(deviceAsset as any).assetId}`;
        deviceId = `${(device as any).id}`;
        gFolderid = `${folderid}`;
        testDevice.deviceTypeId = `${deviceTypeId}`;
        testDevice.assetId = `${assetId}`;
    });

    after(async () => {
        // tear Down test infrastructure
        await tearDownDeviceTestStructure(sdk);
    });

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it("standard properties shoud be defined", async () => {
        deviceManagementClient.should.not.be.undefined;
        deviceManagementClient.GetGateway().should.be.equal(auth.gateway);
        (await deviceManagementClient.GetToken()).length.should.be.greaterThan(200);
        (await deviceManagementClient.GetToken()).length.should.be.greaterThan(200);
    });

    it("should GET devices @sanity", async () => {
        deviceManagementClient.should.not.be.undefined;
        const devices = await deviceManagementClient.GetDevices({
            assetId: `${assetId}`
        });
        devices.should.not.be.undefined;
        devices.should.not.be.null;
        (devices as any).page.number.should.equal(0);
        (devices as any).page.size.should.equal(10);
        (devices as any).content.length.should.be.gte(1);
    });

    it("should GET devices with size", async () => {
        deviceManagementClient.should.not.be.undefined;
        const devices = await deviceManagementClient.GetDevices({
            assetId: `${assetId}`,
            page: 0,
            size: 5,
        });

        devices.should.not.be.undefined;
        devices.should.not.be.null;
        devices.content || throwError("there have to be some devicetypes with that sort parameter!");
        (devices as any).content.length.should.be.greaterThan(0);
    });

    it("should GET specific device", async () => {
        deviceManagementClient.should.not.be.undefined;
        const device = await deviceManagementClient.GetDevice(deviceId);

        device.should.not.be.null;
    });

    it("should POST specific device @sanity", async () => {
        deviceManagementClient.should.not.be.undefined;
        // Add a new asset
        const _asset = await assetMgmt.PostAsset({
            name: `${tenant}.UnitTestDeviceAsset.${timeOffset}`,
            typeId: `${assetTypeId}`,
            parentId: gFolderid,
        });

        // Add new device
        testDevice.deviceTypeId = `${deviceTypeId}`;
        testDevice.assetId = `${_asset.assetId}`;
        testDevice.serialNumber = `UnitTestserialNumber_B`;
        const device = await deviceManagementClient.PostDevice(testDevice);

        device.should.not.be.null;
        (device.serialNumber as any).should.be.string(`UnitTestserialNumber_B`);

        await deviceManagementClient.DeleteDevice(`${device.id}`);
        // Delete the newly created asset
        await assetMgmt.DeleteAsset(
            `${_asset.assetId}`,
            {ifMatch: `${_asset.etag}`}
        );
    });

    it("should PATCH specific device ", async () => {
        deviceManagementClient.should.not.be.undefined;
        const _device = await deviceManagementClient.GetDevice(deviceId);

        _device.serialNumber = `UnitTestserialNumber_D`;
        const patchedDevice = await deviceManagementClient.PatchDevice(`${_device.id}`, _device);
        patchedDevice.should.not.be.null;
        (patchedDevice.serialNumber as any).should.be.string(`UnitTestserialNumber_D`);

        await deviceManagementClient.DeleteDevice(`${_device.id}`);
    });

    it("should DELETE specific device ", async () => {
        deviceManagementClient.should.not.be.undefined;
        // Add a new asset
        const _asset = await assetMgmt.PostAsset({
            name: `${tenant}.UnitTestDeviceAsset.${timeOffset}`,
            typeId: `${assetTypeId}`,
            parentId: gFolderid,
        });

        // Add new device
        testDevice.deviceTypeId = `${deviceTypeId}`;
        testDevice.assetId = `${_asset.assetId}`;
        testDevice.serialNumber = `UnitTestserialNumber_B`;
        const device = await deviceManagementClient.PostDevice(testDevice);

        device.should.not.be.null;
        await deviceManagementClient.DeleteDevice(`${device.id}`);

        // Delete the newly created asset
        await assetMgmt.DeleteAsset(
            `${_asset.assetId}`,
            {ifMatch: `${_asset.etag}`}
        );
    });
});
