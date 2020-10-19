import { TimeSeriesBulkClient } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest } from "./test-utils";

describe("[SDK] IotTsBulkUpload", () => {
    const auth = loadAuth();

    it("should instantiate", async () => {
        const tsBulkUpload = new TimeSeriesBulkClient({ ...auth, basicAuth: decrypt(auth, getPasskeyForUnitTest()) });
        tsBulkUpload.should.exist;
    });

    it("should renew token", async () => {
        const tsBulkUpload = new TimeSeriesBulkClient({ ...auth, basicAuth: decrypt(auth, getPasskeyForUnitTest()) });
        tsBulkUpload.should.exist;
        const result = await tsBulkUpload.RenewToken();
        result.should.be.true;
        const token = tsBulkUpload.GetToken();
        token.should.exist;
    });
});
