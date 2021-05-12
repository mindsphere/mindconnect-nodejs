import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { inferOntologyTemplate } from "./infer-ontology-template";
import { sdiDataTemplate } from "./sdi-data-template";
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

    /**
     * * Data Types
     *
     * Update custom datatypes. The patterns can be added only to existing datatype.
     *
     * @param {string} name data type name
     * @param {SemanticDataInterconnectModels.DataTypePattern} dataTypePattern
     * @returns {Promise<SemanticDataInterconnectModels.DataTypeDefinition>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async AddPatternToDataType(
        name: string,
        dataTypePattern: SemanticDataInterconnectModels.DataTypePattern
    ): Promise<SemanticDataInterconnectModels.DataTypeDefinition> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataTypes/${name}/addPatterns`,
            body: dataTypePattern,
        });
        return result as SemanticDataInterconnectModels.DataTypeDefinition;
    }

    /**
     *
     * * Data Types
     *
     * Retrieves Data Type for Given Name
     *
     * @param {string} name
     * @returns {Promise<SemanticDataInterconnectModels.DataTypeDefinition>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetDataType(name: string): Promise<SemanticDataInterconnectModels.DataTypeDefinition> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataTypes/${name}`,
        });
        return result as SemanticDataInterconnectModels.DataTypeDefinition;
    }

    /**
     * * Data Types
     *
     * Deletes custom datatype for a given datatype name if it is not being used by any schema
     *
     * @param {string} name
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async DeleteDataType(name: string) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataTypes/${name}`,
            noResponse: true,
        });
    }

    /**
     * * Data Types
     *
     * Retrieves custom datatypes for the current tenant containing data type name and one or more registered patterns.
     *
     * @param {{
     *         pageToken?: string;
     *     }} [params]
     * @returns {Promise<SemanticDataInterconnectModels.ListOfDataTypeDefinition>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetDataTypes(params?: {
        pageToken?: string;
    }): Promise<SemanticDataInterconnectModels.ListOfDataTypeDefinition> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataTypes?${toQueryString(parameters)}`,
        });
        return result as SemanticDataInterconnectModels.ListOfDataTypeDefinition;
    }

    /**
     * * Data Types
     *
     * Custom Data Type Registration
     *
     * Initiates a registration for list of custom datatypes for given datatype name and regular expression patterns.
     * There can be one or more pattern for a given custom data type.
     * The custom datatype is being used by DataUpload process during schema generation.
     * The custom datatype registration is rejected for the current tenant if invalid regular expression pattern
     * is provided.
     *
     * The custom datatype applies to all the files ingested for the current tenant.
     * The tenant can have maximum 200 datatypes per tenant and each datatype cannot exceed 10
     * regular expression pattern per datatypename. This returns unique *name that can be used to
     * retrieve the custom data type.
     *
     * @param {SemanticDataInterconnectModels.DataTypeDefinition} dataTypeDefinition
     * @returns {Promise<SemanticDataInterconnectModels.DataTypeDefinition>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async PostDataType(
        dataTypeDefinition: SemanticDataInterconnectModels.DataTypeDefinition
    ): Promise<SemanticDataInterconnectModels.DataTypeDefinition> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataTypes`,
            body: dataTypeDefinition,
        });
        return result as SemanticDataInterconnectModels.DataTypeDefinition;
    }

    /**
     *
     * * Data Types
     *
     * !fix: important! in may 2021 the SDI was return wrong results here (array instead of object). this was fixed in the client.
     *
     * Generates the regular expression patterns for a given set of sample values.
     * In this case sampleValues generates a number of regex patterns and tries to match with
     * patterns provided in testValues.
     *
     * The response contains any of testValues that matches sampleValues as probable pattern match.
     *
     *
     * @param {SemanticDataInterconnectModels.SuggestPatternsRequest} request
     * @returns {Promise<SemanticDataInterconnectModels.ListOfPatterns>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async SuggestPatterns(
        request: SemanticDataInterconnectModels.SuggestPatternsRequest
    ): Promise<SemanticDataInterconnectModels.ListOfPatterns> {
        let result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/suggestPatterns`,
            body: request,
        });

        const transformed: any = { suggestPatterns: [] };

        // !fix: manual fix for wrong result, in April 2021 sdi was returning wrong results here

        if (Array.isArray(result)) {
            (result as Array<any>).forEach((element) => {
                const result: Array<string> = [];
                (element.matches || []).forEach((t: any) => {
                    result.push(t.toString());
                });

                transformed.suggestPatterns.push({
                    schema: element.schema,
                    matches: result,
                    schemaValid: element.schemaValid,
                });
            });

            result = transformed;
        }

        return result as SemanticDataInterconnectModels.ListOfPatterns;
    }

    /**
     * * Data Ingest
     *
     * Initiate the file upload process for provided file under the current tenant.
     *
     * @param {string} fileName Select the file to Upload for SDI process
     * @param {Buffer} buffer
     * @param {string} [mimetype]
     * @returns
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async DataUpload(fileName: string, buffer: Buffer, mimetype?: string) {
        const body = sdiDataTemplate(fileName, buffer, mimetype);

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataUpload`,
            body: body,
            multiPartFormData: true,
            additionalHeaders: { enctype: "multipart/form-data" },
        });
        return result as SemanticDataInterconnectModels.SdiFileUploadResponse;
    }

    /**
     * * Data Ingest
     *
     * Initiate the data ingestion and start the SDI’s schema generation process for the current tenant.
     * This operation currently supports CSV and XML format files. The XML format file requires root element
     * information that is entry point for this operation. This is provided as either rootTag parameter to this
     * operation or registered as part of Data Registry API operation. There are two modes for data ingest.
     *
     * Default: Allows performing the data ingest without need of any Data Registry.
     * In this case service processes files with default policy for schema generation.
     * The schema generated this way cannot be versioned or changed with different files.
     * This mode is used for quick validating the generated schema.
     *
     * Dataregistry: The operation uses Data Registry for ingested file to generate schema.
     * This is preferred mode as it allows more validation against the Data Registry and create
     * multiple schema based on different domains created under Data Registry.
     * Using this mode customer can create combination of schemas from different domain and query
     * them or use for analytical modelling. This works in combination with Data Registry API.
     *
     * @param {SemanticDataInterconnectModels.SDIIngestData} ingestData
     * Specifies the file path and Data Registry information to initiate data ingest process.
     * The ‘{filePath}’ is required parameter and valid file path used during file upload operations.
     * The ‘{dataTag}’ and ‘{sourceName}’ are the valid Data Registry source name and data tag.
     * The ‘{rootTag}’ is optional and applies to XML formatted files.
     * @returns {Promise<SemanticDataInterconnectModels.SdiJobStatusResponse>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async PostIngestJob(
        ingestData: SemanticDataInterconnectModels.SDIIngestData
    ): Promise<SemanticDataInterconnectModels.SdiJobStatusResponse> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/ingestJobs`,
            body: ingestData,
        });
        return result as SemanticDataInterconnectModels.SdiJobStatusResponse;
    }

    /**
     * * Data Ingest
     *
     * Get a list of jobIds that is ingested, this jobId can be used to find detailed status using ingestJobStatus.
     *
     * @param {{
     *         pageToken?: string;
     *     }} [params]
     *
     * @param params.pageToken
     *
     * Selects next page. Value must be taken rom response body property 'page.nextToken’.
     * If omitted, first page is returned.
     *
     * @returns {Promise<SemanticDataInterconnectModels.ListOfJobIds>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetIngestJobs(params?: { pageToken?: string }): Promise<SemanticDataInterconnectModels.ListOfJobIds> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/ingestJobStatus?${toQueryString(parameters)}`,
        });
        return result as SemanticDataInterconnectModels.ListOfJobIds;
    }

    /**
     *
     * * Data Ingest
     *
     * Retrieve the job status based on jobid for the current tenant. The jobid belongs to data ingestion process started for the current tenant.
     *
     * @param {string} id
     * @returns {Promise<SemanticDataInterconnectModels.SdiJobStatusResponse>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetIngestJobStatus(id: string): Promise<SemanticDataInterconnectModels.SdiJobStatusResponse> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/ingestJobStatus/${id}`,
        });
        return result as SemanticDataInterconnectModels.SdiJobStatusResponse;
    }

    /**
     * * Schema registry
     *
     * Operations to review generated schemas and infer semantic model based on extracted schemas.
     * Search schema for ingested data.
     *
     * The data ingestion API creates and stores the schemas for each ingested file.
     * This schema can be retrieved based on schema name, or source name and data tag combination.
     * SchemaSearchRequest is limited to 20 schemas atmost.
     *
     * @param {SemanticDataInterconnectModels.SchemaSearchRequest} schemaSearchRequest
     * @param {{ pageToken?: string }} [params]
     * @param params.pageToken
     * Selects next page. Value must be taken from response body property 'page.nextToken’.
     * If omitted, first page is returned
     *
     * @returns {Promise<SemanticDataInterconnectModels.ListOfSchemaRegistry>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async SearchSchemas(
        schemaSearchRequest: SemanticDataInterconnectModels.SchemaSearchRequest,
        params?: { pageToken?: string }
    ): Promise<SemanticDataInterconnectModels.ListOfSchemaRegistry> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/searchSchemas?${toQueryString(parameters)}`,
            body: schemaSearchRequest,
        });
        return result as SemanticDataInterconnectModels.ListOfSchemaRegistry;
    }

    /**
     * * Data Query
     *
     * Returns a list of Data Query SQL Model
     *
     * @param {{
     *         pageToken?: string;
     *         executable?: boolean;
     *         isDynamic?: boolean;
     *         ontologyId?: string;
     *     }} [params]
     * 
     * @param params.pageToken
     * Selects next page. Value must be taken from response body property 'page.nextToken’.
     * If omitted, first page is returned
     * 
     * @param params.executable
     * Filter based on executable flag.
     * 
     * @param params.isDynamic
     * Filter based on isDynamic flag.
     * 
     * @param params.ontologyId
     * Filter based on ontology id
     
     * @returns {Promise<SemanticDataInterconnectModels.ResponseAllDataSQLQuery>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetQueries(params?: {
        pageToken?: string;
        executable?: boolean;
        isDynamic?: boolean;
        ontologyId?: string;
    }): Promise<SemanticDataInterconnectModels.ResponseAllDataSQLQuery> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/queries?${toQueryString(parameters)}`,
        });
        return result as SemanticDataInterconnectModels.ResponseAllDataSQLQuery;
    }

    /**
     * * Data Query
     *
     * Create new queries and returns id of created query.
     *
     * @param {SemanticDataInterconnectModels.DataQuerySQLRequest} dataQuerySQLRequest
     * @returns {Promise<SemanticDataInterconnectModels.DataQuerySQLResponse>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async PostQuery(
        dataQuerySQLRequest: SemanticDataInterconnectModels.DataQuerySQLRequest
    ): Promise<SemanticDataInterconnectModels.DataQuerySQLResponse> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/queries`,
            body: dataQuerySQLRequest,
        });
        return result as SemanticDataInterconnectModels.DataQuerySQLResponse;
    }

    /**
     * * Data Query
     *
     * Retrieve query by query id.
     * Returns a Data Query SQL Model.
     *
     * @param {string} id
     * @returns {Promise<SemanticDataInterconnectModels.NativeQueryGetResponse>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetQuery(id: string): Promise<SemanticDataInterconnectModels.NativeQueryGetResponse> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/${id}`,
        });
        return result as SemanticDataInterconnectModels.NativeQueryGetResponse;
    }

    /**
     * * Data Query
     *
     * Update query by query id
     * Returns Updated Data Query SQL Model
     *
     *
     * @param {string} id
     * @param {SemanticDataInterconnectModels.DataQuerySQLUpdateRequest} dataQuerySQLUpdateRequest
     * @returns {Promise<SemanticDataInterconnectModels.DataQuerySQLResponse>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async PatchQuery(
        id: string,
        dataQuerySQLUpdateRequest: SemanticDataInterconnectModels.DataQuerySQLUpdateRequest
    ): Promise<SemanticDataInterconnectModels.DataQuerySQLResponse> {
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/queries/${id}`,
            body: dataQuerySQLUpdateRequest,
        });
        return result as SemanticDataInterconnectModels.DataQuerySQLResponse;
    }

    /**
     * * Data Query
     *
     * delete query by query id
     *
     * @param {string} id
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async DeleteQuery(id: string) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/${id}`,
            noResponse: true,
        });
    }

    /**
     * * Query Execution Jobs
     *
     * Create execution job for dynamic query. There is soft limit of upto 10 number of parameters and aliases.
     * Returns id of created job
     *
     * @param {string} id
     * @param {SemanticDataInterconnectModels.DataQueryExecuteQueryRequest} dataQueryExecuteRequest
     * @returns {Promise<SemanticDataInterconnectModels.DataQuerySQLResponse>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async PostQueryExecutionJob(
        id: string,
        dataQueryExecuteRequest: SemanticDataInterconnectModels.DataQueryExecuteQueryRequest
    ): Promise<SemanticDataInterconnectModels.DataQuerySQLResponse> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/queries/${id}/executionJobs`,
            body: dataQueryExecuteRequest,
        });
        return result as SemanticDataInterconnectModels.DataQueryExecuteQueryResponse;
    }

    /**
     * * Query Execution Jobs
     *
     * Retrieve latest query results by query id
     *
     * @param {string} id
     * @param {{ Range?: string }} [params]
     * @param params.Range
     * Part of a file to return in Bytes, eg bytes=200-600
     *
     * @returns {Promise<SemanticDataInterconnectModels.QueryResult>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetQueryExecutionJobLatestResults(
        id: string,
        params?: { Range?: string }
    ): Promise<SemanticDataInterconnectModels.QueryResult> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/queries/${id}/executionJobs/latestResults`,
            additionalHeaders: parameters,
        });
        return result as SemanticDataInterconnectModels.QueryResult;
    }

    /**
     *
     * * Execution Jobs
     *
     * Returns query results
     *
     * @param {string} id
     * @param {{ Range?: string }} [params]
     *
     * @param params.Range
     * Part of a file to return in Bytes, eg bytes=200-600
     *
     * @returns {Promise<SemanticDataInterconnectModels.QueryResult>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetExecutionJobResults(
        id: string,
        params?: { Range?: string }
    ): Promise<SemanticDataInterconnectModels.QueryResult> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/executionJobs/${id}/results`,
            additionalHeaders: parameters,
        });
        return result as SemanticDataInterconnectModels.QueryResult;
    }

    /**
     * * Execution Jobs
     *
     * Retrieve job details by job id
     * Returns Data Query Execution Model
     * @param {string} id
     * @returns {Promise<SemanticDataInterconnectModels.DataQueryExecutionResponse>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetExecutionJob(id: string): Promise<SemanticDataInterconnectModels.DataQueryExecutionResponse> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/executionJobs/${id}`,
        });
        return result as SemanticDataInterconnectModels.DataQueryExecutionResponse;
    }

    /**
     * * Execution Jobs
     *
     * Delete job by job id
     *
     * @param {string} id
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async DeleteExecutionJob(id: string) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/executionJobs/${id}`,
        });
    }

    /**
     * * Execution Job
     *
     * Retrieve all jobs
     *     *
     * @param {{
     *         pageToken?: string;
     *         queryId?: string;
     *         status?: string;
     *     }} [params]
     * @param params.pageToken
     * Selects next page.
     * Value must be taken rom response body property 'page.nextToken’. If omitted, first page is returned.
     *
     * @param params.queryId
     * Filter based on query id
     *
     * @param params.status
     * Filter based on job status
     *
     * @returns {Promise<SemanticDataInterconnectModels.ResponseAllDataQueryExecutionResponse>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetExecutionJobs(params?: {
        pageToken?: string;
        queryId?: string;
        status?: string;
    }): Promise<SemanticDataInterconnectModels.ResponseAllDataQueryExecutionResponse> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/executionJobs?${toQueryString(parameters)}`,
        });
        return result as SemanticDataInterconnectModels.ResponseAllDataQueryExecutionResponse;
    }

    /**
     * * Ontologies
     *
     * Retrieve all ontologies.
     * Returns a list of ontologies
     *
     * @param {{
     *         pageToken?: string;
     *     }} [params]
     * 
     * @param params.pageToken
     * Selects next page.
     * Value must be taken rom response body property 'page.nextToken’. If omitted, first page is returned.
     
     * @returns {Promise<SemanticDataInterconnectModels.ResponseAllOntologies>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetOntologies(params?: {
        pageToken?: string;
    }): Promise<SemanticDataInterconnectModels.ResponseAllOntologies> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/ontologies?${toQueryString(parameters)}`,
        });
        return result as SemanticDataInterconnectModels.ResponseAllOntologies;
    }

    /**
     * * Ontologies
     *
     * Retrieve ontology.
     * @param {string} id
     *
     * @param {{ Range?: string }} [params]
     *
     * @param params.Range
     * Part of a file to return in Bytes, eg bytes=200-600
     *
     * @returns {Promise<SemanticDataInterconnectModels.OntologyResponseData>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetOntology(
        id: string,
        params?: { Range?: string }
    ): Promise<SemanticDataInterconnectModels.OntologyResponseData> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/ontologies/${id}`,
            additionalHeaders: parameters,
        });
        return result as SemanticDataInterconnectModels.OntologyResponseData;
    }

    /**
     * * Ontologies
     *
     * Delete ontology.
     *
     * @param {string} id
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async DeleteOntology(id: string) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/ontologies/${id}`,
            noResponse: true,
        });
    }

    /**
     * * Ontologies
     *
     * Infer semantic model based on two or more generated schemas. Currently it supports infer of up to 20 schemas.
     * Provide two or more schemas to infer an ontology.
     *
     * @param {SemanticDataInterconnectModels.InferSchemaSearchRequest} inferSchemaSearchRequest
     * @returns this returns the predefined JSON format as required by ontologyJobs operation.
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async InferOntology(
        inferSchemaSearchRequest: SemanticDataInterconnectModels.InferSchemaSearchRequest
    ): Promise<any> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/ontologies`,
            body: inferSchemaSearchRequest,
        });
        return result;
    }

    /**
     *
     * * Ontologies
     *
     * Upload file and submit job for create/update ontology
     *
     * @param {string} ontologyName
     * Ontology name should be unique.
     * @param {Buffer} file
     * We support JSON and OWL file pre-defined format.
     * @param {string} [ontologyId]
     * Provide OntologyId for updating existing ontology. If empty then will create new ontology.
     * @param {string} [ontologyDescription]
     * Ontology description.
     * @param {string} [keyMappingType]
     * Define keyMappingType for ontology.
     * Available values : INNER JOIN, FULL OUTER JOIN
     * Default value : INNER JOIN
     * @returns {Promise<SemanticDataInterconnectModels.OntologyJob>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async PostOntologyJob(
        fileName: string,
        file: Buffer,
        mimetype: string,
        ontologyName: string,
        ontologyId?: string,
        ontologyDescription?: string,
        keyMappingType?: string
    ): Promise<SemanticDataInterconnectModels.OntologyJob> {
        const body = inferOntologyTemplate(
            fileName,
            file,
            mimetype,
            ontologyName,
            ontologyId,
            ontologyDescription,
            keyMappingType
        );
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/ontologyJobs`,
            body: body,
            multiPartFormData: true,
            additionalHeaders: { enctype: "multipart/form-data" },
        });
        return result as SemanticDataInterconnectModels.OntologyJob;
    }

    /**
     * * Ontologies
     *
     * Retrieve status of ontology creation/updation job
     *
     * @param {string} id
     * @returns {Promise<SemanticDataInterconnectModels.JobStatus>}
     *
     * @memberOf SemanticDataInterconnectClient
     */
    public async GetOntologyJobStatus(id: string): Promise<SemanticDataInterconnectModels.JobStatus> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/ontologyJobs/${id}`,
        });
        return result as SemanticDataInterconnectModels.JobStatus;
    }
}
