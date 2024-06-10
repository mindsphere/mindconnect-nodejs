import fetch from "cross-fetch";
import { MindConnectBase, TokenRotation } from "./mindconnect-base";
import { removeTrailingSlash, removeUndefined, throwError } from "./utils";

function log(message: string) {
    if (typeof window !== "undefined" && (window as any).DEBUGSDK === true) {
        console.log(message);
    }
}

/**
 *  Frontend Auth for Backend (only used from CLI)
 *
 * @export
 * @class BrowserAuth
 * @implements {TokenRotation}
 */
export class FrontendAuth extends MindConnectBase implements TokenRotation {
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

        // this is only used in commands when working with browser authorization

        if (this._sesionCookie && this._xsrfToken) {
            headers["cookie"] = `SESSION=${this._sesionCookie}; XSRF-TOKEN=${this._xsrfToken}`;
        }

        const xsrfTokenFromCookie = this._xsrfToken || this.getCookieValue("XSRF-TOKEN");

        if (xsrfTokenFromCookie && xsrfTokenFromCookie !== "") {
            headers["x-xsrf-token"] = xsrfTokenFromCookie;
            log(`Set x-xsrf-token to ${headers["x-xsrf-token"]}`);
        } else {
            log("There is no XSRF-TOKEN cookie.");
        }

        headers = removeUndefined({ ...headers, ...additionalHeaders });
        const url = removeTrailingSlash(this.isNodeOrCliCall() ? `${gateway}${baseUrl}` : `${baseUrl}`);

        log(`${message || ""} Headers ${JSON.stringify(headers)} Url ${url}`);
        try {
            const request: any = {
                method: verb,
                headers: headers,
                credentials: "include",
                agent: this._proxyHttpAgent,
            };

            if (verb !== "GET" && verb !== "DELETE") {
                request.body = octetStream || multiPartFormData ? body : JSON.stringify(body);
            }

            const response = await fetch(url, request);
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

    private isNodeOrCliCall() {
        return this._sesionCookie && this._xsrfToken;
    }

    /**
     * * Returns true; MindSphere Gateway is taking care of this
     *
     * @returns {Promise<boolean>}
     *
     * @memberOf BrowserAuth
     */
    async RenewToken(): Promise<boolean> {
        return true; // the mindsphere gateway is doing this for us
    }

    /**
     * * Returns ""; MindSphere Gateway is taking care of this
     *
     * @returns {Promise<string>}
     *
     * @memberOf BrowserAuth
     */
    async GetToken(): Promise<string> {
        return ""; // the mindsphere gateway is doing this for us
    }

    /**
     * * Returns ""; MindSphere Gateway is taking care of this
     *
     * @returns {string}
     *
     * @memberOf BrowserAuth
     */
    GetGateway(): string {
        return this._gateway; // the mindsphere gateway is doing this for us
    }

    /**
     *
     * * Returns ""; MindSphere Gateway is taking care of this
     *
     * @returns {string}
     *
     * @memberOf BrowserAuth
     */
    GetTenant(): string {
        return ""; // the mindsphere gateway is doing this for us
    }

    private getCookieValue(a: string) {
        if (!document) {
            return undefined;
        }
        const b = document.cookie.match("(^|;)\\s*" + a + "\\s*=\\s*([^;]+)");
        return b ? b.pop() : "";
    }

    constructor(private _gateway: string = "", private _sesionCookie: string, private _xsrfToken: string) {
        super();
    }
}
