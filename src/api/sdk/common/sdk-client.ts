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
        ifMatch,
        ifNoneMatch
    }: {
        verb: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
        baseUrl: string;
        body?: Object;
        message?: string;
        ifMatch?: number;
        ifNoneMatch?: number;
    }): Promise<Object> {
        await this.RenewToken();
        if (!this._accessToken) {
            throw new Error("no valid token");
        }
        const headers: any = { ...this._apiHeaders, Authorization: `Bearer ${this._accessToken.access_token}` };

        if (ifMatch !== undefined) {
            headers["If-Match"] = ifMatch;
        }

        if (ifNoneMatch !== undefined) {
            headers["If-None-Match"] = ifNoneMatch;
        }

        const url = `${this._gateway}${baseUrl}`;
        log(`${message} Headers ${JSON.stringify(headers)} Url ${url}`);
        try {
            const request: any = { method: verb, headers: headers, agent: this._proxyHttpAgent };
            if (verb !== "GET") {
                request.body = JSON.stringify(body);
            }
            const response = await fetch(url, request);
            if (!response.ok) {
                throw new Error(`${response.statusText} ${await response.text()}`);
            }

            if (response.status < 200 || response.status > 299) {
                throw new Error(`invalid response ${JSON.stringify(response)}`);
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
