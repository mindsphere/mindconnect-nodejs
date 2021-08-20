import * as chai from "chai";
import { DataSourceConfiguration, dataValidator, eventValidator } from "../src";
chai.should();

describe("validation tests", () => {
    const config = {
        id: "db1e5617-a73a-4b37-9e91-8404cd61c800",
        configurationId: "CF-castidev.Pump",
        dataSources: [
            {
                name: "DS-Environment",
                customData: { aspect: "Environment" },
                description: null,
                dataPoints: [
                    {
                        id: "DP-Temperature",
                        name: "Temperature",
                        description: null,
                        unit: "°C",
                        type: "DOUBLE",
                        customData: { variable: "Temperature" },
                    },
                    {
                        id: "DP-Pressure",
                        name: "Pressure",
                        description: null,
                        unit: "kPa",
                        type: "DOUBLE",
                        customData: { variable: "Pressure" },
                    },
                    {
                        id: "DP-Humidity",
                        name: "Humidity",
                        description: null,
                        unit: "%",
                        type: "INT",
                        customData: { variable: "Humidity" },
                    },
                ],
            },
            {
                name: "DS-PumpData",
                customData: { aspect: "PumpData" },
                description: null,
                dataPoints: [
                    {
                        id: "DP-StuffingBoxTemperature",
                        name: "StuffingBoxTemperature",
                        description: null,
                        unit: "°C",
                        type: "DOUBLE",
                        customData: { variable: "StuffingBoxTemperature" },
                    },
                    {
                        id: "DP-PressureOut",
                        name: "PressureOut",
                        description: null,
                        unit: "hPa",
                        type: "DOUBLE",
                        customData: { variable: "PressureOut" },
                    },
                    {
                        id: "DP-PressureIn",
                        name: "PressureIn",
                        description: null,
                        unit: "hPa",
                        type: "DOUBLE",
                        customData: { variable: "PressureIn" },
                    },
                    {
                        id: "DP-MotorCurrent",
                        name: "MotorCurrent",
                        description: null,
                        unit: "V",
                        type: "DOUBLE",
                        customData: { variable: "MotorCurrent" },
                    },
                    {
                        id: "DP-Flow",
                        name: "Flow",
                        description: null,
                        unit: "l/s",
                        type: "DOUBLE",
                        customData: { variable: "Flow" },
                    },
                    {
                        id: "DP-TimeStamp",
                        name: "TimeStamp",
                        description: null,
                        unit: "Z",
                        type: "TIMESTAMP",
                        customData: { variable: "TimeStamp" },
                    },

                    {
                        id: "DP-BigString",
                        name: "BigString",
                        description: null,
                        unit: "Z",
                        type: "BIG_STRING",
                        customData: { variable: "BigString" },
                    },
                ],
            },
        ],
        eTag: "1",
    } as DataSourceConfiguration;

    const validator = dataValidator(config);

    it("should validate a valid schema", () => {
        const currentMessage = [
            {
                dataPointId: "DP-Humidity",
                qualityCode: "0",
                value: `${Math.ceil(Math.random() * 25) + 70}`,
            },
            {
                dataPointId: "DP-Pressure",
                qualityCode: "0",
                value: `${Math.random() * 120 + 40}`,
            },
            {
                dataPointId: "DP-Temperature",
                qualityCode: "0",
                value: `${Math.random() * 120 + 40}`,
            },
            {
                dataPointId: "DP-Flow",
                qualityCode: "0",
                value: `${Math.random() * 120 + 40}`,
            },
            {
                dataPointId: "DP-MotorCurrent",
                qualityCode: "0",
                value: `${Math.random() * 120 + 40}`,
            },
            {
                dataPointId: "DP-PressureIn",
                qualityCode: "0",
                value: `${Math.random() * 120 + 40}`,
            },
            {
                dataPointId: "DP-PressureOut",
                qualityCode: "0",
                value: `${Math.random() * 120 + 40}`,
            },
            {
                dataPointId: "DP-StuffingBoxTemperature",
                qualityCode: "0",
                value: `${Math.random() * 120 + 40}`,
            },
        ];
        const result = validator(currentMessage);
        result.should.be.true;
    });

    it("should catch non integers in integer variables", () => {
        const currentMessage = [
            {
                dataPointId: "DP-Humidity",
                qualityCode: "0",
                value: "125.4",
            },
        ];
        const result = validator(currentMessage);
        result.should.be.false;
        validator.errors!.should.have.lengthOf(1);
        validator.errors![0].message!.should.equal('must pass "str_integer" keyword validation');
    });

    it("should catch invalid dataPoint ids", () => {
        const currentMessage = [
            {
                dataPointId: "DP-XXy",
                qualityCode: "0",
                value: "125.4",
            },
        ];
        const result = validator(currentMessage);
        result.should.be.false;
        validator.errors!.should.have.lengthOf(1);
        validator.errors![0].message!.should.equal("must be equal to one of the allowed values");
    });

    it("should validate ISO8601 timestamps", () => {
        const currentMessage = [
            {
                dataPointId: "DP-TimeStamp",
                qualityCode: "0",
                value: new Date().toISOString(),
            },
        ];
        const result = validator(currentMessage);
        result.should.be.true;
    });

    it("should catch non-iso8701 timestamps", () => {
        const currentMessage = [
            {
                dataPointId: "DP-TimeStamp",
                qualityCode: "0",
                value: new Date().toLocaleDateString(), // invalid date non ISO8601
            },
        ];
        const result = validator(currentMessage);
        result.should.be.false;
        validator.errors!.should.have.lengthOf(1);
        validator.errors![0].message!.should.equal('must pass "str_timestamp" keyword validation');
        // console.log(validator.errors);
    });

    it("should validate arrays in big strings", () => {
        const currentMessage = [
            {
                dataPointId: "DP-BigString",
                qualityCode: "0",
                value: `${JSON.stringify(Array.from(Array(1000).keys()))}`,
            },
        ];
        const result = validator(currentMessage);
        result.should.be.true;
    });

    it("should validate numbers", () => {
        const currentMessage = [
            {
                dataPointId: "DP-Flow",
                qualityCode: "0",
                value: `45.45`,
            },
        ];
        const result = validator(currentMessage);
        result.should.be.true;
    });

    it("should catch invalid numbers", () => {
        const currentMessage = [
            {
                dataPointId: "DP-Flow",
                qualityCode: "0",
                value: `45.45s`,
            },
        ];
        const result = validator(currentMessage);
        result.should.be.false;
    });

    it("should catch invalid case in qualityCode", () => {
        const currentMessage = [
            {
                dataPointId: "DP-Flow",
                qualitycode: "0",
                value: `45.45`,
            },
        ];
        const result = validator(currentMessage);
        result.should.be.false;
        validator.errors!.should.have.lengthOf(1);
        validator.errors![0].message!.should.equal("must have required property 'qualityCode'");
    });

    it("should catch invalid case in dataPointId", () => {
        const currentMessage = [
            {
                datapointid: "DP-Flow",
            },
        ];
        const result = validator(currentMessage);
        result.should.be.false;
        validator.errors!.should.have.lengthOf(1);
        validator.errors![0].message!.should.equal("must have required property 'dataPointId'");
    });

    it("should validate events", () => {
        const validator = eventValidator();
        const result = validator({ entityId: "1324567890123456789012abcdefabcd", timestamp: new Date().toISOString() });
        result.should.be.true;
    });

    it("should validate events", () => {
        const validator = eventValidator();
        const result = validator({
            entityId: "1324567890123456789012abcdefabcd",
            sourceType: "Agent",
            sourceId: "application",
            source: "MindConnect Agent",
            severity: 20,
            description: "Event sent from @mindconnect/node-red-contrib-mindconnect",
            timestamp: "2021-08-19T18:41:25.740Z",
            additionalProperty: "",
        });
        result.should.be.true;
    });
});
