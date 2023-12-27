import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk, TrendPredictionModels } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { generateTestData } from "../src/cli/commands/command-utils";
import { getPasskeyForUnitTest } from "./test-utils";
chai.should();

describe.skip("[SDK] TrendPredictionClient", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });

    const trendPredictionClient = sdk.GetTrendPredictionClient();

    const data = generateTestData(
        50,
        (x) => {
            return x * 1.0;
        },
        "Temperature"
    );

    // the tests use  the simple polynomial function f(x) = x^2 -15x + 7
    // the trendprediction should be able to use the polynomial regression to find the polynomial which
    // was used to generate the data
    //
    // * https://www.wolframalpha.com/input/?i=x%5E2-15x%2B7
    //
    // for the simplicity we are only using single independent variable in the unit tests
    // * https://developer.mindsphere.io/apis/analytics-trendprediction/api-trendprediction-basics.html#polynomial-regression

    const powerOutputSensor = generateTestData(
        50,
        (x) => {
            return Math.pow(x, 2) - 15 * x + 7; // f(x) = x^2 -15x + 7; https://www.wolframalpha.com/input/?i=x%5E2-15x%2B7
        },
        "powerOutputSensor"
    );

    const trainingData: TrendPredictionModels.TrainBody = {
        modelConfiguration: {
            polynomialDegree: 2,
        },
        metadataConfiguration: {
            outputVariable: {
                entityId: "UnitTestTurbine1",
                propertySetName: "monitoringModule",
                propertyName: "powerOutputSensor",
            },
            inputVariables: [
                {
                    entityId: "UnitTestTurbine1",
                    propertySetName: "combustionSubpart1",
                    propertyName: "Temperature",
                },
            ],
        },
        trainingData: [
            {
                variable: {
                    entityId: "UnitTestTurbine1",
                    propertySetName: "monitoringModule",
                },
                timeSeries: powerOutputSensor,
            },
            {
                variable: {
                    entityId: "UnitTestTurbine1",
                    propertySetName: "combustionSubpart1",
                },
                timeSeries: data,
            },
        ],
    };

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
        trendPredictionClient.should.not.be.undefined;
    });

    it("SDK should train the model and predict the results in two separate steps", async () => {
        sdk.should.not.be.undefined;
        trendPredictionClient.should.not.be.undefined;

        const trainedModel = await trendPredictionClient.Train(trainingData);
        trainedModel.id!.should.not.be.undefined;
        // console.log(JSON.stringify(trainedModel, null, 2));

        const prediction: TrendPredictionModels.PredictBody = {
            modelConfiguration: { modelId: trainedModel.id },
            predictionData: [
                {
                    variable: {
                        entityId: "UnitTestTurbine1",
                        propertySetName: "combustionSubpart1",
                    },

                    timeSeries: [
                        {
                            _time: new Date().toISOString(),
                            Temperature: "4.0",
                        },
                        {
                            _time: new Date().toISOString(),
                            Temperature: "14.0",
                        },
                        {
                            _time: new Date().toISOString(),
                            Temperature: "-4.0",
                        },
                    ],
                },
            ],
        };

        const predictionResult = await trendPredictionClient.Predict(prediction);
        if (new Date() < new Date(2021, 5, 15)) {
            console.log("Skipping test until MindSphere fixes this.");
            return;
        }

        Math.round(predictionResult[0].timeSeries![0]!["powerOutputSensor"]).should.be.equal(-37); // f(x)=x*x -15x + 7 ;// https://www.wolframalpha.com/input/?i=x%5E2-15x%2B7%3B+x+%3D+4

        Math.round(predictionResult[0].timeSeries![1]!["powerOutputSensor"]).should.be.equal(-7); // f(x)=x*x -15x + 7 ;// https://www.wolframalpha.com/input/?i=x%5E2-15x%2B7%3B+x+%3D+14

        Math.round(predictionResult[0].timeSeries![2]!["powerOutputSensor"]).should.be.equal(83); // f(x)=x*x -15x + 7 ;// https://www.wolframalpha.com/input/?i=x%5E2-15x%2B7%3B+x+%3D+-4
    });

    it("SDK should train and predict in one step as well", async () => {
        sdk.should.not.be.undefined;
        trendPredictionClient.should.not.be.undefined;

        const prediction: TrendPredictionModels.PredictBody = {
            predictionData: [
                {
                    variable: {
                        entityId: "UnitTestTurbine1",
                        propertySetName: "combustionSubpart1",
                    },

                    timeSeries: [
                        {
                            _time: new Date().toISOString(),
                            Temperature: "4.0",
                        },
                        {
                            _time: new Date().toISOString(),
                            Temperature: "14.0",
                        },
                        {
                            _time: new Date().toISOString(),
                            Temperature: "-4.0",
                        },
                    ],
                },
            ],
        };

        const predictionResult = await trendPredictionClient.TrainAndPredict({
            ...trainingData,
            ...prediction,
        } as TrendPredictionModels.TrainPredictBody);

        if (new Date() < new Date(2021, 5, 15)) {
            console.log("Skipping test until MindSphere fixes this.");
            return;
        }
        Math.round(predictionResult[0].timeSeries![0]!["powerOutputSensor"]).should.be.equal(-37); // f(x)=x*x -15x + 7 ;// https://www.wolframalpha.com/input/?i=x%5E2-15x%2B7%3B+x+%3D+4

        Math.round(predictionResult[0].timeSeries![1]!["powerOutputSensor"]).should.be.equal(-7); // f(x)=x*x -15x + 7 ;// https://www.wolframalpha.com/input/?i=x%5E2-15x%2B7%3B+x+%3D+14

        Math.round(predictionResult[0].timeSeries![2]!["powerOutputSensor"]).should.be.equal(83); // f(x)=x*x -15x + 7 ;// https://www.wolframalpha.com/input/?i=x%5E2-15x%2B7%3B+x+%3D+-4
    });

    before(async () => {
        try {
            const models = await trendPredictionClient.GetModels({
                entityId: "UnitTestTurbine1",
            });
            // console.log(`Deleting ${models.length} model(s)`);
            models.should.not.be.undefined;
            for (const model of models) {
                await trendPredictionClient.DeleteModel(model.id!); // the id of the model is not optional!
            }
        } catch {}
    });
});
