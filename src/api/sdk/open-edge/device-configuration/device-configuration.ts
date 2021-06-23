// noinspection JSValidateJSDoc

import { toQueryString } from "../../../utils";
import { SdkClient } from "../../common/sdk-client";
import { DeviceConfigurationModels } from "./device-configuration-models";

/**
 * Device Configuration API
 * Device Configuration API can be used to manage device configuration files and to coordinate configuration tasks for devices. The provided operations do not trigger any actions themselves, but are meant to be used by northbound applications to coordinate user and device efforts. Configuration tasks consist of different states that require the app operator user and the target device to participate in order to complete a task.  Devices should use Deployment Workflow API to find out about configuration tasks. Device Configuration Service is based on Deployment Workflow Service and reflects all changes applied through Deployment Workflow API. Once a task is created in this API, it will be available also through Deployment Workflow API. The configuration task status can be advanced at this API or at Deployment Workflow API.
 *
 * @export
 * @class DeviceConfigurationClient
 * @extends {SdkClient}
 */
export class DeviceConfigurationClient extends SdkClient {
    private _baseUrl: string = "/api/deviceconfiguration/v3";

    /**
     * Returns a paginated list of all tasks of the specified device ordered by descending creation date (newest tasks first)
     * @summary List all tasks of a device
     * @param {string} id Id of the device that owns the task.
     * @param {number} [size] The maximum number of elements returned in one page
     * @param {number} [page] The (0-based) index of the page
     * @param {string} [sort] The order in which the elements are returned. Multiple fields could be used spearated by comma
     * @returns {Promise<DeviceConfigurationModels.PaginatedConfigurationTask>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetConfigurationTasks("mdsp.myDevice")
     * @memberof DeviceConfigurationClient
     */
    public async GetConfigurationTasks(
        id: string,
        size?: number,
        page?: number,
        sort?: string
    ): Promise<DeviceConfigurationModels.PaginatedConfigurationTask>  {
        // verify required parameter 'deviceId' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "deviceId",
                "Required parameter id was null or undefined when calling GetConfigurationTasks."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/configurationTasks?${toQueryString({size, page, sort })}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.PaginatedConfigurationTask;
    }

