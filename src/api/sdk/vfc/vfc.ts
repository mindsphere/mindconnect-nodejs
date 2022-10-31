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
    public async GetProjects(params: { userId: string }): Promise<VisualFlowCreatorModels.Projects> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/projects?${toQueryString(params)}`,
        });
        return result as VisualFlowCreatorModels.Projects;
    }

    /**
     * * Projects
     *
     * Create new project.
     *
     * Creates a project with the provided project name.
     * If no name is given in the request, then an error will be returned. The userId parameter is required. The name default is not allowed to be used.
     *
     * @param {VisualFlowCreatorModels.ProjectName} project
     * Name of the project
     * @param {{ userId: string }} params
     * The id of the user. Usually this is the user's email address.
     * If this parameter does not exist the API tries to extract it from the impersonated token.
     * @returns {Promise<VisualFlowCreatorModels.Project>}
     *
     * @memberOf VisualFlowCreatorClient
     */
    public async PostProject(
        project: VisualFlowCreatorModels.ProjectName,
        params: { userId: string }
    ): Promise<VisualFlowCreatorModels.Project> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            body: project,
            baseUrl: `${this._baseUrl}/projects?${toQueryString(params)}`,
        });
        return result as VisualFlowCreatorModels.Project;
    }

    /**
     * * Projects
     *
     * Rename a project
     *
     * Update the project properties of the project with project id id and user user. Currently only the name property can be updated (so currently PATCH can be used to rename projects).
     *
     * @param {string} id
     * id of a project
     * @param {VisualFlowCreatorModels.ProjectName} project
     * project name in
     * @param {{ userId: string }} params
     * The id of the user. Usually this is the user's email address.
     * If this parameter does not exist the API tries to extract it from the impersonated token.
     * @returns {Promise<VisualFlowCreatorModels.Project>}
     *
     * @memberOf VisualFlowCreatorClient
     */
    public async PatchProject(
        id: string,
        project: VisualFlowCreatorModels.ProjectName,
        params: { userId: string }
    ): Promise<VisualFlowCreatorModels.Project> {
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            body: project,
            baseUrl: `${this._baseUrl}/projects/${id}?${toQueryString(params)}`,
        });
        return result as VisualFlowCreatorModels.Project;
    }

    /**
     * * Projects
     *
     * Read the project.
     *
     * Read the specified project information belonging to the specified user.
     * The project information consists of the id, name, user and tenant. To get the nodes which belong to the project, use the "nodes" endpoint
     * @param {string} id
     * project id
     * @param {{ userId: string }} params
     * The id of the user. Usually this is the user's email address.
     * If this parameter does not exist the API tries to extract it from the impersonated token.
     * @returns {Promise<VisualFlowCreatorModels.Project>}
     *
     * @memberOf VisualFlowCreatorClient
     */
    public async GetProject(id: string, params: { userId: string }): Promise<VisualFlowCreatorModels.Project> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/projects/${id}?${toQueryString(params)}`,
        });

        return result as VisualFlowCreatorModels.Project;
    }

    /**
     * * Projects
     *
     * Delete the project
     *
     * @param {string} id
     * project id
     * @param {{ userId: string }} params
     * The id of the user. Usually this is the user's email address.
     * If this parameter does not exist the API tries to extract it from the impersonated token.
     * @memberOf VisualFlowCreatorClient
     */
    public async DeleteProject(id: string, params: { userId: string }) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            noResponse: true,
            baseUrl: `${this._baseUrl}/projects/${id}?${toQueryString(params)}`,
        });
    }

    /**
     * * Nodes
     * Read all nodes of the specified project.
     * After getting the nodes you can inspect them, import them into new projects (see PUT endpoint) or transfer them to a different tenant.
     *
     * @param {string} id
     * project id
     * @param {{ userId: string }} params
     * @returns {Promise<VisualFlowCreatorModels.NodesArray>}
     *
     * @memberOf VisualFlowCreatorClient
     */
    public async GetProjecNodes(id: string, params: { userId: string }): Promise<VisualFlowCreatorModels.NodesArray> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/projects/${id}/nodes?${toQueryString(params)}`,
        });

        return result as VisualFlowCreatorModels.NodesArray;
    }

    /**
     * * Nodes
     *
     * Create nodes or replace existing nodes belonging to a project with new nodes. When executing this request,
     * all existing nodes of the project will be removed. All the nodes included in the request will be added to the project.
     *
     * @param {string} id
     * project id
     * @param {VisualFlowCreatorModels.NodesArray} nodes
     * list of nodes
     *
     * @param {{ userId: string }} params
     *  The id of the user. Usually this is the user's email address.
     * If this parameter does not exist the API tries to extract it from the impersonated token.
     * @returns
     *
     * @memberOf VisualFlowCreatorClient
     */
    public async PutProjectNodes(id: string, nodes: VisualFlowCreatorModels.NodesArray, params: { userId: string }) {
        await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            body: nodes,
            baseUrl: `${this._baseUrl}/projects/${id}/nodes?${toQueryString(params)}`,
            noResponse: true,
        });
    }

    /**
     * * Flow
     *
     * When calling this endpoint with a node id of a node of type inject, t
     * his inject node gets triggered and starts the flow.
     * Subsequent nodes of the inject node will receive the message created by the inject node and can again send messages to subsequent nodes.
     *
     * @param {string} id
     * project id
     * @param {string} nodeId
     * id of the inject Node
     * @param {VisualFlowCreatorModels.TriggerNode} triggerNode
     * the message to be sent
     * @example {"topic": "MyTopic","payload": 1660739931990,"_msgid": "8d015cc1.c4418","_starttime": 1660739931990}
     * @param {{ userId: string }} params
     * The id of the user. Usually this is the user's email address.
     * If this parameter does not exist the API tries to extract it from the impersonated token.
     * @memberOf VisualFlowCreatorClient
     */
    public async TriggerFlow(
        id: string,
        nodeId: string,
        triggerNode: VisualFlowCreatorModels.TriggerNode,
        params: { userId: string }
    ) {
        await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            body: triggerNode,
            baseUrl: `${this._baseUrl}/projects/${id}/nodes/${nodeId}/trigger?${toQueryString(params)}`,
            noResponse: true,
        });
    }
}
