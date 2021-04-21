import * as chai from "chai";
import "url-search-params-polyfill";
import { DataExchangeModels, MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest } from "./test-utils";
chai.should();

describe("[SDK] DataExchangeClient", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it("should not be undefined  @sanity", async () => {
        sdk.GetDataExchangeClient().should.not.be.undefined;
    });

    it("should list private files @sanity", async () => {
        const privateFiles = await sdk.GetDataExchangeClient().GetDirectory(DataExchangeModels.Root.Private);
        privateFiles.should.not.be.undefined;
    });

    it("should list public files @sanity", async () => {
        const publicFiles = await sdk.GetDataExchangeClient().GetDirectory(DataExchangeModels.Root.Public);
        publicFiles.should.not.be.undefined;
    });
});
