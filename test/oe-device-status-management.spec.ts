import * as chai from "chai";
import "url-search-params-polyfill";
import { DeviceStatusModels, MindSphereSdk } from "../src";
import { decrypt, loadAuth} from "../src/api/utils";
import { getPasskeyForUnitTest} from "./test-utils";
import { setupDeviceTestStructure, tearDownDeviceTestStructure } from "./test-device-setup-utils";
chai.should();

describe("[SDK] DeviceManagementClient.Status", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest())
    });
    const deviceStatusManagement = sdk.GetDeviceStatusManagementClient();
    const tenant = sdk.GetTenant();

    let deviceTypeId = "aee2e37f-f562-4ed6-b90a-c43208dc054a";
    let assetTypeId = `${tenant}.UnitTestDeviceAssetType`;
    let assetId = "";
    let deviceId = "";
    let gFolderid = "";

    const reportTemplate = {
        overall: {
            lastUpdate: new Date(),
            health: DeviceStatusModels.HealthStatus.OK,
            message: "Reporting overall health status."
        }
    };

    const heathStatusConfigTemplate = {
        lastUpdate: new Date(),
        configurationId: "5re520...",
        dataSources: []
    };

    before(async () => {
        // Setup the testing architecture
        const { device, deviceAsset, deviceType, deviceAssetType, folderid } = await setupDeviceTestStructure(sdk);
        assetTypeId = `${(deviceAssetType as any).id}`;
        deviceTypeId = `${(deviceType as any).id}`;
        assetId = `${(deviceAsset as any).assetId}`;
        deviceId = `${(device as any).id}`;
        gFolderid = `${folderid}`;

        // report device health status
        // await deviceStatusManagement.PatchDeviceHealth(deviceId, reportTemplate);

        // Sends a device heartbeat
        // await deviceStatusManagement.PostDeviceHeartbeat(`${deviceId}`);
    });

    after(async () => {
        // tear Down test infrastructure
        await tearDownDeviceTestStructure(sdk);
    });

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it("standard properties should be defined", async () => {
        deviceStatusManagement.should.not.be.undefined;
        deviceStatusManagement.GetGateway().should.be.equal(auth.gateway);
        (await deviceStatusManagement.GetToken()).length.should.be.greaterThan(200);
        (await deviceStatusManagement.GetToken()).length.should.be.greaterThan(200);
    });

    /*it("should PATCH data configuration health status", async () => {
        deviceStatusManagement.should.not.be.undefined;

        const now = new Date();
        heathStatusConfigTemplate.lastUpdate = now;
        const config = await deviceStatusManagement.PatchDeviceHealthDataConfig(deviceId, heathStatusConfigTemplate);
        config.should.not.be.undefined;
        config.should.not.be.null;
        (config as any).lastUpdate.should.be.eq(now);
    });

    it("should GET data configuration health status", async () => {
        deviceStatusManagement.should.not.be.undefined;
        const now = new Date();

        const config = await deviceStatusManagement.GetDeviceHealthDataConfig(deviceId);
        config.should.not.be.undefined;
        config.should.not.be.null;
        (config as any).lastUpdate.should.be.eq(now);
    });

    it("should PATCH device health status", async () => {
        deviceStatusManagement.should.not.be.undefined;

        reportTemplate.overall.health = DeviceStatusModels.HealthStatus.WARNING;
        reportTemplate.overall.lastUpdate = new Date();
        const status = await deviceStatusManagement.PatchDeviceHealth(deviceId, reportTemplate);
        status.should.not.be.undefined;
        status.should.not.be.null;
        (status as any).overall.health.should.not.be.eq(DeviceStatusModels.HealthStatus.WARNING);
    });

    it("should GET device device health status", async () => {
        deviceStatusManagement.should.not.be.undefined;
        const status = await deviceStatusManagement.GetDeviceHealth(`${deviceId}`);
        status.should.not.be.undefined;
        status.should.not.be.null;
        (status as any).heartbeat.should.not.be.undefined;
        (status as any).heartbeat.should.not.be.null;
    });

    it("should POST device health beat", async () => {
        deviceStatusManagement.should.not.be.undefined;
        const resp = await deviceStatusManagement.PostDeviceHeartbeat(`${deviceId}`);
        resp.should.not.be.undefined;
        resp.should.not.be.null;
        (resp as any).response.status.should.be.gte(200).and.be.lte(300);
    });

    it("should GET device connection status", async () => {
        deviceStatusManagement.should.not.be.undefined;
        const status = await deviceStatusManagement.GetDeviceConnectionStatus(`${deviceId}`);
        status.should.not.be.undefined;
        status.should.not.be.null;
        (status as any).heartbeat.should.not.be.undefined;
        (status as any).heartbeat.should.not.be.null;
    });*/

    it("should GET list software installed on device", async () => {
        deviceStatusManagement.should.not.be.undefined;

        const softwareList = await deviceStatusManagement.GetDeviceSoftwares(`${deviceId}`);
        softwareList.should.not.be.undefined;
        softwareList.should.not.be.null;
        (softwareList as any).content.length.should.be.gte(0);
    });

    /*it("should GET list device inventory", async () => {
        deviceStatusManagement.should.not.be.undefined;
        const inventory = await deviceStatusManagement.GetDeviceInventory(`${deviceId}`);
        inventory.should.not.be.undefined;
        inventory.should.not.be.null;
        console.log(inventory);
    });

    it("should PATCH device inventory", async () => {
        deviceStatusManagement.should.not.be.undefined;

        const now = new Date();
        const inventoryEntry = {
            softwareId: "a7d6da...",
            version: "1.3",
            type: DeviceStatusModels.SoftwareType.FIRMWARE,
            description: "MyDevice Firmware 1.3 debug build",
            installedAt: now
        };
        const inventory = await deviceStatusManagement.PatchDeviceSoftwareInventory(deviceId, [inventoryEntry]);
        inventory.should.not.be.undefined;
        inventory.should.not.be.null;
        (inventory as any).installedAt.should.be.eq(now);
    });

    it("should PATCH device firmware inventory", async () => {
        deviceStatusManagement.should.not.be.undefined;

        const now = new Date();
        const firmwareEntry = {
            softwareId: "7e7ee7e...",
            version: "2.0",
            type: DeviceStatusModels.SoftwareTypeFirmware.FIRMWARE,
            description: "MyDevice Firmware 2.0 debug build",
            installedAt: now
        };
        const inventory = await deviceStatusManagement.PatchDeviceFirmwareInventory(deviceId, [firmwareEntry]);
        inventory.should.not.be.undefined;
        inventory.should.not.be.null;
        (inventory as any).installedAt.should.be.eq(now);
        (inventory as any).version.should.be.contain("2.0");
    });

    it("should PATCH device app inventory", async () => {
        deviceStatusManagement.should.not.be.undefined;

        const now = new Date();
        const appEntry = {
            softwareId: "4a4a4a44",
            version: "3.0",
            type: DeviceStatusModels.SoftwareTypeApplication.APP,
            description: "MyDevice Firmware 3.0 debug build",
            installedAt: now
        };
        const inventory = await deviceStatusManagement.PatchDeviceApplicationInventory(deviceId, [appEntry]);
        inventory.should.not.be.undefined;
        inventory.should.not.be.null;
        (inventory as any).installedAt.should.be.eq(now);
        (inventory as any).version.should.be.contain("3.0");
    });*/
});
