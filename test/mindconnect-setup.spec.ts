// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import * as debug from "debug";
import "url-search-params-polyfill";
import { DataPoint, IMindConnectConfiguration, MindConnectAgent, MindConnectSetup } from "../src";
import { AgentManagementModels, MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { AgentUnitTestConfiguration, tearDownAgents, unitTestSetup } from "./test-agent-setup-utils";
import {} from "./test-utils";
const log = debug("mindconnect-setup-test");
chai.should();

describe("MindConnect Setup", () => {
    const auth = loadAuth();
    const gateway = auth.gateway;
    const tenant = auth.tenant;
    const basicAuth = decrypt(auth, "passkey.4.unit.test");

    const sdk = new MindSphereSdk({
        gateway: auth.gateway,
        basicAuth: decrypt(auth, "passkey.4.unit.test"),
        tenant: auth.tenant
    });

    let sharedSecretConfig: IMindConnectConfiguration = ({} as unknown) as IMindConnectConfiguration;
    let unitTestConfiguration: AgentUnitTestConfiguration = ({} as unknown) as AgentUnitTestConfiguration;

    before(async () => {
        unitTestConfiguration = await unitTestSetup(
            sdk,
            AgentManagementModels.AgentUpdate.SecurityProfileEnum.SHAREDSECRET
        );

        sharedSecretConfig = unitTestConfiguration.agentConfig as IMindConnectConfiguration;
    });
    after(async () => {
        await tearDownAgents(sdk, unitTestConfiguration);
    });

    it("should instantiate", () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        log(mcsetup);
        mcsetup.should.exist;
    });

    it("should throw an error with invalid setup", () => {
        chai.expect(() => new MindConnectSetup(gateway, "invalid setup", tenant)).to.throw(
            "You have to pass the basic authentication header"
        );
        chai.expect(() => new MindConnectSetup("not.an.url", basicAuth, tenant)).to.throw("the gateway must be an URL");
    });

    it("should acquire the public key for validation", async () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        const testObject = <any>mcsetup;
        testObject.should.exist;
        testObject.AcquirePublicKey.should.exist;
        await testObject.AcquirePublicKey();
        testObject._oauthResponse.should.exist;
        testObject._oauthResponse.keys[0].should.exist;
        testObject._oauthResponse.keys[0].value.should.exist;
        log(testObject._oauthResponse.keys[0].value);
    });

    it("should acquire token via basic auth", async () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        const testObject = <any>mcsetup;
        testObject.should.exist;
        testObject.AcquireToken.should.exist;
        await testObject.AcquireToken();
        testObject._accessToken.should.exist;
    });

    it("should validate token", async () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        const testObject = <any>mcsetup;
        testObject.should.exist;
        testObject.AcquireToken.should.exist;
        await testObject.AcquireToken();
        testObject.ValidateToken.should.exist;
        await testObject.ValidateToken();
        testObject._accessToken.should.exist;
    });

    it("should validate token also on certificate change", async () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        const testObject = <any>mcsetup;
        testObject.should.exist;
        testObject.AcquireToken.should.exist;
        await testObject.AcquireToken();
        testObject.ValidateToken.should.exist;
        // console.log(testObject._accessToken);
        await testObject.ValidateToken();
        testObject._accessToken.should.exist;

        // * This is an expired token which can't be used, signed with self-created certificate

        (<any>testObject)._accessToken.access_token =
            "eyJraWQiOiJrZXktaWQtMSIsImFsZyI6IlJTMjU2IiwidHlwIjoiSldUIn0.eyJqdGkiOiI1ZWJkODg4MGQyZGY0Yzg5OTQzMjIzYTRlYzU3N2FjMCIsInN1YiI6InNjcmVkXzAwMiIsInNjb3BlIjpbIm1kc3A6Y29yZTpBZG1pbjNyZFBhcnR5VGVjaFVzZXIiXSwiY2xpZW50X2lkIjoic2NyZWRfMDAyIiwiY2lkIjoic2NyZWRfMDAyIiwiYXpwIjoic2NyZWRfMDAyIiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInJldl9zaWciOiIxOGJjMDNlZSIsImlhdCI6MTU1NDE1NjcxNCwiZXhwIjoxNTU0MTU4NTE0LCJpc3MiOiJodHRwczovL2Nhc3RpZGV2LnBpYW0uZXUxLm1pbmRzcGhlcmUuaW8vb2F1dGgvdG9rZW4iLCJ6aWQiOiJjYXN0aWRldiIsImF1ZCI6WyJzY3JlZF8wMDIiXSwidGVuIjoiY2FzdGlkZXYiLCJzY2hlbWFzIjpbInVybjpzaWVtZW5zOm1pbmRzcGhlcmU6aWFtOnYxIl0sImNhdCI6ImNsaWVudC10b2tlbjp2MSJ9.hVQ1kR6YfET3EG39QcdVwZHZN0aYhMeBKNxBioIpMOlqDrfahzPsWqJn5-XdW9oBO-kxZe9TFr5Xtdj2w_WHqBWUySqtfGrUTA8fgxcEuWfzFBcRAptvy6gPONTW4xa8Rx_G1SghTLANfrCLeiQOElpImil__b_ijBuLlx1_NHj4wvRvDFE91lvnq0c_s_Izn0-aLzkIO9xfN0iYrK5e7qTSv_m0eDneLnpsNsTMwG-ThDauaLgsxyIJSnKtwn2r_7Vn5IVrX6VD_qe7APmTZPoEtFzDiq4sN3pEDeIlXMGFuEzv_GhYfrLHNMQxLMFisbZqQpDUzTkuCc_OBMlghCRN6T432AsE9-q9SCHk_fPvBvW6O1v2II9g_mh4znj7KswDua_PSKEIwcvlRrlS5gsT-5qJTClXwdw91DIUyYOWcgSh-YaFYBy6JjAhErXKR9sJJ9IgKbMgHtetGuGcV6eF--8tKfyVW98awVSLT9W_kz0QlV92fqLeZkNdJ-UcwCj1d9C6qbElBSpvJAlwQLmraJiewCJ2ZEtyM-9IPF4o5idltp9QiKB1YwKQKbF8LkSNYoXn2scfKjOl6LaVuI55S5_VhODPTramWqQljSBYBm-aYv7J1jzQqhfD9xz19QPZc3wrJANb7kvT1xWnll1Tc0JKGk01obv8fvG0B4c";

        let errorOccured = false;
        try {
            await (<any>testObject).ValidateToken();
        } catch (err) {
            err.name.should.be.equal("JsonWebTokenError");
            err.message.should.be.equal("invalid signature");
            errorOccured = true;
        }
        errorOccured.should.be.true;

        // * this is self-created certificate
        // ! The piam endpoint returns properly formated JWT (with CR LFs in proper place), unlike agent JWK endpoint
        testObject._oauthResponse.keys[0].value = `-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAsj2ULABiqDw3IMatCR8zpwTb3qIwkurNN8O+o9qrcjgsXUkXMYDuGMN5RlUeOkG6bOdQeQmvllnm7qJ00QFRamSaM9NTg3I9yGxUeQsddsb4PtMypeeq1jenoeswLFwK4p9dgZPbPfb/Oi+ymlBdb0HbTTzCufswcfZ/erFeQa9vEtaM1HRDEA4ZZyfDELkM17CjCpzKwfeHeZ6JSOYJ+a4yLy8viwU88PGQN6gcw6f3fUhnbMxqkN9Uyw/PmkD+cwNxSuOaFHZ9Q8gFmqnlu8NJNKIijMC2y1xQlSiK89Nos8rYgLPwMgREi8Kil5Ve5GSz3mdjsBR1P5DHNjoYNLBq4TpRweDdUYkQz82LSFgfhdvd/+tenk1vgYqCbViEKrKjO2+G0haT6x1a/9EZkv+yV9MI+f4XOoCZl1CWQE1fzntUUgT7a59NpGb4z9iVg30dAsAPNLE/qzx4X59SQt86H5xcKAyjqXeEbSVllqST+pGb/dEt1UqBjXPHn2UhacUCABzHlU1KaYTTrdGNzXsnof+GF4FyjPhcR77mi10q+sBb37ACcDxW07IwV5ddTCMOtG5zQo+cWqFHwNQlgqUMevbI6n6+g7OC774VLaMy2TdKfUUZRQowHetz1bBhWUY+iEjfxf1vR6IKJ7gJuUUeu4WxSiEQ0bbh0qRF8v0CAwEAAQ==\n-----END PUBLIC KEY-----`;

        errorOccured = false;
        try {
            await (<any>testObject).ValidateToken();
        } catch (err) {
            err.name.should.be.equal("TokenExpiredError");
            err.message.should.be.equal("jwt expired");
            errorOccured = true;
        }

        errorOccured.should.be.true;
    });

    it("should renew token", async () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        const result = await mcsetup.RenewToken();
        result.should.be.true;
    });

    it("should get diagnostics", async () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        const diag = await mcsetup.GetDiagnosticInformation();
        mcsetup.should.not.be.null;
        diag.content.should.not.be.undefined;
    });

    it("should get agent status", async () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        const agent = new MindConnectAgent(sharedSecretConfig);

        const agentStatus = await mcsetup.GetAgentStatus(agent.ClientId());
        agentStatus.should.not.be.undefined;
        agentStatus.since.should.not.be.undefined;
        agentStatus.status.toString().should.be.oneOf(["ONLINE", "OFFLINE"]);
    });

    it("should get agent boarding status", async () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        const agent = new MindConnectAgent(sharedSecretConfig);

        const boardingStatus = await mcsetup.GetBoardingStatus(agent.ClientId());

        boardingStatus.should.not.be.undefined;
        if (!boardingStatus.status) {
            throw new Error("invalid status");
        }
        boardingStatus.status.should.not.be.undefined;
        boardingStatus.status.should.be.equal("ONBOARDING");
    });

    it("should register 2 agents for diagnostics", async () => {
        if (!process.env.CI) {
            // don't delete all diagnostic registrations all the time on the CI/CD this can disturb the normal workings on the tenants.
            const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
            mcsetup.should.not.be.null;

            await mcsetup.DeleteAllDiagnosticActivations();

            try {
                await mcsetup.RegisterForDiagnostic("2903bf15381646d3a8f4aeeff8d9bd29");
                await mcsetup.RegisterForDiagnostic("68766a93af834984a8f8decfbeec961e");
            } catch (err) {
                if (("" + err).indexOf("agent limitation") < 0) {
                    throw err;
                }
            }
            const activations = await mcsetup.GetDiagnosticActivations();
            log(activations.content);
            activations.content.length.should.be.equal(2);
            await mcsetup.DeleteAllDiagnosticActivations();
        }
    });

    it("should get logs on error", async () => {
        if (!process.env.CI) {
            const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
            mcsetup.should.not.be.null;
            const agent = new MindConnectAgent(sharedSecretConfig);
            agent.should.exist;

            await mcsetup.DeleteAllDiagnosticActivations();

            try {
                const response = await mcsetup.RegisterForDiagnostic(agent.ClientId());
            } catch (err) {
                if (("" + err).indexOf("Conflict") < 0) {
                    throw err;
                }
            }
            if (!agent.IsOnBoarded()) {
                await agent.OnBoard();
            }
            await agent.PutDataSourceConfiguration({
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
                                unit: "°C"
                            }
                        ]
                    }
                ]
            });

            await agent.PostData(
                [{ dataPointId: "Unexistent", qualityCode: "123123135", value: "12312346.42.23" }],
                undefined,
                false
            );
            const diag = await mcsetup.GetDiagnosticInformation(agent.ClientId());
            diag.content.should.exist;
            let activations = await mcsetup.GetDiagnosticActivations();
            activations.content.length.should.be.greaterThan(0);
            await mcsetup.DeleteDiagnostic(agent.ClientId());
            activations = await mcsetup.GetDiagnosticActivations();
            activations.content.length.should.be.equal(0);
        }
    });
});
