import { CredentialAuth } from "../../credential-auth";
import { MindConnectBase, TokenRotation, isTokenRotation } from "../../mindconnect-base";
import { TokenManagerAuth } from "../../tokenmanager-auth";
import {
    AppCredentials,
    isCredentialAuth,
    isTokenManagerAuth,
    MindSphereCredentials,
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
        return this._authenticator.GetGateway();
    }

    public GetTenant() {
        return this._authenticator.GetTenant();
    }

    protected _authenticator: TokenRotation;

    constructor(credentialsOrAuthorizer: UserCredentials | TenantCredentials | AppCredentials | TokenRotation) {
        super();

        if (isTokenRotation(credentialsOrAuthorizer)) {
            this._authenticator = credentialsOrAuthorizer as TokenRotation;
        } else if (isTokenManagerAuth(credentialsOrAuthorizer)) {
            const appCredentials = credentialsOrAuthorizer as AppCredentials;

            this._authenticator = new TokenManagerAuth(
                appCredentials.gateway,
                appCredentials.basicAuth,
                appCredentials.tenant,
                appCredentials.usertenant,
                appCredentials.appName,
                appCredentials.appVersion
            );
        } else if (isCredentialAuth(credentialsOrAuthorizer)) {
            const credentialsAuth = credentialsOrAuthorizer as MindSphereCredentials;
            this._authenticator = new CredentialAuth(
                credentialsAuth.gateway,
                credentialsAuth.basicAuth,
                credentialsAuth.tenant
            );
        } else {
            throw new Error("invalid constructor");
        }
    }
}
