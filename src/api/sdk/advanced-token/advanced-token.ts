import { SdkClient } from "../common/sdk-client";
import { AdvancedTokenExchangeModels } from "./advanced-token-models";

export class AdvancedTokenExchangeClient extends SdkClient {
    private _baseUrl: string = "/api/ate/v3";

    /**
     *
     * In order to access the ATE /token endpoint, extract the access token from the access_token field in the response
     * from the above Technical Token Manager request and send it as Bearer token in the Authorization header of HTTP requests.
     * The subject_token is provided through the technical token.
     *
     * @see https://developer.mindsphere.io/howto/howto-local-development.html#procedure
     *
     * @param {AdvancedTokenExchangeModels.AdvancedTokenExchangeRequest} request
     * @returns {Promise<AdvancedTokenExchangeModels.AdvancedTokenExchangeResponse>}
     *
     * @memberOf AdvancedTokenExchangeClient
     */
    public async ExchangeToken(
        request: string | AdvancedTokenExchangeModels.AdvancedTokenExchangeRequest
    ): Promise<AdvancedTokenExchangeModels.AdvancedTokenExchangeResponse> {
        if (typeof request === "string") {
            request = {
                subject_token: await this.GetToken(),
                subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
                grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
                resource: request,
            };
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/token`,
            body: request,
        });

        return result as AdvancedTokenExchangeModels.AdvancedTokenExchangeResponse;
    }
}
