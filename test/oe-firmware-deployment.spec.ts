import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src";
import { FirmwareDeploymentModels } from "../src/api/sdk/open-edge/open-edge-models";
import { decrypt, loadAuth } from "../src/api/utils";
import { setupDeviceTestStructure, tearDownDeviceTestStructure } from "./test-device-setup-utils";
import { getPasskeyForUnitTest } from "./test-utils";
chai.should();

const timeOffset = new Date().getTime();
describe("[SDK] DeviceManagementClient.FirmwareDeployment", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const firmwareDeploymentClient = sdk.GetFirmwareDeploymentClient();
    const edgeAppInstanceClient = sdk.GetEdgeAppInstanceManagementClient();
    const tenant = sdk.GetTenant();

    const testAppInstance = {
        name: `testAppInst_${tenant}_${timeOffset}`,
        appInstanceId: `testAppInstId_${tenant}_${timeOffset}`,
        deviceId: "string",
        releaseId: `V001${timeOffset}`,
        applicationId: `testAppID_${tenant}_${timeOffset}`,
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

    const firmwareTemplate = {
        deviceId: "7d018c...",
        softwareType: FirmwareDeploymentModels.InstallationTaskInfo.SoftwareTypeEnum.FIRMWARE,
        softwareId: `testSoftId_${tenant}_${timeOffset}`,
        softwareReleaseId: `testSoftId_${tenant}_${timeOffset}`,
        transitions: [
            {
                type: "string",
                from: FirmwareDeploymentModels.Transition.FromEnum.DOWNLOAD,
                to: FirmwareDeploymentModels.Transition.ToEnum.INSTALL,
                details: {},
            },
        ],
        customData: {
            userDefined: {},
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

    // let installationTaskId = "";

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

        // Create a new app
        testAppInstance.deviceId = `${deviceId}`;
        const appInstRes = await edgeAppInstanceClient.PostAppInstance(testAppInstance);
        appInstanceId = (appInstRes as any).id;
        appId = (appInstRes as any).applicationId;
        appReleaseId = (appInstRes as any).releaseId;

        // Create a new app instance configuration
        testConfigurations.deviceId = `${deviceId}`;
        testConfigurations.appId = `${appId}`;
        testConfigurations.appInstanceId = `${appInstanceId}`;
        testConfigurations.appReleaseId = `${appReleaseId}`;
        const instConfRes = await edgeAppInstanceClient.PostAppInstanceConfigurations(testConfigurations);

        // Set the firmwareTemplate
        firmwareTemplate.deviceId = `${deviceId}`;
        firmwareTemplate.softwareId = `${appId}`;
        firmwareTemplate.softwareReleaseId = `${appInstanceId}`;
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
        firmwareDeploymentClient.should.not.be.undefined;
        firmwareDeploymentClient.GetGateway().should.be.equal(auth.gateway);
        (await firmwareDeploymentClient.GetToken()).length.should.be.greaterThan(200);
        (await firmwareDeploymentClient.GetToken()).length.should.be.greaterThan(200);
    });

    it("should GET list of installation tasks.", async () => {
        firmwareDeploymentClient.should.not.be.undefined;

        const taks = await firmwareDeploymentClient.GetInstallationTasks(deviceId);
        (taks as any).should.not.be.undefined;
        (taks as any).should.not.be.null;
        (taks as any).page.number.should.equal(0);
        (taks as any).page.size.should.be.gte(10);
        (taks as any).content.length.should.be.gte(0);
    });

    /* NOTE: 27-06-2021 Not supported in yet
    it("should POST accepted term and conditions", async () => {
        firmwareDeploymentClient.should.not.be.undefined;

        // Prepare a new workflow instance
        const acceptedTermsAndConditions = await firmwareDeploymentClient.PostAcceptTermsAndConditions({
            deviceId: deviceId,
            releaseId: `V001${timeOffset}`
        });

        acceptedTermsAndConditions.should.not.be.undefined;
        acceptedTermsAndConditions.should.not.be.null;
        (acceptedTermsAndConditions as any).firstAccepted.should.not.be.undefined;
        (acceptedTermsAndConditions as any).firstAccepted.should.not.be.null;
    });

    it("should GET terms and conditions", async () => {
        firmwareDeploymentClient.should.not.be.undefined;

        // Get terms and conditions
        const appTermAndConditions = await firmwareDeploymentClient.GetTermsAndConditions(deviceId, `V001${timeOffset}`);

        appTermAndConditions.should.not.be.undefined;
        appTermAndConditions.should.not.be.null;
        (appTermAndConditions as any).firstAccepted.should.not.be.null;
    });


    it("should POST a new deployment task", async () => {
        firmwareDeploymentClient.should.not.be.undefined;

        // Set the task template
        firmwareTemplate.deviceId = `${deviceId}`;

        const installationTask = await firmwareDeploymentClient.PostInstallationTask(firmwareTemplate);
        (installationTask as any).should.not.be.undefined;
        (installationTask as any).should.not.be.null;
        (installationTask as any).id.should.not.be.undefined;
        (installationTask as any).id.should.not.be.null;
        (installationTask as any).currentState.should.not.be.undefined;
        (installationTask as any).currentState.should.not.be.null;

        installationTaskId = `${(installationTask as any).id}`;
    });

    it("should GET specific installation task", async () => {
        firmwareDeploymentClient.should.not.be.undefined;

        const task = await firmwareDeploymentClient.GetInstallationTask(installationTaskId);
        (task as any).should.not.be.undefined;
        (task as any).should.not.be.null;
        (task as any).id.should.not.be.undefined;
        (task as any).id.should.not.be.null;
    });

    it("should PATCH installation Status as downloading", async () => {
        firmwareDeploymentClient.should.not.be.undefined;

        // Set the task template
        const status = {
            "state": FirmwareDeploymentModels.InstallationStateInfo.StateEnum.DOWNLOADING,
            "progress": 1.0,
            "message": "string",
            "details": {}
        };

        const installationTAsk = await firmwareDeploymentClient.PatchInstallationTask(installationTaskId, status);
        (installationTAsk as any).should.not.be.undefined;
        (installationTAsk as any).should.not.be.null;
        (installationTAsk as any).currentState.should.not.be.undefined;
        (installationTAsk as any).currentState.should.not.be.null;
    });

    it("should PATCH installation Status as activated", async () => {
        firmwareDeploymentClient.should.not.be.undefined;

        // Set the task template
        const status = {
            "state": FirmwareDeploymentModels.InstallationStateInfo.StateEnum.ACTIVATED,
            "progress": 1.0,
            "message": "string",
            "details": {}
        };

        const installationTAsk = await firmwareDeploymentClient.PatchInstallationTask(installationTaskId, status);
        (installationTAsk as any).should.not.be.undefined;
        (installationTAsk as any).should.not.be.null;
        (installationTAsk as any).currentState.should.not.be.undefined;
        (installationTAsk as any).currentState.should.not.be.null;
    });
    */
});
