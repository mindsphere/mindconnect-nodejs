import * as crypto from "crypto";
import * as debug from "debug";
import * as fs from "fs";
import * as path from "path";
import * as stream from "stream";
import { MindConnectAgent } from "../../..";
import { MindConnectBase } from "../../mindconnect-base";
import { retry, throwError } from "../../utils";
import { SdkClient } from "./sdk-client";
import _ = require("lodash");

const mime = require("mime-types");
const log = debug("multipart-uploader");

export type optionalParameters = {
    /**
     * Multipart/upload part.
     *
     * @type {(number | undefined)}
     */
    part?: number | undefined;

    /**
     * File timestamp in mindsphere.
     *
     * @type {(Date | undefined)}
     */
    timestamp?: Date | undefined;
    /**
     * Description in mindsphere.
     *
     * @type {(string | undefined)}
     */
    description?: string | undefined;

    /**
     * Mime type in mindsphere.
     *
     * @type {(string | undefined)}
     */
    type?: string | undefined;

    /**
     * chunkSize. It must be bigger than 5 MB. Default 8 MB.
     *
     * @type {(number | undefined)}
     */
    chunkSize?: number | undefined;

    /**
     * Number of retries.
     *
     * @type {(number | undefined)}
     */
    retry?: number | undefined;

    /**
     * log function is called every time a retry happens
     *
     * @type {(Function | undefined)}
     */
    logFunction?: Function | undefined;

    /**
     * enables multipart/upload
     *
     * @type {(boolean | undefined)}
     */
    chunk?: boolean | undefined;

    /**
     * max paralell uploads for parts (default: 3)
     *
     * @type {(number | undefined)}
     */
    paralelUploads?: number | undefined;

    /**
     *  The etag for the upload. if not set the agent will try to guess it.
     *
     * @type {(number | undefined)}
     */
    ifmatch?: number | undefined;
};

type uploadChunkParameters = {
    description: string;
    chunks: number;
    totalChunks: number;
    fileType: string;
    timeStamp: Date;
    uploadPath: string;
    entityId: string;
    buffer: Uint8Array;
    ifmatch?: number;
};

/**
 * The multipart uploader handles the upload of the files to the mindsphere
 * This class is shared between the MindConnectAgent and the IotFileClient
 *
 * @export
 * @class MultipartUploader
 * @extends {MindConnectBase}
 */
export class MultipartUploader extends MindConnectBase {
    private getTotalChunks(fileLength: number, chunkSize: number, optional: optionalParameters) {
        const totalChunks = Math.ceil(fileLength / chunkSize);
        !optional.chunk &&
            totalChunks > 1 &&
            throwError("File is too big. Enable chunked/multipart upload (CLI: --chunked) to upload it.");
        optional.chunk && totalChunks > 1 && log("WARN: Chunking is experimental!");
        return totalChunks;
    }

    private getTimeStamp(optional: optionalParameters, file: string | Buffer) {
        return optional.timestamp || (file instanceof Buffer ? new Date() : fs.statSync(file).ctime);
    }

    private getFileType(optional: optionalParameters, file: string | Buffer) {
        return (
            optional.type ||
            (file instanceof Buffer ? "application/octet-stream" : `${mime.lookup(file)}` || "application/octet-stream")
        );
    }

    private getStreamFromFile(file: string | Buffer, chunksize: number) {
        return file instanceof Buffer
            ? (() => {
                  const bufferStream = new stream.PassThrough({ highWaterMark: chunksize });
                  for (let index = 0; index < file.length; ) {
                      const end = Math.min(index + chunksize, file.length);
                      bufferStream.write(file.slice(index, end));
                      index = end;
                  }
                  bufferStream.end();
                  return bufferStream;
              })()
            : fs.createReadStream(path.resolve(file), { highWaterMark: chunksize });
    }

    private addDataToBuffer(current: Uint8Array, data: Buffer) {
        const newLength = current.byteLength + data.byteLength;
        const newBuffer = new Uint8Array(newLength);
        newBuffer.set(current, 0);
        newBuffer.set(data, current.byteLength);
        current = newBuffer;
        return current;
    }

    private getBareUrl(url: string) {
        const parsedUrl = new URL(url);
        const bareUrl = url.replace(parsedUrl.search, "");
        return bareUrl;
    }

