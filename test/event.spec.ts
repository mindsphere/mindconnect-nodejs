import * as chai from "chai";
import * as debug from "debug";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest } from "./test-utils";
const log = debug("mindconnect-setup-test");
chai.should();

describe("[SDK] EventManagement API tests", () => {
    const auth = loadAuth();

    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });

    it("should call event management bilboard", async () => {
        const em = sdk.GetEventManagementClient();
        const billboard = await em.GetBillboard();
        billboard.should.not.be.undefined;
    });
});
