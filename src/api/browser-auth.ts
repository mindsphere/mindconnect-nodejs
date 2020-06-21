import { TokenRotation } from "./mindconnect-base";
import { removeUndefined, throwError } from "./utils";

function log(message: string) {
    if ((window as any).DEBUGMINDSPHERESDK === true) {
        console.log(message);
    }
}

/**
 * If the SDK is run in Browser this class implements the necessary HTTP handling.
 *
 * @export
 * @class BrowserAuth
 * @implements {TokenRotation}
 */
export class BrowserAuth implements TokenRotation {
    protected _headers = {
        Accept: "*/*",
        "X-Powered-By": "meowz",
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

    /**
     * perform http action
     *
     * @param {({
     *         verb: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
     *         gateway: string;
     *         baseUrl: string;
     *         authorization: string;
     *         body?: Object;
     *         message?: string;
     *         octetStream?: boolean;
     *         multiPartFormData?: boolean;
     *         additionalHeaders?: Object;
     *         noResponse?: boolean;
     *         rawResponse?: boolean;
     *         returnHeaders?: boolean;
     *         ignoreCodes?: number[];
     *     })} {
     *         verb,
     *         gateway,
     *         baseUrl,
     *         authorization,
     *         body,
     *         message,
     *         octetStream,
     *         multiPartFormData,
     *         additionalHeaders,
     *         noResponse,
     *         rawResponse,
     *         returnHeaders,
     *         ignoreCodes,
     *     }
     * @returns {Promise<Object>}
     *
     * @memberOf MindConnectBase
     */
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
        ignoreCodes,
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
        ignoreCodes?: number[];
    }): Promise<Object | undefined> {
        additionalHeaders = additionalHeaders || {};
        let apiheaders = octetStream ? this._octetStreamHeaders : this._apiHeaders;
        apiheaders = multiPartFormData ? this._multipartFormData : apiheaders;
        ignoreCodes = ignoreCodes || [];
        let headers: any = {
            ...apiheaders,
        };

        if (verb === "GET" || verb === "DELETE") {
            delete headers["Content-Type"];
        }

        headers["x-xsrf-token"] = this.getCookieValue("XSRF-TOKEN");
        headers = removeUndefined({ ...headers, ...additionalHeaders });

        const url = `${gateway}${baseUrl}`;
        log(`${message} Headers ${JSON.stringify(headers)} Url ${url}`);
        try {
            const request: any = { method: verb, headers: headers, mode: "cors" };
            if (verb !== "GET" && verb !== "DELETE") {
                request.body = octetStream || multiPartFormData ? body : JSON.stringify(body);
            }
            const response = await window.fetch(url, request);
            const codeIgnored = ignoreCodes.indexOf(response.status) >= 0;

            !codeIgnored && !response.ok && throwError(`${response.statusText} ${await response.text()}`);

            !codeIgnored &&
                (response.status < 200 || response.status > 299) &&
                throwError(`invalid response ${JSON.stringify(response)}`);

            if (codeIgnored) return undefined;

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

    constructor() {}
    async RenewToken(): Promise<boolean> {
        return true; // the mindsphere gateway is doing this for us
    }
    async GetToken(): Promise<string> {
        return ""; // the mindsphere gateway is doing this for us
    }
    GetGateway(): string {
        return ""; // the mindsphere gateway is doing this for us
    }
    GetTenant(): string {
        return ""; // the mindsphere gateway is doing this for us
    }

    private getCookieValue(a: string) {
        const b = document.cookie.match("(^|;)\\s*" + a + "\\s*=\\s*([^;]+)");
        return b ? b.pop() : "";
    }
}
