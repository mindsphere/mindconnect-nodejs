export namespace AssetManagementSharingModels {

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
     * @enum {string}
     */
    export enum AccessLevel {
        READ = <any>'READ'
    }

    /**
     * 
     * @export
     * @enum {string}
     */
    export enum CollaborationDesiredStatus {
        CANCELLED = <any>'CANCELLED',
        ACCEPTED = <any>'ACCEPTED',
        DECLINED = <any>'DECLINED',
        TERMINATED = <any>'TERMINATED'
    }

    /**
     * Schema for requests that aim at modifying the status of an existing collaboration by specifying the target status.
     * @export
     * @interface CollaborationDesiredStatusRequest
     */
    export interface CollaborationDesiredStatusRequest {
        /**
         * 
         * @type {CollaborationDesiredStatus}
         * @memberof CollaborationDesiredStatusRequest
         */
        status: CollaborationDesiredStatus;
    }

    /**
     * 
     * @export
     * @interface CollaborationRequest
     */
    export interface CollaborationRequest {
        /**
         * The name of the tenant to which the collaboration is going to be offered.
         * @type {string}
         * @memberof CollaborationRequest
         */
        receiverTenantName: string;
    }

    /**
     * 
     * @export
     * @interface CollaborationResource
     */
    export interface CollaborationResource {
        /**
         * 
         * @type {string}
         * @memberof CollaborationResource
         */
        id?: string;
        /**
         * 
         * @type {SharerTenant}
         * @memberof CollaborationResource
         */
        initiatorTenant?: SharerTenant;
        /**
         * 
         * @type {ReceiverTenant}
         * @memberof CollaborationResource
         */
        receiverTenant?: ReceiverTenant;
        /**
         * 
         * @type {CollaborationStatus}
         * @memberof CollaborationResource
         */
        status?: CollaborationStatus;
        /**
         * 
         * @type {ETag}
         * @memberof CollaborationResource
         */
        etag?: ETag;
    }

    /**
     * 
     * @export
     * @interface CollaborationStatus
     */
    export interface CollaborationStatus {
    }

    /**
     * An identifier for a specific version of a resource.
     * @export
     * @interface ETag
     */
    export interface ETag {
    }

    /**
     * 
     * @export
     * @interface Entity
     */
    export interface Entity {
        /**
         * 
         * @type {EntityId}
         * @memberof Entity
         */
        id?: EntityId;
        /**
         * 
         * @type {EntityStatus}
         * @memberof Entity
         */
        entityStatus?: EntityStatus;
        /**
         * Errors that have prevented this entity from being successfully shared.
         * @type {Array<MdspApiError>}
         * @memberof Entity
         */
        errors?: Array<MdspApiError>;
    }

    /**
     * 
     * @export
     * @interface EntityId
     */
    export interface EntityId {
    }

    /**
     * Target status for an entity sharing.
     * @export
     * @interface EntitySharingDesiredStatus
     */
    export interface EntitySharingDesiredStatus {
        /**
         * 
         * @type {string}
         * @memberof EntitySharingDesiredStatus
         */
        status: EntitySharingDesiredStatus.StatusEnum;
    }

    /**
     * @export
     * @namespace EntitySharingDesiredStatus
     */
    export namespace EntitySharingDesiredStatus {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            ACCEPTED = <any>'ACCEPTED',
            DECLINED = <any>'DECLINED',
            CANCELLED = <any>'CANCELLED',
            BEINGREVOKED = <any>'BEING_REVOKED'
        }
    }

    /**
     * 
     * @export
     * @interface EntitySharingRequest
     */
    export interface EntitySharingRequest {
        /**
         * The ID of the established collaboration that serves as a context for sharing the specified entities.
         * @type {string}
         * @memberof EntitySharingRequest
         */
        collaborationId: string;
        /**
         * An ID identifying the entity to be shared.  This list must contain exactly one element.
         * @type {Array<EntityId>}
         * @memberof EntitySharingRequest
         */
        entityIds: Array<EntityId>;
        /**
         * 
         * @type {AccessLevel}
         * @memberof EntitySharingRequest
         */
        accessLevel: AccessLevel;
    }

    /**
     * 
     * @export
     * @interface EntitySharingResource
     */
    export interface EntitySharingResource {
        /**
         * 
         * @type {string}
         * @memberof EntitySharingResource
         */
        id?: string;
        /**
         * 
         * @type {SharerTenant}
         * @memberof EntitySharingResource
         */
        sharerTenant?: SharerTenant;
        /**
         * 
         * @type {ReceiverTenant}
         * @memberof EntitySharingResource
         */
        receiverTenant?: ReceiverTenant;
        /**
         * 
         * @type {string}
         * @memberof EntitySharingResource
         */
        collaborationId?: string;
        /**
         * 
         * @type {EntitySharingResourceEntityCounts}
         * @memberof EntitySharingResource
         */
        entityCounts?: EntitySharingResourceEntityCounts;
        /**
         * 
         * @type {EntitySharingStatus}
         * @memberof EntitySharingResource
         */
        sharingStatus?: EntitySharingStatus;
        /**
         * 
         * @type {AccessLevel}
         * @memberof EntitySharingResource
         */
        accessLevel?: AccessLevel;
        /**
         * 
         * @type {ETag}
         * @memberof EntitySharingResource
         */
        etag?: ETag;
    }

    /**
     * A group of counters reflecting the status of all entities in this sharing.  These counters add up to the total number of entities within this sharing.
     * @export
     * @interface EntitySharingResourceEntityCounts
     */
    export interface EntitySharingResourceEntityCounts {
        /**
         * The number of entities that are not shared (yet).  For pending sharings this count equals to the total number of entities within the entity sharing.
         * @type {number}
         * @memberof EntitySharingResourceEntityCounts
         */
        sharingPending?: number;
        /**
         * The number of entities that are not shared because the offered sharing has been cancelled or declined.  For such aborted sharings this count equals to the total number of entities within the entity sharing.
         * @type {number}
         * @memberof EntitySharingResourceEntityCounts
         */
        sharingAborted?: number;
        /**
         * The number of entities that are successfully shared.
         * @type {number}
         * @memberof EntitySharingResourceEntityCounts
         */
        sharingSucceeded?: number;
        /**
         * The number of entities that could not be shared or unshared due to experiencing one or more errors while creating or deleting shadow copies.
         * @type {number}
         * @memberof EntitySharingResourceEntityCounts
         */
        sharingFailed?: number;
        /**
         * The number of entities that are being unshared.
         * @type {number}
         * @memberof EntitySharingResourceEntityCounts
         */
        unsharingPending?: number;
        /**
         * The number of entities that are successfully unshared.
         * @type {number}
         * @memberof EntitySharingResourceEntityCounts
         */
        unsharingSucceeded?: number;
    }

    /**
     * 
     * @export
     * @enum {string}
     */
    export enum EntitySharingStatus {
        PENDING = <any>'PENDING',
        ACCEPTED = <any>'ACCEPTED',
        DECLINED = <any>'DECLINED',
        CANCELLED = <any>'CANCELLED',
        SUCCEEDED = <any>'SUCCEEDED',
        PARTIALLYSUCCEEDED = <any>'PARTIALLY_SUCCEEDED',
        FAILED = <any>'FAILED',
        BEINGREVOKED = <any>'BEING_REVOKED',
        REVOKED = <any>'REVOKED',
        FAILEDTOBEREVOKED = <any>'FAILED_TO_BE_REVOKED'
    }

    /**
     * 
     * @export
     * @enum {string}
     */
    export enum EntityStatus {
        SHARINGPENDING = <any>'SHARING_PENDING',
        SHARINGABORTED = <any>'SHARING_ABORTED',
        SHARINGSUCCEEDED = <any>'SHARING_SUCCEEDED',
        SHARINGFAILED = <any>'SHARING_FAILED',
        UNSHARINGPENDING = <any>'UNSHARING_PENDING',
        UNSHARINGSUCCEEDED = <any>'UNSHARING_SUCCEEDED'
    }

    /**
     * A descriptor for errors that are integral parts of resources.
     * @export
     * @interface MdspApiError
     */
    export interface MdspApiError {
        /**
         * Unique error code. Every code is bound to one (parametrized) message.
         * @type {string}
         * @memberof MdspApiError
         */
        code?: string;
        /**
         * Human readable error message in English.
         * @type {string}
         * @memberof MdspApiError
         */
        message?: string;
        /**
         * In case an error message is parametrized, the parameter names and values are returned for, e.g., localization purposes. The parametrized error messages are defined at the operation error response descriptions in this API specification. Parameters are denoted by named placeholders '{​\\<parameter name\\>}​' in the message specifications. At runtime, returned message placeholders are substituted by actual parameter values. 
         * @type {Array<MdspApiErrorMessageParameters>}
         * @memberof MdspApiError
         */
        messageParameters?: Array<MdspApiErrorMessageParameters>;
    }

    /**
     * Message parameter
     * @export
     * @interface MdspApiErrorMessageParameters
     */
    export interface MdspApiErrorMessageParameters {
        /**
         * Name of message parameter as specified in parametrized error message.
         * @type {string}
         * @memberof MdspApiErrorMessageParameters
         */
        name?: string;
        /**
         * Value of message parameter as substituted in returned error message.
         * @type {string}
         * @memberof MdspApiErrorMessageParameters
         */
        value?: string;
    }

    /**
     * A descriptor for error responses.
     * @export
     * @interface MdspError
     */
    export interface MdspError extends MdspApiError {
        /**
         * Logging correlation ID for debugging purposes.
         * @type {string}
         * @memberof MdspError
         */
        logref?: string;
    }

    /**
     * 
     * @export
     * @interface MdspErrors
     */
    export interface MdspErrors {
        /**
         * 
         * @type {Array<MdspError>}
         * @memberof MdspErrors
         */
        errors?: Array<MdspError>;
    }

    /**
     * 
     * @export
     * @interface Page
     */
    export interface Page {
        /**
         * 
         * @type {number}
         * @memberof Page
         */
        size?: number;
        /**
         * 
         * @type {number}
         * @memberof Page
         */
        totalElements?: number;
        /**
         * 
         * @type {number}
         * @memberof Page
         */
        totalPages?: number;
        /**
         * 
         * @type {number}
         * @memberof Page
         */
        number?: number;
    }

    /**
     * 
     * @export
     * @interface PagedCollaborationsResource
     */
    export interface PagedCollaborationsResource {
        /**
         * 
         * @type {Array<CollaborationResource>}
         * @memberof PagedCollaborationsResource
         */
        collaborations?: Array<CollaborationResource>;
        /**
         * 
         * @type {Page}
         * @memberof PagedCollaborationsResource
         */
        page?: Page;
    }

    /**
     * 
     * @export
     * @interface PagedEntities
     */
    export interface PagedEntities {
        /**
         * The non-empty set of entities shared in the scope of an entity sharing.  Must contain exactly one element.
         * @type {Array<Entity>}
         * @memberof PagedEntities
         */
        entities?: Array<Entity>;
        /**
         * 
         * @type {Page}
         * @memberof PagedEntities
         */
        page?: Page;
    }

    /**
     * 
     * @export
     * @interface PagedEntitySharingsResource
     */
    export interface PagedEntitySharingsResource {
        /**
         * 
         * @type {Array<EntitySharingResource>}
         * @memberof PagedEntitySharingsResource
         */
        sharings?: Array<EntitySharingResource>;
        /**
         * 
         * @type {Page}
         * @memberof PagedEntitySharingsResource
         */
        page?: Page;
    }

    /**
     * 
     * @export
     * @interface PagedSharedEntitiesResource
     */
    export interface PagedSharedEntitiesResource {
        /**
         * 
         * @type {Array<SharedEntityResource>}
         * @memberof PagedSharedEntitiesResource
         */
        sharedEntities?: Array<SharedEntityResource>;
        /**
         * 
         * @type {Page}
         * @memberof PagedSharedEntitiesResource
         */
        page?: Page;
    }

    /**
     * 
     * @export
     * @interface PagedSharedEntitySharing
     */
    export interface PagedSharedEntitySharing {
        /**
         * Sharings referencing this entity.  The number of such sharings can be at most 4.
         * @type {Array<SharedEntitySharing>}
         * @memberof PagedSharedEntitySharing
         */
        sharings?: Array<SharedEntitySharing>;
        /**
         * 
         * @type {Page}
         * @memberof PagedSharedEntitySharing
         */
        page?: Page;
    }

    /**
     * 
     * @export
     * @interface ReceiverTenant
     */
    export interface ReceiverTenant {
        /**
         * 
         * @type {string}
         * @memberof ReceiverTenant
         */
        name?: string;
    }

    /**
     * 
     * @export
     * @interface SharedEntityResource
     */
    export interface SharedEntityResource {
        /**
         * 
         * @type {EntityId}
         * @memberof SharedEntityResource
         */
        id?: EntityId;
        /**
         * 
         * @type {SharerTenant}
         * @memberof SharedEntityResource
         */
        sharerTenant?: SharerTenant;
        /**
         * The number of entity sharings referencing this entity.  For the Receiver this value is always 1.
         * @type {number}
         * @memberof SharedEntityResource
         */
        activeSharingCount?: number;
    }

    /**
     * Represents one specific sharing of a single, shared entity.
     * @export
     * @interface SharedEntitySharing
     */
    export interface SharedEntitySharing {
        /**
         * 
         * @type {string}
         * @memberof SharedEntitySharing
         */
        id?: string;
        /**
         * 
         * @type {ReceiverTenant}
         * @memberof SharedEntitySharing
         */
        receiverTenant?: ReceiverTenant;
        /**
         * 
         * @type {string}
         * @memberof SharedEntitySharing
         */
        collaborationId?: string;
        /**
         * 
         * @type {EntitySharingStatus}
         * @memberof SharedEntitySharing
         */
        sharingStatus?: EntitySharingStatus;
        /**
         * 
         * @type {AccessLevel}
         * @memberof SharedEntitySharing
         */
        accessLevel?: AccessLevel;
        /**
         * 
         * @type {EntityStatus}
         * @memberof SharedEntitySharing
         */
        entityStatus?: EntityStatus;
        /**
         * Errors that have prevented the enclosing entity from being successfully shared.
         * @type {Array<MdspApiError>}
         * @memberof SharedEntitySharing
         */
        errors?: Array<MdspApiError>;
        /**
         * 
         * @type {ETag}
         * @memberof SharedEntitySharing
         */
        eTag?: ETag;
    }

    /**
     * 
     * @export
     * @interface SharerTenant
     */
    export interface SharerTenant {
        /**
         * 
         * @type {string}
         * @memberof SharerTenant
         */
        name?: string;
    }
}