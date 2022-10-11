import { SdkClient } from "../common/sdk-client";
import { WorkOrderModels } from "./workorder-models";

export class WorkOrderManagementClient extends SdkClient {
    private _baseUrl = "/api/workordermanagement/v3";

    /**
     * Retrieves list of work orders for the tenant.
     *
     * !fix: in october 2022 there was no pagination on the API
     *
     * @returns {Promise<WorkOrderModels.WorkOrderListResponse>}
     *
     * @memberOf WorkOrderManagementClient
     */
    public async GetWorkOrders(): Promise<WorkOrderModels.WorkOrderListResponse> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/workorders`,
        });

        return result as WorkOrderModels.WorkOrderListResponse;
    }

    /**
     * Create workorder for the tenant.
     *
     * @param {WorkOrderModels.WorkOrderRequestDTOOrder} workorder
     * @returns {Promise < WorkOrderModels.WorkOrderResponseStatus>}
     *
     * @memberOf WorkOrderManagementClient
     */
    public async PostWorkOrder(
        workorder: WorkOrderModels.WorkOrderRequestDTO
    ): Promise<WorkOrderModels.WorkOrderResponseStatus> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/workorders`,
            body: workorder,
        });

        return result as WorkOrderModels.WorkOrderResponseStatus;
    }

    /**
     * Get aggregate summary of workorder.
     *
     * @returns {Promise<WorkOrderModels.WorkOrderAggregateResponse>}
     *
     * @memberOf WorkOrderManagementClient
     */
    public async GetWorkOrdersAggregate(): Promise<WorkOrderModels.WorkOrderAggregateResponse> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/workorders/aggregate`,
        });

        return result as WorkOrderModels.WorkOrderAggregateResponse;
    }

    /**
     * Retrieves workorder for given workorder handle.
     *
     * @param {string} woHandle WorkOrderHandle which uniquely identifies a work order.
     * @example AA-001
     * @returns {Promise<WorkOrderModels.WorkOrderResponse>}
     *
     * @memberOf WorkOrderManagementClient
     */
    public async GetWorkOrder(woHandle: string): Promise<WorkOrderModels.WorkOrderResponse> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/workorders/${woHandle}`,
        });

        return result as WorkOrderModels.WorkOrderResponse;
    }

    /**
     * Update workorder for given work order handle.
     *
     * @param {string} woHandle WorkOrderHandle which uniquely identifies a work order.
     * @example AA-001
     * @param {WorkOrderModels.WorkOrderRequestDTO} workorder
     * @returns {Promise<WorkOrderModels.WorkOrderResponseStatus>}
     *
     * @memberOf WorkOrderManagementClient
     */
    public async PutWorkOrder(
        woHandle: string,
        workorder: WorkOrderModels.WorkOrderRequestDTO
    ): Promise<WorkOrderModels.WorkOrderResponseStatus> {
        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/workorders/${woHandle}`,
            body: workorder,
        });

        return result as WorkOrderModels.WorkOrderResponseStatus;
    }

    /**
     * Delete work oder for given work oder handle.
     *
     * @param {string} woHandle WorkOrderHandle which uniquely identifies a work order.
     * @example AA-001
     * @memberOf WorkOrderManagementClient
     */
    public async DeleteWorkOrder(woHandle: string) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/workorders/${woHandle}`,
            noResponse: true,
        });
    }

    /**
     *
     * Partial update attachments work order for given work order handle, replaces whole array of attachments
     *
     * @param {string} woHandle WorkOrderHandle which uniquely identifies a work order.
     * @example AA-001
     * @param {WorkOrderModels.AttachmentsRequestDTO} attachmentRequest
     * @returns {Promise<WorkOrderModels.WorkOrderResponseStatus>}
     *
     * @memberOf WorkOrderManagementClient
     */
    public async PatchWorkOrderAttachments(
        woHandle: string,
        attachmentRequest: WorkOrderModels.AttachmentsRequestDTO
    ): Promise<WorkOrderModels.WorkOrderResponseStatus> {
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/workorders/${woHandle}/attachments`,
            body: attachmentRequest,
        });

        return result as WorkOrderModels.WorkOrderResponseStatus;
    }

    /**
     * Partial update associations work order for given work order handle, replaces whole array of associations.
     *
     * @param {string} woHandle WorkOrderHandle which uniquely identifies a work order.
     * @example AA-001
     * @param {WorkOrderModels.AssociationsRequestDTO} associationsRequest
     * @returns {Promise<WorkOrderModels.WorkOrderResponseStatus>}
     *
     * @memberOf WorkOrderManagementClient
     */
    public async PatchWorkOrderAssociations(
        woHandle: string,
        associationsRequest: WorkOrderModels.AssociationsRequestDTO
    ): Promise<WorkOrderModels.WorkOrderResponseStatus> {
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/workorders/${woHandle}/associations`,
            body: associationsRequest,
        });

        return result as WorkOrderModels.WorkOrderResponseStatus;
    }
}
