import * as debug from "debug";
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

    private _headers = {
        Accept: "*/*",
        "X-Powered-By": "meowz",
        "User-Agent": "mindconnect-nodejs (3.4.0)"
    };

    /**
     * Http headers used for /exchange endpoint handling.
     *
     * @protected
     * @memberof MindConnectBase
     */
    protected _multipartHeaders = {
        ...this._headers,
        "Content-Type": "multipart/mixed; boundary=mindspheremessage"
    };

    /**
     * Http headers used for onboarding message.
     *
     * @protected
     * @memberof MindConnectBase
     */
    protected _apiHeaders = {
        ...this._headers,
        "Content-Type": "application/json"
    };

    /**
     * Http headers used to register the client assertion and acquire the /exchange token.
     *
     * @protected
     * @memberof MindConnectBase
     */
    protected _urlEncodedHeaders = {
        ...this._headers,
        "Content-Type": "application/x-www-form-urlencoded"
    };

    constructor() {
        const proxy = process.env.http_proxy || process.env.HTTP_PROXY;
        log(`Proxy: ${proxy}`);
        this._proxyHttpAgent = proxy ? new HttpsProxyAgent(proxy) : null;
    }
}
