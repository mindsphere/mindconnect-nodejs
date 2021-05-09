import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src";
import { decrypt, loadAuth, throwError } from "../src/api/utils";
import { setupDeviceTestStructure, tearDownDeviceTestStructure } from "./test-device-setup-utils";
import { getPasskeyForUnitTest} from "./test-utils";
chai.should();


describe("[SDK] DeviceManagementClient.DeviceTypes", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const deviceManagementClient = sdk.GetDeviceManagementClient();
    const tenant = sdk.GetTenant();

    const testDeviceType = {
        name: `${tenant}.UnitTestDeviceType`,
        code: `${tenant}.V001`,
        assetTypeId: `${tenant}.UnitTestDeviceAssetType`,
        description: " example device type",
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
        // Setup the testing architecture
        const {device, deviceAsset, deviceType, deviceAssetType, folderid } = await setupDeviceTestStructure(sdk);
        assetTypeId = `${(deviceAssetType as any).id}`;
        deviceTypeId = `${(deviceType as any).id}`;
        assetId = `${(deviceAsset as any).id}`;
        deviceId = `${(device as any).id}`;
        gFolderid = `${folderid}`;
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

    it("should GET device types @sanity", async () => {
        deviceManagementClient.should.not.be.undefined;
        const deviceTypes = await deviceManagementClient.GetDeviceTypes({
            assetTypeId: `${tenant}.UnitTestDeviceAssetType`,
            owner: `${tenant}`,
        });
        deviceTypes.should.not.be.undefined;
        deviceTypes.should.not.be.null;
        (deviceTypes as any).page.number.should.equal(0);
        (deviceTypes as any).page.size.should.equal(10);
        (deviceTypes as any).content.length.should.be.gte(1);
    });

    it("should GET device types with sorting", async () => {
        deviceManagementClient.should.not.be.undefined;
        const deviceTypes = await deviceManagementClient.GetDeviceTypes({
            assetTypeId: `${tenant}.UnitTestDeviceAssetType`,
            owner: `${tenant}`,
            sort: "DESC",
            page: 0,
            size: 0,
        });
        deviceTypes.should.not.be.undefined;
        deviceTypes.should.not.be.null;
        deviceTypes.content || throwError("there have to be some devicetypes with that sort parameter!");
        (deviceTypes as any).content.length.should.be.greaterThan(0);
    });

    it("should GET specific device type ", async () => {
        deviceManagementClient.should.not.be.undefined;
        const deviceType = await deviceManagementClient.GetDeviceType(deviceTypeId);

        deviceType.should.not.be.null;
    });

    it("should PATCH specific device type ", async () => {
        deviceManagementClient.should.not.be.undefined;
        testDeviceType.name = `${tenant}.UnitTestDeviceType_B`;
        const patchedDeviceType = await deviceManagementClient.PatchDeviceType(deviceTypeId, testDeviceType);
        patchedDeviceType.should.not.be.null;
        patchedDeviceType.name.should.be.string(`${tenant}.UnitTestDeviceType_B`);
    });
});