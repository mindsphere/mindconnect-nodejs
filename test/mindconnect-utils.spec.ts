// Copyright (C), Siemens AG 2019
import * as chai from "chai";
import * as csv from "csvtojson";
import { IMindConnectConfiguration, MindConnectAgent } from "../src";
import { convertToTdpArray, retry } from "../src/api/utils";

chai.should();

describe("MindConnect Util Functions:", () => {
    const sharedSecretConfig: IMindConnectConfiguration = require("../agentconfig.json");

    it("Csv parsing for upload command should bring reasonable error ", async () => {
        // * see https://github.com/mindsphere/mindconnect-nodejs/issues/20
        const data: any[] = [];
        await csv()
            .fromString(
                "timestamp, dataPointId, qualityCode, value\n" +
                    "2019-04-09T09:18:21.809Z, DP-Temperature ,0, 20.34\n" +
                    "2019-04-09T09:18:22.809Z, DP-Humidity, 0, 70.4\n" +
                    "2019-04-09T09:18:23.809Z, DP-Pressure, 0, 1012.3"
            )
            .subscribe(entry => {
                data.push(entry);
            });

        const convertedData = convertToTdpArray(data);
        const agent = new MindConnectAgent(sharedSecretConfig);
        let errorOccured = false;
        let errorMessage = "";
        const retries: string[] = [];
        try {
            await retry(3, () => agent.BulkPostData(convertedData), 300, () => retries.push("x"));
        } catch (err) {
            errorOccured = true;
            errorMessage = err.message;
        }
        errorOccured.should.be.true;
        errorMessage.should.contain("str_integer");
        retries.length.should.be.equal(3);
    });
});
