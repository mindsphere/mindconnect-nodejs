// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import { it } from "mocha";
import "url-search-params-polyfill";
import { DataPointValue, IMindConnectConfiguration, MindConnectAgent, retry } from "../src";
import { AgentManagementModels, AssetManagementModels } from "../src/api/sdk";
import { MindSphereSdk } from "../src/api/sdk/";
import { decrypt, loadAuth, throwError } from "../src/api/utils";
import {
    AgentUnitTestConfiguration,
    createUnitTestAsset,
    tearDownAgents,
    unitTestSetup,
} from "./test-agent-setup-utils";
chai.should();

describe("MindConnectApi Version 3 Agent (SHARED_SECRET) - automatic configuration", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, "passkey.4.unit.test"),
    });

    let agentConfig: IMindConnectConfiguration = ({} as unknown) as IMindConnectConfiguration;
    let unitTestConfiguration: AgentUnitTestConfiguration = ({} as unknown) as AgentUnitTestConfiguration;

    let secondAsset: AssetManagementModels.AssetResourceWithHierarchyPath;

    before(async () => {
        unitTestConfiguration = await unitTestSetup(
            sdk,
            AgentManagementModels.AgentUpdate.SecurityProfileEnum.SHAREDSECRET
        );

        agentConfig = unitTestConfiguration.agentConfig as IMindConnectConfiguration;

        secondAsset = await createUnitTestAsset({
            assetMgmt: sdk.GetAssetManagementClient(),
            tenant: sdk.GetTenant(),
            folderid: unitTestConfiguration.folderid,
            name: "SecondUnitTestEngineInstance",
        });
    });
    after(async () => {
        await tearDownAgents(sdk, unitTestConfiguration);
    });

    it("should instantiate shared secret agent.", () => {
        const agent = new MindConnectAgent(agentConfig);
        agent.should.not.be.null;
        (<any>agent)._configuration.should.not.be.null;
        (<any>agent)._configuration.content.clientCredentialProfile[0].should.be.equal("SHARED_SECRET");
        (<any>agent)._storage.should.not.be.null;
    });

    it("should be able to automatically create and overwrite data source configuration", async () => {
        const agent = new MindConnectAgent(agentConfig);

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        const targetAssetId = unitTestConfiguration.targetAsset.assetId || throwError("invalid asset");
        await agent.ConfigureAgentForAssetId(targetAssetId, "DESCRIPTIVE", true);
        await agent.ConfigureAgentForAssetId(targetAssetId, "DESCRIPTIVE", true);

        for (let index = 0; index < 15; index++) {
            const values: DataPointValue[] = [
                { dataPointId: "DP-Temperature", qualityCode: "0", value: "223.1" },
                { dataPointId: "DP-Pressure", qualityCode: "0", value: "244" },
                { dataPointId: "DP-Humidity", qualityCode: "0", value: "366" },
            ];

            await agent.PostData(values);
        }
    });

    it("should be able to create mappings to multiple assets", async () => {
        const agent = new MindConnectAgent(agentConfig);

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        const targetAssetId = unitTestConfiguration.targetAsset.assetId || throwError("invalid asset");
        await agent.ConfigureAgentForAssetId(targetAssetId, "DESCRIPTIVE", true);

        const mappings = agent.GenerateMappings(secondAsset.assetId!);
        await agent.PutDataMappings(mappings);

        agent.GetMindConnectConfiguration().mappings?.length.should.be.equal(14);
        const retrievedMappings = agent.GetDataMappings();
        (await retrievedMappings).length.should.be.equal(14);

        for (let index = 0; index < 15; index++) {
            const values: DataPointValue[] = [
                { dataPointId: "DP-Temperature", qualityCode: "0", value: "223.1" },
                { dataPointId: "DP-Pressure", qualityCode: "0", value: "244" },
                { dataPointId: "DP-Humidity", qualityCode: "0", value: "366" },
            ];

            await agent.PostData(values);
        }
    });

    it("should be able to delete mappings", async () => {
        const agent = new MindConnectAgent(agentConfig);

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        const targetAssetId = unitTestConfiguration.targetAsset.assetId || throwError("invalid asset");
        await agent.ConfigureAgentForAssetId(targetAssetId, "DESCRIPTIVE", true);
        agent.HasDataMappings().should.be.true;

        await agent.DeleteAllMappings();
        agent.HasDataMappings().should.be.false;

        const mappings = await agent.GetDataMappings();
        mappings.length.should.equal(0);
        agent.HasDataMappings().should.be.false;
    });

    it("should use local storage properly", async () => {
        const agent = new MindConnectAgent(agentConfig);

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }
        const targetAssetId = unitTestConfiguration.targetAsset.assetId || throwError("invalid asset");
        if (!agent.HasDataSourceConfiguration()) {
            await agent.ConfigureAgentForAssetId(targetAssetId, "DESCRIPTIVE", true);
        }

        agent.HasDataSourceConfiguration().should.be.true;
        agent.HasDataMappings().should.be.true;

        const config = agent.GetMindConnectConfiguration();

        config.dataSourceConfiguration?.configurationId.should.eq(`CF-${agent.GetTenant()}.UnitTestEngine`);
        config.dataSourceConfiguration?.dataSources[0].dataPoints.length.should.equal(3);
        config.dataSourceConfiguration?.dataSources[1].dataPoints.length.should.equal(4);
        agent.GetMindConnectConfiguration().mappings?.length.should.equal(7);

        const mappings = await agent.GetDataMappings();
        mappings.length.should.equal(7);
    });

    it.only("should store data", async () => {
        const agent = new MindConnectAgent(agentConfig);

        const targetAssetId = unitTestConfiguration.targetAsset.assetId || throwError("invalid asset");

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        if (!agent.HasDataSourceConfiguration()) {
            const generatedConfig = await agent.GenerateDataSourceConfiguration(`${agent.ClientId()}.UnitTestEngine`);
            await agent.PutDataSourceConfiguration(generatedConfig);
        }

        if (!agent.HasDataMappings()) {
            const mappings = await agent.GenerateMappings(targetAssetId);
            await agent.PutDataMappings(mappings);
        }

        agent.HasDataSourceConfiguration().should.be.true;
        agent.HasDataMappings().should.be.true;

        const config = agent.GetMindConnectConfiguration();

        config.dataSourceConfiguration?.configurationId.should.eq(`CF-${agent.GetTenant()}.UnitTestEngine`);
        config.dataSourceConfiguration?.dataSources[0].dataPoints.length.should.equal(3);
        config.dataSourceConfiguration?.dataSources[1].dataPoints.length.should.equal(4);
        agent.GetMindConnectConfiguration().mappings?.length.should.equal(7);

        const mappings = await agent.GetDataMappings();
        mappings.length.should.equal(7);
    });

    it("should be able to use SDK with agent credentials", async () => {
        const agent = new MindConnectAgent(agentConfig);

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        const agentSdk = agent.Sdk();
        const billboard = await retry(5, () => agentSdk.GetAssetManagementClient().GetBillboard());
        billboard.should.not.be.undefined;
        const assetTypes = await retry(5, () => agentSdk.GetAssetManagementClient().GetAspectTypes());
        assetTypes.should.not.be.undefined;
    });
});
