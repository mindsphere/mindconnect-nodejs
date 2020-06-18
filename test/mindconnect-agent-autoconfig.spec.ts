// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import * as debug from "debug";
import { it } from "mocha";
import "url-search-params-polyfill";
import { DataPointValue, IMindConnectConfiguration, MindConnectAgent, retry } from "../src";
import { AgentManagementModels } from "../src/api/sdk";
import { MindSphereSdk } from "../src/api/sdk/";
import { decrypt, loadAuth, throwError } from "../src/api/utils";
import { AgentUnitTestConfiguration, tearDownAgents, unitTestSetup } from "./test-agent-setup-utils";
const log = debug("mindconnect-agent-test");
const HttpsProxyAgent = require("https-proxy-agent");
chai.should();

describe("MindConnectApi Version 3 Agent (SHARED_SECRET)", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, "passkey.4.unit.test"),
    });

    let agentConfig: IMindConnectConfiguration = ({} as unknown) as IMindConnectConfiguration;
    let unitTestConfiguration: AgentUnitTestConfiguration = ({} as unknown) as AgentUnitTestConfiguration;

    before(async () => {
        unitTestConfiguration = await unitTestSetup(
            sdk,
            AgentManagementModels.AgentUpdate.SecurityProfileEnum.SHAREDSECRET
        );

        agentConfig = unitTestConfiguration.agentConfig as IMindConnectConfiguration;
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

    it("should throw exception if the configured path is inaccessible.", () => {
        if (/^win/.test(process.platform)) {
            chai.expect(() => new MindConnectAgent(agentConfig, 600, "z:\\blubb")).to.throw("ENOENT");
        }
    });

    it("should be able to automatically create and map data source configuration to asset", async () => {
        const agent = new MindConnectAgent(agentConfig);

        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
        }

        const targetAssetId = unitTestConfiguration.targetAsset.assetId || throwError("invalid asset");
        await agent.ConfigureAgentForAssetId(targetAssetId);

        for (let index = 0; index < 15; index++) {
            const values: DataPointValue[] = [
                { dataPointId: "DP-Temperature", qualityCode: "0", value: "223.1" },
                { dataPointId: "DP-Pressure", qualityCode: "0", value: "244" },
                { dataPointId: "DP-Humidity", qualityCode: "0", value: "366" },
            ];

            await agent.PostData(values);
        }
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
