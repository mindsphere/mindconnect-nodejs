import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk, ModelManagementClient, ModelManagementModels } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest, sleep } from "./test-utils";
chai.should();

const timeOffset = new Date().getTime();

describe.skip("[SDK] ModelManagementClient.Models", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const modelManagement = sdk.GetModelManagementClient();
    let mmModelId = "";

    const testModelDefinition: ModelManagementModels.Model = {
        name: "NN - Quasi Newton",
        description: "[Model] Newton using variable metrix methods",
        type: "Zeppelin notebook",
        lastVersion: {
            number: 1.0,
            expirationDate: "2099-10-01T12:00:00.001",
            dependencies: [
                {
                    name: "sklearn-theano",
                    type: "Python",
                    version: "2.7",
                },
            ],
            io: {
                consumes: "CSV",
                input: [
                    {
                        name: "variablename1",
                        type: "integer",
                        description: "description for variablename1",
                        value: 5,
                    },
                ],
                output: [
                    {
                        name: "outputname1",
                        type: "integer",
                        description: "description for outputname1",
                        value: 1,
                    },
                ],
                optionalParameters: {
                    freeFormParams: "for the author to use",
                    param1: "value1",
                },
            },
            kpi: [
                {
                    name: "error rate",
                    value: "0.9",
                },
            ],
        },
    };

    before(async () => {
        await deleteModels(modelManagement);
        testModelDefinition.name = `xyz_${timeOffset}_mm_A`;
        const result = await modelManagement.PostModel(testModelDefinition, {
            buffer: Buffer.from("xyz"),
            fileName: `xyz${timeOffset}_mm_A.txt`,
            mimeType: "text/plain",
        });
        mmModelId = `${result.id}`;
        testModelDefinition.name = `xyz_${timeOffset}_mm_B`;
        await modelManagement.PostModel(testModelDefinition, {
            buffer: Buffer.from("xyz"),
            fileName: `xyz${timeOffset}_mm_B.txt`,
            mimeType: "text/plain",
        });
        testModelDefinition.name = `xyz_${timeOffset}_mm_C`;
        await modelManagement.PostModel(testModelDefinition, {
            buffer: Buffer.from("xyz"),
            fileName: `xyz${timeOffset}_mm_C.txt`,
            mimeType: "text/plain",
        });
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

    it("should GET model(s) @sanity", async () => {
        modelManagement.should.not.be.undefined;
        const models = await modelManagement.GetModels();
        models.should.not.be.undefined;
        models.should.not.be.null;
        (models as any).page.number.should.equal(0);
        (models as any).page.size.should.be.gte(1);
    });

    it("should POST specific model", async () => {
        modelManagement.should.not.be.undefined;
        testModelDefinition.name = `xyz_${timeOffset}_mm_D`;
        const model = await modelManagement.PostModel(testModelDefinition, {
            buffer: Buffer.from("xyz"),
            fileName: `xyz${timeOffset}_mm_D.txt`,
            mimeType: "text/plain",
        });
        model.should.not.be.null;
        await modelManagement.DeleteModel(`${model.id}`);
    });

    it("should POST specific model of 8 mb 1byte large file", async () => {
        modelManagement.should.not.be.undefined;
        testModelDefinition.name = `xyz_${timeOffset}_8mb_D`;
        const model = await modelManagement.PostModel(testModelDefinition, {
            buffer: Buffer.alloc(8 * 1024 * 1024 + 1),
            fileName: `xyz${timeOffset}_mm_8mb_D.txt`,
            mimeType: "text/plain",
        });
        model.should.not.be.null;
        await modelManagement.DeleteModel(`${model.id}`);
    });

    it("should POST specific model of 16 mb 1byte large file", async () => {
        modelManagement.should.not.be.undefined;
        testModelDefinition.name = `xyz_${timeOffset}_16mb_D`;
        const model = await modelManagement.PostModel(testModelDefinition, {
            buffer: Buffer.alloc(16 * 1024 * 1024 + 1),
            fileName: `xyz${timeOffset}_mm_16mb_D.txt`,
            mimeType: "text/plain",
        });
        model.should.not.be.null;
        await modelManagement.DeleteModel(`${model.id}`);
    });

    it("should POST specific model of 0 byte large file", async () => {
        modelManagement.should.not.be.undefined;
        testModelDefinition.name = `xyz_${timeOffset}_0b_D`;
        const model = await modelManagement.PostModel(testModelDefinition, {
            buffer: Buffer.alloc(0),
            fileName: `xyz${timeOffset}_mm_0b_D.txt`,
            mimeType: "text/plain",
        });
        model.should.not.be.null;
        await modelManagement.DeleteModel(`${model.id}`);
    });

    it("should GET specific model  @sanity", async () => {
        modelManagement.should.not.be.undefined;

        const model = await modelManagement.GetModel(mmModelId);
        model.should.not.be.undefined;
    });

    it("should PATCH specific model", async () => {
        modelManagement.should.not.be.undefined;
        testModelDefinition.name = `xyz_${timeOffset}_mm_E`;
        const model = await modelManagement.PostModel(testModelDefinition, {
            buffer: Buffer.from("xyz"),
            fileName: `xyz${timeOffset}_mm_E.txt`,
            mimeType: "text/plain",
        });

        model.description = "Newton using variable metrix methods - Autotest update.";
        const patchedModel = await modelManagement.PatchModel(`${model.id}`, {
            description: model.description,
        });

        patchedModel.should.not.be.null;
        (patchedModel as any).description.should.be.equal("Newton using variable metrix methods - Autotest update.");

        model.should.not.be.null;
        await modelManagement.DeleteModel(`${model.id}`);
    });

    it("should DELETE specific model", async () => {
        modelManagement.should.not.be.undefined;
        testModelDefinition.name = `xyz_${timeOffset}_mm_F`;
        const model = await modelManagement.PostModel(testModelDefinition, {
            buffer: Buffer.from("xyz"),
            fileName: `xyz${timeOffset}_mm_F.txt`,
            mimeType: "text/plain",
        });

        model.should.not.be.null;
        await modelManagement.DeleteModel(`${model.id}`);
    });
});

async function deleteModels(mm: ModelManagementClient) {
    await sleep(2000);
    const models = (await mm.GetModels({
        filter: JSON.stringify({
            name: "xyz*",
        }),
        sort: "desc",
        pageNumber: 0,
        pageSize: 1,
    })) as any;
    await sleep(3000);
    for (const x of models.models) {
        await mm.DeleteModel(x.id);
    }
}