    /**
     * Returns the specified task   # Current State #   The `currentState` field contains information about the current state in the state machine as well as the progress inside this state (if updated by the device)   # History #  The 'history' field contains a \"trace\" of all the past states this task was in, as well as the entry and exit times. It can be used to reconstruct the sequence of event/ actions that happend in this task.
     * @summary Get task
     * @param {string} id Id of the device that owns the task.
     * @param {string} taskId Id of the task
     * @returns {Promise<DeviceConfigurationModels.ConfigurationTask>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetDeviceConfigurationTask("mdsp.EnvironmentDevice", "345af46...")
     * @memberOf DeviceConfigurationClient
     */
    public async GetDeviceConfigurationTask(id: string, taskId: string): Promise<DeviceConfigurationModels.ConfigurationTask> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetDeviceConfigurationTask."
            );
        }
        // verify required parameter 'taskId' is not null or undefined
        if (taskId === null || taskId === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "taskId",
                "Required parameter taskId was null or undefined when calling GetDeviceConfigurationTask."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/configurationTasks/${taskId}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.ConfigurationTask;
    }

    /**
     * Create a new config deployment task.  # Start of Execution # The newly created task will be in the CREATED state and thus not visible to the device. In order to start the execution of the task, update it to the CONFIGURE state.  # Files # Each task refers to one or more files. Devices are expected to apply all files of a task in an \"atomic\" fashion (as far as this is feasible) The specified URI will be passed \"as-is\" to the device. Devices are expected to access this URI using Mindsphere credentials. Typically this URI will refer to a file in the Configuration File Storage, however it is possible to pass any URIs to the device as long as the device has the appropriate credentials to access the URI.  # CustomData #  The optional customData field can be used to pass arbitrary json data from the backend to the device in order. The backend will forward this information \"as-is\" to the device.
     * @summary Create new task
     * @param {string} id Id of the device that owns the task.
     * @param {DeviceConfigurationModels.TaskDefinition} taskDefinition task definition
     * @returns {Promise<DeviceConfigurationModels.ConfigurationTask>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await DeviceConfigurationClient.PostNewDeploymentTaskConfiguration("myDeviceID", ...)
     * @memberOf DeviceConfigurationClient
     */
    public async PostNewDeploymentTaskConfiguration(
        id: string,
        taskDefinition: DeviceConfigurationModels.TaskDefinition
    ): Promise<DeviceConfigurationModels.ConfigurationTask> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PostNewDeploymentTaskConfiguration."
            );
        }
        // verify required parameter 'taskDefinition' is not null or undefined
        if (taskDefinition === null || taskDefinition === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "taskDefinition",
                "Required parameter taskDefinition was null or undefined when calling PostNewDeploymentTaskConfiguration."
            );
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/configurationTasks`,
            body: taskDefinition,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.ConfigurationTask;
    }

    /**
     * Updates the task.  Updates must follow the state machine definition. Failing to do so will cause a 409 error
     * @summary Update a task
     * @param {string} id Id of the device that owns the task.
     * @param {string} taskId Id of the task
     * @param {DeviceConfigurationModels.Updatetask} progressReport Updated configuration
     * @returns {Promise<DeviceConfigurationModels.ConfigurationTask>}
     *
     * @example await DeviceConfigurationClient.PatchDeploymentTaskConfiguration("myDeviceID", "mytaskID", ...)
     * @memberOf DeviceConfigurationClient
     */
    public async PatchDeploymentTaskConfiguration(
        id: string,
        taskId: string,
        progressReport: DeviceConfigurationModels.Updatetask
    ): Promise<DeviceConfigurationModels.ConfigurationTask> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PatchDeploymentTaskConfiguration."
            );
        }
        // verify required parameter 'taskId' is not null or undefined
        if (taskId === null || taskId === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "taskId",
                "Required parameter taskId was null or undefined when calling PatchDeploymentTaskConfiguration."
            );
        }
        // verify required parameter 'progressReport' is not null or undefined
        if (progressReport === null || progressReport === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "progressReport",
                "Required parameter progressReport was null or undefined when calling PatchDeploymentTaskConfiguration."
            );
        }


        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/configurationTasks/${taskId}`,
            body: progressReport,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.ConfigurationTask;
    }

    /**
     * Lists all files # Filtering / Searching # Using the `pathPrefix` query parameter, this endpoint can be used to  look up the ids of files with a given path prefix. The supplied prefix will be compared with the `path` field of the file metadata. Users of the API should pick a naming scheme that allows efficient searching of files, e.g., using `{id}/{filename}.json` allows efficient listing of all files \"belonging\" to a specific device id.
     * @summary List files
     * @param {string} pathPrefix the prefix to search for
     * @param {number} [size] The maximum number of elements returned in one page
     * @param {number} [page] The (0-based) index of the page
     * @param {string} [sort] The order in which the elements are returned. Multiple fields could be used spearated by comma
     * @returns {Promise<DeviceConfigurationModels.PaginatedFileMetaData>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetFiles("./myfile")
     * @memberof DeviceConfigurationClient
     */
    public async GetFiles(
        pathPrefix: string,
        size?: number,
        page?: number,
        sort?: string
    ): Promise<DeviceConfigurationModels.PaginatedFileMetaData>  {
        // verify required parameter 'pathPrefix' is not null or undefined
        if (pathPrefix === null || pathPrefix === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "pathPrefix",
                "Required parameter pathPrefix was null or undefined when calling GetFiles."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files?${toQueryString({ pathPrefix, size, page, sort })}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.PaginatedFileMetaData;
    }

    /**
     * Returns the metadata of the specified file. # File Id to Path Mapping # To obtain the id of a file, the GET `files` endpoint can be used which allows looking up file ids based on a path prefix  # File Metadata / File Content # This endpoint returns the metadata of the file. To access the content of the file, either use the `files/{id}/head` endpoint (to access the latest revision) or list all available revisions via  `files/{id}/revisions` and access the content of a specific revision via `files/{id}/revisions/{hash}/content`
     * @summary Get file metadata
     * @param {string} id the ID of the file
     * @returns {Promise<DeviceConfigurationModels.FileMetaData>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetFileMetadata("myFileID")
     * @memberOf DeviceConfigurationClient
     */
    public async GetFileMetadata(id: string): Promise<DeviceConfigurationModels.FileMetaData> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetFileMetadata."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.FileMetaData;
    }

    /**
     * Create a new config file. The specified path must be unique (see general documentation about paths)
     * @summary Create a new empty file
     * @param {DeviceConfigurationModels.ConfigurationFile} file configuration file object
     * @returns {Promise<DeviceConfigurationModels.FileMetaData>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await DeviceConfigurationClient.PostNewFile( ...)
     * @memberOf DeviceConfigurationClient
     */
    public async PostNewFile(
        file: DeviceConfigurationModels.ConfigurationFile
    ): Promise<DeviceConfigurationModels.FileMetaData> {
        // verify required parameter 'file' is not null or undefined
        if (file === null || file === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "file",
                "Required parameter file was null or undefined when calling PostNewFile."
            );
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files`,
            body: file,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.FileMetaData;
    }

    /**
     * Updates the \"head\" of this file, i.e., creates a new revision containing the data sent with the requests and updates the head resource to point to this new revision. Clients should use the If-Match header to safeguard against lost updates, i.e. concurrent access to the head resource  # Content Metadata #  Information about the content type and content length of the file are taken from the corresponding http header fields and must be correctly set by the client
     * @summary Update \"head\"
     * @param {string} id the ID of the file
     * @param {DeviceConfigurationModels.Payload} content Binary content of file.
     * @param {string} [contentType] Defines the accept header value to be used when retrieving the content
     * @returns {Promise<DeviceConfigurationModels.FileMetaData>}
     *
     * @example await DeviceConfigurationClient.PatchDeploymentTaskConfiguration("myFileID", ...)
     * @memberOf DeviceConfigurationClient
     */
    public async PatchFileHead(
        id: string,
        content: DeviceConfigurationModels.Payload,
        contentType?: string
    ): Promise<DeviceConfigurationModels.FileMetaData> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PatchFileHead."
            );
        }
        // verify required parameter 'content' is not null or undefined
        if (content === null || content === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "content",
                "Required parameter content was null or undefined when calling PatchFileHead."
            );
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}/head`,
            body: content,
            additionalHeaders: { "Content-Type": contentType ? contentType : "*/*" },
        });

        return result as DeviceConfigurationModels.FileMetaData;
    }

    /**
     * Deletes the specified file. This will also delete any revisions of this file and their content. # Idempotency # This endpoint provides idempotent deletes, i.e., repeated deletes to the same resource will always return 204 responses regardless whether the resource existed in the first place or not.
     * @summary Delete file
     * @param {string} id the ID of the file
     *
     * @example await DeviceConfigurationClient.DeleteFile("myFileID")
     *
     * @memberOf DeviceConfigurationClient
     */
    public async DeleteFile(id: string) {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling DeleteFile."
            );
        }

        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}`,
            noResponse: true,
        });
    }

    /**
     * Returns a paginated list of all revisions of the specified file. # File Metadata / File Content # This endpoint returns the metadata of the revision. To access the  content use the`files/{id}/revisions/{hash}/content` endpoint
     * @summary List revisions of a file
     * @param {string} id the ID of the file
     * @param {number} [size] The maximum number of elements returned in one page
     * @param {number} [page] The (0-based) index of the page
     * @param {string} [sort] The order in which the elements are returned. Multiple fields could be used spearated by comma
     * @returns {Promise<DeviceConfigurationModels.PaginatedRevisionMetaData>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetFileRevisions("myFileID")
     * @memberof DeviceConfigurationClient
     */
    public async GetFileRevisions(
        id: string,
        size?: number,
        page?: number,
        sort?: string
    ): Promise<DeviceConfigurationModels.PaginatedRevisionMetaData>  {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetFiles."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}/revisions?${toQueryString({ size, page, sort })}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.PaginatedRevisionMetaData;
    }

    /**
     * Returns the metadata of the specified file revision
     * @summary Get revision metadata
     * @param {string} id the ID of the file
     * @param {string} hash the hash, also serves as id of the revision
     * @returns {Promise<DeviceConfigurationModels.RevisionMetaData>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetFileMetadata("myFileID", "8ac80b...")
     * @memberOf DeviceConfigurationClient
     */
    public async GetFileRevisionMetadata(
        id: string,
        hash: string
    ): Promise<DeviceConfigurationModels.RevisionMetaData> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetFileRevisionMetadata."
            );
        }

        // verify required parameter 'hash' is not null or undefined
        if (hash === null || hash === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "hash",
                "Required parameter hash was null or undefined when calling GetFileRevisionMetadata."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}/revisions/${hash}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.RevisionMetaData;
    }

    /**
     * Returns the content of the specified file revision.
     * @summary Get revision content
     * @param {string} id the ID of the file
     * @param {string} hash the hash, also serves as id of the revision
     * @param {string} [accept] If provided, must equal Content-Type provided while uploading
     * @returns {Promise<DeviceConfigurationModels.Payload>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetFileRevisionContent("myFileID",...)
     * @memberOf DeviceConfigurationClient
     */
    public async GetFileRevisionContent(
        id: string,
        hash: string,
        accept?: string
    ): Promise<DeviceConfigurationModels.Payload> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetFileRevisionContent."
            );
        }

        // verify required parameter 'hash' is not null or undefined
        if (hash === null || hash === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "hash",
                "Required parameter hash was null or undefined when calling GetFileRevisionContent."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}/revisions/${hash}/content`,
            additionalHeaders: { "Accept": accept ? accept : "application/octet-stream"},
        });

        return result as DeviceConfigurationModels.Payload;
    }

    /**
     * Creates a new revision containing the provided content. This endpoint will not update the \"head\" of the file to point to the new revision. # Content Metadata #  Information about the content type and content length of the file are taken from the corresponding http header fields and must be correctly set by the client
     * @summary Create a new revision
     * @param {string} id the ID of the file
     * @param {Payload} content Binary content of file.
     * @param {string} [contentType] Defines the accept header value to be used when retrieving the content
     * @returns {Promise<DeviceConfigurationModels.RevisionMetaData>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await DeviceConfigurationClient.PostFileRevision("myFileID", ...)
     * @memberOf DeviceConfigurationClient
     */
    public async PostFileRevision(
        id: string,
        content: DeviceConfigurationModels.Payload,
        contentType?: string
    ): Promise<DeviceConfigurationModels.RevisionMetaData> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PostFileRevision."
            );
        }

        // verify required parameter 'content' is not null or undefined
        if (content === null || content === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "content",
                "Required parameter content was null or undefined when calling PostFileRevision."
            );
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}/revisions`,
            body: content,
            additionalHeaders: { "Content-Type": contentType ? contentType : "application/octet-stream"},
        });

        return result as DeviceConfigurationModels.RevisionMetaData;
    }
}
