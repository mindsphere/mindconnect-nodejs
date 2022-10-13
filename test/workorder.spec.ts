import { MindSphereSdk, WorkOrderModels } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest } from "./test-utils";

describe("[SDK] WorkOrderManagementClient", () => {
    const auth = loadAuth();

    const sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, getPasskeyForUnitTest()) });

    before(async () => {
        await deleteWorkorders(sdk);
    });

    after(async () => {
        await deleteWorkorders(sdk);
    });

    it("should instantiate", async () => {
        const client = sdk.GetWorkOrderManagementClient();
        client.should.not.be.undefined;
    });

    it("should get workorders", async () => {
        const client = sdk.GetWorkOrderManagementClient();

        const workorders = await client.GetWorkOrders();
        workorders.should.not.be.undefined;
        // console.log(workorders);
    });

    it("should create update and delete workorder", async () => {
        const client = sdk.GetWorkOrderManagementClient();

        const workorder = {
            dueDate: new Date().toISOString(),
            title: "[UNITTEST]",
            type: WorkOrderModels.TypeEnum.PLANNED,
        };

        const status = await client.PostWorkOrder({
            ...workorder,
        });

        status.woHandle!.should.not.be.undefined;

        // console.log(status);

        await client.PutWorkOrder(status.woHandle!, { ...workorder, description: "test" });
        // console.log(updatedStatus);

        const updatedWorkorder = await client.GetWorkOrder(status.woHandle!);
        updatedWorkorder.dueDate!.should.be.equal(workorder.dueDate);
        updatedWorkorder.title!.should.be.equal(workorder.title);
        updatedWorkorder.description!.should.be.equal("test");

        await client.DeleteWorkOrder(status.woHandle!);
    });

    it("should create attachment", async () => {
        const client = sdk.GetWorkOrderManagementClient();

        const workorder = {
            dueDate: new Date().toISOString(),
            title: "[UNITTEST]",
            type: WorkOrderModels.TypeEnum.PLANNED,
        };

        const status = await client.PostWorkOrder({
            ...workorder,
        });

        status.woHandle!.should.not.be.undefined;

        const status2 = await client.PatchWorkOrderAttachments(status.woHandle!, {
            attachments: [
                {
                    assetId: (await sdk.GetAssetManagementClient().GetRootAsset()).assetId!,
                    name: "	workorder-v1-9-0.yaml",
                    path: "	workorder-v1-9-0.yaml",
                },
            ],
        });

        status2.message!.should.not.be.undefined;

        await client.DeleteWorkOrder(status.woHandle!);
    });
});

async function deleteWorkorders(sdk: MindSphereSdk) {
    const client = sdk.GetWorkOrderManagementClient();
    const workorders = await client.GetWorkOrders();

    for await (const workorder of workorders.workOrders || []) {
        if (workorder.title?.startsWith("[UNITTEST]")) {
            await client.DeleteWorkOrder(workorder.woHandle!);
        }
    }
}
