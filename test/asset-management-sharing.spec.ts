import * as chai from "chai";
import "url-search-params-polyfill";
import { AssetManagementSharingClient, AssetManagementSharingModels, MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth, throwError } from "../src/api/utils";
import { getPasskeyForUnitTest, sleep } from "./test-utils";
chai.should();

describe("[SDK] AssetManagementSharingClient.Collaborations", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const am = sdk.GetAssetManagementSharingClient();
    const tenant = sdk.GetTenant();

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it.only("should GET all collaboration @sanity", async () => {
        am.should.not.be.undefined;
        const collaboration = await am.GetCollaboration();
        console.log(collaboration);
        collaboration.should.not.be.undefined;
        collaboration.should.not.be.null;
    });



})