import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src";
import { EdgeAppInstanceModels } from "../src/api/sdk/open-edge/open-edge-models";
import { decrypt, loadAuth } from "../src/api/utils";
import { setupDeviceTestStructure, tearDownDeviceTestStructure } from "./test-device-setup-utils";
import { getPasskeyForUnitTest } from "./test-utils";
chai.should();

const timeOffset = new Date().getTime();
describe("[SDK] DeviceManagementClient.EdgeAppInstance", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const edgeAppInstanceClient = sdk.GetEdgeAppInstanceManagementClient();
    const tenant = sdk.GetTenant();

    const testAppInstance = {
        name: `testAppInst_${tenant}_${timeOffset}`,
        appInstanceId: `testAppInst_${tenant}_${timeOffset}`,
        deviceId: "string",
        releaseId: "string",
        applicationId: `testApp_${tenant}_${timeOffset}`,
    };
    const testConfigurations = {
        deviceId: `${tenant}.UnitTestDeviceType`,
        appId: "718ca5ad0...",
        appReleaseId: "718ca5ad0...",
        appInstanceId: "718ca5ad0...",
        configuration: {
            sampleKey1: "sampleValue1",
            sampleKey2: "sampleValue2",
        },
    };
    let deviceTypeId = "aee2e37f-f562-4ed6-b90a-c43208dc054a";
    let assetTypeId = `${tenant}.UnitTestDeviceAssetType`;
    let assetId = "";
    let gFolderid = "";

    let deviceId = "";
    let appId = "";
    let appReleaseId = "";
    let appInstanceId = "";

    before(async () => {
        // tear Down test infrastructure
        await tearDownDeviceTestStructure(sdk);

        // Setup the testing architecture
        const { device, deviceAsset, deviceType, deviceAssetType, folderid } = await setupDeviceTestStructure(sdk);
        assetTypeId = `${(deviceAssetType as any).id}`;
        deviceTypeId = `${(deviceType as any).id}`;
        assetId = `${(deviceAsset as any).assetId}`;
        deviceId = `${(device as any).id}`;
        gFolderid = `${folderid}`;
        testConfigurations.deviceId = `${(device as any).id}`;

        // Create a new app
        testAppInstance.deviceId = `${deviceId}`;
        testAppInstance.releaseId = `V001${timeOffset}`;
        const appInstRes = await edgeAppInstanceClient.PostAppInstance(testAppInstance);
        appInstanceId = (appInstRes as any).id;
        appId = (appInstRes as any).applicationId;
        appReleaseId = (appInstRes as any).releaseId;

        // Create a new app instance configuration
        testConfigurations.deviceId = `${deviceId}`;
        testConfigurations.appId = `${appId}`;
        testConfigurations.appInstanceId = `${appInstanceId}`;
        testConfigurations.appReleaseId = `${appReleaseId}`;

        await edgeAppInstanceClient.PostAppInstanceConfigurations(testConfigurations);
    });

    after(async () => {
        // delete App configuration
        await edgeAppInstanceClient.DeleteAppInstanceConfiguration(appInstanceId);
        // Delete the app
        await edgeAppInstanceClient.DeleteAppInstance(appInstanceId);
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

    it("should GET all app instances by deviceId @sanity", async () => {
        edgeAppInstanceClient.should.not.be.undefined;
        const apps = await edgeAppInstanceClient.GetAppInstances(deviceId);
        apps.should.not.be.undefined;
        apps.should.not.be.null;
        (apps as any).page.number.should.equal(0);
        (apps as any).page.size.should.equal(10);
        (apps as any).content.length.should.be.gte(0);
    });

    it("should GET all app instances by deviceId (with size param)", async () => {
        edgeAppInstanceClient.should.not.be.undefined;
        const apps = await edgeAppInstanceClient.GetAppInstances(deviceId, 100, 0, "ASC");
        apps.should.not.be.undefined;
        apps.should.not.be.null;
        (apps as any).page.number.should.equal(0);
        (apps as any).page.size.should.equal(100);
        (apps as any).content.length.should.be.gte(0);
    });

    it("should GET the deployement status of the application instance by id", async () => {
        edgeAppInstanceClient.should.not.be.undefined;
        const status = await edgeAppInstanceClient.GetAppInstanceLifecycle(appInstanceId);
        status.should.not.be.undefined;
        status.should.not.be.null;
        (status as any).id.should.not.be.undefined;
        (status as any).id.should.not.be.null;
        (status as any).status.should.not.be.undefined;
        (status as any).status.should.not.be.null;
    });

    it("should POST a new app instance  for the given device id", async () => {
        edgeAppInstanceClient.should.not.be.undefined;

        // Add new device
        testAppInstance.name = `testAppInst_${tenant}_${timeOffset}_A`;
        testAppInstance.appInstanceId = `testAppInst_${tenant}_${timeOffset}_A`;
        testAppInstance.applicationId = `testApp_${tenant}_${timeOffset}_A`;
        testAppInstance.deviceId = `${deviceId}`;
        testAppInstance.releaseId = `V001${timeOffset}`;
        const appInstRes = await edgeAppInstanceClient.PostAppInstance(testAppInstance);

        appInstRes.should.not.be.undefined;
        appInstRes.should.not.be.null;
        (appInstRes as any).id.should.not.be.undefined;
        (appInstRes as any).id.should.not.be.null;
        (appInstRes as any).name.should.not.be.undefined;
        (appInstRes as any).name.should.not.be.null;
        (appInstRes as any).releaseId.should.not.be.undefined;
        (appInstRes as any).releaseId.should.not.be.null;
        (appInstRes as any).applicationId.should.not.be.undefined;
        (appInstRes as any).applicationId.should.not.be.null;

        const _appInstanceId = (appInstRes as any).id;

        // Delete App
        await edgeAppInstanceClient.DeleteAppInstance(_appInstanceId);
    });

    it("should DELETE an app instance", async () => {
        edgeAppInstanceClient.should.not.be.undefined;

        // Create a new app instance
        testAppInstance.name = `testAppInst_${tenant}_${timeOffset}_B`;
        testAppInstance.appInstanceId = `testAppInst_${tenant}_${timeOffset}_B`;
        testAppInstance.applicationId = `testApp_${tenant}_${timeOffset}_B`;
        testAppInstance.deviceId = `${deviceId}`;
        testAppInstance.releaseId = `V001${timeOffset}`;
        const appInstRes = await edgeAppInstanceClient.PostAppInstance(testAppInstance);

        appInstRes.should.not.be.undefined;
        appInstRes.should.not.be.null;

        const _appInstanceId = (appInstRes as any).id;
        // Delete App
        await edgeAppInstanceClient.DeleteAppInstance(_appInstanceId);
    });

    it("should PATCH Status of Application Release Instance", async () => {
        edgeAppInstanceClient.should.not.be.undefined;
        // Create a new instance
        testAppInstance.name = `testAppInst_${tenant}_${timeOffset}_C`;
        testAppInstance.appInstanceId = `testAppInst_${tenant}_${timeOffset}_C`;
        testAppInstance.applicationId = `testApp_${tenant}_${timeOffset}_C`;
        testAppInstance.deviceId = `${deviceId}`;
        testAppInstance.releaseId = `V001${timeOffset}`;
        const appInstRes = await edgeAppInstanceClient.PostAppInstance(testAppInstance);
        appInstRes.should.not.be.undefined;
        appInstRes.should.not.be.null;
        const _appInstanceId = (appInstRes as any).id;

        const testStatus = {
            status: EdgeAppInstanceModels.ApplicationInstanceLifeCycleStatus.StatusEnum.STOPPED,
        };

        const _status = await edgeAppInstanceClient.PatchAppInstanceStatus(_appInstanceId, testStatus);
        _status.should.not.be.undefined;
        _status.should.not.be.null;
        (_status as any).status.should.equal(
            EdgeAppInstanceModels.ApplicationInstanceLifeCycleStatus.StatusEnum.STOPPED
        );

        // Delete App
        await edgeAppInstanceClient.DeleteAppInstance(_appInstanceId);
    });

    it("should GET all application configurations by device id @sanity", async () => {
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

    it("should GET an instance configuration by id", async () => {
        edgeAppInstanceClient.should.not.be.undefined;
        // console.log(deviceId);
        // console.log(deviceTypeId);
        // console.log(appInstanceId);

        const all = await edgeAppInstanceClient.GetAppInstanceConfigurations(deviceId);
        // console.log(all);
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

    it("should POST a new app instance configuration for the given device id and application instance id", async () => {
        edgeAppInstanceClient.should.not.be.undefined;

        // Delete App inst configuration
        await edgeAppInstanceClient.DeleteAppInstanceConfiguration(appInstanceId);

        // Add new configuration
        testConfigurations.deviceId = `${deviceId}`;
        testConfigurations.appId = `${appId}`;
        testConfigurations.appInstanceId = `${appInstanceId}`;
        testConfigurations.appReleaseId = `${appReleaseId}`;
        testConfigurations.configuration = {
            sampleKey1: "sampleValue1_A",
            sampleKey2: "sampleValue2_A",
        };
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
    });

    it("should PATCH specified instance configuration", async () => {
        edgeAppInstanceClient.should.not.be.undefined;
        testConfigurations.deviceId = `${deviceId}`;
        testConfigurations.appId = `${appId}`;
        testConfigurations.appInstanceId = `${appInstanceId}`;
        testConfigurations.appReleaseId = `${appReleaseId}`;
        testConfigurations.configuration = {
            sampleKey1: `sampleValue1_B_${timeOffset}`,
            sampleKey2: `sampleValue2_B_${timeOffset}`,
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
    });
    /*
    it("should PATCH all instance configurations", async () => {
        edgeAppInstanceClient.should.not.be.undefined;
        const testAllConfigurations = {
            instanceConfigurations: [
                {
                    id: "Config01",
                    configuration: {
                        sampleKey1: `sampleValue1_C_1_${timeOffset}`,
                        sampleKey2: `sampleValue2_C_1_${timeOffset}`
                    }
                }
            ]
        };

        await edgeAppInstanceClient.PatchAppInstanceConfigurations(testAllConfigurations);
    });
    */
    it("should DELETE an app instance configuration", async () => {
        // Delete App inst configuration
        await edgeAppInstanceClient.DeleteAppInstanceConfiguration(appInstanceId);
    });
});
