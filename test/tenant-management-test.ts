import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest } from "./test-utils";
chai.should();

describe("[SDK] TenantManagementClient", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });

    const tenantManagementClient = sdk.GetTenantManagementClient();

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
        tenantManagementClient.should.not.be.undefined;
    });

    it("should get legal configuration", async () => {
        const result = await tenantManagementClient.GetLegalConfigRegions();
        result.should.not.be.undefined;
    });

    it("should get legal info", async () => {
        const result = await tenantManagementClient.GetLegalInfo();
        result.should.not.be.undefined;
    });

    it("should get subtenant info", async () => {
        const result = await tenantManagementClient.GetSubtenants();
        result.should.not.be.undefined;
    });
});
