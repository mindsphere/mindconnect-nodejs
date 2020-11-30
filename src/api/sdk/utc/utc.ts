import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { UsageTransparencyModels } from "./utc-models";

/**
 * This API also allows platform and third party applications to record application usages
 * by users/assets/tenants for billing, reporting,
 * quota checking purposes.
 *
 * While adding the usages
 *
 * * UTS accepts all the data that is sent, provided it is in valid format and payload does not exceed the limit of usages count per request.
 * * In case rules are configured for the usage units, the corresponding usage data is verified against the rule.
 * * If verification fails, the data will be rejected and is not aggregated.
 * * If /usagesJobs endpoint was used for sending the data, caller can query for the status of the data.
 * * A rule is necessary in case the usages are to be billed.
 * * Limitations
 * * The number usages that can be added to UTS in a single request is limited to 200, regardless of whether usages are for single or multiple users.
 * * Tenants can query the status of up to 1000 recent jobs that they created to add the usages to UTS.
 * * The amount of operations performed that can be performed are limited per time, and may be throttled.
 *
 * * Generic Errors
 * * The following generic error codes might occur at any of the specified operations. Generic errors are prefixed with 'mdsp.core.generic.'.
 *
 * *204: noContent
 * *400: invalidParameter
 * *400: invalidRequestBodyProperty
 * *400: missingParameter
 * *400: missingRequestBodyProperty
 * *401: unauthorized
 * *403: forbidden
 * *404: noMatch
 * *413: payloadTooLarge
 * *415: unsupportedMediaType
 * *429: tooManyRequests
 * *500: internalServerError
 *
 * @export
 * @class UsageTransparencyClient
 * @extends {SdkClient}
 */
export class UsageTransparencyClient extends SdkClient {
    private _baseUrl: string = "/api/usagetransparency/v3";

