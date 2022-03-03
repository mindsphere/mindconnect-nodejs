import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest } from "./test-utils";
chai.should();

describe("[SDK] ResourceManagementClient", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });

    it("should not be undefined  @sanity", async () => {
        sdk.GetResourceManagementClient().should.not.be.undefined;
    });
});
