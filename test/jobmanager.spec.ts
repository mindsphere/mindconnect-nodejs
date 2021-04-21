import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest } from "./test-utils";
chai.should();

describe("[SDK] JobManagerClient", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });

    it.only("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it.only("should not be undefined  @sanity", async () => {
        sdk.GetJobManagerClient().should.not.be.undefined;
    });

    it.only("GetJobs should work @sanity", async () => {
        const jobs = await sdk.GetJobManagerClient().GetJobs();
        jobs.should.not.be.undefined;
    });

    it.only("GetSchedules should work  @sanity", async () => {
        const schedules = await sdk.GetJobManagerClient().GetSchedules();
        schedules.should.not.be.undefined;
    });
});