    private fix_iotFileUpload_3_2_0(result: string | boolean, previousEtag: number | undefined) {
        // ! guess etag for the upload
        // ! in may 2019 mindsphere was not returning eTags for multipart uploads in the header
        // ! but was still expecting them for the new upload
        // ! this fix guesses the new value of the eTag
        return typeof result === "boolean"
            ? previousEtag !== undefined
                ? (previousEtag + 1).toString()
                : "0"
            : result;
    }

    private setIfMatch(url: string, headers: any): number | undefined {
        let result;
        const bareUrl = this.getBareUrl(url);

        (!this.GetConfiguration || headers["If-Match"] !== undefined) &&
            throwError("You have to set if-match if you are using this outside the MindConnectAgent");

        if (this.GetConfiguration) {
            const config = this.GetConfiguration() as any;
            if (config.urls && config.urls[bareUrl]) {
                const eTag = config.urls[bareUrl];
                const etagNumber = parseInt(eTag);
                result = etagNumber;
                (<any>headers)["If-Match"] = etagNumber;
            }
        }
        return result;
    }

    private addUrl(url: string, result: string) {
        if (!this.GetConfiguration) return;

        const config = this.GetConfiguration() as any;

        if (!config.urls) {
            config.urls = {};
        }

        const entry = this.getBareUrl(url);
        config.urls[entry] = result;
    }

    private async MultipartOperation({
        mode,
        entityId,
        uploadPath,
        ifmatch,
        description,
        fileType,
        timeStamp
    }: {
        mode: "start" | "complete" | "abort";
        entityId: string;
        description: string;
        fileType: string;
        uploadPath: string;
        timeStamp: Date;
        ifmatch?: number;
    }) {
        const url = `/api/iotfile/v3/files/${entityId}/${uploadPath}?upload=${mode}`;
        const token = await this.GetToken();

        const headers = {
            description: description,
            type: fileType,
            timestamp: timeStamp.toISOString()
        };

        ifmatch && ((headers as any)["If-Match"] = ifmatch);
        this.setIfMatch(`${this.GetGateway()}${url}`, headers);

        const result = await this.HttpAction({
            verb: "PUT",
            authorization: token,
            gateway: this.GetGateway(),
            baseUrl: url,
            octetStream: true,
            additionalHeaders: headers,
            noResponse: true,
            returnHeaders: true,
            body: Buffer.alloc(0)
        });
        return result;
    }

    private async UploadChunk({
        description,
        chunks,
        totalChunks,
        fileType,
        timeStamp,
        uploadPath,
        entityId,
        buffer,
        ifmatch
    }: uploadChunkParameters): Promise<boolean> {
        if (buffer.length <= 0) return false;

        const headers = {
            description: description,
            type: fileType,
            timestamp: timeStamp.toISOString()
        };

        ifmatch && ((headers as any)["If-Match"] = ifmatch);

        let part = totalChunks === 1 ? "" : `?part=${chunks}`;
        if (part === `?part=${totalChunks}`) {
            part = `?upload=complete`;
        }

        const url = `/api/iotfile/v3/files/${entityId}/${uploadPath}${part}`;
        const previousEtag = this.setIfMatch(`${this.GetGateway()}${url}`, headers);

        const token = await this.GetToken();

        const gateway = this.GetGateway();

        const resultHeaders = (await this.HttpAction({
            verb: "PUT",
            baseUrl: url,
            gateway: gateway,
            authorization: token,
            body: buffer,
            octetStream: true,
            additionalHeaders: headers,
            noResponse: true,
            returnHeaders: true
        })) as Headers;

        const result = resultHeaders.get("ETag") || true;

        // * only set the eTag after the upload is complete
        if (totalChunks > 1 && !url.endsWith(`upload=complete`)) {
            return true;
        }
        const newEtag = this.fix_iotFileUpload_3_2_0(result, previousEtag);
        this.addUrl(`${gateway}${url}`, newEtag);
        return true;
    }

