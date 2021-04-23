import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { DataExchangeModels } from "./data-exchange-models";
import { dataExchangeTemplate, putFileTemplate } from "./data-exchange-template";

/**
 * 
 * Offers data transfer operations as part of the Analytics package, 
 * in a single endpoint providing various operations like upload/download, move, (recursive) delete, 
 * share within tenant.It also provides an abstraction that helps callers easily share files and folders 
 * between the users of tHe same tenant, while allowing uploads with different visibilities private, or
 * public (within a tenant only) When looking to p[lace a file or directory 
 * (either when creating a new one or moving it) into the root of the storage, 
 * simply set the parentId of the file or folder to one of the "_PUBLIC_ROOT_ID" or "_PRIVATE_ROOT_ID" 
 * allowing in this way to specify its visibility space.
 * 
 * Allowed and safe characters to use in both filename and directyory names are the following:
 * Alphanumeric characters [0-9a-zA-Z]
 * Special characters -, _, ., (, ), and the space character The following are examples of valid object key names:
 * 4my-data
 * _test_dir./myfile.csv
 * Not allowed is using &$@=;:+,?,^{}%`[]"<>#|~!*' in filenames and directory names.
mode
The maximum length of the composed path, that is filename and directories names separated by '/' that is used in a request is 1024 bytes in UTF-8 encoding.
 * 
 * 
 * @export
 * @class DataExchangeClient
 * @extends {SdkClient}
 */
export class DataExchangeClient extends SdkClient {
    private _baseUrl: string = "/api/dataexchange/v3";

