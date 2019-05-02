import fetch from "node-fetch";
import { CredentialAuth } from "../../credential-auth";

const debug = require("debug");
const log = debug("sdk-client");

export abstract class SdkClient extends CredentialAuth {
    protected async HttpAction({
        verb,
        baseUrl,
        body,
        message,
        octetStream,
        additionalHeaders,
        noResponse,
        returnHeaders
    }: {
        verb: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
        baseUrl: string;
        body?: Object;
        message?: string;
        octetStream?: boolean;
        additionalHeaders?: Object;
        noResponse?: boolean;
        returnHeaders?: boolean;
    }): Promise<Object> {
        await this.RenewToken();
        if (!this._accessToken) {
            throw new Error("no valid token");
        }
        additionalHeaders = additionalHeaders || {};
        const apiheaders = octetStream ? this._octetStreamHeaders : this._apiHeaders;

        const headers: any = {
            ...apiheaders,
            Authorization: `Bearer ${this._accessToken.access_token}`,
            ...additionalHeaders
        };

        const url = `${this._gateway}${baseUrl}`;
        log(`${message} Headers ${JSON.stringify(headers)} Url ${url}`);
        try {
            const request: any = { method: verb, headers: headers, agent: this._proxyHttpAgent };
            if (verb !== "GET" && verb !== "DELETE") {
                request.body = octetStream ? body : JSON.stringify(body);
            }
            const response = await fetch(url, request);
            if (!response.ok) {
                throw new Error(`${response.statusText} ${await response.text()}`);
            }

            if (response.status < 200 || response.status > 299) {
                throw new Error(`invalid response ${JSON.stringify(response)}`);
            }

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
}
