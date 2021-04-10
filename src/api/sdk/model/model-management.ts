import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { modelDataTemplate } from "./model-data-template";
import { ModelManagementModels } from "./model-models";

/**
 * Service for configuring, reading and managing assets, asset ~ and aspect types.
 *
 * @export
 * @class AssetManagementClient
 * @extends {SdkClient}
 */
export class ModelManagementClient extends SdkClient {
    private _baseUrl: string = "/api/modelmanagement/v3";

    /**
     * * Models
     *
     * List all all models and algorithms available for the authenticated user.
     *
     * @param {{
     *         pageNumber?: number;
     *         pageSize?: number;
     *         filter?: string;
     *         sort?: string;
     * }} [params]
     * @param [params.pageNumber] Specifies the requested page index
     * @param [params.pageSize] Specifies the number of elements in a page
     * @param [params.filter] Specifies the additional filtering criteria
     * @param [params.sort] Specifies the ordering of returned elements e.g. 'asc' or 'desc'
     *
     * @returns {Promise<ModelManagementModels.ModelArray>}
     *
     * @example await modelManagement.GetModels();
     * @example await modelManagement.GetModels({sort: "asc"});
     *
     * @memberOf ModelManagementClient
     */
    public async GetModels(params?: {
        pageNumber?: number;
        pageSize?: number;
        filter?: string;
        sort?: "asc" | "desc";
    }): Promise<ModelManagementModels.ModelArray> {
        const parameters = params || {};
        const { pageNumber, pageSize, filter, sort } = parameters;

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models?${toQueryString({ pageNumber, pageSize, filter, sort })}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as ModelManagementModels.ModelArray;
    }

