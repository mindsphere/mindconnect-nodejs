import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { VisualFlowCreatorModels } from "./vfc-models";

/**
 * The Visual Flow Creator (VFC) API service can be used to create, update, retrieve and delete projects and nodes which
 * belong to projects.
 * It also supports triggering nodes of type inject which means that users can directly start flows using the API.
 *
 * Generic Errors
 * The following generic error codes (with status codes) can occur at the operations of this API.
 * Generic error codes are prefixed with 'mdsp.core.generic.'.
 *
 * * invalidParameter (400)
 * * missingParameter (400)
 * * invalidRequestBodyProperty (400)
 * * missingRequestBodyProperty (400)
 * * forbidden (403)
 * * unauthorized (401)
 * * noMatch (412)
 * * unsupportedMediaType (415)
 * * tooManyRequests (429)
 * * internalServerError (500)
 *
 * See the MindSphere Developer Documentation generic errors page for more information on these errors.VFC API Errors
 *
 * The following error codes (with status codes) may occur when executing API requests.
 * These error codes are prefixed with 'mdsp.core.vfc.'.bodyShouldBeAnArray (400)
 *
 * * validationError (400)
 * * noUserGiven (400)
 * * noBodyGiven (400)
 * * noNodeIdGiven (400)
 * * tabsLimitExceeded (400)
 * * nodesLimitExceeded (400)
 * * forbiddenToReadFlows (403)
 * * forbiddenToSaveFlows (403)
 * * forbiddenToTriggerFlows (403)
 * * projectNotFound (404)
 * * nodeNotFound (404)
 * * nodeNotTypeOfInject (404)
 * * notAllowed (405)
 * * foundDuplicatedEndpoint (409)
 *
 * See the MindSphere Visual Flow Creator Documentation for more information on these errors.
 *
 * Visual Flow Create Documentation is available here:
 * @see https://documentation.mindsphere.io/MindSphere/apps/Visual-Flow-Creator/introduction.html
 *
 * @export
 * @class VisualFlowCreatorClient
 * @extends {SdkClient}
 */
export class VisualFlowCreatorClient extends SdkClient {
    private _baseUrl: string = "/api/vfc/v3";

    /**
     * * Projects
     *
     * Reads all projects of the specified user
     *
     * @param {string} userid
     * The id of the user. Usually this is the user's email address.
     * If this parameter does not exist the API tries to extract it from the impersonated token.
     * @returns {Promise<VisualFlowCreatorModels.Project>}
     * Returns a list of projects of the given user. If no user is specified, an error will be returned.
     * @memberOf VisualFlowCreatorClient
     */
    public async GetProjects(params: { userId: string }): Promise<VisualFlowCreatorModels.Project> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/projects/${toQueryString(params)}`,
        });
        return result as VisualFlowCreatorModels.Project;
    }
}
