import { MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest } from "./test-utils";

describe("[SDK] UsageTransparencyClient", () => {
    const auth = loadAuth();

    const sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, getPasskeyForUnitTest()) });

    it("should instantiate", async () => {
        const client = sdk.GetUsageTransparencyClient();
        client.should.not.be.undefined;
    });

    it("should post some usage data", async () => {
        const client = sdk.GetUsageTransparencyClient();
        await client.PostUsages({
            CustomerTenantID: client.GetTenant(),
            CustomerUserID: "sn0wcat@some.domain",
            UTSUsageData: [
                {
                    resourceAlias: "sdk-unit-test",
                    resourceName: "sdk-test-resource",
                    UsageData: [
                        {
                            usage: 20,
                            usageUnit: "imperialParsecs",
                            usageDate: new Date().toISOString(),
                        },
                    ],
                },
            ],
        });
    });
});
