import * as chai from "chai";
import "url-search-params-polyfill";
import { ModelManagementClient, ModelManagementModels, MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest, sleep } from "./test-utils";
chai.should();

const timeOffset = new Date().getTime();
const futureTimeOffset = new Date( timeOffset + ( 1000 * 60 * 60 * 24));

describe("[SDK] ModelManagementClient.Models.Version", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const modelManagement = sdk.GetModelManagementClient();
    let mmModelId = "";

    const testModelDefinition: ModelManagementModels.Model = {
        name: "NN - Quasi Newton",
        description: "[Version] Newton using variable metrix methods",
        type: "Zeppelin notebook",
        lastVersion: {
            number: 1.0,
            expirationDate: "2099-10-01T12:00:00.001",
            dependencies: [{
              name: "sklearn-theano",
              type: "Python",
              version: "2.7"
            }],
            io: {
              consumes: "CSV",
              input: [{
                name: "variablename1",
                type: "integer",
                description: "description for variablename1",
                value: 5
              }],
              output: [{
                name: "outputname1",
                type: "integer",
                description: "description for outputname1",
                value: 1
              }],
              optionalParameters: {
                freeFormParams: "for the author to use",
                param1: "value1"
              }
            },
            kpi: [{
              name: "error rate",
              value: "0.9"
            }]
          }
    };

    const testModelVersionDefinition: ModelManagementModels.VersionDefinition = {
        number: 2.0,
        expirationDate: "2021-10-01T12:00:00.001",
        dependencies: [{
          name: "sklearn-theano",
          type: "Python",
          version: "2.7"
        }],
        io: {
          consumes: "CSV",
          input: [{
            name: "variablename1",
            type: "integer",
            description: "description for variablename1",
            value: 0
          }],
          output: [{
            name: "outputname1",
            type: "integer",
            description: "description for outputname1",
            value: 0
          }],
          optionalParameters: {
            freeFormParams: "for the author to use",
            param1: "value1"
          }
        },
        kpi: [{
          name: "error rate",
          value: "0.9"
        },
        {
            name: "mse",
            value: "0.01"
        }]
      };

    before(async () => {
        await deleteModels(modelManagement);
        testModelDefinition.name = `xyz_${timeOffset}_mm_A`;
        const result = await modelManagement.postModel(testModelDefinition,{buffer: Buffer.from("xyz"), fileName:`xyz${timeOffset}_mm_A.txt`, mimeType:'text/plain'} );
        mmModelId = `${result.id}`
    });

    after(async () => {
        await deleteModels(modelManagement);
    });

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it("standard properties shoud be defined", async () => {
        modelManagement.should.not.be.undefined;
        modelManagement.GetGateway().should.be.equal(auth.gateway);
        (await modelManagement.GetToken()).length.should.be.greaterThan(200);
        (await modelManagement.GetToken()).length.should.be.greaterThan(200);
    });

    it("should GET the last version of a model @sanity", async () => {
        modelManagement.should.not.be.undefined;
        const oVersion = await modelManagement.GetModelLastVersion(`${mmModelId}`);
        oVersion.should.not.be.undefined;
        oVersion.should.not.be.null;

        (oVersion as any).number.should.be.equals(`${1.0}`);
    });

    it("should GET all versions of a model", async () => {
        modelManagement.should.not.be.undefined;
        testModelDefinition.name = `xyz_${timeOffset}_mm_version_A`;
        const model = await modelManagement.postModel(testModelDefinition,{buffer: Buffer.from("xyz"), fileName:`xyz${timeOffset}_mm_version_A.txt`, mimeType:'text/plain'} );
        model.should.not.be.undefined;
        model.should.not.be.null;


        const versions = await modelManagement.GetModelVersions({            
            modelId: `${model.id}`,
            pageNumber: 0,
            pageSize: 100,
        });
        versions.should.not.be.undefined;
        versions.should.not.be.null;
        (versions as any).page.number.should.equal(0);
        (versions as any).page.size.should.be.equal(1);
        (versions as any).versions?.length.should.be.gte(0);

        model.should.not.be.null;
        await modelManagement.DeleteModel(`${model.id}`);
    });

    it("should GET specific version of a model ", async () => {
        modelManagement.should.not.be.undefined;
        const oVersion = await modelManagement.GetModelLastVersion(`${mmModelId}`);
        oVersion.should.not.be.undefined;
        oVersion.should.not.be.null;

        const sVersion = await modelManagement.GetModelVersion(`${mmModelId}`, `${oVersion.id}`);
        sVersion.should.not.be.undefined;
        sVersion.should.not.be.null;

        (sVersion as any).number.should.be.equals((oVersion as any).number)
    });

    it("should POST new version of a model", async () => {
        modelManagement.should.not.be.undefined;
        testModelVersionDefinition.expirationDate = futureTimeOffset.toISOString();

        const lastVersion = await modelManagement.postModelVersion(`${mmModelId}`,testModelVersionDefinition,{buffer: Buffer.from("xyz"), fileName:`xyz${timeOffset}_mm_version_B.txt`, mimeType:'text/plain'} );
        lastVersion.should.not.be.undefined;
        lastVersion.should.not.be.null;
        (lastVersion as any).id.should.not.be.undefined;
        (lastVersion as any).id.should.not.be.null;
        (lastVersion as any).number.should.not.be.undefined;
        (lastVersion as any).number.should.not.be.null;
        
        await modelManagement.DeleteModelVersion(`${mmModelId}`, `${(lastVersion as any).id}`);
    });

    it("should DELETE last version of a model", async () => {
        modelManagement.should.not.be.undefined;
        testModelDefinition.name = `xyz_${timeOffset}_mm_version_C`;
        const model = await modelManagement.postModel(testModelDefinition,{buffer: Buffer.from("xyz"), fileName:`xyz${timeOffset}_mm_version_C.txt`, mimeType:'text/plain'} );
        
        model.should.not.be.undefined;
        model.should.not.be.null;

        testModelVersionDefinition.expirationDate = futureTimeOffset.toISOString();
        const lastVersion = await modelManagement.postModelVersion(`${model.id}`,testModelVersionDefinition,{buffer: Buffer.from("xyz"), fileName:`xyz${timeOffset}_mm_version_D.txt`, mimeType:'text/plain'} );
        lastVersion.should.not.be.undefined;
        lastVersion.should.not.be.null;

        const modelVersions = await modelManagement.GetModelVersions({            
            modelId: `${model.id}`,
            pageNumber: 0,
            pageSize: 100,
        });
        modelVersions.should.not.be.undefined;
        modelVersions.should.not.be.null;

        await modelManagement.DeleteModelLastVersion(`${model.id}`);

        const newmodelVersions = await modelManagement.GetModelVersions({            
            modelId: `${model.id}`,
            pageNumber: 0,
            pageSize: 100,
        });
        newmodelVersions.should.not.be.undefined;
        newmodelVersions.should.not.be.null;

        (newmodelVersions as any).versions.length.should.be.equals((modelVersions as any).versions.length - 1);
        await modelManagement.DeleteModel(`${model.id}`);
    });

    it("should DELETE a specific version of a model", async () => {
        modelManagement.should.not.be.undefined;
        testModelDefinition.name = `xyz_${timeOffset}_mm_version_E`;
        const model = await modelManagement.postModel(testModelDefinition,{buffer: Buffer.from("xyz"), fileName:`xyz${timeOffset}_mm_version_E.txt`, mimeType:'text/plain'} );
        
        model.should.not.be.undefined;
        model.should.not.be.null;

        const oVersion = await modelManagement.GetModelLastVersion(`${model.id}`);
        oVersion.should.not.be.undefined;
        oVersion.should.not.be.null;

        testModelVersionDefinition.expirationDate = futureTimeOffset.toISOString();
        const lastVersion = await modelManagement.postModelVersion(`${model.id}`,testModelVersionDefinition,{buffer: Buffer.from("xyz"), fileName:`xyz${timeOffset}_mm_version_F.txt`, mimeType:'text/plain'} );
        lastVersion.should.not.be.undefined;
        lastVersion.should.not.be.null;

        await modelManagement.DeleteModelVersion(`${model.id}`,`${oVersion.id}`);

        const nVersion = await modelManagement.GetModelLastVersion(`${model.id}`);
        nVersion.should.not.be.undefined;
        nVersion.should.not.be.null;

        (nVersion as any).number.should.be.equals(`${2.0}`);
        await modelManagement.DeleteModel(`${model.id}`);
    });

    it("should PATCH specific version of a model without changing the model", async () => {
        modelManagement.should.not.be.undefined;

        testModelDefinition.name = `xyz_${timeOffset}_mm_version_G`;
        const oModel = await modelManagement.postModel(testModelDefinition,{buffer: Buffer.from("xyz"), fileName:`xyz${timeOffset}_mm_version_G.txt`, mimeType:'text/plain'} );
        
        oModel.should.not.be.undefined;
        oModel.should.not.be.null;

        const oVersion = await modelManagement.GetModelLastVersion(`${oModel.id}`);
        oVersion.should.not.be.undefined;
        oVersion.should.not.be.null;

        testModelVersionDefinition.expirationDate = futureTimeOffset.toISOString();
        const lastVersion = await modelManagement.PatchLastModelVersion(`${oModel.id}`,testModelVersionDefinition);
        lastVersion.should.not.be.undefined;
        lastVersion.should.not.be.null;

        const nVersion = await modelManagement.GetModelLastVersion(`${oModel.id}`);
        nVersion.should.not.be.undefined;
        nVersion.should.not.be.null;

        (nVersion as any).number.should.be.equals(`${2.0}`);
        (nVersion as any).number.should.not.be.equals((oVersion as any).number);

        const nModel = await modelManagement.GetModel(`${oModel.id}`);
        nModel.should.not.be.undefined;
        nModel.should.not.be.null;

        (nModel as any).id.should.be.equals((oModel as any).id);
        (nModel as any).name.should.be.equals((oModel as any).name);
        (nModel as any).description.should.be.equals((oModel as any).description);

        await modelManagement.DeleteModel(`${oModel.id}`);
    });    
});

async function deleteModels(mm: ModelManagementClient) {
    await sleep(2000);
    const models = (await mm.GetModels({
        filter: JSON.stringify({
            name: "xyz\*",
        }),
        sort: "desc",
        pageNumber: 0,
        pageSize: 1,
    })) as any;
    await sleep(2000);
    for (const x of models.models) {
        await mm.DeleteModel(x.id);
    }
}
