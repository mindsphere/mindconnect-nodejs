// Copyright (C), Siemens AG 2017
import * as ajv from "ajv";
import * as debug from "debug";
import fetch from "node-fetch";
import * as path from "path";
import "url-search-params-polyfill";
import { DataSourceConfiguration, Mapping, retry } from "..";
import { AgentAuth } from "./agent-auth";
import { BaseEvent, DataPointValue, IMindConnectConfiguration, TimeStampedDataPoint } from "./mindconnect-models";
import { bulkDataTemplate, dataTemplate } from "./mindconnect-template";
import { dataValidator, eventValidator } from "./mindconnect-validators";
import { MultipartUploader, optionalParameters } from "./sdk/common/multipart-uploader";
import _ = require("lodash");
const mime = require("mime-types");
const log = debug("mindconnect-agent");
/**
 * MindConnect Agent implements the V3 of the Mindsphere API.
 *
 * @export
 * @class MindConnectAgent
 */
export class MindConnectAgent extends AgentAuth {
    public ClientId() {
        return this._configuration.content.clientId || "not defined yet";
    }

    /**
     *Checkis if the agent is onboarded.
     *
     * @returns {boolean}
     * @memberof MindConnectAgent
     */
    public IsOnBoarded(): boolean {
        return this._configuration.response ? true : false;
    }

