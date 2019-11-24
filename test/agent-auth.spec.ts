// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import * as debug from "debug";
import { it } from "mocha";
import * as nock from "nock";
import "url-search-params-polyfill";
import { ClientIdentifier, IMindConnectConfiguration, MindConnectAgent, OnboardingStatus } from "../src";
import { AgentManagementModels } from "../src/api/sdk";
import { MindSphereSdk } from "../src/api/sdk/";
import { decrypt, loadAuth, retry } from "../src/api/utils";
import { AgentUnitTestConfiguration, tearDownAgents, unitTestSetup } from "./test-agent-setup-utils";
import { errorHelper } from "./test-utils";

const log = debug("mindconnect-agent-auth");
chai.should();

describe("Agent Auth Rotation", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        gateway: auth.gateway,
        basicAuth: decrypt(auth, "passkey.4.unit.test"),
        tenant: auth.tenant
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

    it("onboarding should be able to handle internet connection problems", async () => {
        let errors = 0;
        const scope = nock("https://southgate.eu1.mindsphere.io:443", { encodedQueryParams: true, allowUnmocked: true })
            .post("/api/agentmanagement/v3/register", {})
            .thrice()
            .reply(500, "Internal Server Error")
            .log((err: any) => console.log(err, ++errors));

        const agent = new MindConnectAgent(agentConfig);
        agent.should.not.be.undefined;
        const result = await retry(5, () => agent.OnBoard());
        errors.should.be.equal(3);
        result.should.be.equal(OnboardingStatus.StatusEnum.ONBOARDED);
        scope.done();
    });

    it.only("should be able to recover from a problem with key rotation.", async () => {
        const agent = new MindConnectAgent(agentConfig);
        agent.should.not.be.undefined;
        nock.cleanAll();
        if (!agent.IsOnBoarded()) await retry(5, () => agent.OnBoard());

        const responseA = JSON.stringify((agent as any)._configuration.response);
        await (agent as any).RotateKey();
        (agent as any)._configuration.response = JSON.parse(responseA);
        await (agent as any).RotateKey();

        const responseB = JSON.stringify((agent as any)._configuration.response);

        (agent as any)._configuration.response = JSON.parse(responseA);
        await (agent as any).RotateKey();
        await (agent as any).AquireToken();
        await (agent as any).AquireToken();
        await (agent as any).RenewToken();

        (agent as any)._configuration.response = JSON.parse(responseB);
        const errorShouldOccur = await errorHelper(() => (agent as any).RotateKey());
        errorShouldOccur.should.be.true;

        // fallback to old response for key rotation should always work
        // (agent as any)._configuration.response = JSON.parse(responseA);

        await agent.TryRecovery();

        await (agent as any).RotateKey();

        (agent as any)._configuration.response = { test: "XX" };

        await agent.TryRecovery();
        await agent.RenewToken();

        await (agent as any).SaveConfig();
    });

    it("should be able to store old keys", async () => {
        const agent = new MindConnectAgent(agentConfig);
        agent.should.not.be.undefined;
        nock.cleanAll();
        if (!agent.IsOnBoarded()) await retry(5, () => agent.OnBoard());

        await (agent as any).RotateKey();

        await (agent as any).RotateKey();

        await (agent as any).RotateKey();

        await (agent as any).RotateKey();

        await (agent as any).RotateKey();

        (agent as any)._configuration.recovery.length.should.be.equal(3);
    });

    it("should be able to handle errors in key rotation", async () => {
        const agent = new MindConnectAgent(agentConfig);
        agent.should.not.be.undefined;
        nock.cleanAll();
        if (!agent.IsOnBoarded()) await retry(5, () => agent.OnBoard());
        await retry(3, () => agent.RenewToken());
        let error = 0;
        const scope = nock("https://southgate.eu1.mindsphere.io:443", { encodedQueryParams: true, allowUnmocked: true })
            .put(`/api/agentmanagement/v3/register/${agent.ClientId()}`, {
                client_id: `${agent.ClientId()}`
            })
            .times(12)
            .reply(500, "Internal Server error")
            .log(err => {
                console.log(err, ++error);
            });

        const today = new Date();
        const yesterday = new Date(today);

        yesterday.setHours(today.getHours() + 1);

        ((agent as any)._configuration.response as ClientIdentifier).client_secret_expires_at = Math.trunc(
            yesterday.getTime() / 1000
        );

        await agent.RenewToken();
        await agent.RenewToken();
        await agent.RenewToken();
        error.should.be.equal(12);

        const token = await agent.GetAgentToken();
        token.should.not.be.undefined;
        token.should.not.be.null;
        token.should.not.be.equal("");
        scope.done();
    });

    it("should handle problems with certificate urls", async () => {
        const agent = new MindConnectAgent(agentConfig);
        agent.should.not.be.undefined;
        nock.cleanAll();

        if (!agent.IsOnBoarded()) await retry(5, () => agent.OnBoard());

        let error = 0;
        const scope = nock("https://southgate.eu1.mindsphere.io:443", { encodedQueryParams: true, allowUnmocked: true })
            .get(`/api/agentmanagement/v3/oauth/token_key`)
            .times(4)
            .reply(500, "Internal Server error")
            .log(msg => {
                console.log(msg, ++error);
            });

        await retry(2, () => agent.RenewToken());
        const token = await agent.GetAgentToken();
        error.should.be.equal(4);
        scope.done();
    });
});
