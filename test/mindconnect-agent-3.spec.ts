// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import * as debug from "debug";
import * as os from "os";
import "url-search-params-polyfill";
import { BaseEvent, DataPoint, DataPointValue, DataSourceConfiguration, DefaultStorage, IMindConnectConfiguration, MindConnectAgent, retry, TimeStampedDataPoint } from "../src";
import { mochaAsync } from "./test-utils";
const log = debug("mindconnect-agent-test");
const HttpsProxyAgent = require("https-proxy-agent");
chai.should();

describe("MindConnectApi Version 3 Agent (SHARED_SECRET)", () => {

    const sharedSecretConfig: IMindConnectConfiguration = require("../agentconfig.json");

    it("should instantiate shared secret agent.", () => {
        const agent = new MindConnectAgent(sharedSecretConfig);
        agent.should.not.be.null;
        (<any>agent)._configuration.should.not.be.null;
        (<any>agent)._configuration.content.clientCredentialProfile[0].should.be.equal("SHARED_SECRET");
        (<any>agent)._storage.should.not.be.null;
    });

    it("should throw exception if the configured path is inaccessible.", () => {
        if (/^win/.test(process.platform)) {
            chai.expect(() => new MindConnectAgent(sharedSecretConfig, 600, "z:\\blubb")).to.throw("ENOENT");
        }
    });

    it("should onboard a shared secret agent.", mochaAsync(async () => {
        const agent = new MindConnectAgent(sharedSecretConfig);
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
            (<any>agent)._configuration.response.should.not.be.null;
        } else {
            log("The agent is already onboarded");
        }
    }));

    it("should rotate the client secret for the SHARED_SECRET configuration.", mochaAsync(async () => {
        const agent = new MindConnectAgent(sharedSecretConfig);
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
            (<any>agent)._configuration.response.should.not.be.null;
        } else {
            log("The agent is already onboarded");
        }
        const oldConfig = Object.assign({}, (<any>agent)._configuration);

        await (<any>agent).RotateKey();

        const newConfig: IMindConnectConfiguration = (<any>agent)._configuration;

        if (!oldConfig.response || !newConfig.response) {
            throw new Error("invalid data in responses");
        }
        oldConfig.response.client_id.should.be.equal(newConfig.response.client_id);
        oldConfig.response.client_secret.should.be.not.equal(newConfig.response.client_secret);
        oldConfig.response.registration_access_token.should.be.not.equal(newConfig.response.registration_access_token);
        oldConfig.response.client_secret_expires_at.should.be.lte(newConfig.response.client_secret_expires_at);
    }));

    it("should create client assertions according to the mindsphere specification.", mochaAsync(async () => {

        const agent = new MindConnectAgent(sharedSecretConfig);
        const result = <URLSearchParams>(<any>agent).CreateClientAssertion();
        result.should.not.be.null;
    }));

    it("should be able to acquire a valid access token for exchange endpoint.", mochaAsync(async () => {

        const agent = new MindConnectAgent(sharedSecretConfig);
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }
        await (<any>agent).AquireToken();
        (<any>agent)._accessToken.should.not.be.null;

        const response = (<any>agent)._accessToken;
        const storedConfiguration: IMindConnectConfiguration = (<any>agent)._configuration;

        if (!storedConfiguration.response)
            throw new Error("invalid response in the configuration was agent onboarded?");

        response.access_token.should.not.be.null;
        response.expires_in.should.equal(3600);
        response.scope.length.should.be.greaterThan(0);
    }));


    it("should be able to validate the access token for exchange endpoint.", mochaAsync(async () => {

        const agent = new MindConnectAgent(sharedSecretConfig);
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }
        await (<any>agent).AquireToken();
        (<any>agent)._accessToken.should.not.be.null;

        const result = await (<any>agent).ValidateToken();
        result.should.be.true;
    }));


    it("should be able to renew the exchange token.", mochaAsync(async () => {

        const agent = new MindConnectAgent(sharedSecretConfig);
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        // renew the token
        await (<any>agent).RenewToken();
        (<any>agent)._accessToken.should.not.be.null;
        const oldConfig = Object.assign({}, (<any>agent)._configuration);
        const oldAccessToken = Object.assign({}, (<any>agent)._accessToken);

        // simulate expired jwtToken
        const now = Math.floor(Date.now() / 1000);
        (<any>agent)._configuration.response.client_secret_expires_at = now;

        await (<any>agent).RenewToken();

        const newConfig = Object.assign({}, (<any>agent)._configuration);
        const newAccessToken = Object.assign({}, (<any>agent)._accessToken);

        if (!newConfig.response || !oldConfig.response)
            throw new Error("onboarding failed!");

        newConfig.response.client_secret.should.not.be.equal(oldConfig.response.client_secret);
        newConfig.response.client_secret_expires_at.should.be.greaterThan(oldConfig.response.client_secret_expires_at);
        newAccessToken.access_token.should.be.not.equal(oldAccessToken.access_token);
        oldAccessToken.jti.should.not.be.equal(newAccessToken.jti);
    }));

    it("should be able to put the datasource configuration.", mochaAsync(async () => {

        const agent = new MindConnectAgent(sharedSecretConfig);
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        await agent.GetDataSourceConfiguration();

        if (agent.HasDataSourceConfiguration()) {
            log("The agent is already configured");
            return;
        }

        const dataSourceConfig: DataSourceConfiguration = {
            "configurationId": "Configuration01",
            "dataSources": [
                {
                    "name": "EnvironmentData",
                    "description": "EnvironmentData (from environment sensors)",
                    "dataPoints": [
                        {
                            "id": "DP-Temperature",
                            "name": "Temperature",
                            "description": "Temperature",
                            "type": DataPoint.TypeEnum.DOUBLE,
                            "unit": "°C"
                        },
                        {
                            "id": "DP-Humidity",
                            "name": "Humidity",
                            "description": "Humidity",
                            "type": DataPoint.TypeEnum.INT,
                            "unit": "%"
                        },
                        {
                            "id": "DP-Pressure",
                            "name": "Pressure",
                            "description": "Pressure",
                            "type": DataPoint.TypeEnum.DOUBLE,
                            "unit": "kPa"
                        }

                    ],
                    "customData": {
                        "ostype": os.type(),
                        "osHostname": os.hostname()
                    }
                },
                {
                    "name": "VibrationsData",
                    "description": "Vibration (from vibration sensors)",
                    "dataPoints": [
                        {
                            "id": "DP-Displacement",
                            "name": "Displacement",
                            "description": "Displacement",
                            "type": DataPoint.TypeEnum.DOUBLE,
                            "unit": "mm"
                        },
                        {
                            "id": "DP-Velocity",
                            "name": "Velocity",
                            "description": "Velocity",
                            "type": DataPoint.TypeEnum.DOUBLE,
                            "unit": "mm/s"
                        },
                        {
                            "id": "DP-Acceleration",
                            "name": "Acceleration",
                            "description": "Acceleration",
                            "type": DataPoint.TypeEnum.DOUBLE,
                            "unit": "mm/s^2"
                        },
                        {
                            "id": "DP-Frequency",
                            "name": "Frequency",
                            "description": "Frequency",
                            "type": DataPoint.TypeEnum.DOUBLE,
                            "unit": "Hz"
                        }

                    ],
                    "customData": {
                        "ostype": os.type(),
                        "osHostname": os.hostname()
                    }
                },
            ]
        };

        if (!agent.HasDataSourceConfiguration()) {
            const result = await agent.PutDataSourceConfiguration(dataSourceConfig);
        }
    }));


    it("should be able to get the datasource configuration.", mochaAsync(async () => {

        const agent = new MindConnectAgent(sharedSecretConfig);
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        const result = await agent.GetDataSourceConfiguration();
        result.should.not.be.null;
        log(result);
    }));

    it("should be able to get the data mappings.", mochaAsync(async () => {

        const agent = new MindConnectAgent(sharedSecretConfig);
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        const result = await (<any>agent).GetDataMappings();
        result.should.not.be.null;
        log(result);
    }));

    it("should validate input.", mochaAsync(async () => {
        const agent = new MindConnectAgent(sharedSecretConfig);
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }
        if (!agent.HasDataSourceConfiguration()) {
            await agent.GetDataSourceConfiguration();
        }


        const values: DataPointValue[] = [
            { "dataPointId": "DP-Temperature", "qualityCode": "0", "value": "123.1" },
            { "dataPointId": "DP-Pressure", "qualityCode": "0", "value": "144" },
            { "dataPointId": "DP-Humidity", "qualityCode": "0", "value": "166.45" },
            { "dataPointId": "DP-NONEXISTANT", "qualityCode": "0", "value": "166.45" }
        ];

        try {
            await agent.PostData(values);
            throw Error("should never happen");
        } catch (err) {
            err.toString().should.include("should be equal to one of the allowed values"); // DP-NONEXISTANT
        }
    }));

    it("should behave like a full agent.", mochaAsync(async () => {
        const agent = new MindConnectAgent(sharedSecretConfig);

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }
        if (!agent.HasDataSourceConfiguration()) {
            await agent.GetDataSourceConfiguration();
        }

        for (let index = 0; index < 5; index++) {


            const values: DataPointValue[] = [
                { "dataPointId": "DP-Temperature", "qualityCode": "0", "value": (Math.sin(index) * (20 + index % 2) + 25).toString() },
                { "dataPointId": "DP-Pressure", "qualityCode": "0", "value": (Math.cos(index) * (20 + index % 25) + 25).toString() },
                { "dataPointId": "DP-Humidity", "qualityCode": "0", "value": ((index + 30) % 100).toString() },
                { "dataPointId": "DP-Acceleration", "qualityCode": "0", "value": (1000.0 + index).toString() },
                { "dataPointId": "DP-Frequency", "qualityCode": "0", "value": (60.0 + (index * 0.1)).toString() },
                { "dataPointId": "DP-Displacement", "qualityCode": "0", "value": (index % 10).toString() },
                { "dataPointId": "DP-Velocity", "qualityCode": "0", "value": (50.0 + index).toString() }
            ];

            const validator = agent.GetValidator();
            const isValid = await validator(values);
            if (isValid) {
                const result = await agent.PostData(values);
            } else {
                // we are using simpler one for CI/CD
                // console.log("Running CI/CD");
                const values: DataPointValue[] = [
                    { "dataPointId": "DP001", "qualityCode": "0", "value": "123.67" },
                ];
                const result = await agent.PostData(values);
            }
        }
    }));


    it("should behave like a full agent (using storage provider).", mochaAsync(async () => {
        const agent = new MindConnectAgent(sharedSecretConfig, undefined, new DefaultStorage("./.mc/"));

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }
        if (!agent.HasDataSourceConfiguration()) {
            await agent.GetDataSourceConfiguration();
        }

        for (let index = 0; index < 5; index++) {


            const values: DataPointValue[] = [
                { "dataPointId": "DP-Temperature", "qualityCode": "0", "value": (Math.sin(index) * (20 + index % 2) + 25).toString() },
                { "dataPointId": "DP-Pressure", "qualityCode": "0", "value": (Math.cos(index) * (20 + index % 25) + 25).toString() },
                { "dataPointId": "DP-Humidity", "qualityCode": "0", "value": ((index + 30) % 100).toString() },
                { "dataPointId": "DP-Acceleration", "qualityCode": "0", "value": (1000.0 + index).toString() },
                { "dataPointId": "DP-Frequency", "qualityCode": "0", "value": (60.0 + (index * 0.1)).toString() },
                { "dataPointId": "DP-Displacement", "qualityCode": "0", "value": (index % 10).toString() },
                { "dataPointId": "DP-Velocity", "qualityCode": "0", "value": (50.0 + index).toString() }
            ];

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


    it("should be able to use bulk upload.", mochaAsync(async () => {
        const agent = new MindConnectAgent(sharedSecretConfig);

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }
        if (!agent.HasDataSourceConfiguration()) {
            await agent.GetDataSourceConfiguration();
        }

        let values: DataPointValue[] = [
            { "dataPointId": "DP-Temperature", "qualityCode": "0", "value": "10" },
            { "dataPointId": "DP-Pressure", "qualityCode": "0", "value": "10" },
        ];

        const validator = agent.GetValidator();
        const isValid = await validator(values);

        if (!isValid) {
            // we are using simpler one for CI/CD
            // console.log("Running CI/CD");
            values = [
                { "dataPointId": "DP001", "qualityCode": "0", "value": "123.67" }
            ];

        }

        const now = new Date();

        const hourBefore = new Date();
        hourBefore.setMinutes(hourBefore.getMinutes() - 60);

        const bulk: TimeStampedDataPoint[] = [{
            "timestamp": hourBefore.toISOString(),
            "values": values
        }, {
            "timestamp": now.toISOString(),
            "values": values
        }];

        await agent.BulkPostData(bulk);
    }));



    it("should be able to post an event", mochaAsync(async () => {
        const agent = new MindConnectAgent(sharedSecretConfig);

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }


        if (!sharedSecretConfig.content.clientId) {
            throw new Error("Invalid configuration no client id");
        }

        const events: BaseEvent = {

            "entityId": sharedSecretConfig.content.clientId,
            "sourceType": "Event",
            "sourceId": "application",
            "source": "Meowz",
            "severity": 20,
            "description": `MC.rocks ${Math.floor(new Date().getTime() / 1000) % 100}`
        };

        await agent.PostEvent(events);
    }));


    it("should be able to validate event data", mochaAsync(async () => {
        const agent = new MindConnectAgent(sharedSecretConfig);

        const validator = agent.GetEventValidator();

        if (!sharedSecretConfig.content.clientId)
            throw new Error("Invalid configuration");

        await validator({

            "entityId": sharedSecretConfig.content.clientId,
            "sourceType": "Event",
            "sourceId": "application",
            "source": "Meowz",
            "severity": 20,
            "timestamp": new Date().toISOString(),
            "description": "Test"
        }).should.be.true;

        await validator({

            "entityId": "33ac5ae889a44717b02fa8282a30d1b4",
            "timestamp": "2018-06-16T18:38:07.293Z",
            "sourceType": "Event",
            "sourceId": "application",
            "source": "Meowz",
            "severity": 20,
            "description": ""
        }).should.be.true;

        await validator({

            "entityId": "XXac5ae889a44717b02fa8282a30d1b4",
            "timestamp": "2018-06-16T18:38:07.293Z",
            "sourceType": "Event",
            "sourceId": "application",
            "source": "Meowz",
            "severity": 20,
            "description": ""
        }).should.be.false;

        log(validator.errors);
        const error: any = (<any>validator).errors[0].message;
        error.should.be.equal("should match pattern \"^[A-Fa-f0-9]*$\"");

        await validator({

            "entityId": "aaac5ae889a44717b02fa8282a30d1b4",
            "timestamp": "2018-06-16T18:38:07.293+02:00",
            "sourceType": "Event",
            "sourceId": "application",
            "source": "Meowz",
            "severity": 20,
            "description": "",
            "additionalData": {
                "foo:": "bar"
            }
        }).should.be.true;
    }));


    it("should be able to upload a file chunked", mochaAsync(async () => {
        const agent = new MindConnectAgent(sharedSecretConfig);
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }
        const result = await agent.Upload("CHANGELOG.md", "text/plain", "blubb", true, undefined, 1024);
        result.should.be.equal("296eab6b2660719c6ffe75ff7355eee4");
    }));


    it("should be able to upload a text file in one piece as well", mochaAsync(async () => {
        const agent = new MindConnectAgent(sharedSecretConfig);

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        const result = await agent.Upload("CODE_OF_CONDUCT.md", "", "desc");
        result.should.be.equal("2b9b7c5ad3e71a431c7e5b4bf762bcdf");
    }));


    it("should be able to upload a binary in one piece as well", mochaAsync(async () => {
        const agent = new MindConnectAgent(sharedSecretConfig);

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        const result = await agent.Upload("./images/full.gif", "", "desc");
        result.should.be.equal("3b005ae235287f0d1e67c11f89857ad0");
    }));



    it("should be able to retry an operation before throwing an error", mochaAsync(async () => {
        const agent = new MindConnectAgent(sharedSecretConfig);
        (<any>agent)._proxyHttpAgent = new HttpsProxyAgent("http://localhost:65535");
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }
        let logCount = 0;
        try {
            await retry(5, () => agent.Upload("LICENSE.md", "text/plain", "blubb", true), 300, () => { logCount++; });
        } catch (err) {
            err.message.should.contain("ECONNREFUSED");
        }
        logCount.should.be.equal(5);
    }));

    it("should be to upload file in 5 retries", mochaAsync(async () => {
        const agent = new MindConnectAgent(sharedSecretConfig);
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }
        let logCount = 0;
        await retry(5, () => agent.Upload("LICENSE.md", "text/plain", "blubb", true), 300,
            () => {
                logCount++;
                if (logCount < 3)
                    throw new Error("not yet");
            });

        logCount.should.be.gte(3);
    }));
});