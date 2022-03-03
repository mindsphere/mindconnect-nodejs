import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { ResourceAccessManagementModels } from "./policy-models";

/**
 * Resource Access Management Client
 *
 * API description of the Resource Access Management service.
 * Limitations
 *
 * * The number of existing policies is limited per owner/tenant
 * * The number of existing subjects/rules is limited per policy
 * * The number of existing actions/resources is limited per rule.
 *
 * @export
 * @class ResourceAccessManagementClient
 * @extends {SdkClient}
 */
export class ResourceAccessManagementClient extends SdkClient {
    private _baseUrl: string = "/api/resourceaccessmanagement/v3";

    /**
     * * Policies
     *
     * List all policies of a tenant. Filter is supported on following fields
     * * id,
     * * owner,
     * * name,
     * * active,
     * * subjects,
     * * resources,
     * * createdBy and
     * * lastModifiedBy.
     *
     * @param {{
     *             filter?: string; Specifies the number of elements in a page.
     *             page?: number;
     *             size?: number;
     *         }} [params]
     *
     * @param params.filter Specifies the number of elements in a page. (default 10)
     * @param params.page Specifies the requested page index. (default 0)
     * @param params.filter Specifies the additional filtering criteria
     *
     * @returns {Promise<ResourceAccessManagementModels.PolicyList>}
     *
     * @memberOf ResourceAccessManagementClient
     */
    public async GetPolicies(params?: {
        filter?: string;
        page?: number;
        size?: number;
    }): Promise<ResourceAccessManagementModels.PolicyList> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/policies?${toQueryString(params)}`,
        });
        return result as ResourceAccessManagementModels.PolicyList;
    }

    /**
     *
     *  * Policies
     *
     * Create a new policy with the provided content.
     *
     *
     * @param {ResourceAccessManagementModels.PolicyRequest} policy
     * The policy object to be created. Note: The policy object send in the request might contain further properties
     * (e.g. as specified in the response object, but also beyond),
     * yet those will be ignored.
     *
     * @param policy.name
     *  Name is a client defined identifier. It must be unique within a tenant (owner).
     * Cannot be updated. Max. 100 characters on [a-zA-Z0-9_-].
     * @example: EventPolicy
     *
     * @param policy.description
     * maxLength: 500
     * Description of the policy. This is an optional property with a limit of 500 characters.
     * @example This policy defines the access rules for a technician.
     *
     * @param policy.active
     * Indicating whether the policy should be active or not, i.e.,
     * active policies must be enforced; non-active policies must not be enforced.
     * @example: true
     *
     * @param policy.subjects
     * Resource path identifying of a subject or a group of subjects a policy is to be applied to.
     * maxlength: 300
     * @example  mdsp:core:identitymanagement:eu1:tenantA:user:test@example.com
     *
     * @param pulicy.rules
     * @param policy.rules[].name	string
     * Rule Name is a case-insensitive, client defined identifier. It must be unique within a policy.
     * Populated automatically, if not set by client/user. Max. 20 characters on [a-zA-Z0-9_-].
     * @example Rule1
     *
     * @param policy.rules[].actions[]
     * Identifier describing the action that a rule is to be applied to.
     * maxLength: 255
     * @example mdsp:core:assetmanagement:asset:read
     * @param policy.rules[].resources*
     * Resource path describing the resource that a rule is to be applied to.
     * ruleResourcestring
     * maxLength: 300
     * @example mdsp:core:assetmanagement:eu1:tenantA:asset:dfb0d2961a224a259c44d8c3f76204fe
     * @param policy.rules[].propagationDepth
     * default: -1
     * To support resource hierarchy, this parameter is introduced at the Rule level.
     * * 0 - No propagation. Exact resources specified in the rule are included in the applicability of that rule. No hierarchy support for the included resources.
     * * 1 - Direct children Only. The exact resource mentioned, and its direct children are included in the applicability of the rule.
     * * -1 - Unlimited depth. All the resources (direct children and their descendants till leaf node) that are below the specified resources
     * in that rule are included in the applicability of that rule.
     *
     * @returns
     * Promise<ResourceAccessManagementModels.PolicyResponse>
     *
     *
     * @memberOf ResourceAccessManagementClient
     */
    public async PostPolicy(
        policy: ResourceAccessManagementModels.PolicyRequest
    ): Promise<ResourceAccessManagementModels.PolicyResponse> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/policies`,
            body: policy,
        });

        return result as ResourceAccessManagementModels.PolicyResponse;
    }

    /**
     * Retrieves a specific policy of the current tenant.
     *
     * @param {string} id Id of the policy to retrieve.
     * @returns {Promise<ResourceAccessManagementModels.PolicyResponse>}
     *
     * @memberOf ResourceAccessManagementClient
     */
    public async GetPolicy(id: string): Promise<ResourceAccessManagementModels.PolicyResponse> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/policies/${id}`,
        });

        return result as ResourceAccessManagementModels.PolicyResponse;
    }

    /**
         * *Policies
         *
         * Update the policy
         *
         * @param {string} id
         * @param {{ ifMatch: string }} params Last known version of the policy to facilitate optimistic locking.
         * 
         * @param {ResourceAccessManagementModels.PolicyRequest} policy
         * The policy object to be created. Note: The policy object send in the request might contain further properties
         * (e.g. as specified in the response object, but also beyond),
         * yet those will be ignored.
         *
         * @param policy.name
         *  Name is a client defined identifier. It must be unique within a tenant (owner).
         * Cannot be updated. Max. 100 characters on [a-zA-Z0-9_-].
         * @example: EventPolicy
         *
         * @param policy.description
         * maxLength: 500
         * Description of the policy. This is an optional property with a limit of 500 characters.
         * @example This policy defines the access rules for a technician.
         *
         * @param policy.active
         * Indicating whether the policy should be active or not, i.e.,
         * active policies must be enforced; non-active policies must not be enforced.
         * @example: true
         *
         * @param policy.subjects
         * Resource path identifying of a subject or a group of subjects a policy is to be applied to.
         * maxlength: 300
         * @example  mdsp:core:identitymanagement:eu1:tenantA:user:test@example.com
         *
         * @param pulicy.rules
         * @param policy.rules[].name	string
         * Rule Name is a case-insensitive, client defined identifier. It must be unique within a policy.
         * Populated automatically, if not set by client/user. Max. 20 characters on [a-zA-Z0-9_-].
         * @example Rule1
         *
         * @param policy.rules[].actions[]
         * Identifier describing the action that a rule is to be applied to.
         * maxLength: 255
         * @example mdsp:core:assetmanagement:asset:read
         * @param policy.rules[].resources*
         * Resource path describing the resource that a rule is to be applied to.
         * ruleResourcestring
         * maxLength: 300
         * @example mdsp:core:assetmanagement:eu1:tenantA:asset:dfb0d2961a224a259c44d8c3f76204fe
         * @param policy.rules[].propagationDepth
         * default: -1
         * To support resource hierarchy, this parameter is introduced at the Rule level.
         * * 0 - No propagation. Exact resources specified in the rule are included in the applicability of that rule. No hierarchy support for the included resources.
         * * 1 - Direct children Only. The exact resource mentioned, and its direct children are included in the applicability of the rule.
         * * -1 - Unlimited depth. All the resources (direct children and their descendants till leaf node) that are below the specified resources
         * in that rule are included in the applicability of that rule.
      
         * @returns {Promise<ResourceAccessManagementModels.PolicyResponse>}
         *
         * @memberOf ResourceAccessManagementClient
         */
    public async PutPolicy(
        id: string,
        policy: ResourceAccessManagementModels.PolicyRequest,
        params: { ifMatch: string }
    ): Promise<ResourceAccessManagementModels.PolicyResponse> {
        const parameters = params || {};
        const { ifMatch } = parameters;
        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/policies/${id}`,
            body: policy,
            additionalHeaders: { "If-Match": ifMatch },
        });

        return result as ResourceAccessManagementModels.PolicyResponse;
    }

    /**
     * Delete a policy with given id.
     *
     * @param {string} id the id of the policy to delete.
     *
     * @memberOf ResourceAccessManagementClient
     */
    public async DeletePolicy(id: string) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/policies/${id}`,
            noResponse: true,
        });
    }
}
