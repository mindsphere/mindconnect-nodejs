import * as chai from "chai";
import { MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest } from "./test-utils";
chai.should();

describe("[SDK] MesasgeBrokerClient", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it("should not be undefined  @sanity", async () => {
        sdk.GetMessageBrokerClient().should.not.be.undefined;
    });
});
