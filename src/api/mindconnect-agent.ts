// Copyright (C), Siemens AG 2017
import * as ajv from "ajv";
import fetch from "cross-fetch";
import * as debug from "debug";
import * as path from "path";
import "url-search-params-polyfill";
import { AgentAuth } from "./agent-auth";
import {
    BaseEvent,
    DataPointValue,
    DataSourceConfiguration,
    IMindConnectConfiguration,
    Mapping,
    TimeStampedDataPoint,
} from "./mindconnect-models";
import { bulkDataTemplate, dataTemplate } from "./mindconnect-template";
import { dataValidator, eventValidator } from "./mindconnect-validators";
import { MindSphereSdk } from "./sdk";
import { MultipartUploader, fileUploadOptionalParameters } from "./sdk/common/multipart-uploader";
import { retry, throwError } from "./utils";
import _ = require("lodash");
const log = debug("mindconnect-agent");
/**
 * MindConnect Agent implements the V3 of the Mindsphere API.
 *
 *  * The synchronous methods (IsOnBoarded, HasConfiguration, HasDataMapping...) are operating on agent state storage only.
 *  * The asynchronous methods (GetDataSourceConfiguration, BulkPostData...)  are calling MindSphere APIs.
 *
 * @see https://developer.siemens.com/industrial-iot-open-source/mindconnect-nodejs/agent-development/agent-state-storage.html
 *
 * @export
 * @class MindConnectAgent
 */
export class MindConnectAgent extends AgentAuth {
    public ClientId() {
        return this._configuration.content.clientId || "not defined yet";
    }

    /**
     *
     * Check in the local storage if the agent is onboarded.
     *
     * * This is a local agent state storage setting only. MindSphere API is not called.
     *
     * @see https://developer.siemens.com/industrial-iot-open-source/mindconnect-nodejs/agent-development/agent-state-storage.html
     *
     * @returns {boolean}
     * @memberof MindConnectAgent
     */
    public IsOnBoarded(): boolean {
        return this._configuration.response ? true : false;
    }

