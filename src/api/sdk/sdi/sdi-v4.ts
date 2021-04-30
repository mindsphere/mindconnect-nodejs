import { SdkClient } from "../common/sdk-client";
import { SemanticDataInterconnectModels } from "./sdi-models";

/**
 * The Semantic Data Interconnect (SDI) is a collection of APIs that allows the user
 * to unlock the potential of disparate big data by connecting external data.
 * The SDI can infer the schemas of data based on schema-on-read, allow creating a semantic model
 * and perform big data semantic queries.
 * It seamlessly connects to MindSphere's Integrated Data Lake (IDL), but it can work independently as well.
 *
 *  There are two mechanisms that can be used to upload files so that SDI can generate schemas and make data ready for query.
 *  The SDI operations are divided into the following groups:
 *
 * * Data Registration for SDI
 *
 * This set of APIs is used to organize the incoming data. When configuring a Data Registry,
 * you have the option to update your data based on a replace or append strategy.
 * If you consider a use case where schema may change and incoming data files are completely different
 * every time then replace is a good strategy.
 * The replace strategy will replace the existing schema and data during each data ingest operation
 * whereas the append strategy will update the existing schema and data during each data ingest operation.
 *
 * * Custom Data Type for SDI
 *
 * The SDI by default identifies basic data types for each property, such as String, Integer, Float, Date, etc.
 * The user can use this set of APIs to create their own custom data type.
 * The SDI also provides an API under this category to suggest data type based on user-provided sample test values.
 *
 * * Data Lake for SDI
 *
 * The SDI can process files uploaded provides endpoints
 * to manage customer's data lake registration based on tenant id, cloud provider and data lake type.
 * The set of REST endpoint allows to create, update and retrieve base path for their data lake.
 * The IDL customer needs to create an SDI folder that is under the root folder.
 * Any file uploaded in this folder is automatically picked up by SDI to process via IDL notification.
 *
 * * Data Ingest for SDI
 *
 * This set of APIs allows user to upload files, start an ingest job for uploaded files, find job status for
 * ingested jobs or retrieve all job statuses.
 *
 * * Schema Registry for SDI
 *
 * The SDI provides a way to find the generated schema in this category.
 * * Users can find an SDI generated schema for uploaded files based on source name, data tag or schema name.
 *
 * * Data Query for SDI
 *
 * allows querying based on the extracted schemas. Important supported APIs are:
 * Query interface for querying semantically correlated and transformed data
 * Stores and executes data queries.
 *
 * Uses a semantic model to translate model-based query to physical queries.
 *
 * * Semantic Model for SDI
 *
 * allows user to create semantic model ontologies based on the extracted one or more schemas.
 *
 * The important functionalities achieved with APIs are:
 * Contextual correlation of data from different systems.
 * Infers & Recommends mappings between different schemas.
 * Import and store Semantic model.
 *
 * @export
 * @class SemanticDataInterconnectClient
 * @extends {SdkClient}
 */
export class SemanticDataInterconnectClient extends SdkClient {
    private _baseUrl: string = "/api/sdi/v4";

    /**
     *  * Data Lake
     *
     *  Retrieves DataLake for a given DataLake Id
     *
     * @param {string} id
     * @returns {Promise<SemanticDataInterconnectModels.DataLakeResponse>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetDataLake(id: string): Promise<SemanticDataInterconnectModels.DataLakeResponse> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataLakes/${id}`,
        });
        return result as SemanticDataInterconnectModels.DataLakeResponse;
    }

    /**
     * * Data Lake
     *
     * Updates base path for a given data lake type
     *
     * @param {string} id
     * @param {SemanticDataInterconnectModels.UpdateDataLakeRequest} updateDataLakeRequest
     * @returns {Promise<SemanticDataInterconnectModels.DataLakeResponse>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async PatchDataLake(
        id: string,
        updateDataLakeRequest: SemanticDataInterconnectModels.UpdateDataLakeRequest
    ): Promise<SemanticDataInterconnectModels.DataLakeResponse> {
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            body: updateDataLakeRequest,
            baseUrl: `${this._baseUrl}/dataLakes/${id}`,
        });
        return result as SemanticDataInterconnectModels.DataLakeResponse;
    }

    /**
     * * Data Lake
     *
     * Retrieves base path for a given data lake type, this will return an empty array when no datalake is found.
     *
     * @returns {Promise<SemanticDataInterconnectModels.DataLakeList>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetDataLakes(): Promise<SemanticDataInterconnectModels.DataLakeList> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataLakes`,
        });
        return result as SemanticDataInterconnectModels.DataLakeList;
    }

    /**
     * * Data Lake
     *
     * Creates a data lake record with given data lake type, name and base path.
     * To use IDL as preferred data lake, use type as MindSphere and name as IDL.
     * The possible values for type is MindSphere or Custom.
     *
     * @param {SemanticDataInterconnectModels.CreateDataLakeRequest} createDataLakeRequest
     * @returns {Promise<SemanticDataInterconnectModels.CreateDataLakeResponse>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async PostDataLake(
        createDataLakeRequest: SemanticDataInterconnectModels.CreateDataLakeRequest
    ): Promise<SemanticDataInterconnectModels.CreateDataLakeResponse> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            body: createDataLakeRequest,
            baseUrl: `${this._baseUrl}/dataLakes`,
        });
        return result as SemanticDataInterconnectModels.CreateDataLakeRequest;
    }

    public async DeleteDataLake(id: string) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataLakes/${id}`,
        });
    }
}
