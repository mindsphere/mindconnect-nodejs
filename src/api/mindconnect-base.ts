import * as debug from "debug";
import fetch from "node-fetch";
import { removeUndefined, throwError } from "./utils";
const HttpsProxyAgent = require("https-proxy-agent");
const log = debug("mindconnect");

/**
 * TokenRotation interface marks all classes which rotate the authentication token according to mindsphere specifications.
 *
 * @export
 * @interface TokenRotation
 */
export interface TokenRotation {
    /**
     * Checks if the token has expired and renews it if necessary.
     *
     * @returns {Promise<boolean>}
     *
     * @memberOf TokenRotation
     */
    RenewToken(): Promise<boolean>;

    GetToken(): Promise<string>;

    GetGateway(): string;

    GetTenant(): string;
}

export function isTokenRotation(obj: any): boolean {
    const tr = obj as TokenRotation;

    return (
        tr.GetGateway !== undefined &&
        tr.GetTenant !== undefined &&
        tr.GetToken !== undefined &&
        tr.RenewToken !== undefined &&
        tr instanceof Object &&
        typeof tr.GetGateway === "function" &&
        typeof tr.GetTenant === "function" &&
        typeof tr.GetToken === "function" &&
        typeof tr.RenewToken === "function"
    );
}

/**
 * Base class for mindconnect agent (and setup) which provides headers and proxy handling.
 *
 * @export
 * @abstract
 * @class MindConnectBase
 */
export abstract class MindConnectBase {
    /**
     * This is a https proxy agent which is used in the fetch commands if the HTTP_PROXY variable is configured.
     *
     * @protected
     * @type {*}
     * @memberof MindConnectBase
     */
    protected _proxyHttpAgent: any;

    protected _headers = {
        Accept: "*/*",
        "X-Powered-By": "meowz",
        "User-Agent": "mindconnect-nodejs (3.8.0)",
    };

    /**
     * Http headers used for /exchange endpoint handling.
     *
     * @protected
     * @memberof MindConnectBase
     */
    protected _multipartHeaders = {
        ...this._headers,
        "Content-Type": "multipart/mixed; boundary=mindspheremessage",
    };

    protected _multipartFormData = {
        ...this._headers,
        "Content-Type": "multipart/form-data; boundary=--mindsphere",
    };

    /**
     * Http headers used for onboarding message.
     *
     * @protected
     * @memberof MindConnectBase
     */
    protected _apiHeaders = {
        ...this._headers,
        "Content-Type": "application/json",
    };

    protected _octetStreamHeaders = {
        ...this._headers,
        "Content-Type": "application/octet-stream",
    };

    /**
     * Http headers used to register the client assertion and acquire the /exchange token.
     *
     * @protected
     * @memberof MindConnectBase
     */
    protected _urlEncodedHeaders = {
        ...this._headers,
        "Content-Type": "application/x-www-form-urlencoded",
    };

    public async HttpAction({
        verb,
        gateway,
        baseUrl,
        authorization,
        body,
        message,
        octetStream,
        multiPartFormData,
        additionalHeaders,
        noResponse,
        rawResponse,
        returnHeaders,
    }: {
        verb: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
        gateway: string;
        baseUrl: string;
        authorization: string;
        body?: Object;
        message?: string;
        octetStream?: boolean;
        multiPartFormData?: boolean;
        additionalHeaders?: Object;
        noResponse?: boolean;
        rawResponse?: boolean;
        returnHeaders?: boolean;
    }): Promise<Object> {
        additionalHeaders = additionalHeaders || {};
        let apiheaders = octetStream ? this._octetStreamHeaders : this._apiHeaders;
        apiheaders = multiPartFormData ? this._multipartFormData : apiheaders;

        let headers: any = {
            ...apiheaders,
            Authorization: `Bearer ${authorization}`,
        };

        if (verb === "GET" || verb === "DELETE") {
            delete headers["Content-Type"];
        }

        headers = removeUndefined({ ...headers, ...additionalHeaders });

        const url = `${gateway}${baseUrl}`;
        log(`${message} Headers ${JSON.stringify(headers)} Url ${url}`);
        try {
            const request: any = { method: verb, headers: headers, agent: this._proxyHttpAgent };
            if (verb !== "GET" && verb !== "DELETE") {
                request.body = octetStream || multiPartFormData ? body : JSON.stringify(body);
            }
            const response = await fetch(url, request);

            !response.ok && throwError(`${response.statusText} ${await response.text()}`);
            (response.status < 200 || response.status > 299) &&
                throwError(`invalid response ${JSON.stringify(response)}`);

            if (rawResponse) return response;

            if (noResponse) {
                if (returnHeaders) {
                    return response.headers;
                }
                return {};
            }

            const json = await response.json();
            log(`${message} Response ${JSON.stringify(json)}`);
            return json;
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    constructor() {
        const proxy = process.env.http_proxy || process.env.HTTP_PROXY;
        log(`Proxy: ${proxy}`);
        this._proxyHttpAgent = proxy ? new HttpsProxyAgent(proxy) : null;
    }
}
