import { MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest } from "./test-utils";

describe("[SDK] WorkOrderManagementClient", () => {
    const auth = loadAuth();

    const sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, getPasskeyForUnitTest()) });

    it.only("should instantiate", async () => {
        const client = sdk.GetWorkOrderManagementClient();
        client.should.not.be.undefined;
    });

    it.only("should get workorders", async () => {
        const client = sdk.GetWorkOrderManagementClient();

        const workorders = await client.GetWorkOrders();
        console.log(workorders);
    });
});