    /**
     * Upload file to MindSphere IOTFileService
     *
     * @param {string} entityId - asset id or agent.ClientId() for agent
     * @param {string} filepath - mindsphere file path
     * @param {(string | Buffer)} file - local path or Buffer
     * @param {optionalParameters} [optional] - optional parameters: enable chunking, define retries etc.
     * @returns {Promise<string>} - md5 hash of the file
     *
     * @memberOf MultipartUploader
     *
     */
    public async UploadFile(
        entityId: string,
        filepath: string,
        file: string | Buffer,
        optional?: optionalParameters
    ): Promise<string> {
        optional = optional || {};
        const chunkSize = optional.chunkSize || 8 * 1024 * 1024;
        optional.chunk &&
            chunkSize < 5 * 1024 * 1024 &&
            throwError("The chunk size must be at least 5 MB for multipart upload.");

        const fileLength = file instanceof Buffer ? file.length : fs.statSync(file).size;
        const totalChunks = this.getTotalChunks(fileLength, chunkSize, optional);

        const shortFileName = path.basename(filepath);
        const fileInfo = {
            description: optional.description || shortFileName,
            timeStamp: this.getTimeStamp(optional, file),
            fileType: this.getFileType(optional, file),
            uploadPath: filepath,
            totalChunks: totalChunks,
            entityId: entityId
        };

        const RETRIES = optional.retry || 1;
        const logFunction = optional.logFunction;

        optional.ifmatch && ((fileInfo as any)["If-Match"] = optional.ifmatch);

        const mystream = this.getStreamFromFile(file, chunkSize);
        const hash = crypto.createHash("md5");
        const promises: any[] = [];

        let current = new Uint8Array(0);
        let chunks = 0;

        optional.chunk &&
            totalChunks > 1 &&
            (await retry(
                RETRIES,
                () =>
                    this.MultipartOperation({
                        mode: "start",
                        ...fileInfo
                    }),
                300,
                logFunction
            ));

        return new Promise((resolve, reject) => {
            mystream
                .on("error", err => reject(err))
                .on("data", async (data: Buffer) => {
                    if (current.byteLength + data.byteLength < chunkSize) {
                        current = this.addDataToBuffer(current, data);
                    } else {
                        if (current.byteLength > 0) {
                            const currentBuffer = Buffer.from(current);

                            promises.push(() =>
                                retry(
                                    RETRIES,
                                    () =>
                                        this.UploadChunk({
                                            ...fileInfo,
                                            chunks: ++chunks,
                                            buffer: currentBuffer
                                        }),
                                    300,
                                    logFunction
                                )
                            );
                        }
                        current = new Uint8Array(data.byteLength);
                        current.set(data, 0);
                    }
                })
                .on("end", () => {
                    const currentBuffer = Buffer.from(current);

                    promises.push(() =>
                        retry(
                            RETRIES,
                            () =>
                                this.UploadChunk({
                                    ...fileInfo,
                                    chunks: ++chunks,
                                    buffer: currentBuffer
                                }),
                            300,
                            logFunction
                        )
                    );
                })
                .pipe(hash)
                .once("finish", async () => {
                    try {
                        // * this is the last promise (for multipart) the one which completes the upload
                        // * this has to be awaited last.
                        const lastPromise = promises.pop();

                        // * the chunks before last can be uploaded in paralell to mindsphere
                        const maxParalellUploads = (optional && optional.paralelUploads) || 3;
                        const splitedPromises = _.chunk(promises, maxParalellUploads);

                        for (const partPromises of splitedPromises) {
                            const uploadParts: any = [];
                            partPromises.forEach(async f => {
                                uploadParts.push(f());
                            });

                            await Promise.all(uploadParts);
                        }
                        // * for non-multipart-upload this is the only promise which is ever resolved
                        // ! don't retry as this is already a retry operation! (from uploadchunk push)

                        await lastPromise();
                        resolve(hash.read().toString("hex"));
                    } catch (err) {
                        reject(new Error("upload failed: " + err));
                    }
                });
        });
    }

    private async GetToken() {
        !this.agent && !this.sdkClient && throwError("invalid conifguraiton for multipart upload");
        if (this.agent) {
            return await this.agent.GetAgentToken();
        }

        if (this.sdkClient) {
            return await this.sdkClient.GetServiceToken();
        }
        return "";
    }

    private GetGateway() {
        !this.agent && !this.sdkClient && throwError("invalid conifguraiton for multipart upload");
        if (this.agent) {
            return `${this.agent.GetMindConnectConfiguration().content.baseUrl}`;
        }

        if (this.sdkClient) {
            return this.sdkClient.GetGateway();
        }
        return "";
    }

    private GetConfiguration() {
        !this.agent && !this.sdkClient && throwError("invalid conifguraiton for multipart upload");
        if (this.agent) {
            return this.agent.GetMindConnectConfiguration();
        }
    }

    constructor(private agent?: MindConnectAgent, private sdkClient?: SdkClient) {
        super();
        !agent && !sdkClient && throwError("you have to specify either agent or sdkclient");
    }
}
