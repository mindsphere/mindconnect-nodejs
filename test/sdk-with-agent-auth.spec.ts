// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import * as debug from "debug";
import { it } from "mocha";
import "url-search-params-polyfill";
import { IMindConnectConfiguration, MindConnectAgent } from "../src";
import { CredentialAuth } from "../src/api/credential-auth";
import { isTokenRotation } from "../src/api/mindconnect-base";
import { AgentManagementModels, MindSphereSdk } from "../src/api/sdk";
import { TokenManagerAuth } from "../src/api/tokenmanager-auth";
import { decrypt, loadAuth } from "../src/api/utils";
import { AgentUnitTestConfiguration, tearDownAgents, unitTestSetup } from "./test-agent-setup-utils";
import { getPasskeyForUnitTest } from "./test-utils";
const log = debug("mindconnect-agent-test");
const HttpsProxyAgent = require("https-proxy-agent");
chai.should();

describe("[SDK] using agent authorization", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
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

    it("should be able to run the SDK with agent authorization", async () => {
        const agent = new MindConnectAgent(agentConfig);
        if (!agent.IsOnBoarded()) {
            await agent.OnBoard();
            (<any>agent)._configuration.response.should.not.be.null;
        } else {
            log("The agent is already onboarded");
        }

        const mysdk = new MindSphereSdk(agent);

        const assetManagement = mysdk.GetAssetManagementClient();
        (await assetManagement.GetToken()).should.not.be.undefined;
        (await assetManagement.GetAssets())._embedded?.assets?.length.should.be.greaterThan(0);
    });

    it("should determine if something implements TokenRotation", async () => {
        const agent = new MindConnectAgent(agentConfig);
        const credentialAuth = new CredentialAuth("https://opensource.mindsphere.io", "Basic: test", "test");
        const tokenManagerAuth = new TokenManagerAuth(
            "https://opensource.mindsphere.io",
            "Basic: test",
            "test",
            "test",
            "test",
            "test"
        );

        isTokenRotation({ GetToken: "", GetTenant: "", GetGateway: "", RenewToken: "" }).should.be.false;
        isTokenRotation({ GetToken: () => {}, GetTenant: () => {}, GetGateway: () => {}, RenewToken: () => {} }).should
            .be.true;

        isTokenRotation(agent).should.be.true;
        isTokenRotation(credentialAuth).should.be.true;
        isTokenRotation(tokenManagerAuth).should.be.true;
    });
});
