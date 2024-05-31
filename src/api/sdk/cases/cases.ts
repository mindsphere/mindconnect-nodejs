import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { CaseManagementModels } from "./cases-models";

/**
 * * Case Management API
 * case solution building block provides a workflow for maintenance, repair, inspection and incident handling requests.
 *
 * This workflow would enable user to
 * Digitalize preventive maintenance - cases for planned maintenance requests (insights from condition monitoring, prescribed by manufacturer,
 * dictated by performance, required by policies)
 * Digitalize corrective maintenance - cases for incident handling and repair requests (alerts from condition monitoring, observations)
 * Digitalize compliance to regulations - Audit of inspection records
 * Improve work request coordination leading to improvement in productivity
 * Improve work request efficiency - right information at right place at right time case solution building block would enable user
 * by allowing to create, monitor and update cases in multiple ways.
 *
 * @export
 * @class CaseManagementClient
 * @extends {SdkClient}
 */
export class CaseManagementClient extends SdkClient {
    private _baseUrl = "/api/casemanagement/v3";
    /**
     *
     * Retrieves the list of cases for the tenant.
     *
     * @param {{
     *         page?: number;
     *         size?: number;
     *         sort?: string;
     *         filter?: string;
     *     }} [params]
     * @return {*}  {Promise<CaseManagementModels.CaseListResponse>}
     * @memberof CaseManagementClient
     */
    public async GetCases(params?: {
        page?: number;
        size?: number;
        sort?: string;
        filter?: string;
    }): Promise<CaseManagementModels.CaseListResponse> {
        const parameters = params || {};
        const { page, size, sort, filter } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases?${toQueryString({ page, size, sort, filter })}`,
        });

        return result as CaseManagementModels.CaseListResponse;
    }

    /**
     * Create case
     *
     * @param {CaseManagementModels.CaseRequestDTO} caseRequest
     * @return {*}  {Promise<CaseManagementModels.CaseSuccessResponseStatus>}
     * @memberof CaseManagementClient
     */
    public async CreateCase(
        caseRequest: CaseManagementModels.CaseRequestDTO
    ): Promise<CaseManagementModels.CaseSuccessResponseStatus> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases`,
            body: caseRequest,
        });

        return result as CaseManagementModels.CaseSuccessResponseStatus;
    }
    /**
     * Get list of all cases activities
     *
     * @param {{
     *         page?: number;
     *         size?: number;
     *         sort?: string;
     *         filter?: string;
     *     }} [params]
     * @return {*}  {Promise<CaseManagementModels.CaseActivitiesListResponse>}
     * @memberof CaseManagementClient
     */
    public async GetCasesActivities(params?: {
        page?: number;
        size?: number;
        sort?: string;
        filter?: string;
    }): Promise<CaseManagementModels.CaseActivitiesListResponse> {
        const parameters = params || {};
        const { page, size, sort, filter } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases/activities?${toQueryString({ page, size, sort, filter })}`,
        });

        return result as CaseManagementModels.CaseActivitiesListResponse;
    }

    /**
     * Get list of cases comments
     *
     * @param {{
     *         page?: number;
     *         size?: number;
     *         sort?: string;
     *         filter?: string;
     *     }} [params]
     * @return {*}  {Promise<CaseManagementModels.CaseCommentsListResponse>}
     * @memberof CaseManagementClient
     */
    public async GetCasesComments(params?: {
        page?: number;
        size?: number;
        sort?: string;
        filter?: string;
    }): Promise<CaseManagementModels.CaseCommentsListResponse> {
        const parameters = params || {};
        const { page, size, sort, filter } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases/comments?${toQueryString({ page, size, sort, filter })}`,
        });

        return result as CaseManagementModels.CaseCommentsListResponse;
    }

    /**
     * Get aggregate summary of the case
     *
     * @param {{
     *         includeOnly?: string;
     *     }} [params]
     * @return {*}  {Promise<CaseManagementModels.CaseAggregateResponse>}
     * @memberof CaseManagementClient
     */
    public async GetCasesAggregate(params?: {
        includeOnly?: string;
    }): Promise<CaseManagementModels.CaseAggregateResponse> {
        const parameters = params || {};
        const { includeOnly } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases/aggregate?${toQueryString({ includeOnly })}`,
        });

        return result as CaseManagementModels.CaseAggregateResponse;
    }
    /**
     * Retrieve case for given case handle
     *
     * @param {string} handle
     * @return {*}  {Promise<CaseManagementModels.CaseResponse>}
     * @memberof CaseManagementClient
     */
    public async GetCase(handle: string): Promise<CaseManagementModels.CaseResponse> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases/${handle}`,
        });

        return result as CaseManagementModels.CaseResponse;
    }
    /**
     * Update case for given case handle.
     *
     * @param {string} handle
     * @param {CaseManagementModels.CaseRequestDTO} caseRequest
     * @param {{ ifMatch: string }} params
     * @return {*}  {Promise<CaseManagementModels.CaseResponseStatus>}
     * @memberof CaseManagementClient
     */
    public async UpdateCase(
        handle: string,
        caseRequest: CaseManagementModels.CaseRequestDTO,
        params: { ifMatch: string }
    ): Promise<CaseManagementModels.CaseResponseStatus> {
        const parameters = params || {};
        const { ifMatch } = parameters;

        const result = await this.HttpAction({
            verb: "PUT",
            body: caseRequest,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases/${handle}`,
            additionalHeaders: { "If-Match": ifMatch },
        });

        return result as CaseManagementModels.CaseResponseStatus;
    }
    /**
     * Delete case for given case handle
     *
     * @param {string} handle
     * @param {{ ifMatch: string }} params
     * @memberof CaseManagementClient
     */
    public async DeleteCase(handle: string, params: { ifMatch: string }) {
        const parameters = params || {};
        const { ifMatch } = parameters;

        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases/${handle}`,
            additionalHeaders: { "If-Match": ifMatch },
            noResponse: true,
        });
    }
    /**
     * Partial update attachments case for given case handle
     *
     * @param {string} handle
     * @param {CaseManagementModels.AttachmentsRequestDTO} attachementRequestDto
     * @param {{ ifMatch: string }} params
     * @return {*}  {Promise<CaseManagementModels.CaseSuccessResponseStatus>}
     * @memberof CaseManagementClient
     */
    public async UpdateAttachments(
        handle: string,
        attachementRequestDto: CaseManagementModels.AttachmentsRequestDTO,
        params: { ifMatch: string }
    ): Promise<CaseManagementModels.CaseSuccessResponseStatus> {
        const parameters = params || {};
        const { ifMatch } = parameters;

        const result = await this.HttpAction({
            verb: "PATCH",
            body: attachementRequestDto,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases/${handle}/attachments`,
            additionalHeaders: { "If-Match": ifMatch },
        });

        return result as CaseManagementModels.CaseSuccessResponseStatus;
    }

    /**
     * Partial update associations case for given case handle
     *
     * @param {string} handle
     * @param {CaseManagementModels.AssociationsRequestDTO} associationsRequestDto
     * @param {{ ifMatch: string }} params
     * @return {*}  {Promise<CaseManagementModels.CaseSuccessResponseStatus>}
     * @memberof CaseManagementClient
     */
    public async UpdateAssociations(
        handle: string,
        associationsRequestDto: CaseManagementModels.AssociationsRequestDTO,
        params: { ifMatch: string }
    ): Promise<CaseManagementModels.CaseSuccessResponseStatus> {
        const parameters = params || {};
        const { ifMatch } = parameters;

        const result = await this.HttpAction({
            verb: "PATCH",
            body: associationsRequestDto,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases/${handle}/associations`,
            additionalHeaders: { "If-Match": ifMatch },
        });

        return result as CaseManagementModels.CaseSuccessResponseStatus;
    }
    /**
     * Partial update externalSystems for given case handle
     *
     * @param {string} handle
     * @param {CaseManagementModels.ExternalSystemsRequestDTO} externalSystemsRequestDto
     * @param {{ ifMatch: string }} params
     * @return {*}  {Promise<CaseManagementModels.CaseSuccessResponseStatus>}
     * @memberof CaseManagementClient
     */
    public async UpdateExternalSystems(
        handle: string,
        externalSystemsRequestDto: CaseManagementModels.ExternalSystemsRequestDTO,
        params: { ifMatch: string }
    ): Promise<CaseManagementModels.CaseSuccessResponseStatus> {
        const parameters = params || {};
        const { ifMatch } = parameters;

        const result = await this.HttpAction({
            verb: "PATCH",
            body: externalSystemsRequestDto,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases/${handle}/externalsystems`,
            additionalHeaders: { "If-Match": ifMatch },
        });

        return result as CaseManagementModels.CaseSuccessResponseStatus;
    }
    /**
     * Partial update tags for given case handle
     *
     * @param {string} handle
     * @param {CaseManagementModels.TagsRequestDTO} tags
     * @param {{ ifMatch: string }} params
     * @return {*}  {Promise<CaseManagementModels.CaseSuccessResponseStatus>}
     * @memberof CaseManagementClient
     */
    public async UpdateTags(
        handle: string,
        tags: CaseManagementModels.TagsRequestDTO,
        params: { ifMatch: string }
    ): Promise<CaseManagementModels.CaseSuccessResponseStatus> {
        const parameters = params || {};
        const { ifMatch } = parameters;

        const result = await this.HttpAction({
            verb: "PATCH",
            body: tags,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases/${handle}/tags`,
            additionalHeaders: { "If-Match": ifMatch },
        });

        return result as CaseManagementModels.CaseSuccessResponseStatus;
    }
    /**
     * Create comment for given case handle
     *
     * @param {string} handle
     * @param {CaseManagementModels.CaseCommentsRequestDTO} comment
     * @return {*}  {Promise<CaseManagementModels.CaseSuccessResponseStatus>}
     * @memberof CaseManagementClient
     */
    public async CreateComment(
        handle: string,
        comment: CaseManagementModels.CaseCommentsResponse
    ): Promise<CaseManagementModels.CaseCommentsResponse> {
        const result = await this.HttpAction({
            verb: "POST",
            body: comment,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases/${handle}/comments`,
        });

        return result as CaseManagementModels.CaseCommentsResponse;
    }
    /**
     * Get list of case comments for given case handle
     *
     * @param {string} handle
     * @param {{
     *             page?: number;
     *             size?: number;
     *             sort?: string;
     *             filter?: string;
     *         }} [params]
     * @return {*}  {Promise<CaseManagementModels.CaseCommentsListResponse>}
     * @memberof CaseManagementClient
     */
    public async GetCaseComents(
        handle: string,
        params?: {
            page?: number;
            size?: number;
            sort?: string;
            filter?: string;
        }
    ): Promise<CaseManagementModels.CaseCommentsListResponse> {
        const parameters = params || {};
        const { page, size, sort, filter } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases/${handle}/comments?${toQueryString({ page, size, sort, filter })}`,
        });

        return result as CaseManagementModels.CaseCommentsListResponse;
    }

    /**
     * Partial update comment for given case handle
     *
     * @param {string} handle
     * @param {string} id
     * @param {CaseManagementModels.CaseCommentsRequestDTO} comment
     * @param {{ ifMatch: string }} params
     * @return {*}  {Promise<CaseManagementModels.CaseSuccessResponseStatus>}
     * @memberof CaseManagementClient
     */
    public async UpdateComment(
        handle: string,
        id: string,
        comment: CaseManagementModels.CaseCommentsRequestDTO,
        params: { ifMatch: string }
    ): Promise<CaseManagementModels.CaseSuccessResponseStatus> {
        const parameters = params || {};
        const { ifMatch } = parameters;

        const result = await this.HttpAction({
            verb: "PATCH",
            body: comment,
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases/${handle}/comments/${id}`,
            additionalHeaders: { "If-Match": ifMatch },
        });

        return result as CaseManagementModels.CaseCommentsResponse;
    }
    /**
     * Delete comment
     *
     * @param {string} handle
     * @param {string} id
     * @param {{ ifMatch: string }} params
     * @memberof CaseManagementClient
     */
    public async DeleteComment(handle: string, id: string, params: { ifMatch: string }) {
        const parameters = params || {};
        const { ifMatch } = parameters;

        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/cases/${handle}/comments/${id}`,
            additionalHeaders: { "If-Match": ifMatch },
            noResponse: true,
        });
    }
}
