import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { WorkOrderModels } from "./workorder-models";

export class WorkOrderManagementClient extends SdkClient {
    private _baseUrl = "/api/workordermanagement/v3";

    /**
     * Retrieves paginated list of work order for the tenant.
     *
     * @param {({
     *         pageNumber?: number;
     *         pageSize?: number;
     *         filter?: string;
     *         sort?: "asc" | "desc";
     *     })} [params]
     * @returns {Promise<WorkOrderModels.WorkOrderListResponse>}
     *
     * @memberOf WorkOrderManagementClient
     */
    public async GetWorkOrders(params?: {
        pageNumber?: number;
        pageSize?: number;
        filter?: string;
        sort?: "asc" | "desc";
    }): Promise<WorkOrderModels.WorkOrderListResponse> {
        const parameters = params || {};
        const { pageNumber, pageSize, filter, sort } = parameters;

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/workorders?${toQueryString({ pageNumber, pageSize, filter, sort })}`,
        });

        return result as WorkOrderModels.WorkOrderListResponse;
    }
}
