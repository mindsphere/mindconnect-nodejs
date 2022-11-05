import { MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest } from "./test-utils";

describe("[SDK] VisualFlowCreatorClient", () => {
    const auth = loadAuth();

    const sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, getPasskeyForUnitTest()) });

    it("should instantiate", async () => {
        const client = sdk.GetVisualFlowCreatorClient();
        client.should.not.be.undefined;
    });
});
