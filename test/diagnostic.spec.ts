import * as chai from "chai";
import * as debug from "debug";
import "url-search-params-polyfill";
import { DataPoint, IMindConnectConfiguration, MindConnectAgent } from "../src";
import { AgentManagementModels, MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { AgentUnitTestConfiguration, tearDownAgents, unitTestSetup } from "./test-agent-setup-utils";
import {} from "./test-utils";
const log = debug("mindconnect-setup-test");
chai.should();

describe("[SDK] Diagnostic API tests", () => {
    const auth = loadAuth();

    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, "passkey.4.unit.test"),
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
        const mcApiClient = sdk.GetMindConnectApiClient();
        log(mcApiClient);
        mcApiClient.should.exist;
    });

    it("should register 2 agents for diagnostics", async () => {
        if (!process.env.CI) {
            // don't delete all diagnostic registrations all the time on the CI/CD this can disturb the normal workings on the tenants.
            const mcApiClient = sdk.GetMindConnectApiClient();
            mcApiClient.should.not.be.null;

            await mcApiClient.DeleteAllDiagnosticActivations();

            try {
                await mcApiClient.PostDiagnosticActivation(sharedSecretConfig.content.clientId!);
            } catch (err) {
                if (("" + err).indexOf("agent limitation") < 0) {
                    throw err;
                }
            }
            const activations = await mcApiClient.GetDiagnosticActivations();
            log(activations.content);
            activations.content.length.should.be.equal(1);
            await mcApiClient.DeleteAllDiagnosticActivations();
        }
    });

    it("should get logs on error", async () => {
        if (!process.env.CI) {
            const mcApiClient = sdk.GetMindConnectApiClient();
            mcApiClient.should.not.be.null;
            const agent = new MindConnectAgent(sharedSecretConfig);
            agent.should.exist;

            await mcApiClient.DeleteAllDiagnosticActivations();

            try {
                const response = await mcApiClient.PostDiagnosticActivation(agent.ClientId());
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
                                unit: "°C",
                            },
                        ],
                    },
                ],
            });

            await agent.PostData(
                [
                    {
                        dataPointId: "Unexistent",
                        qualityCode: "123123135",
                        value: "12312346.42.23",
                    },
                ],
                undefined,
                false
            );
            const diag = await mcApiClient.GetDiagnosticActivationMessages(agent.ClientId());
            diag.content.should.exist;
            let activations = await mcApiClient.GetDiagnosticActivations();
            activations.content.length.should.be.greaterThan(0);
            await mcApiClient.DeleteDiagnosticActivation(agent.ClientId());
            activations = await mcApiClient.GetDiagnosticActivations();
            activations.content.length.should.be.equal(0);
        }
    });
});