    /**
     * Checks in the local storage if the agent has a data source configuration.
     *
     * * This is a local agent state storage setting only. MindSphere API is not called.
     * * Call await GetDataSourceConfiguration() if you want to check if there is configuration in the mindsphere.
     *
     * @see https://developer.siemens.com/industrial-iot-open-source/mindconnect-nodejs/agent-development/agent-state-storage.html
     *
     * @returns {boolean}
     * @memberof MindConnectAgent
     */
    public HasDataSourceConfiguration(): boolean {
        if (!this._configuration.dataSourceConfiguration) {
            return false;
        } else if (!this._configuration.dataSourceConfiguration.configurationId) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Checks in the local storage if the agent has configured mappings.
     *
     * * This is a local agent state storage setting only. MindSphere API is not called.
     * * Call await GetDataMappings() to check if the agent has configured mappings in the MindSphere.
     *
     * @see https://developer.siemens.com/industrial-iot-open-source/mindconnect-nodejs/agent-development/agent-state-storage.html
     *
     * @returns {boolean}
     * @memberof MindConnectAgent
     */
    public HasDataMappings(): boolean {
        return (this._configuration.mappings || []).length > 0;
    }

    /**
     * Stores the configuration in the mindsphere.
     *
     * By default the eTag parameter in the provided configuration is ignored, and the agent just updates the configuration every time the put method is stored
     * and automatically increases the eTag.
     * This is why its a good idea to check if the configuration was stored before the data was posted. If the ignoreEtag is set to false then the agent just uses
     * the eTag which was specified in the configuration. This might throw an "already stored" exception in the mindsphere.
     *
     * @param {DataSourceConfiguration} dataSourceConfiguration
     * @param {boolean} [ignoreEtag=true]
     * @returns {Promise<DataSourceConfiguration>}
     * @memberof MindConnectAgent
     */
    public async PutDataSourceConfiguration(
        dataSourceConfiguration: DataSourceConfiguration,
        ignoreEtag: boolean = true
    ): Promise<DataSourceConfiguration> {
        await this.RenewToken();
        this.checkConfiguration();
        const eTag: number = this.calculateEtag(ignoreEtag, dataSourceConfiguration);

        const agentManangement = this.Sdk().GetAgentManagementClient();

        try {
            const storedConfig = await agentManangement.PutDataSourceConfiguration(
                this.ClientId(),
                dataSourceConfiguration,
                {
                    ifMatch: eTag.toString(),
                }
            );
            this._configuration.dataSourceConfiguration = storedConfig;
            await retry(5, () => this.SaveConfig());
            return storedConfig;
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    private calculateEtag(ignoreEtag: boolean, dataSourceConfiguration: DataSourceConfiguration) {
        let eTag: number = 0;

        if (this._configuration.dataSourceConfiguration && this._configuration.dataSourceConfiguration.eTag) {
            eTag = parseInt(this._configuration.dataSourceConfiguration.eTag);
            if (isNaN(eTag)) throw new Error("Invalid eTag in configuration!");
        }

        if (!ignoreEtag) {
            if (!dataSourceConfiguration.eTag) throw new Error("There is no eTag in the provided configuration!");
            eTag = parseInt(dataSourceConfiguration.eTag);
            if (isNaN(eTag)) throw new Error("Invalid eTag in provided configuration!");
        }
        return eTag;
    }

    /**
     * Acquire DataSource Configuration and store it in the Agent Storage.
     *
     * @see https://developer.siemens.com/industrial-iot-open-source/mindconnect-nodejs/agent-development/agent-state-storage.html
     *
     * @returns {Promise<DataSourceConfiguration>}
     *
     * @memberOf MindConnectAgent
     */
    public async GetDataSourceConfiguration(): Promise<DataSourceConfiguration> {
        await this.RenewToken();
        if (!this._accessToken) throw new Error("The agent doesn't have a valid access token.");
        if (!this._configuration.content.clientId) throw new Error("No client id in the configuration of the agent.");

        const agentManagment = this.Sdk().GetAgentManagementClient();

        try {
            const result = await agentManagment.GetDataSourceConfiguration(this.ClientId());
            this._configuration.dataSourceConfiguration = result;
            await retry(5, () => this.SaveConfig());
            return result;
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    /**
     * Acquire the data mappings from the MindSphere and store them in the agent state storage.
     *
     * @see https://developer.siemens.com/industrial-iot-open-source/mindconnect-nodejs/agent-development/agent-state-storage.html
     *
     * @returns {Promise<Array<Mapping>>}
     *
     * @memberOf MindConnectAgent
     */
    public async GetDataMappings(): Promise<Array<Mapping>> {
        await this.RenewToken();
        this.checkConfiguration();

        const mcapi = this.Sdk().GetMindConnectApiClient();
        const agentFilter = JSON.stringify({ agentId: `${this._configuration.content.clientId}` });

        try {
            const result = await mcapi.GetDataPointMappings({
                size: 2000,
                filter: agentFilter,
            });
            this._configuration.mappings = result.content;
            await retry(5, () => this.SaveConfig());
            return result.content;
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    private checkConfiguration() {
        !this._accessToken && throwError("The agent doesn't have a valid access token.");
        !this._configuration.content.clientId && throwError("No client id in the configuration of the agent.");
    }

    /**
     * Store data mappings in the mindsphere and also in the local agent state storage.
     *
     * @see https://developer.siemens.com/industrial-iot-open-source/mindconnect-nodejs/agent-development/agent-state-storage.html
     *
     * @param {Mapping[]} mappings
     * @returns {Promise<boolean>}
     *
     * @memberOf MindConnectAgent
     */
    public async PutDataMappings(mappings: Mapping[]): Promise<boolean> {
        await this.RenewToken();
        this.checkConfiguration();

        const mcapi = this.Sdk().GetMindConnectApiClient();

        for (const mapping of mappings) {
            log(`Storing mapping ${mapping}`);
            try {
                // we are ignoring the 409 so that method becomes retryable
                await mcapi.PostDataPointMapping(mapping, { ignoreCodes: [409] });
            } catch (err) {
                log(err);
                throw new Error(`Network error occured ${err.message}`);
            }

            let oldmappings = this._configuration.mappings || [];
            // there was a deprecation of old mappings in mindsphere, this isn't an array anymore.
            if ((oldmappings as any).content) {
                oldmappings = [];
            }
            this._configuration.mappings = _.uniqWith([...oldmappings, ...mappings], (a, b) => {
                return (
                    a.agentId === b.agentId &&
                    a.dataPointId === b.dataPointId &&
                    a.entityId === b.entityId &&
                    a.propertyName === b.propertyName &&
                    a.propertySetName === b.propertySetName
                );
            });

            await retry(5, () => this.SaveConfig());
        }
        return true;
    }

    /**
     * Deletes all mappings from the agent
     *
     * @memberOf MindConnectAgent
     */
    public async DeleteAllMappings() {
        const toDeleteMappings = await this.GetDataMappings();

        const mcapi = this.Sdk().GetMindConnectApiClient();

        for (let index = 0; index < toDeleteMappings.length; index++) {
            const element = toDeleteMappings[index];
            await mcapi.DeleteDataMapping(element.id!, { ignoreCodes: [404] });
        }

        this._configuration.mappings = [];
        await retry(5, () => this.SaveConfig());
    }

    /**
     * Posts the Events to the Exchange Endpoint
     *
     * @see: https://developer.mindsphere.io/apis/api-advanced-eventmanagement/index.html
     *
     * @param {*} events
     * @param {Date} [timeStamp=new Date()]
     * @param {boolean} [validateModel=true]
     * @returns {Promise<boolean>}
     * @memberof MindConnectAgent
     */
    public async PostEvent(
        event: BaseEvent | CustomEvent,
        timeStamp: Date = new Date(),
        validateModel: boolean = true
    ): Promise<boolean> {
        await this.RenewToken();
        if (!this._accessToken) throw new Error("The agent doesn't have a valid access token.");

        const eventManagement = this.Sdk().GetEventManagementClient();

        const headers = { ...this._apiHeaders, Authorization: `Bearer ${this._accessToken.access_token}` };
        // const url = `${this._configuration.content.baseUrl}/api/mindconnect/v3/exchange`;
        const url = `${this._configuration.content.baseUrl}/api/eventmanagement/v3/events`;
        log(`GetDataSourceConfiguration Headers ${JSON.stringify(headers)} Url ${url}`);

        if (!(event as any).timestamp) {
            (event as any).timestamp = timeStamp.toISOString();
        }

        if (validateModel) {
            const validator = this.GetEventValidator();
            const isValid = await validator(event);
            if (!isValid) {
                throw new Error(`Data doesn't match the configuration! Errors: ${JSON.stringify(validator.errors)}`);
            }
        }

        await eventManagement.PostEvent(event as any);
        return true;
    }

    /**
     * Post Data Point Values to the Exchange Endpoint
     *
     * @see: https://developer.mindsphere.io/howto/howto-upload-agent-data/index.html
     *
     * @param {DataPointValue[]} dataPoints
     * @param {Date} [timeStamp=new Date()]
     * @param {boolean} [validateModel=true] you can set this to false to speed up the things if your agent is working.
     * @returns {Promise<boolean>}
     * @memberof MindConnectAgent
     */
    public async PostData(
        dataPoints: DataPointValue[],
        timeStamp: Date = new Date(),
        validateModel: boolean = true
    ): Promise<boolean> {
        await this.RenewToken();
        if (!this._accessToken) throw new Error("The agent doesn't have a valid access token.");
        if (!this._configuration.content.clientId) throw new Error("No client id in the configuration of the agent.");
        if (!this._configuration.dataSourceConfiguration)
            throw new Error("No data source configuration for the agent.");
        if (!this._configuration.dataSourceConfiguration.configurationId)
            throw new Error("No data source configuration ID for the agent.");

        if (validateModel) {
            const validator = this.GetValidator();
            const isValid = await validator(dataPoints);
            if (!isValid) {
                throw new Error(`Data doesn't match the configuration! Errors: ${JSON.stringify(validator.errors)}`);
            }
        }

        const headers = { ...this._multipartHeaders, Authorization: `Bearer ${this._accessToken.access_token}` };
        const url = `${this._configuration.content.baseUrl}/api/mindconnect/v3/exchange`;

        log(`GetDataSourceConfiguration Headers ${JSON.stringify(headers)} Url ${url}`);

        const dataMessage = dataTemplate(
            timeStamp,
            dataPoints,
            this._configuration.dataSourceConfiguration.configurationId
        );
        log(dataMessage);

        const result = await this.SendMessage("POST", url, dataMessage, headers);
        return <boolean>result;
    }

    /**
     * Post Bulk Data Point Values to the Exchange Endpoint.
     *
     * @param {TimeStampedDataPoint[]} timeStampedDataPoints
     * @param {boolean} [validateModel=true]
     * @returns {Promise<boolean>}
     *
     * @memberOf MindConnectAgent
     */
    public async BulkPostData(
        timeStampedDataPoints: TimeStampedDataPoint[],
        validateModel: boolean = true
    ): Promise<boolean> {
        await this.RenewToken();
        if (!this._accessToken) throw new Error("The agent doesn't have a valid access token.");
        if (!this._configuration.content.clientId) throw new Error("No client id in the configuration of the agent.");
        if (!this._configuration.dataSourceConfiguration)
            throw new Error("No data source configuration for the agent.");
        if (!this._configuration.dataSourceConfiguration.configurationId)
            throw new Error("No data source configuration ID for the agent.");

        if (validateModel) {
            const validator = this.GetValidator();

            for (let index = 0; index < timeStampedDataPoints.length; index++) {
                const element = timeStampedDataPoints[index];
                const isValid = await validator(element.values);
                if (!isValid) {
                    throw new Error(
                        `Data doesn't match the configuration! Errors: ${JSON.stringify(validator.errors)}`
                    );
                }
            }
        }

        const headers = { ...this._multipartHeaders, Authorization: `Bearer ${this._accessToken.access_token}` };
        const url = `${this._configuration.content.baseUrl}/api/mindconnect/v3/exchange`;

        log(`GetDataSourceConfiguration Headers ${JSON.stringify(headers)} Url ${url}`);

        const bulkDataMessage = bulkDataTemplate(
            timeStampedDataPoints,
            this._configuration.dataSourceConfiguration.configurationId
        );
        log(bulkDataMessage);

        const result = await this.SendMessage("POST", url, bulkDataMessage, headers);
        return <boolean>result;
    }

    /**
     * Upload file to MindSphere IOTFileService
     *
     * * This method is used to upload the files to the MindSphere.
     * * It supports standard and multipart upload which can be configured with the [optional.chunk] parameter.
     *
     * * The method will try to abort the multipart upload if an exception occurs.
     * * Multipart Upload is done in following steps:
     *     * start multipart upload
     *     * upload in parallel [optional.parallelUploadChunks] the file parts (retrying [optional.retry] times if configured)
     *     * uploading last chunk.
     *
     * @param {string} entityId - asset id or agent.ClientId() for agent
     * @param {string} filepath - mindsphere file path
     * @param {(string | Buffer)} file - local path or Buffer
     * @param {fileUploadOptionalParameters} [optional] - optional parameters: enable chunking, define retries etc.
     * @param {(number | undefined)}[optional.part] multipart/upload part
     * @param {(Date | undefined)} [optional.timestamp] File timestamp in mindsphere.
     * @param {(string | undefined)} [optional.description] Description in mindsphere.
     * @param {(string | undefined)} [optional.type] Mime type in mindsphere.
     * @param {(number | undefined)} [optional.chunkSize] chunkSize. It must be bigger than 5 MB. Default 8 MB.
     * @param {(number | undefined)} [optional.retry] Number of retries
     * @param {(Function | undefined)} [optional.logFunction] log functgion is called every time a retry happens.
     * @param {(Function | undefined)} [optional.verboseFunction] verboseLog function.
     * @param {(boolean | undefined)} [optional.chunk] Set to true to enable multipart uploads
     * @param {(number | undefined)} [optional.parallelUploads] max paralell uploads for parts (default: 3)
     * @param {(number | undefined)} [optional.ifMatch] The etag for the upload.
     * @returns {Promise<string>} - md5 hash of the file
     *
     * @memberOf MindConnectAgent
     *
     * @example await agent.UploadFile (agent.GetClientId(), "some/mindsphere/path/file.txt", "file.txt");
     * @example await agent.UploadFile (agent.GetClientId(), "some/other/path/10MB.bin", "bigFile.bin",{ chunked:true, retry:5 });
     */
    public async UploadFile(
        entityId: string,
        filepath: string,
        file: string | Buffer,
        optional?: fileUploadOptionalParameters
    ): Promise<string> {
        const result = await this.uploader.UploadFile(entityId, filepath, file, optional);
        await retry(5, () => this.SaveConfig());
        return result;
    }

    /**
     * Uploads the file to mindsphere
     *
     * @deprecated please use UploadFile method instead this method will probably be removed in version 4.0.0
     *
     * @param {string} file filename or buffer for upload
     * @param {string} fileType mime type (e.g. image/png)
     * @param {string} description description of the file
     * @param {boolean} [chunk=true]  if this is set to false the system will only upload smaller files
     * @param {string} [entityId] entityid can be used to define the asset for upload, otherwise the agent is used.
     * @param {number} [chunkSize=8 * 1024 * 1024]  - at the moment 8MB as per restriction of mindgate
     * @param {number} [maxSockets=3] - maxSockets for http Upload - number of parallel multipart uploads
     * @returns {Promise<string>} md5 hash of the uploaded file
     *
     * @memberOf MindConnectAgent
     */
    public async Upload(
        file: string | Buffer,
        fileType: string,
        description: string,
        chunk: boolean = true,
        entityId?: string,
        chunkSize: number = 8 * 1024 * 1024,
        maxSockets: number = 3,
        filePath?: string
    ): Promise<string> {
        const clientId = entityId || this.ClientId();
        const filepath = filePath || (file instanceof Buffer ? "no-filepath-for-buffer" : path.basename(file));

        return await this.UploadFile(clientId, filepath, file, {
            type: fileType,
            description: description,
            chunk: chunk,
            chunkSize: chunkSize,
            parallelUploads: maxSockets,
        });
    }

    private async SendMessage(
        method: "POST" | "PUT",
        url: string,
        dataMessage: string | ArrayBuffer,
        headers: {}
    ): Promise<string | boolean> {
        try {
            const response = await fetch(url, {
                method: method,
                body: dataMessage,
                headers: headers,
                agent: this._proxyHttpAgent,
            } as RequestInit);
            if (!response.ok) {
                log({ method: method, body: dataMessage, headers: headers, agent: this._proxyHttpAgent });
                log(response);

                throw new Error(response.statusText);
            }

            const text = await response.text();
            if (response.status >= 200 && response.status <= 299) {
                const etag = response.headers.get("eTag");
                return etag ? etag : true;
            } else {
                throw new Error(`Error occured response status ${response.status} ${text}`);
            }
            // process body
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    /**
     * Generates a Data Source Configuration for specified Asset Type
     *
     * you still have to generate the mappings (or use ConfigureAgentForAssetId method)
     *
     * @example
     * config = await agent.GenerateDataSourceConfiguration("castidev.Engine");
     *
     * @param {string} assetTypeId
     * @param {("NUMERICAL" | "DESCRIPTIVE")} [mode="DESCRIPTIVE"]
     * * NUMERICAL MODE will use names like CF0001 for configurationId , DS0001,DS0002,DS0003... for data source ids and DP0001, DP0002... for dataPointIds
     * * DESCRIPTIVE MODE will use names like CF-assetName for configurationId , DS-aspectName... for data source ids and DP-variableName for data PointIds (default)
     * @returns {Promise<DataSourceConfiguration>}
     *
     * @memberOf MindConnectAgent
     */
    public async GenerateDataSourceConfiguration(
        assetTypeId: string,
        mode: "NUMERICAL" | "DESCRIPTIVE" = "DESCRIPTIVE"
    ): Promise<DataSourceConfiguration> {
        const assetType = await this.Sdk().GetAssetManagementClient().GetAssetType(assetTypeId, { exploded: true });

        const dataSourceConfiguration = this.Sdk()
            .GetMindConnectApiClient()
            .GenerateDataSourceConfiguration(assetType, mode);

        return dataSourceConfiguration;
    }

    /**
     * Generate automatically the mappings for the specified target assetid
     *
     * !Important! this only works if you have created the data source coniguration automatically
     *
     * @example
     * config = await agent.GenerateDataSourceConfiguration("castidev.Engine");
     * await agent.PutDataSourceConfiguration(config);
     * const mappings = await agent.GenerateMappings(targetassetId);
     * await agent.PutDataMappings (mappings);
     *
     * @param {string} targetAssetId
     * @returns {Mapping[]}
     *
     * @memberOf MindConnectAgent
     */
    public GenerateMappings(targetAssetId: string): Mapping[] {
        const mcapi = this.Sdk().GetMindConnectApiClient();

        !this._configuration.dataSourceConfiguration &&
            throwError(
                "no data source configuration! (have you forgotten to create / generate the data source configuration first?"
            );

        const mappings = mcapi.GenerateMappings(
            this._configuration.dataSourceConfiguration!,
            this.ClientId(),
            targetAssetId
        );

        return mappings;
    }

    /**
     * This method can automatically create all necessary configurations and mappings for selected target asset id.
     *
     * * This method will automatically create all necessary configurations and mappings to start sending the data
     * * to an asset with selected assetid in Mindsphere
     *
     * @param {string} targetAssetId
     * @param {("NUMERICAL" | "DESCRIPTIVE")} mode
     *
     * * NUMERICAL MODE will use names like CF0001 for configurationId , DS0001,DS0002,DS0003... for data source ids and DP0001, DP0002... for dataPointIds
     * * DESCRIPTIVE MODE will use names like CF-assetName for configurationId , DS-aspectName... for data source ids and DP-variableName for data PointIds (default)
     * @param {boolean} [overwrite=true] ignore eTag will overwrite mappings and data source configuration
     * @memberOf MindConnectAgent
     */
    public async ConfigureAgentForAssetId(
        targetAssetId: string,
        mode: "NUMERICAL" | "DESCRIPTIVE" = "DESCRIPTIVE",
        overwrite: boolean = true
    ) {
        const asset = await this.Sdk().GetAssetManagementClient().GetAsset(targetAssetId);
        const configuration = await this.GenerateDataSourceConfiguration(asset.typeId as unknown as string, mode);
        if (overwrite) {
            await this.GetDataSourceConfiguration();
        }
        await this.PutDataSourceConfiguration(configuration, overwrite);
        if (overwrite) {
            await this.DeleteAllMappings();
        }
        const mappings = this.GenerateMappings(targetAssetId);
        await this.PutDataMappings(mappings);
    }

    private _sdk?: MindSphereSdk = undefined;

    /**
     * MindSphere SDK using agent authentication
     *
     * ! important: not all APIs can be called with agent credentials, however MindSphere is currently working on making this possible.
     *
     *  * Here is a list of some APIs which you can use:
     *
     *  * AssetManagementClient (Read Methods)
     *  * MindConnectApiClient
     *
     * @returns {MindSphereSdk}
     *
     * @memberOf MindConnectAgent
     */
    public Sdk(): MindSphereSdk {
        if (!this._sdk) {
            this._sdk = new MindSphereSdk(this);
        }

        return this._sdk;
    }

    /**
     * Ajv Validator (@see https://github.com/ajv-validator/ajv) for the data points. Validates if the data points array is only
     * containing dataPointIds which are configured in the agent configuration.
     *
     * @returns {ajv.ValidateFunction}
     *
     * @memberOf MindConnectAgent
     */
    public GetValidator(): ajv.ValidateFunction {
        const model = this._configuration.dataSourceConfiguration;
        if (!model) {
            throw new Error("Invalid local configuration, Please get or crete the data source configuration.");
        }
        return dataValidator(model);
    }

    private _eventValidator?: ajv.ValidateFunction;

    /**
     *
     * Ajv Validator (@see https://github.com/ajv-validator/ajv) for the events. Validates the syntax of the mindsphere events.
     *
     * @returns {ajv.ValidateFunction}
     *
     * @memberOf MindConnectAgent
     */
    public GetEventValidator(): ajv.ValidateFunction {
        if (!this._eventValidator) {
            this._eventValidator = eventValidator();
        }
        return this._eventValidator;
    }

    /**
     * Get local configuration from the agent state storage.
     *
     * * This is a local agent state storage setting only. MindSphere API is not called.
     *
     * @see https://developer.siemens.com/industrial-iot-open-source/mindconnect-nodejs/agent-development/agent-state-storage.html
     *
     * @returns {IMindConnectConfiguration}
     *
     * @memberOf MindConnectAgent
     */
    public GetMindConnectConfiguration(): IMindConnectConfiguration {
        return this._configuration;
    }

    private uploader = new MultipartUploader(this);
}
