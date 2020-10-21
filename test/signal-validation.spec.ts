import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { generateTestData } from "../src/cli/commands/command-utils";
import { getPasskeyForUnitTest } from "./test-utils";
chai.should();

describe("[SDK] SignalValidationClient", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });

    const signalValidationClient = sdk.GetSignalValidationClient();

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
        signalValidationClient.should.not.be.undefined;
    });

    it("Signal Validation should perform a Range Check. @sanity", async () => {
        sdk.should.not.be.undefined;
        signalValidationClient.should.not.be.undefined;

        const data = generateTestData(100, (x) => {
            return x === 31 ? 120 : Math.sin(x);
        });

        const result = await signalValidationClient.DetectRangeViolations(data, {
            variableName: "variable1",
            lowerLimit: -1,
            upperLimit: 1,
        });
        result.should.not.be.null;
        result.length.should.be.equal(1);
    });

    it("Signal Validation should perform a Spike Alert.", async () => {
        const data = generateTestData(100, (x) => {
            return x >= 40 && x <= 42 ? 13 * Math.sin(x) : Math.sin(x);
        });

        const result = await signalValidationClient.DetectSpikes(data, {
            variableName: "variable1",
            windowSize: 20,
        });

        result.length.should.be.equal(2);
    });

    it("Signal Validation should perform Jump Detection.", async () => {
        const data = generateTestData(100, (x) => {
            return x >= 84 && x <= 85 ? 500 * Math.cos(x) : Math.sin(x);
        });

        const result = await signalValidationClient.DetectJumps(data, {
            variableName: "variable1",
            windowSize: 10,
        });

        result.length.should.be.equal(2);
    });

    it("Signal Validation should perform Noise Setection.", async () => {
        const data = generateTestData(1000, (x) => {
            return x % 100 >= 90 && x % 100 <= 100 ? Math.sin(x) * 3.15 : Math.sin(x);
        });

        const result = await signalValidationClient.DetectNoise(data, {
            variableName: "variable1",
            windowRadius: 3,
            threshold: 1,
        });

        result.length.should.be.equal(7);
    });

    it("Signal Validation should detect Data Gaps.", async () => {
        const data = generateTestData(1000, (x) => {
            if (x % 100 === 80 || x % 100 === 81) return undefined;
            return Math.sin(x);
        });

        const result = await signalValidationClient.DetectGaps(data, {
            variableName: "variable1",
            threshold: 1500,
        });

        result.events!.length.should.be.equal(20);
    });

    it("Signal Validation should interpolate Data Gaps.", async () => {
        const data = generateTestData(1000, (x) => {
            if (x % 100 === 80 || x % 100 === 81) return undefined;
            return Math.sin(x);
        });

        const result = await signalValidationClient.DetectGapsAndInterpolate(data, {
            variableName: "variable1",
            threshold: 1500,
        });

        result.events!.length.should.be.equal(20);
        result.interpolatedMeasurements!.length.should.be.equal(20);
    });

    it("Signal Validation should detect Bias.", async () => {
        const data = generateTestData(1000, (x) => {
            if (x % 100 >= 80 && x % 100 <= 85) return 4 * Math.sin(x);
            else return 4;
        });

        const result = await signalValidationClient.DetectBias(data, {
            variableName: "variable1",
            windowSize: 20,
            step: 10,
            threshold: 3,
        });

        result.length.should.equal(97);
    });
});
