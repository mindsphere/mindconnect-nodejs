import * as chai from "chai";
import "url-search-params-polyfill";
import { EdgeAppDeploymentModels } from "../src/api/sdk/open-edge/open-edge-models";
import { MindSphereSdk } from "../src";
import { decrypt, loadAuth, throwError } from "../src/api/utils";
import { setupDeviceTestStructure, tearDownDeviceTestStructure } from "./test-device-setup-utils";
import { getPasskeyForUnitTest, sleep } from "./test-utils";
chai.should();

const timeOffset = new Date().getTime();
describe("[SDK] DeviceManagementClient.EdgeAppDeployment", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const appDeploymentClient = sdk.GetEdgeDeploymentClient();
    const edgeAppInstanceClient = sdk.GetEdgeAppInstanceManagementClient();
    const tenant = sdk.GetTenant();

    const testAppInstance = {
        name: `testAppInst_${tenant}_${timeOffset}`,
        appInstanceId: `testAppInst_${tenant}_${timeOffset}`,
        deviceId: "string",
        releaseId: "string",
        applicationId: `testApp_${tenant}_${timeOffset}`
    };

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

    const taskTemplate = {
        deviceId: "7d018c...",
        softwareId: "7d018c...",
        softwareReleaseId: "7d018c...",
        customData: {
            sampleKey1: "sampleValue1",
            sampleKey2: "sampleValue2"
        }
    };

    const workflowInstance = {
        deviceId: "",
        model: {
            key: `${tenant}_fwupdate`,
            customTransitions: []
        },
        data: {
            userDefined: {}
        }
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
    // let removalTaskId = "";

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
        const instConfRes = await edgeAppInstanceClient.PostAppInstanceConfigurations(testConfigurations);

        // Set the task template
        taskTemplate.deviceId = `${deviceId}`;
        taskTemplate.softwareId = `${appId}`;
        taskTemplate.softwareReleaseId = `${appInstanceId}`;
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
        appDeploymentClient.should.not.be.undefined;
        appDeploymentClient.GetGateway().should.be.equal(auth.gateway);
        (await appDeploymentClient.GetToken()).length.should.be.greaterThan(200);
        (await appDeploymentClient.GetToken()).length.should.be.greaterThan(200);
    });

    it("should POST accepted term and conditions", async () => {
        appDeploymentClient.should.not.be.undefined;

        // Prepare a new workflow instance
        const acceptedTermsAndConditions = await appDeploymentClient.PostAcceptTermsAndConditions({
            deviceId: deviceId,
            releaseId: appReleaseId
        });

        acceptedTermsAndConditions.should.not.be.undefined;
        acceptedTermsAndConditions.should.not.be.null;
        (acceptedTermsAndConditions as any).firstAccepted.should.not.be.undefined;
        (acceptedTermsAndConditions as any).firstAccepted.should.not.be.null;
    });

    it("should GET terms and conditions", async () => {
        appDeploymentClient.should.not.be.undefined;

        // Get terms and conditions
        const appTermAndConditions = await appDeploymentClient.GetTermsAndConditions(deviceId, appReleaseId);

        appTermAndConditions.should.not.be.undefined;
        appTermAndConditions.should.not.be.null;
        (appTermAndConditions as any).firstAccepted.should.not.be.null;
    });

/*  TODO: 27-06-2021 Not supported in yet
    it("should POST a new deployment task", async () => {
        appDeploymentClient.should.not.be.undefined;

        // Set the task template
        taskTemplate.deviceId = `${deviceId}`;
        taskTemplate.softwareId = `${appId}`;
        taskTemplate.softwareReleaseId = `${appInstanceId}`;

        const installationTask = await appDeploymentClient.PostInstallationTask(taskTemplate);
        (installationTask as any).should.not.be.undefined;
        (installationTask as any).should.not.be.null;
        (installationTask as any).id.should.not.be.undefined;
        (installationTask as any).id.should.not.be.null;
        (installationTask as any).currentState.should.not.be.undefined;
        (installationTask as any).currentState.should.not.be.null;

        installationTaskId = `${(installationTask as any).id}`;
    });*/

    it("should GET list of installation tasks.", async () => {
        appDeploymentClient.should.not.be.undefined;

        const taks = await appDeploymentClient.GetInstallationTasks(deviceId);
        (taks as any).should.not.be.undefined;
        (taks as any).should.not.be.null;
        (taks as any).page.number.should.equal(0);
        (taks as any).page.size.should.be.gte(10);
        (taks as any).content.length.should.be.gte(0);
    });

