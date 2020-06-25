import { MindConnectBase, TokenRotation } from "./mindconnect-base";
import { isUrl } from "./utils";

/**
 * User Authenticator for Backend Authentication in NodeJS
 *
 * @see https://developer.mindsphere.io/concepts/concept-authentication.html#calling-apis-from-backend
 *
 * @export
 * @class UserAuth
 * @extends {MindConnectBase}
 * @implements {TokenRotation}
 */
export class UserAuth extends MindConnectBase implements TokenRotation {
    private _token: string;
    private _gateway: string;

    /**
     * Creates an instance of UserAuth.
     * extract token from http request headers (req.get("authorization"))
     *
     * @param {string} token
     * @param {string} gateway
     *
     * extract token from curreny http request:
     * Gateway has to follow the https://gateway.{region}.{mindsphere-domain} schema
     *
     * @see https://developer.mindsphere.io/concepts/concept-authentication.html#calling-apis-from-backend
     *
     * @memberOf UserAuth
     */
    constructor(token: string, gateway: string) {
        super();
        if (!isUrl(gateway)) {
            throw new Error("the gateway must be an URL (e.g. https://gateway.eu1.mindsphere.io");
        }
        this._token = token.replace("Bearer", "").trim(); // just for the case that people pass complete bearer token with leading bearer
        this._gateway = gateway;
    }

    /**
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
        return this._token; // the mindsphere gateway is doing this for us
    }

    /**
     * returns the configured gateway
     *
     * @returns {string}
     *
     * @memberOf BrowserAuth
     */
    GetGateway(): string {
        return this._gateway;
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
}
