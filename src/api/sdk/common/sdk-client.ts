import { CredentialAuth } from "../../credential-auth";

export abstract class SdkClient extends CredentialAuth {
    protected async GetToken() {
        return await this.GetServiceToken();
    }
    public GetGateway() {
        return this._gateway;
    }
}
