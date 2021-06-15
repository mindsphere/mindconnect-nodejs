import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src";
import { decrypt, loadAuth, throwError } from "../src/api/utils";
import { setupDeviceTestStructure, tearDownDeviceTestStructure } from "./test-device-setup-utils";
import { getPasskeyForUnitTest} from "./test-utils";
chai.should();

const timeOffset = new Date().getTime();
describe("[SDK] DeviceManagementClient.EdgeAppInstance", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const edgeAppInstanceClient = sdk.GetEdgeAppInstanceManagementClient();
    const assetMgmt = sdk.GetAssetManagementClient();
    const tenant = sdk.GetTenant();

    const testConfigurations = {
        deviceId: `${tenant}.UnitTestDeviceType`,
        appId: "718ca5ad0...",
        appReleaseId: "718ca5ad0...",
        appInstanceId: "718ca5ad0...",
        configuration: {
            sampleKey1: "sampleValue1",
            sampleKey2: "sampleValue2"
        }
    };
    let deviceTypeId = "aee2e37f-f562-4ed6-b90a-c43208dc054a";
    let assetTypeId = `${tenant}.UnitTestDeviceAssetType`;
    let assetId = "";
    let gFolderid = "";

    let deviceId = "";
    const appId = "";
    const appReleaseId = "";
    const appInstanceId = "";

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
        testConfigurations.deviceId = `${(device as any).id}`;
    });

    after(async () => {
        // tear Down test infrastructure
        await tearDownDeviceTestStructure(sdk);
    });

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it("standard properties shoud be defined", async () => {
        edgeAppInstanceClient.should.not.be.undefined;
        edgeAppInstanceClient.GetGateway().should.be.equal(auth.gateway);
        (await edgeAppInstanceClient.GetToken()).length.should.be.greaterThan(200);
        (await edgeAppInstanceClient.GetToken()).length.should.be.greaterThan(200);
    });

    it("should GET all app instance configurations by deviceId @sanity", async () => {
        edgeAppInstanceClient.should.not.be.undefined;
        const configurations = await edgeAppInstanceClient.GetAppInstanceConfigurations(deviceId);
        configurations.should.not.be.undefined;
        configurations.should.not.be.null;
        (configurations as any).page.number.should.equal(0);
        (configurations as any).page.size.should.equal(10);
        (configurations as any).content.length.should.be.gte(0);
    });

    it("should GET all app instance configurations by deviceId (with size param)", async () => {
        edgeAppInstanceClient.should.not.be.undefined;
        const configurations = await edgeAppInstanceClient.GetAppInstanceConfigurations(deviceId, 10, 0, "ASC");
        configurations.should.not.be.undefined;
        configurations.should.not.be.null;
        (configurations as any).page.number.should.equal(0);
        (configurations as any).page.size.should.equal(10);
        (configurations as any).content.length.should.be.gte(0);
    });

    /*
    it("should GET an instance configuration by id", async () => {
        edgeAppInstanceClient.should.not.be.undefined;
        const configuration = await edgeAppInstanceClient.GetAppInstanceConfiguration(appInstanceId);
        configuration.should.not.be.undefined;
        configuration.should.not.be.null;
        (configuration as any).deviceId.should.not.be.undefined;
        (configuration as any).deviceId.should.not.be.null;
        (configuration as any).appId.should.not.be.undefined;
        (configuration as any).appId.should.not.be.null;
        (configuration as any).appReleaseId.should.not.be.undefined;
        (configuration as any).appReleaseId.should.not.be.null;
        (configuration as any).appInstanceId.should.not.be.undefined;
        (configuration as any).appInstanceId.should.not.be.null;
    });

    it("should POST a new instance configuration for the given device id and application instance id", async () => {
        edgeAppInstanceClient.should.not.be.undefined;

        // Add new device
        testConfigurations.deviceId = `${deviceId}`;
        testConfigurations.appId = `${appId}`;
        testConfigurations.appInstanceId = `${appInstanceId}`;
        testConfigurations.appReleaseId = `${appReleaseId}`;
        const instConfRes = await edgeAppInstanceClient.PostAppInstanceConfigurations(testConfigurations);

        instConfRes.should.not.be.undefined;
        instConfRes.should.not.be.null;
        (instConfRes as any).deviceId.should.not.be.undefined;
        (instConfRes as any).deviceId.should.not.be.null;
        (instConfRes as any).appId.should.not.be.undefined;
        (instConfRes as any).appId.should.not.be.null;
        (instConfRes as any).appReleaseId.should.not.be.undefined;
        (instConfRes as any).appReleaseId.should.not.be.null;
        (instConfRes as any).appInstanceId.should.not.be.undefined;
        (instConfRes as any).appInstanceId.should.not.be.null;

        // Delete Configuration
    });

    it("should PATCH all instance configurations", async () => {
        edgeAppInstanceClient.should.not.be.undefined;
        const testAllConfigurations = {
            instanceConfigurations: [
                {
                    id: "string",
                    configuration: {
                        sampleKey1: `sampleValue1_${timeOffset}`,
                        sampleKey2: `sampleValue2_${timeOffset}`
                    }
                }
            ]
        };

        await edgeAppInstanceClient.PatchAppInstanceConfigurations(testAllConfigurations);

        // Delete configuration??
    });

    it("should PATCH specified instance configuration", async () => {
        edgeAppInstanceClient.should.not.be.undefined;
        testConfigurations.configuration = {
                sampleKey1: `sampleValue1_${timeOffset}`,
                sampleKey2: `sampleValue2_${timeOffset}`
            };

        const instConfRes = await edgeAppInstanceClient.PatchAppInstanceConfigurationData(
            appInstanceId,
            testConfigurations
        );
        instConfRes.should.not.be.undefined;
        instConfRes.should.not.be.null;
        (instConfRes as any).deviceId.should.not.be.undefined;
        (instConfRes as any).deviceId.should.not.be.null;
        (instConfRes as any).appId.should.not.be.undefined;
        (instConfRes as any).appId.should.not.be.null;
        (instConfRes as any).appReleaseId.should.not.be.undefined;
        (instConfRes as any).appReleaseId.should.not.be.null;
        (instConfRes as any).appInstanceId.should.not.be.undefined;
        (instConfRes as any).appInstanceId.should.not.be.null;

        // Delete configurtion
    });

    it("should DELETE an app instance configuration", async () => {
        edgeAppInstanceClient.should.not.be.undefined;

        // Add a new configuration
        testConfigurations.deviceId = `${deviceId}`;
        testConfigurations.appId = `${appId}`;
        testConfigurations.appInstanceId = `${appInstanceId}`;
        testConfigurations.appReleaseId = `${appReleaseId}`;
        const instConfRes = await edgeAppInstanceClient.PostAppInstanceConfigurations(testConfigurations);

        instConfRes.should.not.be.undefined;
        instConfRes.should.not.be.null;
        (instConfRes as any).appInstanceId.should.not.be.undefined;
        (instConfRes as any).appInstanceId.should.not.be.null;

        const _appInstanceId = (instConfRes as any).appInstanceId;

        // Delete App inst configuration
        await edgeAppInstanceClient.DeleteAppInstanceConfiguration(_appInstanceId);
    });

     */
});
