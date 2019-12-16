import * as chai from "chai";
import {
  AgentManagementModels,
  AssetManagementModels,
  MindSphereSdk
} from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
chai.should();

const timeOffset = new Date().getTime();

describe("[SDK] AgentManagementClient", () => {
  const auth = loadAuth();
  const sdk = new MindSphereSdk({
    basicAuth: decrypt(auth, "passkey.4.unit.test"),
    tenant: auth.tenant,
    gateway: auth.gateway
  });
  const assetMgmt = sdk.GetAssetManagementClient();
  const agentMgmt = sdk.GetAgentManagementClient();
  let testAssetId: string, testAgentId: string;

  const testAgent: AgentManagementModels.Agent = {
    name: "",
    securityProfile:
      AgentManagementModels.AgentUpdate.SecurityProfileEnum.SHAREDSECRET,
    entityId: ""
  };
  // const test asset :
  const testAsset: AssetManagementModels.Asset = {
    name: `UnitTestShip_${timeOffset}`,
    externalId: "SN 123456-123-123456",
    description: "The ship of Han Solo and Chewbacca",
    location: {
      country: "Austria",
      region: "Tyrol",
      locality: "Innsbruck",
      streetAddress: "Industriestraße 21 A/II",
      postalCode: "6020",
      longitude: 53.5125546,
      latitude: 9.9763411
    },
    variables: [],
    aspects: [],
    fileAssignments: [],
    typeId: `core.mclib`,
    timezone: "Europe/Berlin",
    twinType: AssetManagementModels.TwinType.Performance
  };

  before(async () => {
    testAsset.parentId = (await assetMgmt.GetRootAsset()).assetId;
    const result = await assetMgmt.PostAsset(testAsset);
    testAssetId = `${result.assetId}`;
    testAgent.name = testAgent.entityId = testAssetId;

    const agent = await agentMgmt.PostAgent(testAgent);
    testAgentId = `${agent.id}`;
  });
  after(async () => {
    await deleteAgents();
  });

  it("SDK should not be undefined", async () => {
    sdk.should.not.be.undefined;
  });

  it("standard properties shoud be defined", async () => {
    agentMgmt.should.not.be.undefined;
    agentMgmt.GetGateway().should.be.equal(auth.gateway);
    (await agentMgmt.GetToken()).length.should.be.greaterThan(200);
    (await agentMgmt.GetServiceToken()).length.should.be.greaterThan(200);
  });

  it("should GET agent(s)", async () => {
    agentMgmt.should.not.be.undefined;
    const agents = await agentMgmt.GetAgents({ size: 10 });
    agents.should.not.be.undefined;
    agents.should.not.be.null;
    agents.totalElements.should.be.greaterThan(0);
    agents.size.should.be.lessThan(11);
  });

  it("should GET agent(s) with filter", async () => {
    agentMgmt.should.not.be.undefined;
    const agents = await agentMgmt.GetAgents({
      filter: JSON.stringify({
        and: {
          id: { startsWith: testAgentId }
        }
      })
    });
    agents.should.not.be.undefined;
    agents.should.not.be.null;
    agents.totalElements.should.equal(1);
  });

  it("should GET agent(s) with sorting", async () => {
    agentMgmt.should.not.be.undefined;
    const agents = await agentMgmt.GetAgents({
      filter: JSON.stringify({
        and: {
          name: { startsWith: "1" },
          id: { startsWith: "1" }
        }
      }),
      sort: "entityId,DESC"
    });

    agents.should.not.be.undefined;
    agents.should.not.be.null;
  });

  it("should GET specific agent ", async () => {
    agentMgmt.should.not.be.undefined;
    const agent = await agentMgmt.GetAgent(testAssetId);
    agent.should.not.be.undefined;
  });

  it("should PUT specific agent ", async () => {
    const agent = await agentMgmt.GetAgent(testAgentId);
    agent.securityProfile =
      AgentManagementModels.AgentUpdate.SecurityProfileEnum.SHAREDSECRET;
    const { securityProfile } = agent;

    const newName = `UnitTest${new Date().getTime()}`;

    const patchedAgent = await agentMgmt.PutAgent(
      testAgentId,
      { name: newName, securityProfile },
      { ifMatch: `${agent.eTag}` }
    );

    patchedAgent.name.should.equal(newName);
    patchedAgent.securityProfile.should.equal("SHARED_SECRET");
  });

  async function deleteAgents() {
    if (testAgentId) {
      const agent = await agentMgmt.GetAgent(testAgentId);
      await agentMgmt.DeleteAgent(testAgentId, { ifMatch: `${agent.eTag}` });

      await assetMgmt.DeleteAsset(testAssetId, { ifMatch: `0` });
    }
  }
});
