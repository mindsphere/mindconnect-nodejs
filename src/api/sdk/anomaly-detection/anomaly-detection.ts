import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { AnomalyDetectionModels } from "./anomaly-detection-models";

/**
 * Service for configuring, reading and managing assets, asset ~ and aspect types.
 *
 * @export
 * @class AssetManagementClient
 * @extends {SdkClient}
 */
export class AnomalyDetectionClient extends SdkClient {
    private _baseUrl: string = "/api/anomalydetection/v3";

    /**
     * Creates new model based on given timeseries data. Analytic Model Management service is used to store created model.
     * @summary Train model
     * @param {Array<Timeseries>} ioTTimeSeriesItems An array containing the time series items. Data to train a model. Data must contain 10 variables at max. Each timeseries item must have equal number of variables.
     * @param {number} epsilon Threshold for the distance to check if point belongs to cluster.
     * @param {number} minPointsPerCluster Minimum cluster size. Positive. Minimum is 2.
     * @param {'EUCLIDEAN' | 'MANHATTAN' | 'CHEBYSHEV'} [distanceMeasureAlgorithm] Name of the distance measure algorithm.
     * @param {string} [name] Human-friendly name of the model. If a name is provided, it must not be an empty string. Maximum length is 255 characters. Only ASCII characters are allowed. Example &#39;Test Model
     * @returns {Array<AnomalyDetectionModels.Timeseries>}
     * @throws {AnomalyDetectionModels.RequiredError}
     * @memberof AnomalyDetectionClient
     */
     public async modelsPost(
         ioTTimeSeriesItems: Array<AnomalyDetectionModels.Timeseries>, 
         epsilon: number, 
         minPointsPerCluster: number, 
         distanceMeasureAlgorithm?: 'EUCLIDEAN' | 'MANHATTAN' | 'CHEBYSHEV', 
         name?: string
    ): Promise<AnomalyDetectionModels.Model> {
        // verify required parameter 'ioTTimeSeriesItems' is not null or undefined
        if (ioTTimeSeriesItems === null || ioTTimeSeriesItems === undefined) {
            throw new AnomalyDetectionModels.RequiredError('ioTTimeSeriesItems','Required parameter ioTTimeSeriesItems was null or undefined when calling modelsPost.');
        }
        // verify required parameter 'epsilon' is not null or undefined
        if (epsilon === null || epsilon === undefined) {
            throw new AnomalyDetectionModels.RequiredError('epsilon','Required parameter epsilon was null or undefined when calling modelsPost.');
        }
        // verify required parameter 'minPointsPerCluster' is not null or undefined
        if (minPointsPerCluster === null || minPointsPerCluster === undefined) {
            throw new AnomalyDetectionModels.RequiredError('minPointsPerCluster','Required parameter minPointsPerCluster was null or undefined when calling modelsPost.');
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models?${toQueryString({epsilon, minPointsPerCluster, distanceMeasureAlgorithm, name})}`,
            body: ioTTimeSeriesItems || {},
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as AnomalyDetectionModels.Model;
    }

    /**
     * Performs anomaly detection for given timeseries data against specified model.
     * @summary Anomaly detection
     * @param {Array<AnomalyDetectionModels.Timeseries>} ioTTimeSeriesItems An array containing the time series items. Data to performs detection on. Data must contain 10 variables at max. Each timeseries item must have equal number of variables. Variables must be the same as the ones used to train the model (the same number of variables and the same names).
     * @param {string} modelID ID of the model to use.
     * @returns {Promise<Array<AnomalyDetectionModels.Anomaly>>}
     * @throws {AnomalyDetectionModels.RequiredError}
     * @memberof AnomalyDetectionClient
     */
    public async detectanomaliesPost(
        ioTTimeSeriesItems: Array<AnomalyDetectionModels.Timeseries>, 
        modelID: string
    ):Promise<Array<AnomalyDetectionModels.Anomaly>>{
        // verify required parameter 'ioTTimeSeriesItems' is not null or undefined
        if (ioTTimeSeriesItems === null || ioTTimeSeriesItems === undefined) {
            throw new AnomalyDetectionModels.RequiredError('ioTTimeSeriesItems','Required parameter ioTTimeSeriesItems was null or undefined when calling detectanomaliesPost.');
        }
        // verify required parameter 'modelID' is not null or undefined
        if (modelID === null || modelID === undefined) {
            throw new AnomalyDetectionModels.RequiredError('modelID','Required parameter modelID was null or undefined when calling detectanomaliesPost.');
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/detectanomalies?${toQueryString({modelID})}`,
            body: ioTTimeSeriesItems || {},
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as Array<AnomalyDetectionModels.Anomaly>;
    }
    
    /**
     * Creates new model based on given asset details. Analytic Model Management service is used to store created model.
     * @summary Train model in direct integration with IoT time series
     * @param {number} epsilon Threshold for the distance to check if point belongs to cluster.
     * @param {number} minPointsPerCluster Minimum cluster size. Positive. Minimum is 2.
     * @param {string} assetId unique identifier of the asset (entity)
     * @param {string} aspectName Name of the aspect (property set).
     * @param {Date} from Beginning of the time range to be retrieved (exclusive).
     * @param {Date} to End of the time range to be retrieved (exclusive).
     * @param {'EUCLIDEAN' | 'MANHATTAN' | 'CHEBYSHEV'} [distanceMeasureAlgorithm] Name of the distance measure algorithm.
     * @param {string} [name] Human-friendly name of the model. If a name is provided, it must not be an empty string. Maximum length is 255 characters. Only ASCII characters are allowed. Example &#39;Test Model
     * @returns {Promise<AnomalyDetectionModels.Model>}
     * @throws {AnomalyDetectionModels.RequiredError}
     * @memberof AnomalyDetectionClient
     */
     public async modelsDirectPost(
         epsilon: number, 
         minPointsPerCluster: number, 
         assetId: string, 
         aspectName: string, 
         from: Date, 
         to: Date, 
         distanceMeasureAlgorithm?: 'EUCLIDEAN' | 'MANHATTAN' | 'CHEBYSHEV', 
         name?: string
    ): Promise<AnomalyDetectionModels.Model>{
        // verify required parameter 'epsilon' is not null or undefined
        if (epsilon === null || epsilon === undefined) {
            throw new AnomalyDetectionModels.RequiredError('epsilon','Required parameter epsilon was null or undefined when calling modelsDirectPost.');
        }
        // verify required parameter 'minPointsPerCluster' is not null or undefined
        if (minPointsPerCluster === null || minPointsPerCluster === undefined) {
            throw new AnomalyDetectionModels.RequiredError('minPointsPerCluster','Required parameter minPointsPerCluster was null or undefined when calling modelsDirectPost.');
        }
        // verify required parameter 'assetId' is not null or undefined
        if (assetId === null || assetId === undefined) {
            throw new AnomalyDetectionModels.RequiredError('assetId','Required parameter assetId was null or undefined when calling modelsDirectPost.');
        }
        // verify required parameter 'aspectName' is not null or undefined
        if (aspectName === null || aspectName === undefined) {
            throw new AnomalyDetectionModels.RequiredError('aspectName','Required parameter aspectName was null or undefined when calling modelsDirectPost.');
        }
        // verify required parameter 'from' is not null or undefined
        if (from === null || from === undefined) {
            throw new AnomalyDetectionModels.RequiredError('from','Required parameter from was null or undefined when calling modelsDirectPost.');
        }
        // verify required parameter 'to' is not null or undefined
        if (to === null || to === undefined) {
            throw new AnomalyDetectionModels.RequiredError('to','Required parameter to was null or undefined when calling modelsDirectPost.');
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/modelsDirect?${toQueryString({epsilon, minPointsPerCluster, assetId, aspectName, from, to, distanceMeasureAlgorithm, name })}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as AnomalyDetectionModels.Model;
    }


    /**
     * Performs anomaly detection for given asset details against specified model.
     * @summary Anomaly detection in direct integration with IoT time series
     * @param {string} modelID ID of the model to use.
     * @param {string} assetId unique identifier of the asset (entity)
     * @param {string} aspectName Name of the aspect (property set).
     * @param {Date} from Beginning of the time range to be retrieved (exclusive).
     * @param {Date} to End of the time range to be retrieved (exclusive).
     * @returns {Promise<Array<AnomalyDetectionModels.Anomaly>>}
     * @throws {AnomalyDetectionModels.RequiredError}
     * @memberof AnomalyDetectionClient
     */
     public async detectanomaliesDirectPost(
         modelID: string, 
         assetId: string, 
         aspectName: string, 
         from: Date, 
         to: Date
    ): Promise<Array<AnomalyDetectionModels.Anomaly>> {
        // verify required parameter 'modelID' is not null or undefined
        if (modelID === null || modelID === undefined) {
            throw new AnomalyDetectionModels.RequiredError('modelID','Required parameter modelID was null or undefined when calling detectanomaliesDirectPost.');
        }
        // verify required parameter 'assetId' is not null or undefined
        if (assetId === null || assetId === undefined) {
            throw new AnomalyDetectionModels.RequiredError('assetId','Required parameter assetId was null or undefined when calling detectanomaliesDirectPost.');
        }
        // verify required parameter 'aspectName' is not null or undefined
        if (aspectName === null || aspectName === undefined) {
            throw new AnomalyDetectionModels.RequiredError('aspectName','Required parameter aspectName was null or undefined when calling detectanomaliesDirectPost.');
        }
        // verify required parameter 'from' is not null or undefined
        if (from === null || from === undefined) {
            throw new AnomalyDetectionModels.RequiredError('from','Required parameter from was null or undefined when calling detectanomaliesDirectPost.');
        }
        // verify required parameter 'to' is not null or undefined
        if (to === null || to === undefined) {
            throw new AnomalyDetectionModels.RequiredError('to','Required parameter to was null or undefined when calling detectanomaliesDirectPost.');
        }
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/detectanomaliesDirect?${toQueryString({modelID, assetId, aspectName, from, to})}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as Array<AnomalyDetectionModels.Anomaly>;
    }

    /**
     * Cancels specified job.
     * @summary Cancel jod.
     * @param {string} id ID of the job to get status for.
     * @throws {AnomalyDetectionModels.RequiredError}
     * @memberof AnomalyDetectionClient
     */
     public async detectAnomaliesJobsIdCancelPost(id: string) {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new AnomalyDetectionModels.RequiredError('id','Required parameter id was null or undefined when calling detectAnomaliesJobsIdCancelPost.');
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/detectAnomaliesJobs/${id}/cancel`,
            additionalHeaders: { "Content-Type": "application/json" },
            noResponse: true
        });
    }

    /**
     * Returns current status for specified jod.
     * @summary Get job status.
     * @param {string} id ID of the job to get status for.
     * @returns {Promise<AnomalyDetectionModels.ReasoningJobInfo>}
     * @throws {AnomalyDetectionModels.RequiredError}
     * @memberof AnomalyDetectionClient
     */
    public async detectAnomaliesJobsIdGet(
        id: string
    ): Promise<AnomalyDetectionModels.ReasoningJobInfo>{
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new AnomalyDetectionModels.RequiredError('id','Required parameter id was null or undefined when calling detectAnomaliesJobsIdGet.');
        }
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/detectAnomaliesJobs/${id}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as AnomalyDetectionModels.ReasoningJobInfo;
    }

    /**
     * Performs long running reasoning (anomaly detection) for given timeseries data.
     * @summary Anomaly Detection batch reasoning
     * @param {AnomalyDetectionModels.SubmitReasoningRequest} [submitReasoningRequest] Request data to launch reasoning job.
     * @returns {Promise<AnomalyDetectionModels.ReasoningJobInfo>}
     * @throws {AnomalyDetectionModels.RequiredError}
     * @memberof AnomalyDetectionClient
     */
    public async detectAnomaliesJobsPost(
        submitReasoningRequest?: AnomalyDetectionModels.SubmitReasoningRequest
    ) : Promise<AnomalyDetectionModels.ReasoningJobInfo>{
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/detectAnomaliesJobs`,
            body: submitReasoningRequest || {},
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as AnomalyDetectionModels.ReasoningJobInfo;
    }

    /**
     * Performs long running model training for given timeseries data. The number of timeseries items to process is limited by 1000000, this parameter can be changed in the future without notice.
     * @summary Anomaly Detection batch model training
     * @param {AnomalyDetectionModels.SubmitTrainingRequest} [submitTrainingRequest] Request data to launch training job.
     * @returns {Promise<AnomalyDetectionModels.TrainingJobInfo>}
     * @throws {AnomalyDetectionModels.RequiredError}
     * @memberof AnomalyDetectionClient
     */
    public async trainModelJobsPost(
         submitTrainingRequest?: AnomalyDetectionModels.SubmitTrainingRequest
    ): Promise<AnomalyDetectionModels.TrainingJobInfo> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/trainModelJobs`,
            body: submitTrainingRequest || {},
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as AnomalyDetectionModels.TrainingJobInfo;
    }

    /**
     * Returns current status for specified jod.
     * @summary Get job status.
     * @param {string} id ID of the job to get status for.
     * @returns {Promise<AnomalyDetectionModels.TrainingJobInfo>}
     * @throws {AnomalyDetectionModels.RequiredError}
     * @memberof AnomalyDetectionClient
     */
    public async trainModelJobsIdGet(id: string): Promise<AnomalyDetectionModels.TrainingJobInfo> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new AnomalyDetectionModels.RequiredError('id','Required parameter id was null or undefined when calling trainModelJobsIdGet.');
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/trainModelJobs/${id}`,
            additionalHeaders: { "Content-Type": "application/json" },
            noResponse: true
        });
        return result as AnomalyDetectionModels.TrainingJobInfo;
    }

    /**
     * Cancels specified job.
     * @summary Cancel job.
     * @param {string} id ID of the job to get status for.
     * @throws {RequiredError}
     * @memberof AnomalyDetectionClient
     */
     public async trainModelJobsIdCancelPost(id: string) {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new AnomalyDetectionModels.RequiredError('id','Required parameter id was null or undefined when calling trainModelJobsIdCancelPost.');
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/trainModelJobs/${id}/cancel`,
            additionalHeaders: { "Content-Type": "application/json" },
            noResponse: true
        });
    }    
}
