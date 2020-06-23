import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { IdentityManagementModels } from "./identity-models";

/**
 * The Identity Management API provides a means form managing users, groups and OAuth clients.
 * The user and group management is based on SCIM (System for Cross-domain Identity Management).
 *
 * Note: Unless stated otherwise the Identity Management APIs allow each caller only to act within the context of the tenant to which the caller belong's to.
 *
 * Note2: UIAM stands for User Identity Access Management, since users and providers are separated in system. Therefore this API documentation is related to users generally.
 *
 * @export
 * @class TimeSeriesClient
 * @extends {SdkClient}
 */
export class IdentityManagementClient extends SdkClient {
    private _baseUrl: string = "/api/identitymanagement/v3";

    /**
     *
     * *uiam user - API for Managing Users in a Tenant
     *
     * List of users of a tenant.
     * Please note, in order to request only the list of users (without the information to which group a user belongs)
     * it is recommended to make use of the "attributes" query parameter as follows /Users?attributes=userName,name,meta
     * (this will significantly improve the performance over simply calling /Users).
     *
      @summary List of users of a tenant.
     * @param {{
     *             filter?: string,
     *             atributes?: string,
     *             sortBy?: string,
     *             sortOrder?: string,
     *             count?: number,
     *             startIndex?: number,
     *             subtenant?: string
     *         }} [params]
     *
     * @param {string} [params.filter] SCIM filter for searching see [here](http://www.simplecloud.info/specs/draft-scim-api-01.html).
     * The available filter attributes are: id, username, email or emails.value, givenname, familyname, active, phonenumber, verified, origin, created or meta.
     * created, lastmodified or meta.lastmodified, version or meta.version, groups.display.
     * Note: parameter cannot be used in complex filter expression and only eq operator is allowed eg.
     * ilter=groups.display eq "MyGroupName"
     * @param {string} [params.attributes] Comma separated list of attribute names to be returned, e.g., userName, name, meta. The attributes parameters does not support the parameter \&quot;subtenants\&quot;.
     * @param {string} [params.sortBy] Sorting field name, like email or id
     * @param {string} [params.sortOrder] Sort order, ascending/descending (defaults to ascending)
     * @param {number} [params.count] Number of objects to be returned (defaults to 100)
     * @param {number} [params.startIndex] The starting index of the search results when paginated. Index starts with 1 (defaults to 1).
     * @param {string} [params.subtenant] Filter for subtenant users
     * @throws {RequiredError}
     * @returns {Promise<IdentityManagementModels.ScimUserResponseSearchResults>}
     *
     * @memberOf IdentityManagementClient
     */
    public async GetUsers(params?: {
        filter?: string;
        attributes?: string;
        sortBy?: string;
        sortOrder?: string;
        count?: number;
        startIndex?: number;
        subtenant?: string;
    }): Promise<IdentityManagementModels.ScimUserResponseSearchResults> {
        const qs = toQueryString(params);
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/Users?${qs}`,
            message: "GetUsers",
        })) as IdentityManagementModels.ScimUserResponseSearchResults;
    }

    /**
     * *uiam user - API for Managing Users in a Tenant
     *
     * Get details of user
     *
     * @param {string} id
     * @returns {Promise<IdentityManagementModels.ScimUserResponse>}
     *
     * @memberOf IdentityManagementClient
     */
    public async GetUser(id: string): Promise<IdentityManagementModels.ScimUserResponse> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/Users/${id}`,
            message: "GET",
        })) as IdentityManagementModels.ScimUserResponse;
    }

    /**
     * *uiam user - API for Managing Users in a Tenant
     *
     * Create a new user in a tenant.
     * Note: The ‘subtenants’ field is optional. If it is present, the user is considered to be a subtenant user.
     *
     * @param {IdentityManagementModels.ScimUserPost} user
     * @returns {Promise<IdentityManagementModels.ScimUserPostResponse>}
     *
     * @memberOf IdentityManagementClient
     */
    public async PostUser(
        user: IdentityManagementModels.ScimUserPost
    ): Promise<IdentityManagementModels.ScimUserPostResponse> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/Users`,
            message: "PostUser",
            body: user,
        })) as IdentityManagementModels.ScimUserPostResponse;
    }

    /**
     * *uiam user - API for Managing Users in a Tenant
     *
     * Update User
     *
     * @param {string} id
     * @param {IdentityManagementModels.ScimUserPost} user
     * @returns {Promise<IdentityManagementModels.ScimUserResponse>}
     *
     * @memberOf IdentityManagementClient
     */
    public async PutUser(
        id: string,
        user: IdentityManagementModels.ScimUserPut
    ): Promise<IdentityManagementModels.ScimUserResponse> {
        return (await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/Users/${id}`,
            message: "PutUser",
            body: user,
        })) as IdentityManagementModels.ScimUserResponse;
    }

    /**
     * *uiam user - API for Managing Users in a Tenant
     *
     * Delete user of tenant.
     * Note that tenant can have user if it purchased at least the simple offering.
     * Example path /api/identitymanagement/v3/Users/2f95913-d3d9-4a4a-951a-c21184080cf3
     *
     * @param {string} id
     * @returns {Promise<IdentityManagementModels.ScimUserResponse>}
     *
     * @memberOf IdentityManagementClient
     */
    public async DeleteUser(id: string): Promise<IdentityManagementModels.ScimUserResponse> {
        return (await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/Users/${id}`,
            message: "DeleteUser",
        })) as IdentityManagementModels.ScimUserResponse;
    }

    /**
     *
     * *uiam user - API for Managing Users in a Tenant
     *
     * Get list of groups starting with the prefix "mdsp:" in which the user is a member.
     *
     * @returns {Promise<IdentityManagementModels.Group>}
     *
     * @memberOf IdentityManagementClient
     */
    public async GetUsersMe(): Promise<IdentityManagementModels.Group> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/Users/me`,
            message: "GetUsersMe",
        })) as IdentityManagementModels.Group;
    }

    /**
     *
     * *uiam group - API for Managing Groups in a Tenant
     *
     * List of groups of a tenant.

      @summary List of groups of a tenant.
     * @param {{
        *             filter?: string,
        *             count?: number,
        *             startIndex?: number,
        *         }} [params]
        *
        * @param {string} [params.filter] SCIM filter for searching see [here](http://www.simplecloud.info/specs/draft-scim-api-01.html).
        * The available filter attributes are: id, groupname, email or emails.value, givenname, familyname, active, phonenumber, verified, origin, created or meta.
        * created, lastmodified or meta.lastmodified, version or meta.version, groups.display.
        * Note: parameter cannot be used in complex filter expression and only eq operator is allowed eg.
        * ilter=groups.display eq "MyGroupName"
        * @param {number} [params.count] Number of objects to be returned (defaults to 100)
        * @param {number} [params.startIndex] The starting index of the search results when paginated. Index starts with 1 (defaults to 1).
        * @throws {RequiredError}
        * @returns {Promise<IdentityManagementModels.ScimGroupSearchResults>}
        *
        * @memberOf IdentityManagementClient
        */
    public async GetGroups(params?: {
        filter?: string;
        count?: number;
        startIndex?: number;
    }): Promise<IdentityManagementModels.ScimGroupSearchResults> {
        const qs = toQueryString(params);
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/Groups?${qs}`,
            message: "GetGroups",
        })) as IdentityManagementModels.ScimGroupSearchResults;
    }

    /**
     * *uiam group - API for Managing Groups in a Tenant
     *
     * Get details of group
     *
     * @param {string} id
     * @returns {Promise<IdentityManagementModels.ScimGroup>}
     *
     * @memberOf IdentityManagementClient
     */
    public async GetGroup(id: string): Promise<IdentityManagementModels.ScimGroup> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/Groups/${id}`,
            message: "GET",
        })) as IdentityManagementModels.ScimGroup;
    }

    /**
     * *uiam group - API for Managing Groups in a Tenant
     *
     * Create a new group in a tenant.
     * Note: The ‘subtenants’ field is optional. If it is present, the group is considered to be a subtenant group.
     *
     * @param {IdentityManagementModels.ScimGroupPost} group
     * @returns {Promise<IdentityManagementModels.ScimGroup>}
     *
     * @memberOf IdentityManagementClient
     */
    public async PostGroup(group: IdentityManagementModels.ScimGroupPost): Promise<IdentityManagementModels.ScimGroup> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/Groups`,
            message: "PostGroup",
            body: group,
        })) as IdentityManagementModels.ScimGroup;
    }

    /**
     * *uiam group - API for Managing Groups in a Tenant
     *
     * Update Group
     *
     * @param {string} id
     * @param {IdentityManagementModels.ScimGroupPost} group
     * @returns {Promise<IdentityManagementModels.ScimGroup>}
     *
     * @memberOf IdentityManagementClient
     */
    public async PutGroup(
        id: string,
        group: IdentityManagementModels.ScimGroupPost
    ): Promise<IdentityManagementModels.ScimGroup> {
        return (await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/Groups/${id}`,
            message: "PutGroup",
            body: group,
        })) as IdentityManagementModels.ScimGroup;
    }

    /**
     * *uiam group - API for Managing Groups in a Tenant
     *
     * Delete group and every connection to that group, too.
     * Example path /api/identitymanagement/v3/Groups/68af46d-e9b8-4t04-5a20-7d557f5da8d
     *
     * @param {string} id
     * @returns {Promise<IdentityManagementModels.ScimGroup>}
     *
     * @memberOf IdentityManagementClient
     */
    public async DeleteGroup(id: string): Promise<IdentityManagementModels.ScimGroup> {
        return (await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/Groups/${id}`,
            message: "DeleteGroup",
        })) as IdentityManagementModels.ScimGroup;
    }

    /**
     * *uiam group - API for Managing Groups in a Tenant
     *
     * @param {string} id
     * @returns {Promise<IdentityManagementModels.ScimGroupMemberList>}
     *
     * @memberOf IdentityManagementClient
     */
    public async GetGroupMembers(id: string): Promise<IdentityManagementModels.ScimGroupMemberList> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/Groups/${id}/members`,
            message: "GetGroupMemberList",
        })) as IdentityManagementModels.ScimGroupMemberList;
    }

    /**
     * *uiam group - API for Managing Groups in a Tenant
     *
     * Add new member (either user or group) to an existing group.
     *  Example path /api/identitymanagement/v3/Groups/68af46d-e9b8-4t04-5a20-7d557f5da8d/members.
     *
     * @param {IdentityManagementModels.ScimGroupMemberPost} group
     * @returns {Promise<IdentityManagementModels.ScimGroupMember>}
     *
     * @memberOf IdentityManagementClient
     */
    public async PostGroupMember(
        id: string,
        member: IdentityManagementModels.ScimGroupMember
    ): Promise<IdentityManagementModels.ScimGroupMember> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/Groups/${id}/members`,
            message: "PostGroupMember",
            body: member,
        })) as IdentityManagementModels.ScimGroupMember;
    }

    /**
     * *uiam group - API for Managing Groups in a Tenant
     *
     * Delete member (either user or group) from a group.
     * Example path /api/identitymanagement/v3/Groups/68af46d-e9b8-4t04-5a20-7d557f5da8d/members/e74ff46d-8bb8-4d04-b420-7d557fe86a8d
     *
     * @param {string} id
     * @param {string} memberId
     * @returns {Promise<IdentityManagementModels.ScimGroupMember>}
     *
     * @memberOf IdentityManagementClient
     */
    public async DeleteGroupMember(id: string, memberId: string): Promise<IdentityManagementModels.ScimGroupMember> {
        return (await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/Groups/${id}/members/${memberId}`,
            message: "DeleteGroupMember",
        })) as IdentityManagementModels.ScimGroupMember;
    }
}
