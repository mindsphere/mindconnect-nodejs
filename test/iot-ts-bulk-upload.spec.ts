import { IotTsBulkUpload } from "../src";
import { decrypt, loadAuth } from "../src/api/utils";

describe("IotTsBulkUpload", () => {
    const gateway = process.env.GATEWAY || loadAuth().gateway;
    const tenant = process.env.TENANT || loadAuth().tenant;
    const basicAuth = process.env.BASICAUTH || decrypt(loadAuth(), "passkey.4.unit.test");
    it.only("should instantiate", async () => {
        const tsBulkUpload = new IotTsBulkUpload(gateway, basicAuth, tenant);
        tsBulkUpload.should.exist;
    });

    it.only("should renew token", async () => {
        const tsBulkUpload = new IotTsBulkUpload(gateway, basicAuth, tenant);
        tsBulkUpload.should.exist;
        const result = await tsBulkUpload.RenewToken();
        result.should.be.true;
        const token = tsBulkUpload.GetServiceToken();
        token.should.exist;
    });
});
