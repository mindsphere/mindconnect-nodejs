// Copyright (C), Siemens AG 2017
import * as debug from "debug";
import * as stream from "stream";
import { TextDecoder, TextEncoder } from "text-encoding";
import { MessageEncoding } from "..";
import { fileTemplateFooter, fileTemplateHeader } from "./mindconnect-template";
const log = debug("mindconnect");

/**
 * Transforms the input stream to a stream of text-encoded mindconnect messages.
 *
 * @export
 * @class MindConnectTransform
 * @extends {stream.Transform}
 */
export class MindConnectTransform extends stream.Transform {
    private _message: string = "";
    private _chunk = 0;

    private getName() {
        if (this._totalChunks > 1) {
            return `${this._filename}.part${this._chunk}.of.${this._totalChunks}`;
        }
        return this._filename;
    }

    private getType() {
        if (this._totalChunks > 1) {
            return `${this._fileType};Content-Transfer-Encoding: ${this._encoding}`;
        }
        return this._fileType;
    }

    public _transform(chunk: any, encoding: MessageEncoding, callback: Function) {

        if (chunk) {
            if (!this._message) {

                this._message += fileTemplateHeader(this.getName(), this._creationDate, this.getType());
            }
        }

        const encodedChunk = Buffer.from(chunk).toString(this._encoding);
        if (this._message.length + encodedChunk.length + fileTemplateFooter.length < this._maxPostSize) {
            this._message += encodedChunk;
        } else {
            this._message += fileTemplateFooter;
            this.push(this._message);
            this._chunk++;
            this._message = fileTemplateHeader(this.getName(), this._creationDate, this.getType());
            this._message += encodedChunk;
        }

        callback();
    }

    public _flush(callback: Function) {

        if (this._message) {
            this._message += fileTemplateFooter;
            this.push(this._message);
            this._message = "";
        }
        callback();
    }


    public constructor(private _filename: string,
        private _creationDate: Date = new Date(),
        private _fileType: string = "file", private _maxPostSize: number = 2 * 1024 * 1024, private _encoding?: MessageEncoding, private _totalChunks: number = 0) {
        super();
    }
}

/**
 * Transforms the input stream to a stream of octet/stream mindsphere messages.
 *
 * @export
 * @class MindConnectRawTransform
 * @extends {stream.Transform}
 */
export class MindConnectRawTransform extends stream.Transform {
    private _chunk = 0;

    private getName() {
        if (this._totalChunks > 1) {
            return `${this._filename}.part${this._chunk}.of.${this._totalChunks}`;
        }
        return this._filename;
    }

    private getType() {
        return this._fileType;
    }

    private _message?: Uint8Array;
    private _enc = new TextEncoder();
    private _dec = new TextDecoder();

    private AddHeader2Message() {

        this._message = this._enc.encode(fileTemplateHeader(this.getName(), this._creationDate, this.getType()));
    }

    private AddFooter2Message() {
        if (!this._message)
            throw new Error("array buffer is undefined!");
        const newLength = this._message.byteLength + fileTemplateFooter.length * 2;
        const newBuffer = new Uint8Array(newLength);
        const footer = this._enc.encode(fileTemplateFooter);
        newBuffer.set(this._message, 0);
        newBuffer.set(footer, this._message.byteLength);
        this._message = newBuffer;
    }

    private AddChunk2ArrayBuffer(chunk: Buffer) {
        if (!this._message)
            throw new Error("array buffer is undefined!");
        const newLength = this._message.byteLength + chunk.byteLength;
        const newBuffer = new Uint8Array(newLength);
        newBuffer.set(this._message, 0);
        newBuffer.set(chunk, this._message.byteLength);
        this._message = newBuffer;
    }

    public _transform(chunk: Buffer, encoding: never, callback: Function) {


        if (chunk) {
            if (!this._message) {
                this.AddHeader2Message();
            }
            if (!this._message)
                throw new Error("no header in chunk data");

            // fileTemplateFooterlength * 2 due to unicode
            const newLengthWithFooter = this._message.byteLength + chunk.byteLength + fileTemplateFooter.length * 2;
            if (newLengthWithFooter < this._maxPostSize) {
                this.AddChunk2ArrayBuffer(chunk);
            } else {
                this.AddFooter2Message();
                log(this._dec.decode(this._message));
                this.push(this._message);
                this._chunk++;
                this.AddHeader2Message();
                this.AddChunk2ArrayBuffer(chunk);
            }
            callback();
        }
    }

    public _flush(callback: Function) {

        if (this._message) {
            this.AddFooter2Message();
            log(this._dec.decode(this._message));
            this.push(this._message);
            this._message = undefined;
        }
        callback();
    }

    public constructor(private _filename: string,
        private _creationDate: Date = new Date(),
        private _fileType: string = "file", private _maxPostSize: number = 2 * 1024 * 1024, private _totalChunks: number = 0) {
        super();
    }
}