    /**
     * This method can be used by operators and applications to send application specific usages
     * (e.g. number of created report pages, cpu times per user, assets configured, etc) to the UTS.
     * Use this endpoint to send USAGES of a SINGLE TENANT and USER to UTS.
     * The job id, though internally generated is not returned to the caller.
     * Caller can use the GET /addUsagesJobs API to get the status of the sent data.
     *
     * @param {UsageTransparencyModels.UserUsage} usageData
     * @returns
     *
     * @memberOf UsageTransparencyClient
     */
    public async PostUsages(usageData: UsageTransparencyModels.UserUsage) {
        return await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(), // always use this.GetGateway()  and this.GetToken()
            authorization: await this.GetToken(), // this is overriden in different authorizers
            body: usageData,
            noResponse: true,
            baseUrl: `${this._baseUrl}/usages`,
        });
    }

    /**
     * This method can be used by operators and applications to create a job that adds application specific usages (e.g. number of created report pages, CPU times per user, assets configured, etc.) to the UTS.
     * Maximum of 200 usages can be added by one job. Larger payloads are immediately and completely rejected.
     * Use this endpoint to add USAGES of MULTIPLE TENANTS and USERS to UTS.
     * The returned id can be used later to query the status of the UTS process for the job and added usages.
     * In case the usages need to be billed, a rule must be created in UTS.
     * In case the userId is not provided in the payload, the tenantId is used as userId, also userType is then tenant
     *
     * @param {UsageTransparencyModels.Users} usages
     * @returns {Promise<UsageTransparencyModels.UsagesJob>}
     *
     * @memberOf UsageTransparencyClient
     */
    public async PostUsagesJobs(usages: UsageTransparencyModels.Users): Promise<UsageTransparencyModels.UsagesJob> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(), // always use this.GetGateway()  and this.GetToken()
            authorization: await this.GetToken(), // this is overriden in different authorizers
            body: usages,
            baseUrl: `${this._baseUrl}/usagesJobs`,
        })) as UsageTransparencyModels.UsagesJob;
    }

    /**
     * Returns overall summary of the jobs and optionally the usages added using /addUsagesJobs or /usages APIs.
     * Callers are not usually expected to use this API as part of business workflow, but for 'in-frequent auditing'.
     * The calls to this method may be throttled.
     * Only 1000 latest jobs per operator tenant can be retrieved.
     * Description of job statuses.
     * ACCEPTED: A job is created, and the usages have been accepted.
     * INPROGRESS: Processing is on-going on at least one of the usages added by the job.
     * ERRORS: There is at least one error encountered while processing the usages.
     * COMPLETED: All the processes applicable to the usages have been completed.
     *
     * @param {{
     *         date?: Date;
     *         tenant?: string;
     *         application?: string;
     *         unit?: string;
     *         page?: number;
     *         size?: number;
     *     }} [params]
     * @returns {Promise<UsageTransparencyModels.UsagesJobQueryResult>}
     *
     * @memberOf UsageTransparencyClient
     */
    public async GetUsagesJobs(params?: {
        date?: Date;
        tenant?: string;
        application?: string;
        unit?: string;
        page?: number;
        size?: number;
    }): Promise<UsageTransparencyModels.UsagesJobQueryResult> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(), // always use this.GetGateway()  and this.GetToken()
            authorization: await this.GetToken(), // this is overriden in different authorizers
            baseUrl: `${this._baseUrl}/usagesJobs?${toQueryString(params)}`,
        })) as UsageTransparencyModels.UsagesJobQueryResult;
    }

    /**
     * Returns status summary of the usages added by the data sent using /addUsagesJobs or /usages APIs.
     * Callers are not usually expected to use this API as part of business workflow, but for 'in-frequent auditing'.
     * The calls to this method may be throttled.
     * Summaries from only 1000 latest jobs per operator tenant can be retrieved.
     * Description of usage statuses.
     * ACCEPTED: Usages have been accepted.
     * VERIFIED: Usages have been verified against the rules configured in rule engine, if applicable.
     * VERIFICATIONFAILED: Verification of at least one of the usages has failed.
     * NOVERIFICATION: No applicable rule was found and hence no verification was done.
     * AGGREGATED: Usages have been aggregated into a running daily aggregate value based on the aggregation function defined in UTS rule. In case no rule is applicable, default aggregation function 'SUM' is used. The aggregation is performed every hour and the daily aggregate is updated. Once aggregated, the UTS can be queried to report the usages through UI or data endpoints.
     * SENTFORBILLING: If billing is enabled for the usages, the data has been sent successfully to the billing system.
     * FAILEDTOSENDFORBILLING: Errors were encountered while sending the data to billing. These could be network issues or other internal errors.
     * RECEIVEDFORBILLING: Data sent for billing has been verified to be received in the billing system.
     *
     * @param {string} id id of the job that was used to send the usages.
     * @param {{
     *             page?: number;
     *             size?: number;
     *         }} [params]
     * @returns {Promise<UsageTransparencyModels.UsagesJobSummary>}
     *
     * @memberOf UsageTransparencyClient
     */
    public async GetUsagesJobsById(
        id: string,
        params?: {
            page?: number;
            size?: number;
        }
    ): Promise<UsageTransparencyModels.UsagesJobSummary> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(), // always use this.GetGateway()  and this.GetToken()
            authorization: await this.GetToken(), // this is overriden in different authorizers
            baseUrl: `${this._baseUrl}/usagesJobs/${id}?${toQueryString(params)}`,
        })) as UsageTransparencyModels.UsagesJobSummary;
    }

    /**
     * Returns the errors, if any, associated with a set of usages that were received by the identified job.
     * Callers are not usually expected to use this API as part of business workflow, but for 'in-frequent auditing'.
     * The calls to this method may be throttled.
     * In case of 'Verification Errors', the list of usages that failed verification is part of the errors.
     * In case of 'Billing Errors', billing ids are part of the error data. API users need to contact UTS team with the billing-ids to resolve the issues.
     *
     * @param {string} id
     * @param {{
     *             errorClass?: string;
     *             page?: number;
     *             size?: number;
     *         }} [params]
     * @returns {Promise<UsageTransparencyModels.UsageErrors>}
     *
     * @memberOf UsageTransparencyClient
     */
    public async GetUsagesJobsByIdErrors(
        id: string,
        params?: {
            errorClass?: string;
            page?: number;
            size?: number;
        }
    ): Promise<UsageTransparencyModels.UsageErrors> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(), // always use this.GetGateway()  and this.GetToken()
            authorization: await this.GetToken(), // this is overriden in different authorizers
            baseUrl: `${this._baseUrl}/usagesJobs/${id}/errors?${toQueryString(params)}`,
        })) as UsageTransparencyModels.UsageErrors;
    }
}