/*  TODO: 27-06-2021 Not supported in yet
    it("should GET specific installation task", async () => {
        appDeploymentClient.should.not.be.undefined;

        const task = await appDeploymentClient.GetInstallationTask(installationTaskId);
        (task as any).should.not.be.undefined;
        (task as any).should.not.be.null;
        (task as any).id.should.not.be.undefined;
        (task as any).id.should.not.be.null;
    });*/

/*  TODO: 27-06-2021 Not supported in yet
    it("should PATCH installation Status as downloading", async () => {
        appDeploymentClient.should.not.be.undefined;

        // Set the task template
        const status = {
            state: EdgeAppDeploymentModels.TaskStatus.StateEnum.DOWNLOAD,
            progress: 0.9,
            message: "Task status updated as DOWNLOAD",
            details: {
                sampleKey1: "sampleValue1",
                sampleKey2: "sampleValue2"
            }
        };

        const installationTAsk = await appDeploymentClient.PatchInstallationTask(installationTaskId, status);
        (installationTAsk as any).should.not.be.undefined;
        (installationTAsk as any).should.not.be.null;
        (installationTAsk as any).currentState.should.not.be.undefined;
        (installationTAsk as any).currentState.should.not.be.null;
    });
*/

/*  TODO: 27-06-2021 Not supported in yet
    it("should PATCH installation Status as activate", async () => {
        appDeploymentClient.should.not.be.undefined;

        // Set the task template
        const status = {
            state: EdgeAppDeploymentModels.TaskStatus.StateEnum.ACTIVATE,
            progress: 1.0,
            message: "Task status updated as ACTIVATE",
            details: {
                sampleKey1: "sampleValue1",
                sampleKey2: "sampleValue2"
            }
        };

        const installationTAsk = await appDeploymentClient.PatchInstallationTask(installationTaskId, status);
        (installationTAsk as any).should.not.be.undefined;
        (installationTAsk as any).should.not.be.null;
        (installationTAsk as any).currentState.should.not.be.undefined;
        (installationTAsk as any).currentState.should.not.be.null;
    });
*/

/* TODO: 27-06-2021 Not supported in yet
    it("should POST to create a removal task", async () => {
        appDeploymentClient.should.not.be.undefined;

        // Set the task template
        taskTemplate.deviceId = `${deviceId}`;
        taskTemplate.softwareId = `${appId}`;
        taskTemplate.softwareReleaseId = `${appInstanceId}`;

        const installationTask = await appDeploymentClient.PostRemovalTask(taskTemplate);
        (installationTask as any).should.not.be.undefined;
        (installationTask as any).should.not.be.null;
        (installationTask as any).id.should.not.be.undefined;
        (installationTask as any).id.should.not.be.null;
        (installationTask as any).currentState.should.not.be.undefined;
        (installationTask as any).currentState.should.not.be.null;

        removalTaskId = `${(installationTask as any).id}`;
    });*/

    it("should GET list of removal tasks.", async () => {
        appDeploymentClient.should.not.be.undefined;

        const taks = await appDeploymentClient.GetRemovalTasks(deviceId);
        (taks as any).should.not.be.undefined;
        (taks as any).should.not.be.null;
        (taks as any).page.number.should.equal(0);
        (taks as any).page.size.should.be.gte(10);
        (taks as any).content.length.should.be.gte(0);
    });
});



