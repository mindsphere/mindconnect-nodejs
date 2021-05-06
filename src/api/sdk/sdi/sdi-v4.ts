import { toQueryString } from "../../utils";
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

    /**
     * * Data Lakes
     *
     * !important: this doesn't work because of missing support in mindsphere in April 2021
     * !fix: implemented the method for the case that there is a support in the future
     *
     * @param {string} id
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async DeleteDataLake(id: string) {
        try {
            await this.HttpAction({
                verb: "DELETE",
                gateway: this.GetGateway(),
                authorization: await this.GetToken(),
                baseUrl: `${this._baseUrl}/dataLakes/${id}`,
            });
        } catch (error) {
            console.error(
                "At the time of creation of this client (April 2021), MindSphere didn't have any support for DELETE operation on data lakes."
            );
            console.error("This was reported to mindsphere development team and should eventually start working.");
            throw error;
        }
    }

    /**
     * * Data Registries
     *
     * Retrieves Data Registry for a given registry id
     *
     * @param {string} id
     * @returns {Promise<SemanticDataInterconnectModels.DataRegistry>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetDataRegistry(id: string): Promise<SemanticDataInterconnectModels.DataRegistry> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataRegistries/${id}`,
        });
        return result as SemanticDataInterconnectModels.DataRegistry;
    }

    /**
     *
     * * Data Registries
     *
     * Update Data Registry entries for a given Data Registry Id.
     *
     * @param {string} id
     * @param {SemanticDataInterconnectModels.UpdateDataRegistryRequest} updateDataRegistryRequest
     * @returns {Promise<SemanticDataInterconnectModels.DataRegistry>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async PatchDataRegistry(
        id: string,
        updateDataRegistryRequest: SemanticDataInterconnectModels.UpdateDataRegistryRequest
    ): Promise<SemanticDataInterconnectModels.DataRegistry> {
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataRegistries/${id}`,
            body: updateDataRegistryRequest,
        });
        return result as SemanticDataInterconnectModels.DataRegistry;
    }

    /**
     *
     * * Data Registries
     *
     * Retrieves all Data Registry entries, Data Registry based on sourceName, dataTag or combination of sourceName and dataTag.
     *
     * @param {{
     *         dataTag?: string;
     *         sourceName?: string;
     *         pageToken?: string;
     *     }} [params]
     * @param params.datatag dataTag
     * @param params.sourceName sourceName
     * @param params.pageToken Selects next page. Value must be taken rom response body property 'page.nextToken’. If omitted, first page is returned.
     *
     * @returns {Promise<SemanticDataInterconnectModels.ListOfRegistryResponse>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetDataRegistries(params?: {
        dataTag?: string;
        sourceName?: string;
        pageToken?: string;
    }): Promise<SemanticDataInterconnectModels.ListOfRegistryResponse> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataRegistries?${toQueryString(parameters)}`,
        });
        return result as SemanticDataInterconnectModels.ListOfRegistryResponse;
    }

    /**
     *
     * * Data Registries
     *
     * Initiate creation of Data Registry for the current tenant.
     * The Data Registry information is used during data ingest for the tenant.
     * Only one Data Registry can be created for a request.
     * The dataTag, sourceName and fileUploadStrategy is required to create Date Registry
     * otherwise creation is rejected.
     * DataUpload will allow only files to be uploaded matching this Data Registry.
     * This returns unique registryId for each request that can be used to retrieve the created registry.
     * The tenant cannot have more than 500 data registries in the system.
     * The schemaFrozen flag must be set to false during creation of a registry.
     * It can be set to true after creation of the initial schema for the registry.
     *
     * @param {SemanticDataInterconnectModels.CreateDataRegistryRequest} createDataRegistryRequest
     * @returns {Promise<SemanticDataInterconnectModels.DataRegistry>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async PostDataRegistry(
        createDataRegistryRequest: SemanticDataInterconnectModels.CreateDataRegistryRequest
    ): Promise<SemanticDataInterconnectModels.DataRegistry> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataRegistries`,
            body: createDataRegistryRequest,
        });
        return result as SemanticDataInterconnectModels.DataRegistry;
    }

    /**
     * * Data Registries
     *
     * !important: this doesn't work because of missing support in mindsphere in April 2021
     * !fix: implemented the method for the case that there is a support in the future
     *
     * @param {string} id
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async DeleteDataRegistry(id: string) {
        try {
            await this.HttpAction({
                verb: "DELETE",
                gateway: this.GetGateway(),
                authorization: await this.GetToken(),
                baseUrl: `${this._baseUrl}/dataRegistries/${id}`,
            });
        } catch (error) {
            console.error(
                "At the time of creation of this client (April 2021), MindSphere didn't have any support for DELETE operation on data registries."
            );
            console.error("This was reported to mindsphere development team and should eventually start working.");
            throw error;
        }
    }

    /**
     * * IoT Data Registries
     *
     * Retrieves an IoT Data Registry with MindSphere AssetId and AspectName
     *
     * @param {{
     *         filter?: string;
     *         pageToken?: string;
     *     }} [params]
     * @param params.filter filter
     * @param params.pageToken Selects next page. Value must be taken rom response body property 'page.nextToken’. If omitted, first page is returned.
     *
     * @returns {Promise<SemanticDataInterconnectModels.ListOfIoTRegistryResponse>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetIotDataRegistries(params?: {
        filter?: string;
        pageToken?: string;
    }): Promise<SemanticDataInterconnectModels.ListOfIoTRegistryResponse> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/iotDataRegistries?${toQueryString(parameters)}`,
        });
        return result as SemanticDataInterconnectModels.ListOfIoTRegistryResponse;
    }

    /**
     * * IoT Data Registry
     *
     * Create new IoT Data Registry with MindSphereAssetId and AspectName
     *
     * @param {SemanticDataInterconnectModels.IotDataRegistry} iotDataRegistry
     * @returns {Promise<SemanticDataInterconnectModels.IotDataRegistryResponse>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async PostIotDataRegistry(
        iotDataRegistry: SemanticDataInterconnectModels.IotDataRegistry
    ): Promise<SemanticDataInterconnectModels.IotDataRegistryResponse> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/iotDataRegistries`,
            body: iotDataRegistry,
        });
        return result as SemanticDataInterconnectModels.IotDataRegistryResponse;
    }

    /**
     * * Iot Data Registry
     *
     * Gets the details about the iot data registry
     *
     * !important!: this is convenience method in the client as the SDI API didn't have a specific operation in April 2021
     *     *
     * @param {string} registryId
     * @returns {Promise<SemanticDataInterconnectModels.IotDataRegistry>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetIotDataRegistry(registryId: string): Promise<SemanticDataInterconnectModels.IotDataRegistry> {
        let nextToken = undefined;
        let registry = undefined;

        do {
            const result = await this.GetIotDataRegistries();
            result.iotDataRegistries?.forEach((x) => {
                if (x.registryId === registryId) {
                    registry = x;
                }
            });
            nextToken = result.page?.nextToken;
        } while (nextToken);

        if (!registry) {
            throw new Error(`couldn't find iot data registry with id ${registryId}`);
        }
        return registry;
    }

    /**
     * * Iot Registries
     *
     * !important: this doesn't work because of missing support in mindsphere in April 2021
     * !fix: implemented the method for the case that there is a support in the future
     *
     * @param {string} id
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async DeleteIotRegistry(id: string) {
        try {
            await this.HttpAction({
                verb: "DELETE",
                gateway: this.GetGateway(),
                authorization: await this.GetToken(),
                baseUrl: `${this._baseUrl}/iotDataRegistries/${id}`,
            });
        } catch (error) {
            console.error(
                "At the time of creation of this client (April 2021), MindSphere didn't have any support for DELETE operation on data registries."
            );
            console.error("This was reported to mindsphere development team and should eventually start working.");
            throw error;
        }
    }
}
