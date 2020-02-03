import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { TrendPredictionModels } from "./trend-prediction-models";

/**
 * Predicts future values for time series using linear and nonlinear regression models.
 * Models can be of univariable input, e.g. f(x) or f(t), or of multivariable input,
 * e.g. f(t, x1, x2, …).
 *
 * @export
 * @class TrendPredictionClient
 * @extends {SdkClient}
 */
export class TrendPredictionClient extends SdkClient {
    private _baseUrl = "/api/trendprediction/v3";

    /**
     * Fits a regression model on the training dataset, storing the trained regression model in a database.
     *
     * @param {TrendPredictionModels.TrainBody} modelData
     * * Data structure with three parts - modelConfiguration, metadataConfiguration, and trainingData.
     *
     * * modelConfiguration
     * contains the information necessary for configuring the regression model to be trained (e.g., the degree of a polynomial in case of polynomial regression).
     *
     * * metadataConfiguration
     * specifies which variables are the input variables (regressors), and which one is the output variable (regressand) of the regression model.
     * In order to specify time as one of the input variables, set propertyName equal to timestamp
     *
     * * trainingtData
     * contains the time series data that will be used for model training the regression model.
     * It should contain the values for all variables specified under metadataConfiguration.
     *
     *
     * @returns {Promise<TrendPredictionModels.ModelDto>}
     *
     * @memberOf TrendPredictionClient
     */
    public async Train(modelData: TrendPredictionModels.TrainBody): Promise<TrendPredictionModels.ModelDto> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/train`,
            body: modelData
        });
        return result as TrendPredictionModels.ModelDto;
    }

    /**
     * Predicts future values of a given output variable using a pre-trained regression model.
     *
     * @param {TrendPredictionModels.PredictBody} modelData
     *
     * * Data structure with two parts - modelConfiguration and predictionData.
     *
     * * modelConfiguration
     * contains the information necessary to identify the pre-trained regression model (i.e., modelId).
     * * predictionData
     * contains the values of the input variables used by the pre-trained regression model. Note that it is necessary to include the values
     * for all of the input variables specified under metadataConfiguration at the training step.
     * The example below assumes the two input variables that were used to train the regression model are
     *
     * @example
     * [entityId: turbine1, propertySet: combustionSubpart1, property: pressure],
     * [entityId: turbine1, propertySet: combustionSubpart1, property: temperature].
     * @returns {Promise<TrendPredictionModels.PredictionDataArray>}
     *
     * @memberOf TrendPredictionClient
     */
    public async Predict(
        modelData: TrendPredictionModels.PredictBody
    ): Promise<TrendPredictionModels.PredictionDataArray> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/predict`,
            body: modelData
        });
        return result as TrendPredictionModels.PredictionDataArray;
    }

    /**
     * Fits a regression model on the training dataset and predicts future values of a given output variable using the trained regression model
     *
     * @param {TrendPredictionModels.TrainPredictBody} modelData
     *
     * * Data structure with four parts - modelConfiguration, metadataConfiguration, trainingData, and predictionData.
     *
     * * modelConfiguration
     * contains the information necessary for configuring the regression model to be trained (e.g., the degree of a polynomial in case of polynomial regression)
     * *metadataConfiguration
     * specifies which variables are the input variables (regressors), and which one is the output variable (regressand) of the regression model.
     * In order to specify time as one of the input variables, set propertyName equal to timestamp.
     * * trainingData
     * contains the time series data that will be used for model training the regression model.
     * It should contain the values for all variables specified under metadataConfiguration.
     * *predictionData
     * contains the values of the input variables used by the pre-trained regression model.
     * Note that it is necessary to include the values for all of the input variables specified under metadataConfiguration at the training step.
     *
     * @returns {Promise<TrendPredictionModels.PredictionDataArray>}
     *
     * @memberOf TrendPredictionClient
     */
    public async TrainAndPredict(
        modelData: TrendPredictionModels.TrainPredictBody
    ): Promise<TrendPredictionModels.PredictionDataArray> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/trainAndPredict`,
            body: modelData
        });
        return result as TrendPredictionModels.PredictionDataArray;
    }

    /**
     * Retrieves all trained regression models for a given entity.
     *
     * @param {({
     *       entityId: string;
     *       sort?: "asc" | "desc";
     *     })} [optional={ entityId: "*", sort: "asc" }]
     * @returns {Promise<TrendPredictionModels.ModelDto[]>}
     *
     * * entityid
     * Entity to get the regression models for.
     * * sort
     * Sorts the regression models by creation timestamp (ascending/descending).
     * Available values : asc, desc
     *
     * @memberOf TrendPredictionClient
     */
    public async GetModels(
        optional: {
            entityId: string;
            sort?: "asc" | "desc";
        } = { entityId: "*", sort: "asc" }
    ): Promise<TrendPredictionModels.ModelDto[]> {
        const qs = toQueryString(optional);

        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models?${qs}`,
            message: "GetModels"
        })) as TrendPredictionModels.ModelDto[];
    }

    /**
     * Retrieves a regression model using the corresponding ID.
     *
     * @param {string} id
     * * Id of the regression model.
     * @returns {Promise<TrendPredictionModels.ModelDto>}
     *
     * @memberOf TrendPredictionClient
     */
    public async GetModel(id: string): Promise<TrendPredictionModels.ModelDto> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models/${id}`,
            message: "GetModel"
        })) as TrendPredictionModels.ModelDto;
    }

    /**
     * Deletes a regression model using the corresponding ID.
     *
     * @param {string} id
     * * Id of the regression model.
     *
     * @returns
     *
     * @memberOf TrendPredictionClient
     */
    public async DeleteModel(id: string) {
        return await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models/${id}`,
            message: "DeleteModel",
            noResponse: true
        });
    }
}
