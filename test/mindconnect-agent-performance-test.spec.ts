// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import * as debug from "debug";
import "url-search-params-polyfill";
import { DataPointValue, IMindConnectConfiguration, MindConnectAgent, retry } from "../src";
import { mochaAsync } from "./test-utils";
const log = debug("mindconnect-agent-test");
const HttpsProxyAgent = require("https-proxy-agent");
chai.should();

describe("MindConnectApi perf test", () => {

    const sharedSecretConfig: IMindConnectConfiguration = require("../agentconfig.json");

    it("should instantiate shared secret agent.", () => {
        const agent = new MindConnectAgent(sharedSecretConfig);
        agent.should.not.be.null;
        (<any>agent)._configuration.should.not.be.null;
        (<any>agent)._configuration.content.clientCredentialProfile[0].should.be.equal("SHARED_SECRET");
        (<any>agent)._storage.should.not.be.null;
    });


    it.only("should function under heavy load", mochaAsync(async () => {

        const agent = new MindConnectAgent(sharedSecretConfig);
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        if (!agent.HasDataSourceConfiguration()) {
            await retry(5, () => agent.GetDataSourceConfiguration());
        }

        const promises = [];

        for (let index = 0; index < 10; index++) {

            const now = Math.floor(Date.now() / 1000);
            (<any>agent)._configuration.response.client_secret_expires_at = now;
            promises.push(await agent.RenewToken());
        }

        await Promise.all(promises);


        for (let index = 0; index < 100; index++) {
            const values: DataPointValue[] = [
                { "dataPointId": "DP-Temperature", "qualityCode": "0", "value": (Math.sin(index) * (20 + index % 2) + 25).toString() },
                { "dataPointId": "DP-Pressure", "qualityCode": "0", "value": (Math.cos(index) * (20 + index % 25) + 25).toString() },
                { "dataPointId": "DP-Humidity", "qualityCode": "0", "value": ((index + 30) % 100).toString() },
                { "dataPointId": "DP-Acceleration", "qualityCode": "0", "value": (1000.0 + index).toString() },
                { "dataPointId": "DP-Frequency", "qualityCode": "0", "value": (60.0 + (index * 0.1)).toString() },
                { "dataPointId": "DP-Displacement", "qualityCode": "0", "value": (index % 10).toString() },
                { "dataPointId": "DP-Velocity", "qualityCode": "0", "value": (50.0 + index).toString() }
            ];

            if (Date.now() % 3 === 0) {
                const now = Math.floor(Date.now() / 1000);
                (<any>agent)._configuration.response.client_secret_expires_at = now;
            }

            const validator = agent.GetValidator();
            const isValid = await validator(values);
            if (isValid) {
                const result = await retry(5, () => agent.PostData(values));
            } else {
                // we are using simpler one for CI/CD
                // console.log("Running CI/CD");
                const values: DataPointValue[] = [
                    { "dataPointId": "DP001", "qualityCode": "0", "value": "123.67" },
                ];
                const result = await retry(5, () => agent.PostData(values));
            }
        }

    }));

});