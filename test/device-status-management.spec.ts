import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk, DeviceStatusManagementClient, DeviceStatusModels } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest, sleep } from "./test-utils";
chai.should();

const timeOffset = new Date().getTime();

describe("[SDK] DeviceStatusManagementClient", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const deviceStatusManagement = sdk.GetDeviceStatusManagementClient();
    const deviceId = "";

    before(async () => {
        await deleteModels(deviceStatusManagement);
    });

    after(async () => {
        await deleteModels(deviceStatusManagement);
    });

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it("standard properties shoud be defined", async () => {
        deviceStatusManagement.should.not.be.undefined;
        deviceStatusManagement.GetGateway().should.be.equal(auth.gateway);
        (await deviceStatusManagement.GetToken()).length.should.be.greaterThan(200);
        (await deviceStatusManagement.GetToken()).length.should.be.greaterThan(200);
    });


});

async function deleteModels(mm: DeviceStatusManagementClient) {
    await sleep(2000);

}
