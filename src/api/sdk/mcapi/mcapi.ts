import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { MindConnectApiModels } from "./mcapi-models";

/**
 * MindConnect API Client
 *
 * @export
 * @class MindConnectApiClient
 * @extends {SdkClient}
 */
export class MindConnectApiClient extends SdkClient {
    private _baseUrl: string = "/api/mindconnect/v3";

    /**
     * * diagnostic
     *
     * * Register agent for diagnostic activation
     *
     * @param {string} agentId
     * @returns {Promise<MindConnectApiModels.DiagnosticActivation>}
     *
     * @memberOf MindConnectApiClient
     */
    public async PostDiagnosticActivation(agentId: string): Promise<MindConnectApiModels.DiagnosticActivation> {
        const body = { agentId: agentId };

        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticActivations`,
            body: body,
            message: "PostDiagnosticActivation",
        })) as MindConnectApiModels.DiagnosticActivation;
    }

    /**
     * * diagnostic
     *
     * Get the list of diagnostic activations
     *
     * @param {{
     *         size?: number;
     *         page?: number;
     *         sort?: string;
     *     }} [optional]
     * @returns {Promise<MindConnectApiModels.PagedDiagnosticActivation>}
     *
     * @memberOf MindConnectApiClient
     */
    public async GetDiagnosticActivations(optional?: {
        size?: number;
        page?: number;
        sort?: string;
    }): Promise<MindConnectApiModels.PagedDiagnosticActivation> {
        const qs = toQueryString(optional);

        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticActivations?${qs}`,
            message: "GetDiagnosticActivations",
        })) as MindConnectApiModels.PagedDiagnosticActivation;
    }

    /**
     *
     * *diagnostic
     *
     * Put diagnostic api client
     *
     * @param {string} id
     * @param {MindConnectApiModels.DiagnosticActivationStatus} diagnosticStatus
     * @returns {Promise<MindConnectApiModels.DiagnosticActivation>}
     *
     * @memberOf MindConnectApiClient
     */
    public async PutDiagnosticActivation(
        id: string,
        diagnosticStatus: MindConnectApiModels.DiagnosticActivationStatus
    ): Promise<MindConnectApiModels.DiagnosticActivation> {
        const body = diagnosticStatus;

        return (await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticActivations/${id}`,
            body: body,
            message: "PutDiagnosticActivation",
        })) as MindConnectApiModels.DiagnosticActivation;
    }

    /**
     * * diagnostic
     *
     * Get current diagnostic activation
     *
     * @param {string} id
     * @returns {Promise<MindConnectApiModels.DiagnosticActivation>}
     *
     * @memberOf MindConnectApiClient
     */
    public async GetDiagnosticActivation(id: string): Promise<MindConnectApiModels.DiagnosticActivation> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticActivations/${id}`,
            message: "GetDiagnosticActivation",
        })) as MindConnectApiModels.DiagnosticActivation;
    }

    /**
     * *diagnnostic
     *
     * Delete diagnostic activation.
     *
     * @param {string} id
     * @returns
     *
     * @memberOf MindConnectApiClient
     */
    public async DeleteDiagnosticActivation(id: string) {
        return await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticActivations/${id}`,
            message: "DeleteDiagnosticActivation",
            noResponse: true,
        });
    }

    /**
     * Get messages
     *
     * @param {string} id
     * @param {{ filter?: string; size?: number; page?: number; sort?: string }} [optional]
     * @returns {Promise<MindConnectApiModels.PagedDiagnosticInformationMessages>}
     *
     * @memberOf MindConnectApiClient
     */
    public async GetDiagnosticActivationMessages(
        id: string,
        optional?: { filter?: string; size?: number; page?: number; sort?: string }
    ): Promise<MindConnectApiModels.PagedDiagnosticInformationMessages> {
        const qs = toQueryString(optional);
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticActivations/${id}/messages?${qs}`,
            message: "GetDiagnosticActivationMessages",
        })) as MindConnectApiModels.PagedDiagnosticInformationMessages;
    }

    /**
     * @deprecated please use GetDiagnosticActivationMessages
     *
     * Get list of diagnostic informations
     *
     * @param {{
     *         filter?: string;
     *         size?: number;
     *         page?: number;
     *         sort?: string;
     *     }} [optional]
     * @returns {Promise<MindConnectApiModels.PagedDiagnosticInformationMessages>}
     *
     * @memberOf MindConnectApiClient
     */
    public async GetDiagnosticInformation(optional?: {
        filter?: string;
        size?: number;
        page?: number;
        sort?: string;
    }): Promise<MindConnectApiModels.PagedDiagnosticInformationMessages> {
        const qs = toQueryString(optional);
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticInformation?${qs}`,
            message: "GetDiagnosticInformation",
        })) as MindConnectApiModels.PagedDiagnosticInformationMessages;
    }

    /**
     *
     * * Delete all diagnostic activations
     *
     * Deletes all diagnostic activations
     *
     *
     * @memberOf MindConnectApiClient
     */
    public async DeleteAllDiagnosticActivations() {
        const activations = await this.GetDiagnosticActivations();
        for (const activation of activations.content) {
            if (activation.id) await this.DeleteDiagnosticActivation(activation.id);
        }
    }

    /**
     * * diagnostic
     *
     * Get all diagnostic information paged (for the CLI)
     *
     * @param {string} agentId
     * @param {(x: MindConnectApiModels.DiagnosticInformation[], ...args: any[]) => any} [callback]
     * @param {*} [callbackOptions]
     * @param {boolean} [skipToLast=true]
     * @returns
     *
     * @memberOf MindConnectApiClient
     */
    public async GetAllDiagnosticInformation(
        agentId: string,
        callback?: (x: MindConnectApiModels.DiagnosticInformation[], ...args: any[]) => any,
        callbackOptions?: any,
        skipToLast: boolean = true
    ) {
        let pagedInformation: MindConnectApiModels.PagedDiagnosticInformation;
        let page = 0;
        do {
            pagedInformation = await this.GetDiagnosticActivationMessages(agentId, { page: page++ });
            if (skipToLast) {
                page = pagedInformation.totalPages - 2;
                if (page < 0) page = 0;
                skipToLast = false;
                if (!pagedInformation.last) {
                    continue;
                }
            }
            if (callback) {
                callback(pagedInformation.content, callbackOptions);
            }
        } while (!pagedInformation.last);
        return pagedInformation;
    }

    /**
     * * mappings
     *
     * Create single mapping
     *
     * @param {MindConnectApiModels.Mapping} mapping
     * @returns
     *
     * @memberOf MindConnectApiClient
     */
    public async PostDataPointMapping(mapping: MindConnectApiModels.Mapping) {
        const body = mapping;

        return await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataPointMappings`,
            body: body,
            message: "PostDataPointMapping",
            noResponse: true,
        });
    }

    /**
     *
     * * mappings
     *
     * Get mappings
     *
     * @param {{
     *         filter?: string;
     *         size?: number;
     *         page?: number;
     *         sort?: string;
     *     }} [optional]
     * @returns {Promise<MindConnectApiModels.PagedMapping>}
     *
     * @memberOf MindConnectApiClient
     */
    public async GetDataPointMappings(optional?: {
        filter?: string;
        size?: number;
        page?: number;
        sort?: string;
    }): Promise<MindConnectApiModels.PagedMapping> {
        const qs = toQueryString(optional);
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataPointMappings?${qs}`,
            message: "GetDataPointMappings",
            noResponse: true,
        })) as MindConnectApiModels.PagedMapping;
    }

    /**
     * * mappings
     *
     * Get a mapping by id
     *
     * @param {string} id
     * @returns {Promise<MindConnectApiModels.Mapping>}
     *
     * @memberOf MindConnectApiClient
     */
    public async GetDataPointMapping(id: string): Promise<MindConnectApiModels.Mapping> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataPointMappings/${id}`,
            message: "GetDataPointMapping",
        })) as MindConnectApiModels.Mapping;
    }

    /**
     *
     * Delete a mapping
     *
     * @param {string} id
     * @returns
     *
     * @memberOf MindConnectApiClient
     */
    public async DeleteDataMapping(id: string) {
        return await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataPointMappings/${id}`,
            message: "DeleteDataMapping",
            noResponse: true,
        });
    }
}
