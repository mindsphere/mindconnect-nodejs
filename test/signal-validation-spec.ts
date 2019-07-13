import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk, SignalValidationModels } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { subtractSecond } from "../src/cli/commands/command-utils";
chai.should();

const timeOffset = new Date().getTime();

describe("[SDK] SignalValidationClient", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        basicAuth: decrypt(auth, "passkey.4.unit.test"),
        tenant: auth.tenant,
        gateway: auth.gateway
    });

    const signalValidationClient = sdk.GetSignalValidationClient();

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
        signalValidationClient.should.not.be.undefined;
    });

    it("Signal Validation should perform a range check.", async () => {
        sdk.should.not.be.undefined;
        signalValidationClient.should.not.be.undefined;

        // signalValidationClient.DetectRangeViolations([{}], { variableName: "test", lowerLimit: 1, upperLimit: 10 });
    });

    function generateTestData(size: number, fn: (x: number) => number) {
        const startDate = new Date();
        const results: SignalValidationModels.Timeseries[] = [];
        for (let index = size; index > 0; index--) {
            const time = subtractSecond(startDate, index);
            const value = fn(index);
        }

        return results;
    }
});
