// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import { log } from "console";
import * as fs from "fs";
import * as os from "os";
import "url-search-params-polyfill";
import {
    DataPoint,
    DataPointValue,
    DataSourceConfiguration,
    IMindConnectConfiguration,
    Mapping,
    MindConnectAgent,
    retry,
} from "../src";
import { AgentManagementModels, MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth, throwError } from "../src/api/utils";
import { AgentUnitTestConfiguration, tearDownAgents, unitTestSetup } from "./test-agent-setup-utils";
import { getPasskeyForUnitTest } from "./test-utils";

chai.should();

describe("MindConnectApi RSA_3072 Agent performance test", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });

    let rsaConfig: IMindConnectConfiguration = {} as unknown as IMindConnectConfiguration;
    let unitTestConfiguration: AgentUnitTestConfiguration = {} as unknown as AgentUnitTestConfiguration;

    before(async () => {
        unitTestConfiguration = await unitTestSetup(sdk, AgentManagementModels.AgentUpdate.SecurityProfileEnum.RSA3072);

        rsaConfig = unitTestConfiguration.agentConfig as IMindConnectConfiguration;
    });
    after(async () => {
        await tearDownAgents(sdk, unitTestConfiguration);
    });

    it("should instantiate RSA_3072 agent.", () => {
        const agent = new MindConnectAgent(rsaConfig);
        agent.should.not.be.null;
        (<any>agent)._configuration.should.not.be.null;
        (<any>agent)._configuration.content.clientCredentialProfile[0].should.be.equal("RSA_3072");
        (<any>agent)._storage.should.not.be.null;
    });

    it("should be able to put the datasource configuration.", async () => {
        const agent = new MindConnectAgent(rsaConfig);
        agent.SetupAgentCertificate(fs.readFileSync("private.key"));
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        await agent.GetDataSourceConfiguration();

        if (agent.HasDataSourceConfiguration()) {
            log("The agent is already configured");
            return;
        }

        const dataSourceConfig: DataSourceConfiguration = {
            configurationId: "Configuration01",
            dataSources: [
                {
                    name: "EnvironmentData",
                    description: "EnvironmentData (from environment sensors)",
                    dataPoints: [
                        {
                            id: "DP-Temperature",
                            name: "Temperature",
                            description: "Temperature",
                            type: DataPoint.TypeEnum.DOUBLE,
                            unit: "°C",
                        },
                        {
                            id: "DP-Humidity",
                            name: "Humidity",
                            description: "Humidity",
                            type: DataPoint.TypeEnum.INT,
                            unit: "%",
                        },
                        {
                            id: "DP-Pressure",
                            name: "Pressure",
                            description: "Pressure",
                            type: DataPoint.TypeEnum.DOUBLE,
                            unit: "kPa",
                        },
                    ],
                    customData: {
                        ostype: os.type(),
                        osHostname: os.hostname(),
                    },
                },
                {
                    name: "VibrationData",
                    description: "Vibration (from vibration sensors)",
                    dataPoints: [
                        {
                            id: "DP-Displacement",
                            name: "Displacement",
                            description: "Displacement",
                            type: DataPoint.TypeEnum.DOUBLE,
                            unit: "mm",
                        },
                        {
                            id: "DP-Velocity",
                            name: "Velocity",
                            description: "Velocity",
                            type: DataPoint.TypeEnum.DOUBLE,
                            unit: "mm/s",
                        },
                        {
                            id: "DP-Acceleration",
                            name: "Acceleration",
                            description: "Acceleration",
                            type: DataPoint.TypeEnum.DOUBLE,
                            unit: "mm/s^2",
                        },
                        {
                            id: "DP-Frequency",
                            name: "Frequency",
                            description: "Frequency",
                            type: DataPoint.TypeEnum.DOUBLE,
                            unit: "Hz",
                        },
                    ],
                    customData: {
                        ostype: os.type(),
                        osHostname: os.hostname(),
                    },
                },
            ],
        };

        if (!agent.HasDataSourceConfiguration()) {
            const result = await agent.PutDataSourceConfiguration(dataSourceConfig);
            result.should.not.be.undefined;
        }
    });

    it("should be able to get the datasource configuration.", async () => {
        const agent = new MindConnectAgent(rsaConfig);
        agent.SetupAgentCertificate(fs.readFileSync("private.key"));
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        const result = await agent.GetDataSourceConfiguration();
        result.should.not.be.null;
    });

    it("should be able to put the mappings configuration.", async () => {
        const agent = new MindConnectAgent(rsaConfig);
        agent.SetupAgentCertificate(fs.readFileSync("private.key"));

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        const dataSourceConfig = await agent.GetDataSourceConfiguration();
        dataSourceConfig.should.not.be.null;

        const mappings: Mapping[] = [];
        const aspects = unitTestConfiguration.targetAsset.aspects || [];
        const variables = [];
        for (const aspect of aspects) {
            for (const variable of aspect.variables || []) {
                variables.push(variable);
            }
        }

        const agentId = agent.ClientId();
        const targetAssetId = unitTestConfiguration.targetAsset.assetId || throwError("invalid asset");

        for (const dataSource of dataSourceConfig.dataSources) {
            for (const datapoint of dataSource.dataPoints) {
                mappings.push({
                    agentId: agentId,
                    dataPointId: datapoint.id,
                    entityId: targetAssetId,
                    propertyName: datapoint.name.replace("DP-", ""),
                    propertySetName: dataSource.name,
                    keepMapping: true,
                });
            }
        }
        const result = await agent.PutDataMappings(mappings);
        result.should.not.be.undefined;
    });

    it("should be able to get the data mappings.", async () => {
        const agent = new MindConnectAgent(rsaConfig);
        agent.SetupAgentCertificate(fs.readFileSync("private.key"));

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        const result = await (<any>agent).GetDataMappings();
        result.should.not.be.null;
        result.should.not.be.equal([]);
    });

    it.skip("should function under heavy load", async () => {
        if (!process.env.CI) return;
        const agent = new MindConnectAgent(rsaConfig);
        agent.SetupAgentCertificate(fs.readFileSync("private.key"));
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
                {
                    dataPointId: "DP-Temperature",
                    qualityCode: "0",
                    value: (Math.sin(index) * (20 + (index % 2)) + 25).toString(),
                },
                {
                    dataPointId: "DP-Pressure",
                    qualityCode: "0",
                    value: (Math.cos(index) * (20 + (index % 25)) + 25).toString(),
                },
                { dataPointId: "DP-Humidity", qualityCode: "0", value: ((index + 30) % 100).toString() },
                { dataPointId: "DP-Acceleration", qualityCode: "0", value: (1000.0 + index).toString() },
                { dataPointId: "DP-Frequency", qualityCode: "0", value: (60.0 + index * 0.1).toString() },
                { dataPointId: "DP-Displacement", qualityCode: "0", value: (index % 10).toString() },
                { dataPointId: "DP-Velocity", qualityCode: "0", value: (50.0 + index).toString() },
            ];

            if (Date.now() % 3 === 0) {
                const now = Math.floor(Date.now() / 1000);
                (<any>agent)._configuration.response.client_secret_expires_at = now;
            }

            const validator = agent.GetValidator();
            const isValid = await validator(values);
            if (isValid) {
            } else {
                throw new Error("invalid configuration!");
            }

            await retry(3, () =>
                agent.Upload(
                    `images/mappings.png`,
                    "",
                    "desc",
                    true,
                    undefined,
                    undefined,
                    undefined,
                    `${new Date().getTime()}/mappings.png`
                )
            );
            await retry(3, () =>
                agent.Upload(
                    `images/environmentdata.PNG`,
                    "",
                    "desc",
                    true,
                    undefined,
                    undefined,
                    undefined,
                    `${new Date().getTime()}/mappings.png`
                )
            );
        }
    });
});
