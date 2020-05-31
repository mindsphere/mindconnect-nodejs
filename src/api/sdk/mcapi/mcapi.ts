import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { MindConnectApiModels } from "./mcapi-models";

export class MindConnectApiClient extends SdkClient {
    private _baseUrl: string = "/api/mindconnect/v3";

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

    public async GetDiagnosticActivation(id: string): Promise<MindConnectApiModels.DiagnosticActivation> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticActivations/${id}`,
            message: "GetDiagnosticActivation",
        })) as MindConnectApiModels.DiagnosticActivation;
    }

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

    public async DeleteAllDiagnosticActivations() {
        const activations = await this.GetDiagnosticActivations();
        for (const activation of activations.content) {
            if (activation.id) await this.DeleteDiagnosticActivation(activation.id);
        }
    }

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
}
