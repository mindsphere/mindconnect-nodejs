import { CredentialAuth } from "../../credential-auth";
import { MindConnectBase } from "../../mindconnect-base";
import { TokenManagerAuth } from "../../tokenmanager-auth";
import {
    AppCredentials,
    isCredentialAuth,
    isTokenManagerAuth,
    TenantCredentials,
    UserCredentials,
} from "./credentials";

export abstract class SdkClient extends MindConnectBase {
    public async GetToken() {
        return await this._authenticator.GetToken();
    }

    public async RenewToken() {
        return await this._authenticator.RenewToken();
    }

    public GetGateway() {
        return this._credentials.gateway;
    }

    public GetTenant() {
        return this._credentials.tenant;
    }

    protected _authenticator: CredentialAuth | TokenManagerAuth;

    constructor(protected _credentials: UserCredentials | TenantCredentials | AppCredentials) {
        super();

        if (isTokenManagerAuth(_credentials)) {
            const appCredentials = _credentials as AppCredentials;

            this._authenticator = new TokenManagerAuth(
                appCredentials.gateway,
                appCredentials.basicAuth,
                appCredentials.tenant,
                appCredentials.usertenant,
                appCredentials.appName,
                appCredentials.appVersion
            );
        } else if (isCredentialAuth(_credentials)) {
            this._authenticator = new CredentialAuth(_credentials.gateway, _credentials.basicAuth, _credentials.tenant);
        } else {
            throw new Error("invalid constructor");
        }
    }
}
