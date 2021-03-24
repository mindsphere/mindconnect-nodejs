// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import * as debug from "debug";
import { it } from "mocha";
import * as nock from "nock";
import "url-search-params-polyfill";
import { ClientIdentifier, IMindConnectConfiguration, MindConnectAgent, OnboardingStatus } from "../src";
import { AgentManagementModels, MindSphereSdk } from "../src/api/sdk/";
import { decrypt, loadAuth, retry } from "../src/api/utils";
import { AgentUnitTestConfiguration, tearDownAgents, unitTestSetup } from "./test-agent-setup-utils";
import { errorHelper, getPasskeyForUnitTest } from "./test-utils";

const log = debug("mindconnect-agent-auth");
chai.should();

describe("Agent Auth Rotation", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });

    let agentConfig: IMindConnectConfiguration = ({} as unknown) as IMindConnectConfiguration;
    let unitTestConfiguration: AgentUnitTestConfiguration = ({} as unknown) as AgentUnitTestConfiguration;

    const southgateUrl = sdk.GetGateway().replace("gateway", "southgate");

    before(async () => {
        nock.cleanAll();
        unitTestConfiguration = await unitTestSetup(
            sdk,
            AgentManagementModels.AgentUpdate.SecurityProfileEnum.SHAREDSECRET
        );
        agentConfig = unitTestConfiguration.agentConfig as IMindConnectConfiguration;
    });

    after(async () => {
        await tearDownAgents(sdk, unitTestConfiguration);
    });

    it("should use correct url @sanity", async () => {
        southgateUrl.should.contain("southgate");
    });

    it("onboarding should be able to handle internet connection problems @sanity", async () => {
        // respond 3 times with internal server error before returning the correct response
        let errors = 0;
        const scope = (nock(`${southgateUrl}:443`, {
            encodedQueryParams: true,
            allowUnmocked: true,
        }) as any)
            .post("/api/agentmanagement/v3/register", {})
            .thrice()
            .reply(500, "Internal Server Error")
            .log(() => errors++);

        const agent = new MindConnectAgent(agentConfig);
        agent.should.not.be.undefined;

        // try 8 times so that we can be sure that the agent will get onboarded
        const result = await retry(8, () => agent.OnBoard());
        errors.should.be.equal(3);
        result.should.be.equal(OnboardingStatus.StatusEnum.ONBOARDED);
        scope.done();
    });

    it("should be able to recover from a problem with key rotation.", async () => {
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

        await agent.RenewToken();
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

        (agent as any)._configuration.recovery.length.should.be.equal(5);

        await (agent as any).RotateKey();

        (agent as any)._configuration.recovery.length.should.be.equal(5);
    });

    it("should be able to handle errors in key rotation", async () => {
        const agent = new MindConnectAgent(agentConfig);
        agent.should.not.be.undefined;
        nock.cleanAll();
        if (!agent.IsOnBoarded()) await retry(5, () => agent.OnBoard());
        await retry(3, () => (agent as any).RotateKey());
        await retry(3, () => agent.RenewToken());

        (agent as any)._configuration.recovery.length.should.be.greaterThan(1);

        let error = 0;
        const scope = (nock(`${southgateUrl}:443`, {
            encodedQueryParams: true,
            allowUnmocked: true,
        }) as any)
            .put(`/api/agentmanagement/v3/register/${agent.ClientId()}`, {
                client_id: `${agent.ClientId()}`,
            })
            .times(24)
            .reply(500, "Internal Server error")
            .log(() => {
                ++error;
            });

        const today = new Date();
        const inOneHour = new Date(today);

        inOneHour.setHours(today.getHours() + 1);

        ((agent as any)._configuration.response as ClientIdentifier).client_secret_expires_at = Math.trunc(
            inOneHour.getTime() / 1000
        );

        (agent as any)._configuration.response.client_secret = "broken";
        (agent as any)._configuration.response.registration_access_token = "broken";
        await agent.RenewToken();
        await agent.RenewToken();
        await agent.RenewToken();
        error.should.be.equal(24); // (5 + 3 failed recovery attempts) * 3
        scope.done();
        nock.cleanAll();

        (agent as any)._accessToken = undefined;

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
        const scope = (nock(`${southgateUrl}:443`, {
            encodedQueryParams: true,
            allowUnmocked: true,
        }) as any)
            .get(`/api/agentmanagement/v3/oauth/token_key`)
            .times(4)
            .reply(500, "Internal Server error")
            .log(() => ++error);

        await retry(2, () => agent.RenewToken());
        const token = await agent.GetAgentToken();
        token.should.not.be.undefined;
        token.length.should.be.greaterThan(10);
        error.should.be.equal(4);
        scope.done();
    });
});