    /**
     * * Models
     *
     * Gets the model for the given model id.
     *
     * @param {string} id
     * @returns {Promise<ModelManagementModels.Model>}
     *
     * @example await modelManagement.GetModel("mdsp.SimulationEngine")
     * @memberOf ModelManagementClient
     */
    public async GetModel(id: string): Promise<ModelManagementModels.Model> {
        // verify required parameter 'modelId' is not null or undefined
        if (id === null || id === undefined) {
            throw new ModelManagementModels.RequiredError(
                "modelId",
                "Required parameter modelId was null or undefined when calling GetModel."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models/${id}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as ModelManagementModels.Model;
    }

    /**
     * * Models
     *
     * Updates the model's metadata.
     *
     * @param {string} id ID of the model which is to be updated
     * @param {ModelManagementModels.ModelDefinition} model
     * @returns {Promise<ModelManagementModels.Model>}
     * @throws {ModelManagementModels.RequiredError}
     *
     * @example await modelManagement.PatchModel("mdsp.SimulationEngine", myModelDefinition)
     * @memberOf ModelManagementClient
     */
    public async PatchModel(
        id: string,
        model: ModelManagementModels.ModelDefinition
    ): Promise<ModelManagementModels.Model> {
        // verify required parameter 'modelId' is not null or undefined
        if (id === null || id === undefined) {
            throw new ModelManagementModels.RequiredError(
                "modelId",
                "Required parameter modelId was null or undefined when calling PatchModel."
            );
        }
        // verify required parameter 'model' is not null or undefined
        if (model === null || model === undefined) {
            throw new ModelManagementModels.RequiredError(
                "model",
                "Required parameter model was null or undefined when calling PatchModel."
            );
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models/${id}`,
            body: model,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as ModelManagementModels.Model;
    }

    /**
     * * Models
     *
     * Deletes a model, all the versions and the corresponding metadata.
     * Also, use this endpoint if needed to delete a model that has a single version available.
     *
     * @param {string} id ID of the model which is to be updated
     *
     * @example await modelManagement.DeleteModel(id)
     *
     * @memberOf ModelManagementClient
     */
    public async DeleteModel(id: string) {
        // verify required parameter 'modelId' is not null or undefined
        if (id === null || id === undefined) {
            throw new ModelManagementModels.RequiredError(
                "modelId",
                "Required parameter modelId was null or undefined when calling DeleteModel."
            );
        }

        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models/${id}`,
            noResponse: true,
        });
    }

    /**
     * * Models
     *
     * Uploads a model payload and the corresponding metadata.
     *
     * @param {any} file The model/algorithm file
     * @param {ModelManagementModels.ModelDefinition} metadata The details regarding what the model represents, as name, author, type, description, in JSON format (see definitions/Model and definitions/VersionDefinition)&lt;br /&gt; &lt;pre&gt; {   name: \&quot;NN - Quasi Newton\&quot;,   description: \&quot;Newton using variable matrix methods\&quot;,   type: \&quot;Zeppelin notebook\&quot;,   author: \&quot;user@siemens.com\&quot;,   version:    {     number: 3.1,     expirationDate: \&quot;2017-10-01T12:00:00.001Z\&quot;,     author: \&quot;user@siemens.com\&quot;,     creationDate: \&quot;2017-10-01T12:00:00.001Z\&quot;,     dependencies: [       {         name: \&quot;sklearn-theano\&quot;,         type: \&quot;Python\&quot;,         version: \&quot;1.7, 5.2.6\&quot;       }     ],     io: {       consumes: \&quot;CSV/XML/Parquet\&quot;,       input: [         {           name: \&quot;t1\&quot;,           type: \&quot;integer\&quot;,           description: \&quot;temperature sensor value\&quot;,           value: 5         }       ],       output: [         {           name: \&quot;t1\&quot;,           type: \&quot;integer\&quot;,           description: \&quot;temperature sensor value\&quot;,           value: 5         }       ],       optionalParameters:        {         freeFormParams: \&quot;for the author to use\&quot;       }     },     producedBy: [       {\&quot;951b3240-7857-11e8-adc0-fa7ae01bbebc\&quot;}     ],     kpi: [       {         name: \&quot;error rate\&quot;,         value: 0.9       }     ]   } }&lt;/pre&gt;
     * @returns {Promise<ModelManagementModels.Model>}
     *
     * @memberOf ModelManagementClient
     */
    public async PostModel(
        metadata: ModelManagementModels.ModelDefinition,
        payload: ModelManagementModels.ModelPayload
    ): Promise<ModelManagementModels.Model> {
        // verify required parameter 'file' is not null or undefined
        if (payload === null || payload === undefined) {
            throw new ModelManagementModels.RequiredError(
                "file",
                "Required parameter file was null or undefined when calling postModel."
            );
        }
        // verify required parameter 'metadata' is not null or undefined
        if (metadata === null || metadata === undefined) {
            throw new ModelManagementModels.RequiredError(
                "metadata",
                "Required parameter metadata was null or undefined when calling postModel."
            );
        }
        const body = modelDataTemplate(metadata, payload);

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models`,
            body: body,
            multiPartFormData: true,
            additionalHeaders: { enctype: "multipart/form-data" },
        });
        return result as ModelManagementModels.Model;
    }

    /**
     * * Versions
     *
     * Retrieves all the versions of a model or an algorithm based on the model identifier.
     * Whenever a new model file or a metadata JSON are uploaded as an update of an existing entry a new version of the entry is created.
     *
     * @param {{
     *         modelId?: string;
     *         pageNumber?: number;
     *         pageSize?: number;
     * }} [params]
     * @param [params.modelId] Model ID to get the information for it
     * @param [params.pageNumber] Specifies the requested page index
     * @param [params.pageSize] Specifies the number of elements in a page
     *
     * @returns {Promise<ModelManagementModels.VersionArray>}
     *
     * @memberOf ModelManagementClient
     */
    public async GetModelVersions(params?: {
        modelId?: string;
        pageNumber?: number;
        pageSize?: number;
    }): Promise<ModelManagementModels.VersionArray> {
        const parameters = params || {};
        const { modelId, pageNumber, pageSize } = parameters;
        // verify required parameter 'modelId' is not null or undefined
        if (modelId === null || modelId === undefined) {
            throw new ModelManagementModels.RequiredError(
                "modelId",
                "Required parameter modelId was null or undefined when calling GetModelVersions."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models/${modelId}/versions?${toQueryString({ pageNumber, pageSize })}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as ModelManagementModels.VersionArray;
    }

    /**
     * * Model Version
     *
     * Retrieves the version payload or the version metadata of a model.
     *
     * @param {string} modelId Model ID to get the information for it
     * @param {string} versionId Version ID to get the information for it
     *
     * @example await modelManagement.GetModelVersion("mdsp.SimulationEngine", "v0.0.1")
     * @memberOf ModelManagementClient
     */
    public async GetModelVersion(modelId: string, versionId: string): Promise<ModelManagementModels.Version> {
        // verify required parameter 'modelId' is not null or undefined
        if (modelId === null || modelId === undefined) {
            throw new ModelManagementModels.RequiredError(
                "modelId",
                "Required parameter modelId was null or undefined when calling GetModelVersion."
            );
        }
        // verify required parameter 'versionId' is not null or undefined
        if (versionId === null || versionId === undefined) {
            throw new ModelManagementModels.RequiredError(
                "versionId",
                "Required parameter versionId was null or undefined when calling GetModelVersion."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models/${modelId}/versions/${versionId}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as ModelManagementModels.Version;
    }

    /**
     * * Model Version
     *
     * Downloads the last version payload or description of a model.
     *
     * @param {string} modelId Id of the model
     * @returns {Promise<ModelManagementModels.Version>}
     *
     * @example await modelManagement.GetModelLastVersion("mdsp.SimulationEngine")
     * @memberOf ModelManagementClient
     */
    public async GetModelLastVersion(modelId: string): Promise<ModelManagementModels.Version> {
        // verify required parameter 'modelId' is not null or undefined
        if (modelId === null || modelId === undefined) {
            throw new ModelManagementModels.RequiredError(
                "modelId",
                "Required parameter modelId was null or undefined when calling modelsModelIdGet."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models/${modelId}/versions/last`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as ModelManagementModels.Version;
    }

    /**
     * * Model Version
     *
     * Deletes a version of a model and the corresponding metadata,
     * only if the version is not the single available version for the model.
     *
     * @summary Deletes the specified version of a model and the corresponding metadata
     * @param {string} modelId Id of the model
     * @param {string} versionId The version id
     *
     * @example await modelManagement.DeleteModelVersion(myModelId, myVersionId)
     *
     * @memberOf ModelManagementClient
     */
    public async DeleteModelVersion(modelId: string, versionId: string) {
        // verify required parameter 'modelId' is not null or undefined
        if (modelId === null || modelId === undefined) {
            throw new ModelManagementModels.RequiredError(
                "modelId",
                "Required parameter modelId was null or undefined when calling modelsModelIdVersionsVersionIdDelete."
            );
        }
        // verify required parameter 'versionId' is not null or undefined
        if (versionId === null || versionId === undefined) {
            throw new ModelManagementModels.RequiredError(
                "versionId",
                "Required parameter versionId was null or undefined when calling modelsModelIdVersionsVersionIdDelete."
            );
        }

        const baseUrl = `${this._baseUrl}/models/{modelId}/versions/{versionId}`
            .replace(`{${"modelId"}}`, encodeURIComponent(String(modelId)))
            .replace(`{${"versionId"}}`, encodeURIComponent(String(versionId)));

        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: baseUrl,
            noResponse: true,
        });
    }

    /**
     * * Model Version
     *
     * Deletes the last version of a model and its associated payload.
     * If the version is the only  version of the model all the information regarding the model will be deleted.
     *
     * @param {string} modelId Id of the model
     *
     * @example await modelManagement.DeleteModelLastVersion(myModelId)
     *
     * @memberOf ModelManagementClient
     */
    public async DeleteModelLastVersion(modelId: string) {
        // verify required parameter 'modelId' is not null or undefined
        if (modelId === null || modelId === undefined) {
            throw new ModelManagementModels.RequiredError(
                "modelId",
                "Required parameter modelId was null or undefined when calling DeleteModelLastVersion."
            );
        }

        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models/${modelId}/versions/last`,
            noResponse: true,
        });
    }

    /**
     * *  Model Version
     *
     * Updates the last version metadata information of a model, without allowing updates to the model payload itself
     *
     * @param {string} modelId The model id
     * @param {ModelManagementModels.VersionDefinition} version
     * @returns {Promise<ModelManagementModels.VersionDefinition>}
     * @throws {ModelManagementModels.RequiredError}
     *
     * @example await modelManagement.PatchLastModelVersion("mdsp.SimulationEngine", myModelVersionDefinition)
     * @memberOf ModelManagementClient
     */
    public async PatchLastModelVersion(
        modelId: string,
        version: ModelManagementModels.VersionDefinition
    ): Promise<ModelManagementModels.VersionDefinition> {
        // verify required parameter 'modelId' is not null or undefined
        if (modelId === null || modelId === undefined) {
            throw new ModelManagementModels.RequiredError(
                "modelId",
                "Required parameter modelId was null or undefined when calling PatchLastModelVersion."
            );
        }
        // verify required parameter 'version' is not null or undefined
        if (version === null || version === undefined) {
            throw new ModelManagementModels.RequiredError(
                "version",
                "Required parameter version was null or undefined when calling PatchLastModelVersion."
            );
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models/${modelId}/versions/last`,
            body: version,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as ModelManagementModels.VersionDefinition;
    }

    /**
     * * Model Versions
     *
     * Create a new model version.
     *
     * @param {string} modelId Model ID to create a new verion for
     * @param {any} file The model/algorithm file
     * @param {ModelManagementModels.VersionDefinition} metadata Version data in JSON format (See definitions/VersionDefinition) &lt;pre&gt; {   number: 3.1,   expirationDate: \&quot;2017-10-01T12:00:00.001Z\&quot;,   author: \&quot;user@siemens.com\&quot;,   creationDate: \&quot;2017-10-01T12:00:00.001Z\&quot;,   dependencies: [     {       name: \&quot;sklearn-theano\&quot;,       type: \&quot;Python\&quot;,       version: \&quot;1.7, 5.2.6\&quot;     }   ],   io: {     consumes: \&quot;CSV/XML/Parquet\&quot;,     input: [       {         name: \&quot;t1\&quot;,         type: \&quot;integer\&quot;,         description: \&quot;temperature sensor value\&quot;,         value: 5       }     ],     output: [       {         name: \&quot;t1\&quot;,         type: \&quot;integer\&quot;,         description: \&quot;temperature sensor value\&quot;,         value: 5       }     ],     optionalParameters:      {       freeFormParams: \&quot;for the author to use\&quot;     }   },   producedBy: [     {\&quot;951b3240-7857-11e8-adc0-fa7ae01bbebc\&quot;}   ],   kpi: [     {       name: \&quot;error rate\&quot;,       value: 0.9     }   ] } &lt;/pre&gt;
     * @returns {Promise<ModelManagementModels.Version>}
     *
     * @memberOf ModelManagementClient
     */
    public async PostModelVersion(
        modelId: string,
        metadata: ModelManagementModels.VersionDefinition,
        payload: ModelManagementModels.ModelPayload
    ): Promise<ModelManagementModels.Version> {
        // verify required parameter 'modelId' is not null or undefined
        if (modelId === null || modelId === undefined) {
            throw new ModelManagementModels.RequiredError(
                "modelId",
                "Required parameter modelId was null or undefined when calling postModelVersion."
            );
        }
        // verify required parameter 'file' is not null or undefined
        if (payload === null || payload === undefined) {
            throw new ModelManagementModels.RequiredError(
                "file",
                "Required parameter file was null or undefined when calling postModelVersion."
            );
        }
        // verify required parameter 'metadata' is not null or undefined
        if (metadata === null || metadata === undefined) {
            throw new ModelManagementModels.RequiredError(
                "metadata",
                "Required parameter metadata was null or undefined when calling postModelVersion."
            );
        }

        const body = modelDataTemplate(metadata, payload);

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models/${modelId}/versions`,
            body: body,
            multiPartFormData: true,
            additionalHeaders: { enctype: "multipart/form-data" },
        });

        return result as ModelManagementModels.Version;
    }
}
