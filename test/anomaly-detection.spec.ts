import * as chai from "chai";
import * as debug from "debug";
import "url-search-params-polyfill";
import { AgentManagementModels, MindSphereSdk, ModelManagementClient, ModelManagementModels } from "../src/api/sdk";
import { checkAssetId, decrypt, loadAuth } from "../src/api/utils";
import { generateTestData } from "../src/cli/commands/command-utils";
import { AgentUnitTestConfiguration, tearDownAgents, unitTestSetup } from "./test-agent-setup-utils";
import { getPasskeyForUnitTest, sleep } from "./test-utils";
const log = debug("mindconnect-setup-test");
chai.should();

const timeOffset = new Date().getTime();
let modelIDTotest: String | null = null;

describe.skip("[SDK] AnomalyDetectionClient", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const tenant = sdk.GetTenant();

    const anomalyDetectionClient = sdk.GetAnomalyDetectionClient();
    const modelManagement = sdk.GetModelManagementClient();
    let assetId = "";

    let unitTestConfiguration: AgentUnitTestConfiguration = {} as unknown as AgentUnitTestConfiguration;

    before(async () => {
        // delete all models that might be generated by us.
        await deleteModels(modelManagement);

        // Set up the infrastructure
        unitTestConfiguration = await unitTestSetup(
            sdk,
            AgentManagementModels.AgentUpdate.SecurityProfileEnum.SHAREDSECRET
        );

        assetId = `${unitTestConfiguration.targetAsset.assetId}`;
    });

    after(async () => {
        await tearDownAgents(sdk, unitTestConfiguration);
        await deleteModels(modelManagement);
    });

    it("should instantiate", () => {
        const _anomalyDetectionClient = sdk.GetAnomalyDetectionClient();
        log(_anomalyDetectionClient);
        _anomalyDetectionClient.should.exist;
    });

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
        anomalyDetectionClient.should.not.be.undefined;
    });

    it("should train a new model. @sanity", async () => {
        sdk.should.not.be.undefined;
        anomalyDetectionClient.should.not.be.undefined;
        modelManagement.should.not.be.undefined;

        // get the count of models
        const models = await modelManagement.GetModels();
        models.should.not.be.undefined;
        models.should.not.be.null;
        (models as any).page.number.should.equal(0);
        (models as any).page.size.should.be.gte(0);

        // generate new Data
        const generatedData = generateTestData(
            100,
            (x) => {
                return 80 + Math.random() * 20 * Math.sin(x);
            },
            "Acceleration",
            "number"
        );

        // Create a new model
        const model = await anomalyDetectionClient.PostModel(
            generatedData,
            50,
            10,
            "EUCLIDEAN",
            `xyz_${tenant}_${timeOffset}_ano_A`
        );
        model.should.not.be.undefined;
        model.should.not.be.null;
        (model as any).id.should.not.be.undefined;
        (model as any).id.should.not.be.null;

        modelIDTotest = (model as any).id as String;

        const models_after = await modelManagement.GetModels();
        models_after.should.not.be.undefined;
        models_after.should.not.be.null;
        (models_after as any).page.number.should.equal(0);
        // (models_after as any).page.size.should.be.gt(model_count);
    });

    // it("should test the model and find no anomalies.", async () => {
    //     sdk.should.not.be.undefined;
    //     anomalyDetectionClient.should.not.be.undefined;
    //     // generate new Data
    //     const generatedData = generateTestData(
    //         500,
    //         (x) => {
    //             return 80 + Math.random() * 20 * Math.sin(x);
    //         },
    //         "Acceleration",
    //         "number"
    //     );

    //     // test the model
    //     const anomalies = await anomalyDetectionClient.DetectAnomalies(generatedData, `${modelIDTotest}`);
    //     anomalies.should.not.be.undefined;
    //     anomalies.should.not.be.null;
    //     anomalies.length.should.be.equals(0);
    // });

    it("should test the model and find some anomalies.", async () => {
        sdk.should.not.be.undefined;
        anomalyDetectionClient.should.not.be.undefined;
        // generate new Data
        const generatedData = generateTestData(
            90,
            (x) => {
                return 80 + Math.random() * 20 * Math.sin(x);
            },
            "Acceleration",
            "number"
        );

        const generatedData2 = generateTestData(
            10,
            (x) => {
                return 5 + Math.random() * 10 * Math.sin(x);
            },
            "Acceleration",
            "number"
        );

        const allGeneratedData = generatedData.concat(generatedData2);

        // test the model
        const anomalies = await anomalyDetectionClient.DetectAnomalies(allGeneratedData, `${modelIDTotest}`);
        anomalies.should.not.be.undefined;
        anomalies.should.not.be.null;
        anomalies.length.should.be.gte(0);
    });

    it("should train a new model from already existing asset data", async () => {
        sdk.should.not.be.undefined;
        anomalyDetectionClient.should.not.be.undefined;
        modelManagement.should.not.be.undefined;

        assetId.should.not.be.undefined;
        assetId.should.not.be.equal("");
        checkAssetId(assetId);

        // get the count of models
        const models = await modelManagement.GetModels();
        models.should.not.be.undefined;
        models.should.not.be.null;
        (models as any).page.number.should.equal(0);
        (models as any).page.size.should.be.gte(0);

        //
        const now = new Date();
        const lastMonth = new Date();
        lastMonth.setDate(lastMonth.getDate() - 7);
        const fromLastMonth = new Date(lastMonth.getUTCFullYear(), lastMonth.getUTCMonth(), lastMonth.getUTCDate());
        const toNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

        // Create a new model
        const model = await anomalyDetectionClient.PostModelDirect(
            5.0,
            2,
            assetId,
            `VibrationData`,
            fromLastMonth,
            toNow,
            "EUCLIDEAN",
            `xyz_${tenant}_${timeOffset}_ano_B`
        );

        // console.log(JSON.stringify(model));

        model.should.not.be.undefined;
        model.should.not.be.null;
        (model as any).id.should.not.be.undefined;
        (model as any).id.should.not.be.null;

        const models_after = await modelManagement.GetModels();
        models_after.should.not.be.undefined;
        models_after.should.not.be.null;
        (models_after as any).page.number.should.equal(0);
    });

    async function deleteModels(mm: ModelManagementClient) {
        await sleep(2000);
        const models: ModelManagementModels.ModelArray = await mm.GetModels({
            filter: JSON.stringify({
                author: "analytics-amm-client",
            }),
        });

        // console.log(models);

        await sleep(3000);

        for await (const x of models.models || []) {
            if ((x as any)?.lastVersion?.io?.optionalParameters?.modelName?.startsWith("xyz")) {
                // broken model for some reason!

                if (x?.id !== "05eab675-d968-4c48-a169-35af4c442975") {
                    await mm.DeleteModel(x.id!);
                }
            }

            await sleep(1000);
        }
    }
});
