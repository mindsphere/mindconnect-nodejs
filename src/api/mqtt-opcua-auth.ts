import * as jwt from "jsonwebtoken";
import { pruneCert } from "./utils";
import uuid = require("uuid");

/**
 * Opc UA via MQTT - Token Rotation
 *
 * @export
 * @class MqttOpcUaAuth
 * @implements {TokenRotation}
 */
export class MqttOpcUaAuth {
    /**
     * Creates an instance of MqttOpcUaAuth.
     * @param {string} _clientid
     * @param {string} _rootca
     * @param {string} _devicecrt
     * @param {number} _expiration
     * @param {string} _devicekey
     * @param {string} [_intermediate]
     * @param {string} [_passphrase]
     * @param {string} [_tenant]
     *
     * @memberOf MqttOpcUaAuth
     */
    constructor(
        private _clientid: string,
        private _rootca: string,
        private _devicecrt: string,
        private _expiration: number,
        private _devicekey: string,
        private _intermediate?: string,
        private _passphrase?: string,
        private _tenant?: string
    ) {}

    private _token?: string;

    public GetMqttToken(): string {
        if (!this.ValidateToken()) {
            this._token = undefined;
        }

        if (!this._token) {
            this._token = this.CreateToken();
        }
        return this._token;
    }

    private ValidateToken(): boolean {
        let result = false;

        if (this._token) {
            const token = jwt.decode(this._token) as any;
            const now = Math.round(new Date().getTime() / 1000);
            result = now < token.exp;
        }

        return result;
    }

    private CreateToken(): string {
        const tokenHeader: any = {
            alg: "RS256",
            x5c: [],
            typ: "JWT",
        };

        const tokenBody: any = {
            aud: ["MQTTBroker"],
            schemas: ["urn:siemens:mindsphere:v1"],
        };

        tokenBody.iss = this._clientid;
        tokenBody.sub = this._clientid;

        tokenHeader.x5c.push(pruneCert(this._devicecrt));
        this._intermediate && tokenHeader.x5c.push(pruneCert(this._intermediate));
        tokenHeader.x5c.push(pruneCert(this._rootca));

        const issuedTime = Math.round(new Date().getTime() / 1000);
        const expirationTime = issuedTime + this._expiration;

        tokenBody.jti = uuid.v4().toString();
        tokenBody.iat = issuedTime;
        tokenBody.nbf = issuedTime;
        tokenBody.exp = expirationTime;
        tokenBody.ten = `${this._tenant}`;

        const signOptions: any = {
            key: this._devicekey,
        };

        if (this._passphrase) {
            signOptions.passphrase = `${this._passphrase}`;
        }

        const signedJwt = jwt.sign(tokenBody, signOptions, { header: tokenHeader, algorithm: "RS256" });
        return signedJwt;
    }

    /**
     * renews the token if expired
     *
     * @returns {Promise<boolean>}
     *
     * @memberOf MqttOpcUaAuth
     */
    public async RenewToken(): Promise<boolean> {
        if (!this.ValidateToken()) {
            this._token = this.CreateToken();
        }
        return true;
    }
}
