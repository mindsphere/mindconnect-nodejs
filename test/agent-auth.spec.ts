// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import * as debug from "debug";
import { it } from "mocha";
import * as nock from "nock";
import "url-search-params-polyfill";
import { IMindConnectConfiguration, MindConnectAgent, OnboardingStatus } from "../src";
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

    it.only("onboarding should be able to handle internet connection problems", async () => {
        let errors = 0;
        const scope = nock("https://southgate.eu1.mindsphere.io:443", { encodedQueryParams: true, allowUnmocked: true })
            .post("/api/agentmanagement/v3/register", {})
            .thrice()
            .reply(500, "Internal Server Error")
            .log(err => console.log(err, ++errors));

        const agent = new MindConnectAgent(agentConfig);
        agent.should.not.be.undefined;
        const result = await retry(5, async () => await agent.OnBoard());
        errors.should.be.equal(3);
        result.should.be.equal(OnboardingStatus.StatusEnum.ONBOARDED);
        scope.done();
    });

    it.only("should be able to recover from a problem with key rotation.", async () => {
        const agent = new MindConnectAgent(agentConfig);
        agent.should.not.be.undefined;

        if (!agent.IsOnBoarded()) {
            await retry(5, () => agent.OnBoard());
        }

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
        (agent as any)._configuration.response = JSON.parse(responseA);
        await (agent as any).RotateKey();
        await (agent as any).SaveConfig();
    });
});