    /**
     * * Files
     *
     * Performs a new file upload
     *
     * Uploads a file using the specified form data parameters, and returns the created file resource.
     * The service verifies whether the user or the tenant under which the operation occurs has access
     * to the specified parent and generates an error in case of an unautorhized access.
     *
     * @param {DataExchangeModels.ResourcePatch} metadata
     * @param {Buffer} file
     * @returns {Promise<DataExchangeModels.File>}
     *
     * @memberOf DataExchangeClient
     */
    public async PostFile(metadata: DataExchangeModels.ResourcePatch, file: Buffer): Promise<DataExchangeModels.File> {
        const body = dataExchangeTemplate(metadata, file);

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files`,
            body: body,
            multiPartFormData: true,
            additionalHeaders: { enctype: "multipart/form-data" },
        });
        return result as DataExchangeModels.File;
    }

    /**
     * * Files
     *
     * Downloads the file identified by the specified ID.
     *
     * @param {string} id
     * @returns {Promise<Response>}
     *
     * @memberOf DataExchangeClient
     */
    public async GetFile(id: string): Promise<Response> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}`,
            additionalHeaders: { "Content-Type": "application/octet-stream" },
            rawResponse: true,
        });
        return result as Response;
    }

    /**
     * * Files
     *
     * Uploads a file on top of an existing file
     *
     * @param {string} id
     * @param {Buffer} file
     * @returns {Promise<DataExchangeModels.File>}
     *
     * @memberOf DataExchangeClient
     */
    public async PutFile(id: string, file: Buffer): Promise<DataExchangeModels.File> {
        const body = putFileTemplate(file);

        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}`,
            body: body,
            multiPartFormData: true,
            additionalHeaders: { enctype: "multipart/form-data" },
        });
        return result as DataExchangeModels.File;
    }

    /**
     * * Files
     *
     * Deletes a file (both metadata and the actual content).
     *
     * @param {string} id
     *
     * @memberOf DataExchangeClient
     */
    public async DeleteFile(id: string) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}`,
            noResponse: true,
        });
    }

    /**
     *
     * Retrieves metadata of the file identified by the specified ID.
     *
     * @param {string} id
     * @returns {Promise<DataExchangeModels.File>}
     *
     * @memberOf DataExchangeClient
     */
    public async GetFileProperties(id: string): Promise<DataExchangeModels.File> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}/properties`,
            // !fix: manual fix - this is actually illegal call according to mindsphere rules
            additionalHeaders: { "Content-Type": "application/json" },
        });
        return result as DataExchangeModels.File;
    }

    /**
     * * Files
     *
     * Allows updating specific properties associated with the file, namely its name and parent (by ID).
     * Updating the visibility (namely tenant-wide or user-only) for a file is not available but can be achieved
     * via changing the current file's parent to a directory that has a different visibility space.
     *
     * @param {string} id
     * @param {DataExchangeModels.ResourcePatch} options
     * @returns {Promise<DataExchangeModels.File>}
     *
     * @memberOf DataExchangeClient
     */
    public async PatchFileProperties(
        id: string,
        options: DataExchangeModels.ResourcePatch
    ): Promise<DataExchangeModels.File> {
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}/properties`,
            body: options,
        });
        return result as DataExchangeModels.File;
    }

    /**
     * * Directories
     *
     * creates a directory
     *
     * @param {DataExchangeModels.ResourcePatch} metadata
     * @returns {Promise<DataExchangeModels.Directory>}
     *
     * @memberOf DataExchangeClient
     */
    public async PostDirectory(metadata: DataExchangeModels.ResourcePatch): Promise<DataExchangeModels.Directory> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/directories`,
            body: metadata,
        });
        return result as DataExchangeModels.Directory;
    }

    /**
     *
     * Retreives updatable directory options, i.e the name and the parentId.
     *
     * @param {string} id
     * @returns {Promise<DataExchangeModels.Directory>}
     *
     * @memberOf DataExchangeClient
     */
    public async GetDirectoryProperties(id: string): Promise<DataExchangeModels.Directory> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/directories/${id}/properties`,
            // !fix: manual fix - this is actually illegal call according to mindsphere rules
            additionalHeaders: { "Content-Type": "application/json" },
        });
        return result as DataExchangeModels.Directory;
    }

    /**
     * * Directories
     *
     * Allows updating directory's properties.
     *
     * Allows updating directory metadata, including the parentId (which triggers a move of the current directory),
     * or its visibility by moving it under a parentId that has a different visibility,
     * causing this change to propagate to its inner contents.
     * Changing the parentId to a parent that already contains a folder with the same name is not possible,
     * an error will be thrown.
     *
     * @param {string} id
     * @param {DataExchangeModels.ResourcePatch} options
     * @returns {Promise<DataExchangeModels.Directory>}
     *
     * @memberOf DataExchangeClient
     */
    public async PatchDirectoryProperties(
        id: string,
        options: DataExchangeModels.ResourcePatch
    ): Promise<DataExchangeModels.Directory> {
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/directories/${id}/properties`,
            body: options,
        });
        return result as DataExchangeModels.Directory;
    }

    /**
     *
     * * Directories
     *
     * Using GET on this endpoint to get a list of the source's contents
     *
     * Specifies the id for which it will list the contents.
     * By convention, when listing a root folder also implies specifying the visibility
     *  that the caller is looking after, that is, if listing the private space root, then this parameter requires
     * "_PUBLIC_ROOT_ID" or "_PRIVATE_ROOT_ID" value instead of a real directory id.
     *
     * @param {string} id
     * @param {{ pageNumber?: number; pageSize?: number; filter: string }} params
     * @returns {Promise<DataExchangeModels.DirectoriesFilesArray>}
     *
     * @memberOf DataExchangeClient
     */
    public async GetDirectory(
        id: string,
        params?: { pageNumber?: number; pageSize?: number; filter?: string }
    ): Promise<DataExchangeModels.DirectoriesFilesArray> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/directories/${id}?${toQueryString(parameters)}`,
        });
        return result as DataExchangeModels.DirectoriesFilesArray;
    }

    /**
     * * Directories
     *
     * Deletes a directory and its contents if recursive=true
     *
     * @param {string} id
     * @param {{ recursive?: boolean }} [params]
     *
     * @param params.recursive specifies if the deletion will be performed recursively
     *
     * @memberOf DataExchangeClient
     */
    public async DeleteDirectory(id: string, params?: { recursive?: boolean }) {
        const parameters = params || {};
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/directories/${id}?${toQueryString(parameters)}`,
            noResponse: true,
        });
    }
}