    /**
     * Checks if the agent has a data source configuration
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
     * Checks if the agent has mappings
     *
     * @returns {boolean}
     * @memberof MindConnectAgent
     */
    public HasDataMappings(): boolean {
        return this._configuration.mappings ? true : false;
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
        if (!this._accessToken) throw new Error("The agent doesn't have a valid access token.");
        if (!this._configuration.content.clientId) throw new Error("No client id in the configuration of the agent.");

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

        const headers = {
            ...this._apiHeaders,
            Authorization: `Bearer ${this._accessToken.access_token}`,
            "If-Match": eTag.toString()
        };
        const url = `${this._configuration.content.baseUrl}/api/agentmanagement/v3/agents/${
            this._configuration.content.clientId
        }/dataSourceConfiguration`;

        log(`PutDataSourceConfiguration Headers ${JSON.stringify(headers)} Url ${url} eTag ${eTag}`);

        try {
            const response = await fetch(url, {
                method: "PUT",
                body: JSON.stringify(dataSourceConfiguration),
                headers: headers,
                agent: this._proxyHttpAgent
            });
            const json = await response.json();
            if (!response.ok) {
                throw new Error(`${response.statusText} ${JSON.stringify(json)}`);
            }

            if (response.status >= 200 && response.status <= 299) {
                this._configuration.dataSourceConfiguration = json;
                await retry(5, () => this.SaveConfig());
                return json;
            } else {
                throw new Error(`invalid response ${JSON.stringify(response)}`);
            }
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    public async GetDataSourceConfiguration(): Promise<DataSourceConfiguration> {
        await this.RenewToken();
        if (!this._accessToken) throw new Error("The agent doesn't have a valid access token.");
        if (!this._configuration.content.clientId) throw new Error("No client id in the configuration of the agent.");

        const headers = { ...this._apiHeaders, Authorization: `Bearer ${this._accessToken.access_token}` };
        const url = `${this._configuration.content.baseUrl}/api/agentmanagement/v3/agents/${
            this._configuration.content.clientId
        }/dataSourceConfiguration`;

        log(`GetDataSourceConfiguration Headers ${JSON.stringify(headers)} Url ${url}`);

        try {
            const response = await fetch(url, { method: "GET", headers: headers, agent: this._proxyHttpAgent });
            if (!response.ok) {
                throw new Error(`${response.statusText}`);
            }

            const json = await response.json();

            if (response.status >= 200 && response.status <= 299) {
                this._configuration.dataSourceConfiguration = json;
                await retry(5, () => this.SaveConfig());
                return json;
            } else {
                throw new Error(`invalid response ${JSON.stringify(response)}`);
            }
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    public async GetDataMappings(): Promise<Array<Mapping>> {
        await this.RenewToken();
        if (!this._accessToken) throw new Error("The agent doesn't have a valid access token.");
        if (!this._configuration.content.clientId) throw new Error("No client id in the configuration of the agent.");

        const headers = { ...this._apiHeaders, Authorization: `Bearer ${this._accessToken.access_token}` };
        const agentFilter = encodeURIComponent(JSON.stringify({ agentId: `${this._configuration.content.clientId}` }));
        const url = `${
            this._configuration.content.baseUrl
        }/api/mindconnect/v3/dataPointMappings?filter=${agentFilter}&size=2000`;

        log(`GetDataSourceConfiguration Headers ${JSON.stringify(headers)} Url ${url}`);
        try {
            const response = await fetch(url, { method: "GET", headers: headers, agent: this._proxyHttpAgent });
            const json = await response.json();
            if (!response.ok) {
                throw new Error(`${response.statusText} ${JSON.stringify(json)}`);
            }

            if (response.status >= 200 && response.status <= 299) {
                this._configuration.mappings = json;
                await retry(5, () => this.SaveConfig());
                return json.content;
            } else {
                throw new Error(`invalid response ${JSON.stringify(response)}`);
            }
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    public async PutDataMappings(mappings: Mapping[]): Promise<boolean> {
        await this.RenewToken();
        if (!this._accessToken) throw new Error("The agent doesn't have a valid access token.");
        if (!this._configuration.content.clientId) throw new Error("No client id in the configuration of the agent.");

        const headers = { ...this._apiHeaders, Authorization: `Bearer ${this._accessToken.access_token}` };
        const url = `${this._configuration.content.baseUrl}/api/mindconnect/v3/dataPointMappings`;

        log(`GetDataSourceConfiguration Headers ${JSON.stringify(headers)} Url ${url}`);

        for (const mapping of mappings) {
            log(`Storing mapping ${mapping}`);
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(mapping),
                headers: headers,
                agent: this._proxyHttpAgent
            });
            const json = await response.json();
            try {
                if (!response.ok) {
                    throw new Error(`${response.statusText} ${JSON.stringify(json)}`);
                }
                if (!(response.status >= 200 && response.status <= 299)) {
                    throw new Error(`invalid response ${JSON.stringify(response)}`);
                }
            } catch (err) {
                log(err);
                throw new Error(`Network error occured ${err.message}`);
            }

            this._configuration.mappings = mappings;
        }
        return true;
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
        event: BaseEvent,
        timeStamp: Date = new Date(),
        validateModel: boolean = true
    ): Promise<boolean> {
        await this.RenewToken();
        if (!this._accessToken) throw new Error("The agent doesn't have a valid access token.");

        const headers = { ...this._apiHeaders, Authorization: `Bearer ${this._accessToken.access_token}` };
        // const url = `${this._configuration.content.baseUrl}/api/mindconnect/v3/exchange`;
        const url = `${this._configuration.content.baseUrl}/api/eventmanagement/v3/events`;
        log(`GetDataSourceConfiguration Headers ${JSON.stringify(headers)} Url ${url}`);

        if (!event.timestamp) {
            event.timestamp = timeStamp.toISOString();
        }

        if (validateModel) {
            const validator = this.GetEventValidator();
            const isValid = await validator(event);
            if (!isValid) {
                throw new Error(`Data doesn't match the configuration! Errors: ${JSON.stringify(validator.errors)}`);
            }
        }

        const result = await this.SendMessage("POST", url, JSON.stringify(event), headers);
        return <boolean>result;
    }

    /**
     * Post Data Point Values to the Exchange Endpoint
     *
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

    public async UploadFile(
        entityId: string,
        filepath: string,
        file: string | Buffer,
        optional?: optionalParameters
    ): Promise<string> {
        const result = await this.uploader.UploadFile(entityId, filepath, file, optional);
        await retry(5, () => this.SaveConfig());
        return result;
    }

    /**
     * Uploads the file to mindsphere
     *
     * @deprecated please use UploadFile method instead this method will be deleted in version 4.0.
     *
     * @param {string} file filename or buffer for upload
     * @param {string} fileType mime type (e.g. image/png)
     * @param {string} description description of the file
     * @param {boolean} [chunk=true]  if this is set to false the system will only upload smaller files
     * @param {string} [entityId] entityid can be used to define the asset for upload, otherwise the agent is used.
     * @param {number} [chunkSize=8 * 1024 * 1024]  - at the moment 8MB as per restriction of mindgate
     * @param {number} [maxSockets=3] - maxSockets for http Upload -
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
            paralelUploads: maxSockets
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
                agent: this._proxyHttpAgent
            });
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

    public GetValidator(): ajv.ValidateFunction {
        const model = this._configuration.dataSourceConfiguration;
        if (!model) {
            throw new Error("Invalid local configuration, Please get or crete the data source configuration.");
        }
        return dataValidator(model);
    }

    private _eventValidator?: ajv.ValidateFunction;
    public GetEventValidator(): ajv.ValidateFunction {
        if (!this._eventValidator) {
            this._eventValidator = eventValidator();
        }
        return this._eventValidator;
    }

    public GetMindConnectConfiguration(): IMindConnectConfiguration {
        return this._configuration;
    }

    private uploader = new MultipartUploader(this);
}
