import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { generateTestData } from "../src/cli/commands/command-utils";
import { getPasskeyForUnitTest } from "./test-utils";
chai.should();

describe("[SDK] SignalCalculationClient", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });

    const signalCalculationClient = sdk.GetSignalCalculationClient();

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
        signalCalculationClient.should.not.be.undefined;
    });

    it("should calculate sin(Acceleration) on test data. @sanity", async () => {
        sdk.should.not.be.undefined;
        signalCalculationClient.should.not.be.undefined;

        const generatedData = generateTestData(
            10,
            (x) => {
                return x;
            },
            "Acceleration",
            "number"
        );

        const checkData = generateTestData(
            10,
            (x) => {
                return Math.sin(x);
            },
            "Acceleration",
            "number"
        );

        const input = {
            configuration: {
                operation: "SIN",
                operands: [
                    {
                        entityId: "assetid",
                        propertySetName: "Vibration",
                        propertyName: "Acceleration",
                    },
                ],
                result: {
                    entityId: "assetid",
                    propertySetName: "Vibration",
                    propertyName: "Acceleration",
                },
            },
            data: [
                {
                    entityId: "assetid",
                    propertySetName: "Vibration",
                    timeSeries: generatedData,
                },
            ],
        };

        const result = await signalCalculationClient.PostApplyOperation(input);

        for (let index = 0; index < result.timeSeries.length; index++) {
            const element = result.timeSeries[index];

            element.Acceleration.should.be.equal(checkData[index].Acceleration);
        }
    });

    it("should generate new data. @sanity", async () => {
        sdk.should.not.be.undefined;
        signalCalculationClient.should.not.be.undefined;

        const generatedData = generateTestData(
            10,
            (x) => {
                return Math.cos(x);
            },
            "Acceleration",
            "number"
        );

        const input = {
            configuration: {
                operation: "GENERATOR",
                params: { generatorType: "TEMPORAL", timePeriodInSeconds: 60, numberOfEvents: 2 },
                operands: [
                    {
                        entityId: "assetid",
                        propertySetName: "Vibration",
                        propertyName: "Acceleration",
                    },
                ],
                result: {
                    entityId: "assetid",
                    propertySetName: "Vibration",
                    propertyName: "Acceleration",
                },
            },
            data: [
                {
                    entityId: "assetid",
                    propertySetName: "Vibration",
                    timeSeries: generatedData,
                },
            ],
        };

        const result = await signalCalculationClient.PostApplyOperation(input);
        result.timeSeries.length.should.equal(20);
    });

    it("should check if a date is a weekend", async () => {
        sdk.should.not.be.undefined;
        signalCalculationClient.should.not.be.undefined;

        const generatedData = generateTestData(
            10,
            (x) => {
                return Math.cos(x);
            },
            "Acceleration",
            "number"
        );

        const input = {
            configuration: {
                operation: "IS_WEEKEND",
                operands: [
                    {
                        entityId: "assetid",
                        propertySetName: "Vibration",
                        propertyName: "_time",
                    },
                ],
                result: {
                    entityId: "assetid",
                    propertySetName: "Schedule",
                    propertyName: "IsWeekend",
                },
            },
            data: [
                {
                    entityId: "assetid",
                    propertySetName: "Vibration",
                    timeSeries: generatedData,
                },
            ],
        };

        const result = await signalCalculationClient.PostApplyOperation(input);

        result.timeSeries.length.should.equal(10);
    });
});
