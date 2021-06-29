import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src";
import { DeploymentWorkflowModels } from "../src/api/sdk/open-edge/open-edge-models";
import { decrypt, loadAuth } from "../src/api/utils";
import { setupDeviceTestStructure, tearDownDeviceTestStructure } from "./test-device-setup-utils";
import { getPasskeyForUnitTest } from "./test-utils";
chai.should();

describe("[SDK] DeviceManagementClient.DeploymentWorkflow", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const deploymentWorkflowClient = sdk.GetDeploymentWorkflowClient();
    const tenant = sdk.GetTenant();

    const workflowTemplate = {
        key: `${tenant}_fwupdate`,
        states: [
            {
                name: "STOPPED",
                description: "test state stopped",
                initial: true,
                final: false,
                cancel: false,
            },
            {
                name: "RUN",
                description: "test state run",
                initial: false,
                final: false,
                cancel: false,
            },
            {
                name: "FINAL",
                description: "test state run",
                initial: false,
                final: true,
                cancel: false,
            },
            {
                name: "CANCEL",
                description: "test state run",
                initial: false,
                final: false,
                cancel: true,
            },
        ],
        transitions: [
            {
                from: "STOPPED",
                to: "RUN",
                type: DeploymentWorkflowModels.TransitionType.BACKENDTRIGGER,
                allowedTypes: [DeploymentWorkflowModels.TransitionType.BACKENDTRIGGER],
            },
            {
                from: "STOPPED",
                to: "CANCEL",
                type: DeploymentWorkflowModels.TransitionType.BACKENDTRIGGER,
                allowedTypes: [DeploymentWorkflowModels.TransitionType.BACKENDTRIGGER],
            },
            {
                from: "RUN",
                to: "CANCEL",
                type: DeploymentWorkflowModels.TransitionType.BACKENDTRIGGER,
                allowedTypes: [DeploymentWorkflowModels.TransitionType.BACKENDTRIGGER],
            },
            {
                from: "RUN",
                to: "FINAL",
                type: DeploymentWorkflowModels.TransitionType.BACKENDTRIGGER,
                allowedTypes: [DeploymentWorkflowModels.TransitionType.BACKENDTRIGGER],
            },
        ],
        groups: [
            {
                name: "Machine",
                states: ["STOPPED", "RUN", "CANCEL", "FINAL"],
            },
        ],
    };

    const workflowInstance = {
        deviceId: "",
        model: {
            key: `${tenant}_fwupdate`,
            customTransitions: [],
        },
        data: {
            userDefined: {},
        },
    };

    let deviceTypeId = "aee2e37f-f562-4ed6-b90a-c43208dc054a";
    let assetTypeId = `${tenant}.UnitTestDeviceAssetType`;
    let assetId = "";
    let gFolderid = "";

    let deviceId = "";
    let workflowModelKey = `${tenant}_fwupdate`;
    let workflowInstanceId = `${tenant}_fwupdate`;
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
    });

    after(async () => {
        // tear Down test infrastructure
        await tearDownDeviceTestStructure(sdk);
    });

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it("standard properties shoud be defined", async () => {
        deploymentWorkflowClient.should.not.be.undefined;
        deploymentWorkflowClient.GetGateway().should.be.equal(auth.gateway);
        (await deploymentWorkflowClient.GetToken()).length.should.be.greaterThan(200);
        (await deploymentWorkflowClient.GetToken()).length.should.be.greaterThan(200);
    });

    it("should POST to create a new workflow model", async () => {
        deploymentWorkflowClient.should.not.be.undefined;

        // Post a new deployment workflow model
        const newWorkflowModel = await deploymentWorkflowClient.PostNewWorkflowModel(workflowTemplate);

        newWorkflowModel.should.not.be.undefined;
        newWorkflowModel.should.not.be.null;
        (newWorkflowModel as any).key.should.not.be.undefined;
        (newWorkflowModel as any).key.should.not.be.null;
        workflowModelKey = `${(newWorkflowModel as any).key}`;
    });

    it("should GET Model description for a given key", async () => {
        deploymentWorkflowClient.should.not.be.undefined;

        const workflowModel = await deploymentWorkflowClient.GetWorkflowModel(workflowModelKey);
        (workflowModel as any).should.not.be.undefined;
        (workflowModel as any).should.not.be.null;
        (workflowModel as any).states.should.not.be.undefined;
        (workflowModel as any).states.should.not.be.null;
        (workflowModel as any).states.length.should.be.gte(3);
    });

    it("should POST a new workflow instance", async () => {
        deploymentWorkflowClient.should.not.be.undefined;

        // Prepare a new workflow instance
        workflowInstance.deviceId = deviceId;
        workflowInstance.model.key = workflowModelKey;

        const newWorkflowInstance = await deploymentWorkflowClient.PostNewWorflowInstance(workflowInstance, true, true);

        newWorkflowInstance.should.not.be.undefined;
        newWorkflowInstance.should.not.be.null;
        (newWorkflowInstance as any).id.should.not.be.undefined;
        (newWorkflowInstance as any).id.should.not.be.null;
        workflowInstanceId = (newWorkflowInstance as any).id;
    });

    it("should GET list of instance descriptions belonging to the caller's tenant.", async () => {
        deploymentWorkflowClient.should.not.be.undefined;

        const workflowInstances = await deploymentWorkflowClient.GetWorkflowInstances(true, true);
        (workflowInstances as any).should.not.be.undefined;
        (workflowInstances as any).should.not.be.null;
        (workflowInstances as any).page.number.should.equal(0);
        (workflowInstances as any).page.size.should.be.gte(10);
        (workflowInstances as any).content.length.should.be.gte(0);
    });

    it("should GET Instance description for a given id", async () => {
        deploymentWorkflowClient.should.not.be.undefined;

        const workflowInstance = await deploymentWorkflowClient.GetWorkflowInstance(workflowInstanceId, true, true);
        (workflowInstance as any).should.not.be.undefined;
        (workflowInstance as any).should.not.be.null;
        (workflowInstance as any).id.should.not.be.undefined;
        (workflowInstance as any).id.should.not.be.null;
    });

    it("should PATCH Modify current state of a workflow instance.", async () => {
        // Prepare state info
        const stateInfo = {
            progress: 100,
            message: "string",
            details: {
                userDefined: {},
            },
            state: "RUN",
        };
        // Patch the state info
        const updatedInstance = await deploymentWorkflowClient.PatchWorkflowInstance(
            workflowInstanceId,
            stateInfo,
            true,
            true
        );
        (updatedInstance as any).should.not.be.undefined;
        (updatedInstance as any).should.not.be.null;
        (updatedInstance as any).id.should.not.be.undefined;
        (updatedInstance as any).id.should.not.be.null;
    });

    it("should POST to cancel a workflow instance", async () => {
        deploymentWorkflowClient.should.not.be.undefined;

        const workflowInstance = await deploymentWorkflowClient.PostToCancelWorkflowInstance(
            workflowInstanceId,
            true,
            true
        );
        (workflowInstance as any).should.not.be.undefined;
        (workflowInstance as any).should.not.be.null;
        (workflowInstance as any).id.should.not.be.undefined;
        (workflowInstance as any).id.should.not.be.null;
    });

    it("should DELETE workflow model", async () => {
        deploymentWorkflowClient.should.not.be.undefined;

        // delete file
        await deploymentWorkflowClient.DeleteWorkflowModel(workflowModelKey);
    });
});
