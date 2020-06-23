export namespace IdentityManagementModels {
    /**
     *
     * @export
     * @class RequiredError
     * @extends {Error}
     */
    export class RequiredError extends Error {
        name: "RequiredError" = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *
     * @export
     * @interface ChangeSecretRequest
     */
    export interface ChangeSecretRequest {
        /**
         * New secret for the client. Must meet the following requirements:   * alphabet is a-zA-Z0-9   * minimum 43 characters   * maximum 255 characters If parameter is missing, then new secret will be generated.
         * @type {string}
         * @memberof ChangeSecretRequest
         */
        newSecret?: string;
    }

    /**
     *
     * @export
     * @interface ChangedSecretResponse
     */
    export interface ChangedSecretResponse {
        /**
         * the new secret.
         * @type {string}
         * @memberof ChangedSecretResponse
         */
        secret?: string;
    }

    /**
     * Epoch (milliseconds) of the moment the client secret was introduced. Array contains creation times in ascending order. Most of the time it should contain only one item, except during secret rotation - in that case, two items will be there.
     * @export
     * @interface ClientSecretCreationTimes
     */
    export interface ClientSecretCreationTimes extends Array<number> {}

    /**
     *
     * @export
     * @interface Email
     */
    export interface Email {
        /**
         * The email address.
         * @type {string}
         * @memberof Email
         */
        value: string;
    }

    /**
     *
     * @export
     * @interface Group
     */
    export interface Group {
        /**
         *
         * @type {string}
         * @memberof Group
         */
        display: string;
        /**
         *
         * @type {string}
         * @memberof Group
         */
        type?: Group.TypeEnum;
        /**
         *
         * @type {string}
         * @memberof Group
         */
        value?: string;
    }

    /**
     * @export
     * @namespace Group
     */
    export namespace Group {
        /**
         * @export
         * @enum {string}
         */
        export enum TypeEnum {
            DIRECT = <any>"DIRECT",
            INDIRECT = <any>"INDIRECT",
        }
    }

    /**
     *
     * @export
     * @interface NameRequest
     */
    export interface NameRequest {
        /**
         *
         * @type {string}
         * @memberof NameRequest
         */
        familyName: string;
        /**
         *
         * @type {string}
         * @memberof NameRequest
         */
        givenName: string;
    }

    /**
     *
     * @export
     * @interface NameResponse
     */
    export interface NameResponse {
        /**
         *
         * @type {string}
         * @memberof NameResponse
         */
        familyName?: string;
        /**
         *
         * @type {string}
         * @memberof NameResponse
         */
        givenName?: string;
    }

    /**
     *
     * @export
     * @interface OAuthClient
     */
    export interface OAuthClient {
        /**
         * Identifier of the client, unique within the identity zone
         * @type {string}
         * @memberof OAuthClient
         */
        clientId?: string;
        /**
         * List of grant types that can be used to obtain a token with this client. Can include authorization_code, password, implicit, and/or client_credentials.
         * @type {Array<string>}
         * @memberof OAuthClient
         */
        authorizedGrantTypes?: Array<string>;
        /**
         *
         * @type {Array<string>}
         * @memberof OAuthClient
         */
        redirectUri?: Array<string>;
        /**
         * A human readable name for the client
         * @type {string}
         * @memberof OAuthClient
         */
        name?: string;
        /**
         * Scopes which the client is able to grant when creating a client. Defaults to \"uaa.none\". E.g. with client_credentials as authorized_grant_types, the client will get the scopes listed here.
         * @type {Array<string>}
         * @memberof OAuthClient
         */
        authorities?: Array<string>;
        /**
         * Scopes allowed for the client. Defaults to \"uaa.none\". E.g. with *password* as authorized_grant_types the user can get the intersection of his scopes and the scopes listed here.
         * @type {Array<string>}
         * @memberof OAuthClient
         */
        scopes?: Array<string>;
        /**
         * Epoch (milliseconds) of the moment the client information was last altered. Not affected by secret changes.
         * @type {number}
         * @memberof OAuthClient
         */
        lastModified?: number;
        /**
         *
         * @type {ClientSecretCreationTimes}
         * @memberof OAuthClient
         */
        secretCreationTimes?: ClientSecretCreationTimes;
    }

    /**
     *
     * @export
     * @interface ScimGroup
     */
    export interface ScimGroup {
        /**
         * The globally unique group ID
         * @type {string}
         * @memberof ScimGroup
         */
        id?: string;
        /**
         * Human readable description of the group, displayed e.g. when approving scopes
         * @type {string}
         * @memberof ScimGroup
         */
        description?: string;
        /**
         * The identifier specified upon creation of the group, unique within the identity zone
         * @type {string}
         * @memberof ScimGroup
         */
        displayName?: string;
        /**
         *
         * @type {Array<ScimGroupMember>}
         * @memberof ScimGroup
         */
        members?: Array<ScimGroupMember>;
        /**
         *
         * @type {ScimMeta}
         * @memberof ScimGroup
         */
        meta?: ScimMeta;
    }

    /**
     *
     * @export
     * @interface ScimGroupMember
     */
    export interface ScimGroupMember {
        /**
         * Either \"USER\" or \"GROUP\"
         * @type {string}
         * @memberof ScimGroupMember
         */
        type: ScimGroupMember.TypeEnum;
        /**
         * Globally unique identifier of the member, either a user ID or another group ID
         * @type {string}
         * @memberof ScimGroupMember
         */
        value: string;
    }

    /**
     * @export
     * @namespace ScimGroupMember
     */
    export namespace ScimGroupMember {
        /**
         * @export
         * @enum {string}
         */
        export enum TypeEnum {
            USER = <any>"USER",
            GROUP = <any>"GROUP",
        }
    }

    /**
     *
     * @export
     * @interface ScimGroupMemberList
     */
    export interface ScimGroupMemberList extends Array<ScimGroupMember> {}

    /**
     *
     * @export
     * @interface ScimGroupPost
     */
    export interface ScimGroupPost {
        /**
         * Human readable description of the group, displayed e.g. when approving scopes
         * @type {string}
         * @memberof ScimGroupPost
         */
        description?: string;
        /**
         * The identifier specified upon creation of the group, unique within the identity zone
         * @type {string}
         * @memberof ScimGroupPost
         */
        displayName: string;
        /**
         * If given members array is empty, all members will be deleted.
         * @type {Array<ScimGroupMember>}
         * @memberof ScimGroupPost
         */
        members?: Array<ScimGroupMember>;
    }

    /**
     *
     * @export
     * @interface ScimGroupSearchResults
     */
    export interface ScimGroupSearchResults {
        /**
         *
         * @type {number}
         * @memberof ScimGroupSearchResults
         */
        itemsPerPage?: number;
        /**
         *
         * @type {Array<ScimGroup>}
         * @memberof ScimGroupSearchResults
         */
        resources?: Array<ScimGroup>;
        /**
         *
         * @type {Array<string>}
         * @memberof ScimGroupSearchResults
         */
        schemas?: Array<string>;
        /**
         *
         * @type {number}
         * @memberof ScimGroupSearchResults
         */
        startIndex?: number;
        /**
         *
         * @type {number}
         * @memberof ScimGroupSearchResults
         */
        totalResults?: number;
    }

    /**
     *
     * @export
     * @interface ScimMeta
     */
    export interface ScimMeta {
        /**
         *
         * @type {Date}
         * @memberof ScimMeta
         */
        created?: Date;
        /**
         *
         * @type {Date}
         * @memberof ScimMeta
         */
        lastModified?: Date;
        /**
         *
         * @type {number}
         * @memberof ScimMeta
         */
        version?: number;
    }

    /**
     *
     * @export
     * @interface ScimUserPost
     */
    export interface ScimUserPost {
        /**
         * False means a soft delete.
         * @type {boolean}
         * @memberof ScimUserPost
         */
        active?: boolean;
        /**
         *
         * @type {NameRequest}
         * @memberof ScimUserPost
         */
        name?: NameRequest;
        /**
         *
         * @type {UserName}
         * @memberof ScimUserPost
         */
        userName: UserName;
        /**
         *
         * @type {Array<SubtenantId>}
         * @memberof ScimUserPost
         */
        subtenants?: Array<SubtenantId>;
    }

    /**
     *
     * @export
     * @interface ScimUserPostResponse
     */
    export interface ScimUserPostResponse {
        /**
         *
         * @type {Array<string>}
         * @memberof ScimUserPostResponse
         */
        schemas?: Array<string>;
        /**
         *
         * @type {string}
         * @memberof ScimUserPostResponse
         */
        id?: string;
        /**
         * The e-mail address of the user.
         * @type {string}
         * @memberof ScimUserPostResponse
         */
        userName?: string;
        /**
         *
         * @type {NameResponse}
         * @memberof ScimUserPostResponse
         */
        name?: NameResponse;
        /**
         *
         * @type {Array<Group>}
         * @memberof ScimUserPostResponse
         */
        groups?: Array<Group>;
        /**
         *
         * @type {Array<Email>}
         * @memberof ScimUserPostResponse
         */
        emails?: Array<Email>;
        /**
         *
         * @type {boolean}
         * @memberof ScimUserPostResponse
         */
        active?: boolean;
        /**
         *
         * @type {ScimMeta}
         * @memberof ScimUserPostResponse
         */
        meta?: ScimMeta;
        /**
         *
         * @type {Array<SubtenantId>}
         * @memberof ScimUserPostResponse
         */
        subtenants?: Array<SubtenantId>;
    }

    /**
     * Name object can be null. Example: \"name\": {}. Name attributes are fetched from WebKey during authentication.
     * @export
     * @interface ScimUserPut
     */
    export interface ScimUserPut {
        /**
         * False means a soft delete.
         * @type {boolean}
         * @memberof ScimUserPut
         */
        active?: boolean;
        /**
         *
         * @type {NameRequest}
         * @memberof ScimUserPut
         */
        name: NameRequest;
        /**
         *
         * @type {UserName}
         * @memberof ScimUserPut
         */
        userName: UserName;
        /**
         *
         * @type {Array<Email>}
         * @memberof ScimUserPut
         */
        emails: Array<Email>;
        /**
         *
         * @type {Array<SubtenantId>}
         * @memberof ScimUserPut
         */
        subtenants?: Array<SubtenantId>;
    }

    /**
     *
     * @export
     * @interface ScimUserResponse
     */
    export interface ScimUserResponse {
        /**
         *
         * @type {Array<string>}
         * @memberof ScimUserResponse
         */
        schemas?: Array<string>;
        /**
         *
         * @type {string}
         * @memberof ScimUserResponse
         */
        id?: string;
        /**
         * The e-mail address of the user.
         * @type {string}
         * @memberof ScimUserResponse
         */
        userName?: string;
        /**
         *
         * @type {NameResponse}
         * @memberof ScimUserResponse
         */
        name?: NameResponse;
        /**
         *
         * @type {Array<Group>}
         * @memberof ScimUserResponse
         */
        groups?: Array<Group>;
        /**
         *
         * @type {Array<Email>}
         * @memberof ScimUserResponse
         */
        emails?: Array<Email>;
        /**
         *
         * @type {boolean}
         * @memberof ScimUserResponse
         */
        active?: boolean;
        /**
         *
         * @type {ScimMeta}
         * @memberof ScimUserResponse
         */
        meta?: ScimMeta;
        /**
         *
         * @type {Array<SubtenantId>}
         * @memberof ScimUserResponse
         */
        subtenants?: Array<SubtenantId>;
    }

    /**
     *
     * @export
     * @interface ScimUserResponseSearchResults
     */
    export interface ScimUserResponseSearchResults {
        /**
         *
         * @type {number}
         * @memberof ScimUserResponseSearchResults
         */
        itemsPerPage?: number;
        /**
         *
         * @type {Array<ScimUserResponse>}
         * @memberof ScimUserResponseSearchResults
         */
        resources?: Array<ScimUserResponse>;
        /**
         *
         * @type {Array<string>}
         * @memberof ScimUserResponseSearchResults
         */
        schemas?: Array<string>;
        /**
         *
         * @type {number}
         * @memberof ScimUserResponseSearchResults
         */
        startIndex?: number;
        /**
         *
         * @type {number}
         * @memberof ScimUserResponseSearchResults
         */
        totalResults?: number;
    }

    /**
     *
     * @export
     * @interface SubtenantId
     */
    export interface SubtenantId {
        /**
         * The ID / name of the subtenant.
         * @type {string}
         * @memberof SubtenantId
         */
        id: string;
    }

    /**
     * The e-mail address of the user.
     * @export
     * @interface UserName
     */
    export interface UserName {}
}
