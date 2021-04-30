export namespace SemanticDataInterconnectModels {
    /**
     *
     * @export
     * @class RequiredError
     * @extends {Error}
     */
    export class RequiredError extends Error {
        name: "RequiredError" = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *
     * @export
     * @interface Aliases
     */
    export interface Aliases {
        /**
         *
         * @type {string}
         * @memberof Aliases
         */
        attributeName: string;
        /**
         *
         * @type {string}
         * @memberof Aliases
         */
        aliasValue: string;
    }

    /**
     *
     * @export
     * @interface ApiErrorsView
     */
    export interface ApiErrorsView {
        /**
         *
         * @type {Array<ApiFieldError>}
         * @memberof ApiErrorsView
         */
        errors?: Array<ApiFieldError>;
    }

    /**
     *
     * @export
     * @interface ApiFieldError
     */
    export interface ApiFieldError {
        /**
         *
         * @type {string}
         * @memberof ApiFieldError
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof ApiFieldError
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof ApiFieldError
         */
        message?: string;
        /**
         *
         * @type {Array<MessageParameter>}
         * @memberof ApiFieldError
         */
        messageParameters?: Array<MessageParameter>;
    }

    /**
     *
     * @export
     * @interface CreateDataLakeRequest
     */
    export interface CreateDataLakeRequest {
        /**
         *
         * @type {string}
         * @memberof CreateDataLakeRequest
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof CreateDataLakeRequest
         */
        type?: CreateDataLakeRequest.TypeEnum;
        /**
         * This is currently supported only for the IDL customer. Please refer to the document section \"For Integrated Data Lake (IDL) customers\" on correct basePath structure.
         * @type {string}
         * @memberof CreateDataLakeRequest
         */
        basePath?: string;
    }

    /**
     * @export
     * @namespace CreateDataLakeRequest
     */
    export namespace CreateDataLakeRequest {
        /**
         * @export
         * @enum {string}
         */
        export enum TypeEnum {
            MindSphere = <any>"MindSphere",
            Custom = <any>"Custom",
        }
    }

    /**
     *
     * @export
     * @interface CreateDataLakeResponse
     */
    export interface CreateDataLakeResponse {
        /**
         *
         * @type {string}
         * @memberof CreateDataLakeResponse
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof CreateDataLakeResponse
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof CreateDataLakeResponse
         */
        type?: CreateDataLakeResponse.TypeEnum;
        /**
         *
         * @type {string}
         * @memberof CreateDataLakeResponse
         */
        basePath?: string;
        /**
         *
         * @type {string}
         * @memberof CreateDataLakeResponse
         */
        createdDate?: string;
        /**
         *
         * @type {string}
         * @memberof CreateDataLakeResponse
         */
        updatedDate?: string;
    }

    /**
     * @export
     * @namespace CreateDataLakeResponse
     */
    export namespace CreateDataLakeResponse {
        /**
         * @export
         * @enum {string}
         */
        export enum TypeEnum {
            MindSphere = <any>"MindSphere",
            Custom = <any>"Custom",
        }
    }

    /**
     *
     * @export
     * @interface CreateDataRegistryRequest
     */
    export interface CreateDataRegistryRequest {
        /**
         *
         * @type {string}
         * @memberof CreateDataRegistryRequest
         */
        dataTag?: string;
        /**
         *
         * @type {string}
         * @memberof CreateDataRegistryRequest
         */
        defaultRootTag?: string;
        /**
         *
         * @type {string}
         * @memberof CreateDataRegistryRequest
         */
        filePattern?: string;
        /**
         *
         * @type {string}
         * @memberof CreateDataRegistryRequest
         */
        fileUploadStrategy?: CreateDataRegistryRequest.FileUploadStrategyEnum;
        /**
         *
         * @type {Array<string>}
         * @memberof CreateDataRegistryRequest
         */
        metaDataTags?: Array<string>;
        /**
         *
         * @type {string}
         * @memberof CreateDataRegistryRequest
         */
        sourceName?: string;
        /**
         *
         * @type {Array<string>}
         * @memberof CreateDataRegistryRequest
         */
        xmlProcessRules?: Array<string>;
        /**
         * This property must be set to false during initial creation of a registry. It can be changed to true after the initial schema creation to reuse the existing schema for the newly ingested data
         * @type {boolean}
         * @memberof CreateDataRegistryRequest
         */
        schemaFrozen?: boolean;
    }

    /**
     * @export
     * @namespace CreateDataRegistryRequest
     */
    export namespace CreateDataRegistryRequest {
        /**
         * @export
         * @enum {string}
         */
        export enum FileUploadStrategyEnum {
            Append = <any>"append",
            Replace = <any>"replace",
        }
    }

    /**
     *
     * @export
     * @interface DataLakeList
     */
    export interface DataLakeList {
        /**
         *
         * @type {Array<DataLakeResponse>}
         * @memberof DataLakeList
         */
        dataLakes?: Array<DataLakeResponse>;
    }

    /**
     *
     * @export
     * @interface DataLakeResponse
     */
    export interface DataLakeResponse {
        /**
         *
         * @type {string}
         * @memberof DataLakeResponse
         */
        basePath?: string;
        /**
         *
         * @type {string}
         * @memberof DataLakeResponse
         */
        createdDate?: string;
        /**
         *
         * @type {string}
         * @memberof DataLakeResponse
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof DataLakeResponse
         */
        updatedDate?: string;
        /**
         *
         * @type {string}
         * @memberof DataLakeResponse
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof DataLakeResponse
         */
        type?: string;
    }

    /**
     * Either parameters or aliases must be present.
     * @export
     * @interface DataQueryExecuteQueryRequest
     */
    export interface DataQueryExecuteQueryRequest {
        /**
         *
         * @type {string}
         * @memberof DataQueryExecuteQueryRequest
         */
        description?: string;
        /**
         *
         * @type {Array<Parameters>}
         * @memberof DataQueryExecuteQueryRequest
         */
        parameters?: Array<Parameters>;
        /**
         *
         * @type {Array<Aliases>}
         * @memberof DataQueryExecuteQueryRequest
         */
        aliases?: Array<Aliases>;
    }

    /**
     *
     * @export
     * @interface DataQueryExecuteQueryResponse
     */
    export interface DataQueryExecuteQueryResponse {
        /**
         *
         * @type {string}
         * @memberof DataQueryExecuteQueryResponse
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof DataQueryExecuteQueryResponse
         */
        status?: string;
        /**
         *
         * @type {string}
         * @memberof DataQueryExecuteQueryResponse
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface DataQueryExecutionResponse
     */
    export interface DataQueryExecutionResponse {
        /**
         *
         * @type {string}
         * @memberof DataQueryExecutionResponse
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof DataQueryExecutionResponse
         */
        description?: string;
        /**
         *
         * @type {Array<Parameters>}
         * @memberof DataQueryExecutionResponse
         */
        parameters?: Array<Parameters>;
        /**
         *
         * @type {Array<Aliases>}
         * @memberof DataQueryExecutionResponse
         */
        aliases?: Array<Aliases>;
        /**
         *
         * @type {string}
         * @memberof DataQueryExecutionResponse
         */
        queryId?: string;
        /**
         * Status of execution job. - CURRENT: Job has executed successfully and results are current. - IN_PROGRESS: Job execution is in progress. - OUTDATED: Job execution completed but results are outdated. - FAILED: Job execution has failed. - OBSOLETE: Job execution completed but results are obsolete.
         * @type {string}
         * @memberof DataQueryExecutionResponse
         */
        status?: DataQueryExecutionResponse.StatusEnum;
        /**
         *
         * @type {string}
         * @memberof DataQueryExecutionResponse
         */
        createdDate?: string;
        /**
         *
         * @type {string}
         * @memberof DataQueryExecutionResponse
         */
        updatedDate?: string;
    }

    /**
     * @export
     * @namespace DataQueryExecutionResponse
     */
    export namespace DataQueryExecutionResponse {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            CURRENT = <any>"CURRENT",
            INPROGRESS = <any>"IN_PROGRESS",
            OUTDATED = <any>"OUTDATED",
            FAILED = <any>"FAILED",
            OBSOLETE = <any>"OBSOLETE",
        }
    }

    /**
     *
     * @export
     * @interface DataQuerySQLRequest
     */
    export interface DataQuerySQLRequest {
        /**
         *
         * @type {string}
         * @memberof DataQuerySQLRequest
         */
        description?: string;
        /**
         *
         * @type {boolean}
         * @memberof DataQuerySQLRequest
         */
        isBusinessQuery?: boolean;
        /**
         * If isBusinessQuery is true then ontologyId must be passed.
         * @type {string}
         * @memberof DataQuerySQLRequest
         */
        ontologyId?: string;
        /**
         *
         * @type {boolean}
         * @memberof DataQuerySQLRequest
         */
        isDynamic?: boolean;
        /**
         *
         * @type {string}
         * @memberof DataQuerySQLRequest
         */
        name: string;
        /**
         * Pass base64 encode value of spark sql like SELECT vehicle.vin, make.def FROM vehicle, make WHERE vehicle.make = make.id. Please refer SDI-How -to-create-query documentation for preparing sqlStatement.
         * @type {string}
         * @memberof DataQuerySQLRequest
         */
        sqlStatement: string;
    }

    /**
     *
     * @export
     * @interface DataQuerySQLResponse
     */
    export interface DataQuerySQLResponse {
        /**
         *
         * @type {string}
         * @memberof DataQuerySQLResponse
         */
        createdDate?: string;
        /**
         *
         * @type {string}
         * @memberof DataQuerySQLResponse
         */
        description?: string;
        /**
         *
         * @type {boolean}
         * @memberof DataQuerySQLResponse
         */
        executable?: boolean;
        /**
         *
         * @type {string}
         * @memberof DataQuerySQLResponse
         */
        id?: string;
        /**
         *
         * @type {boolean}
         * @memberof DataQuerySQLResponse
         */
        isBusinessQuery?: boolean;
        /**
         *
         * @type {boolean}
         * @memberof DataQuerySQLResponse
         */
        isDynamic?: boolean;
        /**
         *
         * @type {string}
         * @memberof DataQuerySQLResponse
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof DataQuerySQLResponse
         */
        ontologyId?: string;
        /**
         *
         * @type {Array<MappingErrorSQLDetails>}
         * @memberof DataQuerySQLResponse
         */
        pendingActions?: Array<MappingErrorSQLDetails>;
        /**
         *
         * @type {string}
         * @memberof DataQuerySQLResponse
         */
        sqlStatement?: string;
        /**
         *
         * @type {string}
         * @memberof DataQuerySQLResponse
         */
        updatedDate?: string;
    }

    /**
     *
     * @export
     * @interface DataQuerySQLUpdateRequest
     */
    export interface DataQuerySQLUpdateRequest {
        /**
         *
         * @type {string}
         * @memberof DataQuerySQLUpdateRequest
         */
        description?: string;
        /**
         *
         * @type {boolean}
         * @memberof DataQuerySQLUpdateRequest
         */
        isBusinessQuery?: boolean;
        /**
         * If isBusinessQuery is true then ontologyId must be passed.
         * @type {string}
         * @memberof DataQuerySQLUpdateRequest
         */
        ontologyId?: string;
        /**
         *
         * @type {boolean}
         * @memberof DataQuerySQLUpdateRequest
         */
        isDynamic?: boolean;
        /**
         *
         * @type {string}
         * @memberof DataQuerySQLUpdateRequest
         */
        name?: string;
        /**
         * Pass base64 encode value of spark sql like SELECT vehicle.vin, make.def FROM vehicle, make WHERE vehicle.make = make.id. Please refer SDI-How -to-create-query documentation for preparing sqlStatement.
         * @type {string}
         * @memberof DataQuerySQLUpdateRequest
         */
        sqlStatement?: string;
    }

    /**
     *
     * @export
     * @interface DataRegistry
     */
    export interface DataRegistry {
        /**
         *
         * @type {string}
         * @memberof DataRegistry
         */
        createdDate?: string;
        /**
         *
         * @type {string}
         * @memberof DataRegistry
         */
        dataTag?: string;
        /**
         *
         * @type {string}
         * @memberof DataRegistry
         */
        defaultRootTag?: string;
        /**
         *
         * @type {string}
         * @memberof DataRegistry
         */
        filePattern?: string;
        /**
         *
         * @type {string}
         * @memberof DataRegistry
         */
        fileUploadStrategy?: DataRegistry.FileUploadStrategyEnum;
        /**
         *
         * @type {string}
         * @memberof DataRegistry
         */
        updatedDate?: string;
        /**
         *
         * @type {Array<string>}
         * @memberof DataRegistry
         */
        metaDataTags?: Array<string>;
        /**
         *
         * @type {Array<string>}
         * @memberof DataRegistry
         */
        xmlProcessRules?: Array<string>;
        /**
         *
         * @type {boolean}
         * @memberof DataRegistry
         */
        mutable?: boolean;
        /**
         *
         * @type {string}
         * @memberof DataRegistry
         */
        registryId?: string;
        /**
         *
         * @type {string}
         * @memberof DataRegistry
         */
        sourceId?: string;
        /**
         *
         * @type {string}
         * @memberof DataRegistry
         */
        sourceName?: string;
        /**
         *
         * @type {boolean}
         * @memberof DataRegistry
         */
        schemaFrozen?: boolean;
    }

    /**
     * @export
     * @namespace DataRegistry
     */
    export namespace DataRegistry {
        /**
         * @export
         * @enum {string}
         */
        export enum FileUploadStrategyEnum {
            Append = <any>"append",
            Replace = <any>"replace",
        }
    }

    /**
     *
     * @export
     * @interface DataTypeDefinition
     */
    export interface DataTypeDefinition {
        /**
         *
         * @type {string}
         * @memberof DataTypeDefinition
         */
        name?: string;
        /**
         *
         * @type {Array<string>}
         * @memberof DataTypeDefinition
         */
        patterns?: Array<string>;
    }

    /**
     *
     * @export
     * @interface DataTypePattern
     */
    export interface DataTypePattern {
        /**
         *
         * @type {Array<string>}
         * @memberof DataTypePattern
         */
        patterns?: Array<string>;
    }

    /**
     *
     * @export
     * @interface ErrorMessage
     */
    export interface ErrorMessage {
        /**
         *
         * @type {Array<ApiFieldError>}
         * @memberof ErrorMessage
         */
        errors?: Array<ApiFieldError>;
    }

    /**
     *
     * @export
     * @interface GetAllSQLQueriesData
     */
    export interface GetAllSQLQueriesData {
        /**
         *
         * @type {string}
         * @memberof GetAllSQLQueriesData
         */
        createdBy?: string;
        /**
         *
         * @type {string}
         * @memberof GetAllSQLQueriesData
         */
        createdDate?: string;
        /**
         *
         * @type {string}
         * @memberof GetAllSQLQueriesData
         */
        description?: string;
        /**
         *
         * @type {boolean}
         * @memberof GetAllSQLQueriesData
         */
        executable?: boolean;
        /**
         *
         * @type {string}
         * @memberof GetAllSQLQueriesData
         */
        id?: string;
        /**
         *
         * @type {boolean}
         * @memberof GetAllSQLQueriesData
         */
        isBusinessQuery?: boolean;
        /**
         *
         * @type {boolean}
         * @memberof GetAllSQLQueriesData
         */
        isDynamic?: boolean;
        /**
         *
         * @type {string}
         * @memberof GetAllSQLQueriesData
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof GetAllSQLQueriesData
         */
        ontologyId?: string;
        /**
         *
         * @type {Array<MappingErrorSQLDetails>}
         * @memberof GetAllSQLQueriesData
         */
        pendingActions?: Array<MappingErrorSQLDetails>;
        /**
         *
         * @type {string}
         * @memberof GetAllSQLQueriesData
         */
        updatedBy?: string;
        /**
         *
         * @type {string}
         * @memberof GetAllSQLQueriesData
         */
        updatedDate?: string;
    }

    /**
     *
     * @export
     * @interface InferSchemaSearchRequest
     */
    export interface InferSchemaSearchRequest {
        /**
         *
         * @type {Array<InferSearchObject>}
         * @memberof InferSchemaSearchRequest
         */
        schemas?: Array<InferSearchObject>;
        /**
         *
         * @type {Array<string>}
         * @memberof InferSchemaSearchRequest
         */
        excludeProperties?: Array<string>;
    }

    /**
     *
     * @export
     * @interface InferSearchObject
     */
    export interface InferSearchObject {
        /**
         *
         * @type {string}
         * @memberof InferSearchObject
         */
        dataTag?: string;
        /**
         *
         * @type {string}
         * @memberof InferSearchObject
         */
        schemaName?: string;
        /**
         *
         * @type {string}
         * @memberof InferSearchObject
         */
        sourceName?: string;
        /**
         *
         * @type {string}
         * @memberof InferSearchObject
         */
        assetId?: string;
        /**
         *
         * @type {string}
         * @memberof InferSearchObject
         */
        aspectName?: string;
    }

    /**
     *
     * @export
     * @interface InputClass
     */
    export interface InputClass {
        /**
         *
         * @type {string}
         * @memberof InputClass
         */
        description?: string;
        /**
         *
         * @type {string}
         * @memberof InputClass
         */
        name?: string;
        /**
         * If class mapped with more than one schemas then user can define either one of them as primary schema.
         * @type {string}
         * @memberof InputClass
         */
        primarySchema?: string;
        /**
         * Class keyMappingType. If Parent level 'keyMappingType' is defined then class 'keyMappingType' property will overwrite Parent level 'keyMappingType' value.
         * @type {string}
         * @memberof InputClass
         */
        keyMappingType?: InputClass.KeyMappingTypeEnum;
    }

    /**
     * @export
     * @namespace InputClass
     */
    export namespace InputClass {
        /**
         * @export
         * @enum {string}
         */
        export enum KeyMappingTypeEnum {
            INNERJOIN = <any>"INNER JOIN",
            FULLOUTERJOIN = <any>"FULL OUTER JOIN",
        }
    }

    /**
     *
     * @export
     * @interface InputClassProperty
     */
    export interface InputClassProperty {
        /**
         *
         * @type {string}
         * @memberof InputClassProperty
         */
        datatype?: string;
        /**
         *
         * @type {string}
         * @memberof InputClassProperty
         */
        description?: string;
        /**
         *
         * @type {string}
         * @memberof InputClassProperty
         */
        name?: string;
        /**
         *
         * @type {InputParent}
         * @memberof InputClassProperty
         */
        parentClass?: InputParent;
    }

    /**
     *
     * @export
     * @interface InputMapping
     */
    export interface InputMapping {
        /**
         *
         * @type {InputMappingClassProperty}
         * @memberof InputMapping
         */
        classProperty?: InputMappingClassProperty;
        /**
         *
         * @type {string}
         * @memberof InputMapping
         */
        description?: string;
        /**
         *
         * @type {boolean}
         * @memberof InputMapping
         */
        functionalMapping?: boolean;
        /**
         *
         * @type {boolean}
         * @memberof InputMapping
         */
        keyMapping?: boolean;
        /**
         *
         * @type {MappingFunction}
         * @memberof InputMapping
         */
        mappingFunction?: MappingFunction;
        /**
         *
         * @type {string}
         * @memberof InputMapping
         */
        name?: string;
        /**
         *
         * @type {Array<InputMappingSchemaProperty>}
         * @memberof InputMapping
         */
        schemaProperties?: Array<InputMappingSchemaProperty>;
    }

    /**
     *
     * @export
     * @interface InputMappingClassProperty
     */
    export interface InputMappingClassProperty {
        /**
         *
         * @type {string}
         * @memberof InputMappingClassProperty
         */
        name?: string;
        /**
         *
         * @type {InputParent}
         * @memberof InputMappingClassProperty
         */
        parentClass?: InputParent;
    }

    /**
     *
     * @export
     * @interface InputMappingSchemaProperty
     */
    export interface InputMappingSchemaProperty {
        /**
         *
         * @type {string}
         * @memberof InputMappingSchemaProperty
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof InputMappingSchemaProperty
         */
        order?: string;
        /**
         *
         * @type {InputParent}
         * @memberof InputMappingSchemaProperty
         */
        parentSchema?: InputParent;
    }

    /**
     *
     * @export
     * @interface InputParent
     */
    export interface InputParent {
        /**
         *
         * @type {string}
         * @memberof InputParent
         */
        name?: string;
    }

    /**
     *
     * @export
     * @interface InputPropertyRelation
     */
    export interface InputPropertyRelation {
        /**
         *
         * @type {string}
         * @memberof InputPropertyRelation
         */
        description?: string;
        /**
         *
         * @type {InputMappingClassProperty}
         * @memberof InputPropertyRelation
         */
        endClassProperty?: InputMappingClassProperty;
        /**
         *
         * @type {string}
         * @memberof InputPropertyRelation
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof InputPropertyRelation
         */
        relationType?: string;
        /**
         *
         * @type {InputMappingClassProperty}
         * @memberof InputPropertyRelation
         */
        startClassProperty?: InputMappingClassProperty;
    }

    /**
     *
     * @export
     * @interface InputSchema
     */
    export interface InputSchema {
        /**
         *
         * @type {string}
         * @memberof InputSchema
         */
        description?: string;
        /**
         *
         * @type {string}
         * @memberof InputSchema
         */
        name?: string;
    }

    /**
     *
     * @export
     * @interface InputSchemaProperty
     */
    export interface InputSchemaProperty {
        /**
         *
         * @type {string}
         * @memberof InputSchemaProperty
         */
        datatype?: string;
        /**
         *
         * @type {string}
         * @memberof InputSchemaProperty
         */
        description?: string;
        /**
         *
         * @type {string}
         * @memberof InputSchemaProperty
         */
        name?: string;
        /**
         *
         * @type {InputParent}
         * @memberof InputSchemaProperty
         */
        parentSchema?: InputParent;
    }

    /**
     *
     * @export
     * @interface IotDataRegistry
     */
    export interface IotDataRegistry {
        /**
         *
         * @type {string}
         * @memberof IotDataRegistry
         */
        assetId?: string;
        /**
         *
         * @type {string}
         * @memberof IotDataRegistry
         */
        aspectName?: string;
    }

    /**
     *
     * @export
     * @interface IotDataRegistryResponse
     */
    export interface IotDataRegistryResponse {
        /**
         *
         * @type {string}
         * @memberof IotDataRegistryResponse
         */
        aspectName?: string;
        /**
         *
         * @type {string}
         * @memberof IotDataRegistryResponse
         */
        assetId?: string;
        /**
         * The category for this IoT Data Registry is always IOT
         * @type {string}
         * @memberof IotDataRegistryResponse
         */
        category?: string;
        /**
         *
         * @type {string}
         * @memberof IotDataRegistryResponse
         */
        createdDate?: string;
        /**
         * The dataTag is combination of assetId and aspectName, separated by _
         * @type {string}
         * @memberof IotDataRegistryResponse
         */
        dataTag?: string;
        /**
         *
         * @type {string}
         * @memberof IotDataRegistryResponse
         */
        fileUploadStrategy?: IotDataRegistryResponse.FileUploadStrategyEnum;
        /**
         *
         * @type {string}
         * @memberof IotDataRegistryResponse
         */
        updatedDate?: string;
        /**
         *
         * @type {string}
         * @memberof IotDataRegistryResponse
         */
        registryId?: string;
        /**
         * The sourceName is always MindSphere.
         * @type {string}
         * @memberof IotDataRegistryResponse
         */
        sourceName?: string;
    }

    /**
     * @export
     * @namespace IotDataRegistryResponse
     */
    export namespace IotDataRegistryResponse {
        /**
         * @export
         * @enum {string}
         */
        export enum FileUploadStrategyEnum {
            Append = <any>"append",
            Replace = <any>"replace",
        }
    }

    /**
     *
     * @export
     * @interface JobStatus
     */
    export interface JobStatus {
        /**
         * Unique Ontology job ID.
         * @type {string}
         * @memberof JobStatus
         */
        id?: string;
        /**
         * Status of ontology creation/updation job. - SUBMITTED: job has been created but creation/updation of ontology not yet started. - IN_PROGRESS: Ontology creation or updation started. - FAILED: Ontology creation or updation has failed. No data is available to be retrieved. - SUCCESS: Ontology creation or updation has been successfully finished.
         * @type {string}
         * @memberof JobStatus
         */
        status?: JobStatus.StatusEnum;
        /**
         * Contains an message in case the job created. Possible messages:  - The Request for Create Ontology.  - The Request for Create Ontology using owl file upload.  - The Request for Update Ontology.
         * @type {string}
         * @memberof JobStatus
         */
        message?: string;
        /**
         * Start time of Ontology job created in UTC date format.
         * @type {string}
         * @memberof JobStatus
         */
        createdDate?: string;
        /**
         * Job last modified time in UTC date format. The backend updates this time whenever the job status changes.
         * @type {string}
         * @memberof JobStatus
         */
        updatedDate?: string;
        /**
         * ontologyResponse will contain either ontology id or ontology error based on job success or fail.
         * @type {any}
         * @memberof JobStatus
         */
        ontologyResponse?: any;
    }

    /**
     * @export
     * @namespace JobStatus
     */
    export namespace JobStatus {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            SUBMITTED = <any>"SUBMITTED",
            INPROGRESS = <any>"IN_PROGRESS",
            ERROR = <any>"ERROR",
            SUCCESS = <any>"SUCCESS",
        }
    }

    /**
     *
     * @export
     * @interface ListOfDataTypeDefinition
     */
    export interface ListOfDataTypeDefinition {
        /**
         *
         * @type {Array<DataTypeDefinition>}
         * @memberof ListOfDataTypeDefinition
         */
        dataTypes?: Array<DataTypeDefinition>;
        /**
         *
         * @type {TokenPage}
         * @memberof ListOfDataTypeDefinition
         */
        page?: TokenPage;
    }

    /**
     *
     * @export
     * @interface ListOfIoTRegistryResponse
     */
    export interface ListOfIoTRegistryResponse {
        /**
         *
         * @type {Array<IotDataRegistryResponse>}
         * @memberof ListOfIoTRegistryResponse
         */
        iotDataRegistries?: Array<IotDataRegistryResponse>;
        /**
         *
         * @type {TokenPage}
         * @memberof ListOfIoTRegistryResponse
         */
        page?: TokenPage;
    }

    /**
     *
     * @export
     * @interface ListOfJobIds
     */
    export interface ListOfJobIds {
        /**
         *
         * @type {Array<SdiJobStatusResponse>}
         * @memberof ListOfJobIds
         */
        ingestJobStatus?: Array<SdiJobStatusResponse>;
        /**
         *
         * @type {TokenPage}
         * @memberof ListOfJobIds
         */
        page?: TokenPage;
    }

    /**
     *
     * @export
     * @interface ListOfPatterns
     */
    export interface ListOfPatterns {
        /**
         *
         * @type {Array<Pattern>}
         * @memberof ListOfPatterns
         */
        suggestPatterns?: Array<Pattern>;
    }

    /**
     *
     * @export
     * @interface ListOfRegistryResponse
     */
    export interface ListOfRegistryResponse {
        /**
         *
         * @type {Array<DataRegistry>}
         * @memberof ListOfRegistryResponse
         */
        dataRegistries?: Array<DataRegistry>;
        /**
         *
         * @type {TokenPage}
         * @memberof ListOfRegistryResponse
         */
        page?: TokenPage;
    }

    /**
     *
     * @export
     * @interface ListOfSchemaProperties
     */
    export interface ListOfSchemaProperties {}

    /**
     *
     * @export
     * @interface ListOfSchemaRegistry
     */
    export interface ListOfSchemaRegistry {
        /**
         *
         * @type {Array<SDISchemaRegistry>}
         * @memberof ListOfSchemaRegistry
         */
        schemas?: Array<SDISchemaRegistry>;
        /**
         *
         * @type {TokenPage}
         * @memberof ListOfSchemaRegistry
         */
        page?: TokenPage;
    }

    /**
     *
     * @export
     * @interface MappingErrorSQLDetails
     */
    export interface MappingErrorSQLDetails {
        /**
         *
         * @type {string}
         * @memberof MappingErrorSQLDetails
         */
        field?: string;
        /**
         *
         * @type {string}
         * @memberof MappingErrorSQLDetails
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface MappingFunction
     */
    export interface MappingFunction {
        /**
         *
         * @type {string}
         * @memberof MappingFunction
         */
        operator?: string;
    }

    /**
     * A descriptor for errors that are integral parts of resources.
     * @export
     * @interface MdspApiError
     */
    export interface MdspApiError {
        /**
         * Unique error code. Every code is bound to one (parametrized) message.
         * @type {string}
         * @memberof MdspApiError
         */
        code?: string;
        /**
         * Human readable error message in English.
         * @type {string}
         * @memberof MdspApiError
         */
        message?: string;
        /**
         * In case an error message is parametrized, the parameter names and values are returned for, e.g., localization purposes. The parametrized error messages are defined at the operation error response descriptions in this API specification. Parameters are denoted by named placeholders '{\\<parameter name\\>}' in the message specifications. At runtime, returned message placeholders are substituted by actual parameter values.
         * @type {Array<any>}
         * @memberof MdspApiError
         */
        messageParameters?: Array<any>;
    }

    /**
     * A descriptor for error responses.
     * @export
     * @interface MdspError
     */
    export interface MdspError extends MdspApiError {
        /**
         * Logging correlation ID for debugging purposes.
         * @type {string}
         * @memberof MdspError
         */
        logref?: string;
    }

    /**
     *
     * @export
     * @interface MdspErrors
     */
    export interface MdspErrors {
        /**
         *
         * @type {Array<MdspError>}
         * @memberof MdspErrors
         */
        errors?: Array<MdspError>;
    }

    /**
     *
     * @export
     * @interface MessageParameter
     */
    export interface MessageParameter {
        /**
         *
         * @type {string}
         * @memberof MessageParameter
         */
        name?: string;
        /**
         *
         * @type {any}
         * @memberof MessageParameter
         */
        value?: any;
    }

    /**
     *
     * @export
     * @interface NativeQueryGetResponse
     */
    export interface NativeQueryGetResponse {
        /**
         *
         * @type {string}
         * @memberof NativeQueryGetResponse
         */
        createdDate?: string;
        /**
         *
         * @type {string}
         * @memberof NativeQueryGetResponse
         */
        description?: string;
        /**
         *
         * @type {boolean}
         * @memberof NativeQueryGetResponse
         */
        executable?: boolean;
        /**
         *
         * @type {string}
         * @memberof NativeQueryGetResponse
         */
        id?: string;
        /**
         *
         * @type {boolean}
         * @memberof NativeQueryGetResponse
         */
        isBusinessQuery?: boolean;
        /**
         *
         * @type {boolean}
         * @memberof NativeQueryGetResponse
         */
        isDynamic?: boolean;
        /**
         *
         * @type {string}
         * @memberof NativeQueryGetResponse
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof NativeQueryGetResponse
         */
        ontologyId?: string;
        /**
         *
         * @type {Array<MappingErrorSQLDetails>}
         * @memberof NativeQueryGetResponse
         */
        pendingActions?: Array<MappingErrorSQLDetails>;
        /**
         *
         * @type {string}
         * @memberof NativeQueryGetResponse
         */
        sqlStatement?: string;
        /**
         *
         * @type {string}
         * @memberof NativeQueryGetResponse
         */
        updatedDate?: string;
        /**
         *
         * @type {Array<string>}
         * @memberof NativeQueryGetResponse
         */
        lastTenExecutionJobIds?: Array<string>;
    }

    /**
     *
     * @export
     * @interface OntologyJob
     */
    export interface OntologyJob {
        /**
         * Unique Ontology job ID.
         * @type {string}
         * @memberof OntologyJob
         */
        id?: string;
        /**
         * Status of ontology creation/updation job. - SUBMITTED: job has been created but creation/updation of ontology not yet started. - IN_PROGRESS: Ontology creation or updation started. - FAILED: Ontology creation or updation has failed. No data is available to be retrieved. - SUCCESS: Ontology creation or updation has been successfully finished.
         * @type {string}
         * @memberof OntologyJob
         */
        status?: OntologyJob.StatusEnum;
        /**
         * Contains an message in case the job created. Possible messages:  - The Resuest for Create Ontology.  - The Resuest for Create Ontology using owl file upload.  - The Resuest for Update Ontology.
         * @type {string}
         * @memberof OntologyJob
         */
        message?: string;
        /**
         * Start time of Ontology job created in UTC date format.
         * @type {string}
         * @memberof OntologyJob
         */
        createdDate?: string;
        /**
         * Job last modified time in UTC date format. The backend updates this time whenever the job status changes.
         * @type {string}
         * @memberof OntologyJob
         */
        updatedDate?: string;
    }

    /**
     * @export
     * @namespace OntologyJob
     */
    export namespace OntologyJob {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            SUBMITTED = <any>"SUBMITTED",
            INPROGRESS = <any>"IN_PROGRESS",
            ERROR = <any>"ERROR",
            SUCCESS = <any>"SUCCESS",
        }
    }

    /**
     *
     * @export
     * @interface OntologyMetadata
     */
    export interface OntologyMetadata {
        /**
         *
         * @type {string}
         * @memberof OntologyMetadata
         */
        createdDate?: string;
        /**
         * Ontology description.
         * @type {string}
         * @memberof OntologyMetadata
         */
        ontologyDescription?: string;
        /**
         * Ontology id.
         * @type {string}
         * @memberof OntologyMetadata
         */
        id?: string;
        /**
         * Ontology name.
         * @type {string}
         * @memberof OntologyMetadata
         */
        ontologyName?: string;
        /**
         * Ontology keyMappingType.
         * @type {string}
         * @memberof OntologyMetadata
         */
        keyMappingType?: string;
        /**
         *
         * @type {string}
         * @memberof OntologyMetadata
         */
        updatedDate?: string;
    }

    /**
     *
     * @export
     * @interface OntologyResponseData
     */
    export interface OntologyResponseData {
        /**
         *
         * @type {string}
         * @memberof OntologyResponseData
         */
        createdDate?: string;
        /**
         * Ontology description.
         * @type {string}
         * @memberof OntologyResponseData
         */
        ontologyDescription?: string;
        /**
         * Ontology id.
         * @type {string}
         * @memberof OntologyResponseData
         */
        id?: string;
        /**
         * Ontology name.
         * @type {string}
         * @memberof OntologyResponseData
         */
        ontologyName?: string;
        /**
         * Ontology keyMappingType.
         * @type {string}
         * @memberof OntologyResponseData
         */
        keyMappingType?: string;
        /**
         *
         * @type {string}
         * @memberof OntologyResponseData
         */
        updatedDate?: string;
        /**
         *
         * @type {Array<InputClassProperty>}
         * @memberof OntologyResponseData
         */
        classProperties?: Array<InputClassProperty>;
        /**
         *
         * @type {Array<InputClass>}
         * @memberof OntologyResponseData
         */
        classes?: Array<InputClass>;
        /**
         *
         * @type {Array<InputMapping>}
         * @memberof OntologyResponseData
         */
        mappings?: Array<InputMapping>;
        /**
         *
         * @type {Array<InputPropertyRelation>}
         * @memberof OntologyResponseData
         */
        propertyRelations?: Array<InputPropertyRelation>;
        /**
         *
         * @type {Array<InputSchemaProperty>}
         * @memberof OntologyResponseData
         */
        schemaProperties?: Array<InputSchemaProperty>;
        /**
         *
         * @type {Array<InputSchema>}
         * @memberof OntologyResponseData
         */
        schemas?: Array<InputSchema>;
    }

    /**
     *
     * @export
     * @interface Parameters
     */
    export interface Parameters {
        /**
         *
         * @type {string}
         * @memberof Parameters
         */
        paramName: string;
        /**
         *
         * @type {string}
         * @memberof Parameters
         */
        paramValue: string;
    }

    /**
     *
     * @export
     * @interface Pattern
     */
    export interface Pattern {
        /**
         *
         * @type {string}
         * @memberof Pattern
         */
        schema?: string;
        /**
         *
         * @type {Array<string>}
         * @memberof Pattern
         */
        matches?: Array<string>;
        /**
         *
         * @type {boolean}
         * @memberof Pattern
         */
        schemaValid?: boolean;
    }

    /**
     *
     * @export
     * @interface QueryObsoleteResult
     */
    export interface QueryObsoleteResult {
        /**
         *
         * @type {Array<ApiFieldError>}
         * @memberof QueryObsoleteResult
         */
        errors?: Array<ApiFieldError>;
        /**
         *
         * @type {Array<any>}
         * @memberof QueryObsoleteResult
         */
        data?: Array<any>;
    }

    /**
     * If user creates query 'SELECT vehicle.vin, make.def FROM vehicle, make WHERE vehicle.make = make.id' returns results as array of json object contaning keys as 'vehicle.vin', 'make.def' and values matching according to criteria.
     * @export
     * @interface QueryResult
     */
    export interface QueryResult {
        /**
         * Query result status.
         * @type {string}
         * @memberof QueryResult
         */
        status?: string;
        /**
         *
         * @type {string}
         * @memberof QueryResult
         */
        timestamp?: string;
        /**
         *
         * @type {Array<any>}
         * @memberof QueryResult
         */
        data?: Array<any>;
    }

    /**
     *
     * @export
     * @interface ResponseAllDataQueryExecutionResponse
     */
    export interface ResponseAllDataQueryExecutionResponse {
        /**
         *
         * @type {TokenPage}
         * @memberof ResponseAllDataQueryExecutionResponse
         */
        page?: TokenPage;
        /**
         *
         * @type {Array<DataQueryExecutionResponse>}
         * @memberof ResponseAllDataQueryExecutionResponse
         */
        jobs?: Array<DataQueryExecutionResponse>;
    }

    /**
     *
     * @export
     * @interface ResponseAllDataSQLQuery
     */
    export interface ResponseAllDataSQLQuery {
        /**
         *
         * @type {TokenPage}
         * @memberof ResponseAllDataSQLQuery
         */
        page?: TokenPage;
        /**
         *
         * @type {Array<GetAllSQLQueriesData>}
         * @memberof ResponseAllDataSQLQuery
         */
        queries?: Array<GetAllSQLQueriesData>;
    }

    /**
     *
     * @export
     * @interface ResponseAllOntologies
     */
    export interface ResponseAllOntologies {
        /**
         *
         * @type {Array<OntologyMetadata>}
         * @memberof ResponseAllOntologies
         */
        ontologies?: Array<OntologyMetadata>;
        /**
         *
         * @type {TokenPage}
         * @memberof ResponseAllOntologies
         */
        page?: TokenPage;
    }

    /**
     *
     * @export
     * @interface SDIIngestData
     */
    export interface SDIIngestData {
        /**
         *
         * @type {string}
         * @memberof SDIIngestData
         */
        dataTag?: string;
        /**
         *
         * @type {string}
         * @memberof SDIIngestData
         */
        filePath?: string;
        /**
         *
         * @type {string}
         * @memberof SDIIngestData
         */
        rootTag?: string;
        /**
         *
         * @type {string}
         * @memberof SDIIngestData
         */
        sourceName?: string;
    }

    /**
     *
     * @export
     * @interface SDISchemaProperty
     */
    export interface SDISchemaProperty {
        /**
         *
         * @type {string}
         * @memberof SDISchemaProperty
         */
        dataType: string;
        /**
         *
         * @type {Array<string>}
         * @memberof SDISchemaProperty
         */
        customTypes?: Array<string>;
    }

    /**
     *
     * @export
     * @interface SDISchemaRegistry
     */
    export interface SDISchemaRegistry {
        /**
         *
         * @type {string}
         * @memberof SDISchemaRegistry
         */
        createdDate?: string;
        /**
         *
         * @type {string}
         * @memberof SDISchemaRegistry
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof SDISchemaRegistry
         */
        updatedDate?: string;
        /**
         *
         * @type {Array<string>}
         * @memberof SDISchemaRegistry
         */
        originalFileNames?: Array<string>;
        /**
         * This is a loosely defined schema string containing property name, one or more data type for given property and list of regex patterns for a type.
         * @type {{ [key: string]: ListOfSchemaProperties; }}
         * @memberof SDISchemaRegistry
         */
        schema?: { [key: string]: ListOfSchemaProperties };
        /**
         *
         * @type {string}
         * @memberof SDISchemaRegistry
         */
        schemaName?: string;
        /**
         *
         * @type {string}
         * @memberof SDISchemaRegistry
         */
        registryId?: string;
        /**
         *
         * @type {string}
         * @memberof SDISchemaRegistry
         */
        category?: string;
    }

    /**
     *
     * @export
     * @interface SchemaSearchObject
     */
    export interface SchemaSearchObject {
        /**
         *
         * @type {string}
         * @memberof SchemaSearchObject
         */
        dataTag?: string;
        /**
         *
         * @type {string}
         * @memberof SchemaSearchObject
         */
        schemaName?: string;
        /**
         *
         * @type {string}
         * @memberof SchemaSearchObject
         */
        category?: SchemaSearchObject.CategoryEnum;
        /**
         *
         * @type {string}
         * @memberof SchemaSearchObject
         */
        aspectName?: string;
        /**
         *
         * @type {string}
         * @memberof SchemaSearchObject
         */
        assetId?: string;
        /**
         *
         * @type {string}
         * @memberof SchemaSearchObject
         */
        sourceName?: string;
        /**
         * metaDataTags can be defined while creating a data registry.
         * @type {Array<string>}
         * @memberof SchemaSearchObject
         */
        metaDataTags?: Array<string>;
    }

    /**
     * @export
     * @namespace SchemaSearchObject
     */
    export namespace SchemaSearchObject {
        /**
         * @export
         * @enum {string}
         */
        export enum CategoryEnum {
            ENTERPRISE = <any>"ENTERPRISE",
            IOT = <any>"IOT",
        }
    }

    /**
     *
     * @export
     * @interface SchemaSearchRequest
     */
    export interface SchemaSearchRequest {
        /**
         *
         * @type {Array<SchemaSearchObject>}
         * @memberof SchemaSearchRequest
         */
        schemas?: Array<SchemaSearchObject>;
    }

    /**
     *
     * @export
     * @interface SdiFileUploadResponse
     */
    export interface SdiFileUploadResponse {
        /**
         *
         * @type {string}
         * @memberof SdiFileUploadResponse
         */
        filePath?: string;
    }

    /**
     *
     * @export
     * @interface SdiJobStatusResponse
     */
    export interface SdiJobStatusResponse {
        /**
         *
         * @type {string}
         * @memberof SdiJobStatusResponse
         */
        jobId?: string;
        /**
         *
         * @type {string}
         * @memberof SdiJobStatusResponse
         */
        startedDate?: string;
        /**
         *
         * @type {string}
         * @memberof SdiJobStatusResponse
         */
        finishedDate?: string;
        /**
         *
         * @type {string}
         * @memberof SdiJobStatusResponse
         */
        message?: string;
        /**
         *
         * @type {string}
         * @memberof SdiJobStatusResponse
         */
        fileName?: string;
        /**
         *
         * @type {string}
         * @memberof SdiJobStatusResponse
         */
        status?: SdiJobStatusResponse.StatusEnum;
    }

    /**
     * @export
     * @namespace SdiJobStatusResponse
     */
    export namespace SdiJobStatusResponse {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            INPROGRESS = <any>"IN_PROGRESS",
            ERROR = <any>"ERROR",
            STARTED = <any>"STARTED",
            FINISHED = <any>"FINISHED",
        }
    }

    /**
     *
     * @export
     * @interface TokenPage
     */
    export interface TokenPage {
        /**
         * Opaque token to next page. Can be used in query paramter 'pageToken' to request next page. The property is only present in case there is a next page.
         * @type {string}
         * @memberof TokenPage
         */
        nextToken?: string;
    }

    /**
     *
     * @export
     * @interface UpdateDataLakeRequest
     */
    export interface UpdateDataLakeRequest {
        /**
         *
         * @type {string}
         * @memberof UpdateDataLakeRequest
         */
        basePath?: string;
    }

    /**
     *
     * @export
     * @interface UpdateDataRegistryRequest
     */
    export interface UpdateDataRegistryRequest {
        /**
         *
         * @type {string}
         * @memberof UpdateDataRegistryRequest
         */
        defaultRootTag?: string;
        /**
         *
         * @type {string}
         * @memberof UpdateDataRegistryRequest
         */
        filePattern?: string;
        /**
         *
         * @type {string}
         * @memberof UpdateDataRegistryRequest
         */
        fileUploadStrategy?: UpdateDataRegistryRequest.FileUploadStrategyEnum;
        /**
         *
         * @type {Array<string>}
         * @memberof UpdateDataRegistryRequest
         */
        metaDataTags?: Array<string>;
        /**
         *
         * @type {Array<string>}
         * @memberof UpdateDataRegistryRequest
         */
        xmlProcessRules?: Array<string>;
        /**
         * This property can be changed to true after creating the initial schema to reuse the schema for the newly ingested data
         * @type {boolean}
         * @memberof UpdateDataRegistryRequest
         */
        schemaFrozen?: boolean;
    }

    /**
     * @export
     * @namespace UpdateDataRegistryRequest
     */
    export namespace UpdateDataRegistryRequest {
        /**
         * @export
         * @enum {string}
         */
        export enum FileUploadStrategyEnum {
            Append = <any>"append",
            Replace = <any>"replace",
        }
    }
}
