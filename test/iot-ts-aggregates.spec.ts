import { MindSphereSdk, TimeSeriesAggregateModels } from "../src/api/sdk";
import { checkAssetId, decrypt, loadAuth } from "../src/api/utils";
import { setupStructure } from "./test-agent-setup-utils";
import { getPasskeyForUnitTest } from "./test-utils";

describe("[SDK] IotTsAggregateClient", () => {
    const auth = loadAuth();

    const sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, getPasskeyForUnitTest()) });

    let assetid = "";

    before(async () => {
        const unitTestStructure = await setupStructure(sdk);
        assetid = `${unitTestStructure.targetAsset.assetId}`;
    });

    it("should instantiate", async () => {
        const aggregateClient = sdk.GetTimeSeriesAggregateClient();
        aggregateClient.should.exist;
    });

    it("should renew token", async () => {
        const aggregateClient = sdk.GetTimeSeriesAggregateClient();
        aggregateClient.should.exist;
        const result = await aggregateClient.RenewToken();
        result.should.be.true;
        const token = await aggregateClient.GetToken();
        token.should.exist;
        token.length.should.be.gte(100);
    });

    it("should get aggregates per hour of the last 7 days using the test asset @sanity", async () => {
        const aggregateClient = sdk.GetTimeSeriesAggregateClient();
        assetid.should.not.be.undefined;
        assetid.should.not.be.equal("");
        checkAssetId(assetid);

        const now = new Date();
        const lastMonth = new Date();
        lastMonth.setDate(lastMonth.getDate() - 7);
        const fromLastMonth = new Date(lastMonth.getUTCFullYear(), lastMonth.getUTCMonth(), lastMonth.getUTCDate());
        const toNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

        const aggregates = await aggregateClient.GetAggregates(assetid, "VibrationData", {
            from: fromLastMonth,
            to: toNow,
            intervalUnit: "hour",
            intervalValue: 1,
        });

        aggregates.should.not.be.undefined;
        aggregates.should.not.be.null;

        for (const obj of Object.keys(aggregates)) {
            const currentAggregate = (aggregates[obj] as unknown) as TimeSeriesAggregateModels.Aggregates;
            currentAggregate.starttime.should.not.be.undefined;
            currentAggregate.endtime.should.not.be.undefined;
        }
    });
});
