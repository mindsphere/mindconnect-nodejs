import { CredentialAuth } from "../../credential-auth";

const debug = require("debug");
const log = debug("sdk-client");

export abstract class SdkClient extends CredentialAuth {
    protected async GetToken() {
        return await this.GetServiceToken();
    }
    public GetGateway() {
        return this._gateway;
    }
}
