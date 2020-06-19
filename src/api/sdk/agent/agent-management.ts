import { sleep } from "../../../../test/test-utils";
import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { AgentManagementModels } from "./agent-models";

/**
 * API defining resources and operations for managing agents.
 *
 * Generating a Boarding Configuration action is an asynchronous operation therefore it may take a while.
 * In case Boarding Configuration is not generated, try to read the configuration again after a couple of seconds.
 *
 * @export
 * @class AgentManagementClient
 * @extends {SdkClient}
 */
export class AgentManagementClient extends SdkClient {
    private _baseUrl: string = "/api/agentmanagement/v3";

    /**
     * * Agents
     *
     * Creates a new agent.
     *
     * @param {AgentManagementModels.Agent} agent
     * @returns
     *
     * @memberOf AgentManagementClient
     */
    public async PostAgent(agent: AgentManagementModels.Agent) {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/agents`,
            body: agent,
        });

        return result as AgentManagementModels.Agent;
    }

    /**
     * * Agents
     *
     * Gets the agents for given filter.
     *
     * @param {{
     *         page?: number;
     *         size?: number;
     *         sort?: string;
     *         filter?: string;
     *     }} [params]
     * @returns {Promise<AgentManagementModels.PagedAgent>}
     *
     * @memberOf AgentManagementClient
     */
    public async GetAgents(params?: {
        page?: number;
        size?: number;
        sort?: string;
        filter?: string;
    }): Promise<AgentManagementModels.PagedAgent> {
        const parameters = params || {};
        const { page, size, sort, filter } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/agents?${toQueryString({ page, size, sort, filter })}`,
        });

        return result as AgentManagementModels.PagedAgent;
    }

    /**
     * * Agents
     *
     * Gets the agent for the given agent id.
     *
     * @param {string} id
     * @returns {Promise<AgentManagementModels.Agent>}
     *
     * @memberOf AgentManagementClient
     */
    public async GetAgent(id: string): Promise<AgentManagementModels.Agent> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/agents/${id}`,
        });

        return result as AgentManagementModels.Agent;
    }

    /**
     * * Agents
     *
     * Updates the agent for the given agent id with given parameters.
     *
     * @param {string} id
     * @param {AgentManagementModels.AgentUpdate} agent
     * @param {{ ifMatch: string }} params
     * @returns {Promise<AgentManagementModels.Agent>}
     *
     * @memberOf AgentManagementClient
     */
    public async PutAgent(
        id: string,
        agent: AgentManagementModels.AgentUpdate,
        params: { ifMatch: string }
    ): Promise<AgentManagementModels.Agent> {
        const parameters = params || {};
        const { ifMatch } = parameters;
        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/agents/${id}`,
            body: agent,
            additionalHeaders: { "If-Match": ifMatch },
        });

        return result as AgentManagementModels.Agent;
    }

    /**
     * * Agents
     *
     * Deletes the agent for the given agent id.
     *
     * @param {string} id
     * @param {{ ifMatch: string }} params
     * @returns {Promise<AgentManagementModels.Agent>}
     *
     * @memberOf AgentManagementClient
     */
    public async DeleteAgent(id: string, params: { ifMatch: string }): Promise<AgentManagementModels.Agent> {
        const parameters = params || {};
        const { ifMatch } = parameters;
        const result = await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/agents/${id}`,
            additionalHeaders: { "If-Match": ifMatch },
            noResponse: true,
        });

        return result as AgentManagementModels.Agent;
    }

    /**
     * * Agents
     *
     * Get online status for the agent with specified agent id.
     *
     * @param {string} id
     * @returns {Promise<AgentManagementModels.OnlineStatus>}
     *
     * @memberOf AgentManagementClient
     */
    public async GetAgentOnlineStatus(id: string): Promise<AgentManagementModels.OnlineStatus> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/agents/${id}/status`,
        });

        return result as AgentManagementModels.OnlineStatus;
    }

    /**
     * * DataSourceConfiguration
     *
     * Fetches data source configuration object.
     *
     * @param {string} id
     * @returns {Promise<AgentManagementModels.DataSourceConfiguration>}
     *
     * @memberOf AgentManagementClient
     */
    public async GetDataSourceConfiguration(id: string): Promise<AgentManagementModels.DataSourceConfiguration> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/agents/${id}/dataSourceConfiguration`,
        });

        return result as AgentManagementModels.DataSourceConfiguration;
    }

    /**
     * * DataSourceConfiguration
     *
     * Creates or updates data source conifguration object.
     *
     * @param {string} id
     * @param {AgentManagementModels.DataSourceConfiguration} dataSourceConfiguration
     * @param {{ ifMatch: string }} params
     * @returns {Promise<AgentManagementModels.DataSourceConfiguration>}
     *
     * @memberOf AgentManagementClient
     */
    public async PutDataSourceConfiguration(
        id: string,
        dataSourceConfiguration: AgentManagementModels.DataSourceConfiguration,
        params: { ifMatch: string }
    ): Promise<AgentManagementModels.DataSourceConfiguration> {
        const parameters = params || {};
        const { ifMatch } = parameters;
        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/agents/${id}/dataSourceConfiguration`,
            body: dataSourceConfiguration,
            additionalHeaders: { "If-Match": ifMatch },
        });

        return result as AgentManagementModels.DataSourceConfiguration;
    }

    /**
     * * Boarding
     *
     * Gets boarding configuration
     *
     * @param {string} id
     * @returns {Promise<AgentManagementModels.Configuration>}
     *
     * @memberOf AgentManagementClient
     */
    public async GetBoardingConfiguration(
        id: string,
        params?: { retry?: number }
    ): Promise<AgentManagementModels.Configuration> {
        const parameters = params || {};
        let { retry } = parameters;
        retry = retry || 1;

        let result;

        for (let index = 0; index < retry; index++) {
            result = (await this.HttpAction({
                verb: "GET",
                gateway: this.GetGateway(),
                authorization: await this.GetToken(),
                baseUrl: `${this._baseUrl}/agents/${id}/boarding/configuration`,
            })) as AgentManagementModels.Configuration;

            if (!result.content) {
                await sleep(500 * index);
                continue;
            } else {
                break;
            }
        }

        return result as AgentManagementModels.Configuration;
    }

    /**
     * * Boarding
     *
     * Offboards the agent
     *
     * @param {string} id
     * @returns {Promise<AgentManagementModels.OnboardingStatus>}
     *
     * @memberOf AgentManagementClient
     */
    public async OffboardAgent(id: string): Promise<AgentManagementModels.OnboardingStatus> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/agents/${id}/boarding/offboard`,
        });

        return result as AgentManagementModels.OnboardingStatus;
    }

    /**
     * * Boarding
     *
     * Gets onboarding status.
     *
     * @param {string} id
     * @returns {Promise<AgentManagementModels.OnboardingStatus>}
     *
     * @memberOf AgentManagementClient
     */
    public async GetOnboardingStatus(id: string): Promise<AgentManagementModels.OnboardingStatus> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/agents/${id}/boarding/status`,
        });

        return result as AgentManagementModels.OnboardingStatus;
    }
}
