import * as fs from "fs";
import { toQueryString } from "../../utils";
import { fileUploadOptionalParameters, MultipartUploader } from "../common/multipart-uploader";
import { SdkClient } from "../common/sdk-client";
import { IotFileModels } from "./iot-file-models";
/**
 *
 * The IoT File API enables storing and retrieving files for entity instances.
 *
 * * The IoT File Client provides a Upload File Method which will do the most important things for you.
 * * It is highly recomended to use the UploadFile method instead of the raw api methods.
 *
 * @export
 * @class IotFileClient
 * @extends {SdkClient}
 */
export class IotFileClient extends SdkClient {
    private _baseUrl: string = "/api/iotfile/v3";

    /**
     * Create or update a file for the specified entity and path, with the provided content.
     * * The most complete function is UploadFile. This is provided for completeness.
     *
     * @param {string} entityId
     * @param {string} filepath
     * @param {(string | Buffer)} file
     * @param {{ part?: number; ifMatch: number; timestamp?: Date; description?: string; type?: string }} [params]
     * @returns {Promise<Headers>}
     *
     * @memberOf IotFileClient
     */
    public async PutFile(
        entityId: string,
        filepath: string,
        file: string | Buffer,
        params?: { part?: number; ifMatch?: number; timestamp?: Date; description?: string; type?: string }
    ): Promise<Headers> {
        const myBuffer = typeof file === "string" ? fs.readFileSync(file) : (file as Buffer);
        const parameters = params || {};

        return (await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${entityId}/${filepath}`,
            body: myBuffer,
            additionalHeaders: parameters,
            octetStream: true,
            noResponse: true,
            returnHeaders: true
        })) as Headers;
    }

    /**
     *
     * Read a file for the specified entity and path
     *
     * @param {string} entityId Id to instance of entity
     * @param {string} filepath path of the file including filename
     * @param {(string | Buffer)} file
     * @param {{ ifNoneMatch?: number; range?: string }} [params]
     * @param {number | undefined} [params.ifNoneMatch] ETag of the latest version (not supported in this release)
     * @param {number | undefined} [params.ifNoneMatch] Part of a file to return in Bytes, eg bytes=200-600
     * @returns {Promise<Response>}
     *
     * @memberOf IotFileClient
     */
    public async GetFile(
        entityId: string,
        filepath: string,
        params?: { ifNoneMatch?: number; range?: string }
    ): Promise<Response> {
        const parameters = params || {};

        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${entityId}/${filepath}`,
            additionalHeaders: parameters,
            rawResponse: true
        })) as Response;
    }

    /**
     * Search files for the specified entity.
     *
     * @param {string} entityid
     * @param {{ offset?: number; limit?: number; count?: number; order?: string; filter?: string }} [params]
     * @returns {Promise<IotFileModels.File[]>}
     *
     * @memberOf IotFileClient
     */
    public async GetFiles(
        entityid: string,
        params?: { offset?: number; limit?: number; count?: boolean; order?: string; filter?: string }
    ): Promise<IotFileModels.File[]> {
        const parameters = params || {};
        const { offset, limit, count, order, filter } = parameters;
        return (await (this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${entityid}?${toQueryString({ filter, offset, limit, count, order })}`
        }) as unknown)) as IotFileModels.File[];
    }

    /**
     * Delete a file for the specified entity and path
     *
     * @param {string} entityId
     * @param {string} filepath
     * @returns
     *
     * @memberOf IotFileClient
     */
    public async DeleteFile(entityId: string, filepath: string) {
        return await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${entityId}/${filepath}`,
            noResponse: true
        });
    }

    /**
     * Delete a file for the specified entity and path
     *
     * @param {string} entityId
     * @param {string} filepath
     * @returns
     *
     * @memberOf IotFileClient
     */
    public async GetMultipartUploads(entityId: string, filepath: string) {
        return await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/fileslist/${entityId}/${filepath}`
        });
    }

    /**
     * Upload file
     *
     * This method is used to upload the files to the MindSphere.
     * It supports standard and multipart upload which can be configured with the [params.chunk] parameter.
     *
     * * The method will try to abort the multipart upload if an exception occurs.
     * * Multipart Upload is done in following steps:
     *     * start multipart upload
     *     * upload in parallel [params.parallelUploadChunks] the file parts (retrying [params.retry] times if configured)
     *     * uploading last chunk.
     *
     * @param {string} entityId
     * @param {string} filepath
     * @param {(string | Buffer)} file
     * @param {fileUploadOptionalParameters} [params] optional parameters
     * @param {(number | undefined)}[params.part] multipart/upload part
     * @param {(Date | undefined)} [params.timestamp] File timestamp in mindsphere.
     * @param {(string | undefined)} [params.description] Description in mindsphere.
     * @param {(string | undefined)} [params.type] Mime type in mindsphere.
     * @param {(number | undefined)} [params.chunkSize] chunkSize. It must be bigger than 5 MB. Default 8 MB.
     * @param {(number | undefined)} [params.retry] Number of retries
     * @param {(Function | undefined)} [params.logFunction] log functgion is called every time a retry happens.
     * @param {(Function | undefined)} [params.verboseFunction] verboseLog function.
     * @param {(boolean | undefined)} [params.chunk] Set to true to enable multipart uploads
     * @param {(number | undefined)} [params.parallelUploads] max paralell uploads for parts (default: 3)
     * @param {(number | undefined)} [params.ifMatch] The etag for the upload.
     * @returns {Promise<string>} md5 hash of the file
     *
     * @example await sdk.GetIotFileClient().UploadFile (agent.GetClientId(), "some/mindsphere/path/file.txt", "file.txt");
     * @example await sdk.GetIotFileClient().UploadFile (agent.GetClientId(), "some/other/path/10MB.bin", "bigFile.bin",{ chunked:true, retry:5 });
     *
     * @memberOf IotFileClient
     */
    public async UploadFile(
        entityId: string,
        filepath: string,
        file: string | Buffer,
        params?: fileUploadOptionalParameters
    ): Promise<string> {
        const result = await this.uploader.UploadFile(entityId, filepath, file, params);
        return result;
    }

    /**
     * Abort the multipart upload.
     *
     * @param {string} entityId
     * @param {string} filePath
     *
     * @memberOf IotFileClient
     */
    public async AbortUpload(entityId: string, filePath: string) {
        await this.uploader.AbortUpload(entityId, filePath);
    }

    private uploader = new MultipartUploader(undefined, this);
}
