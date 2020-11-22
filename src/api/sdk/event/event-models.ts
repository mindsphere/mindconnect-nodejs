export namespace EventManagementModels {
    export class RequiredError extends Error {
        name: "RequiredError" = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *
     * @export
     * @interface BaseEvent
     */
    export interface BaseEvent {
        /**
         * Unique identifier of the event type (filterable, not updatable)
         * @type {string}
         * @memberof BaseEvent
         */
        typeId?: string;
        /**
         * Correlation ID of the event. It can be used to group related events (filterable, not updatable)
         * @type {string}
         * @memberof BaseEvent
         */
        correlationId?: string;
        /**
         * Timestamp attached to the event in UTC format (filterable, not updatable)
         * @type {string}
         * @memberof BaseEvent
         */
        timestamp: string;
        /**
         * Entity attached to the event (filterable, not updatable)
         * @type {string}
         * @memberof BaseEvent
         */
        entityId: string;
    }

    /**
     *
     * @export
     * @interface BaseEventResponse
     */
    export interface BaseEventResponse {
        /**
         * Unique identifier of the event
         * @type {string}
         * @memberof BaseEventResponse
         */
        id: string;
        /**
         * Unique identifier of the event type (filterable, not updatable)
         * @type {string}
         * @memberof BaseEventResponse
         */
        typeId: string;
        /**
         * Correlation ID of the event. It can be used to group related events (filterable, not updatable)
         * @type {string}
         * @memberof BaseEventResponse
         */
        correlationId: string;
        /**
         * Timestamp attached to the event in UTC format (filterable, not updatable)
         * @type {string}
         * @memberof BaseEventResponse
         */
        timestamp: string;
        /**
         * Entity attached to the event (filterable, not updatable)
         * @type {string}
         * @memberof BaseEventResponse
         */
        entityId: string;
        /**
         * Incremental counter for optimistic concurrency control
         * @type {number}
         * @memberof BaseEventResponse
         */
        etag: number;
        /**
         *
         * @type {SharingResource}
         * @memberof BaseEventResponse
         */
        sharing?: SharingResource;
        /**
         *
         * @type {BaseEventResponseLinks}
         * @memberof BaseEventResponse
         */
        _links: BaseEventResponseLinks;
    }

    /**
     *
     * @export
     * @interface BaseEventResponseLinks
     */
    export interface BaseEventResponseLinks {
        /**
         *
         * @type {RelSelf}
         * @memberof BaseEventResponseLinks
         */
        self?: RelSelf;
    }

    /**
     * Details about an event within a bulk create job
     * @export
     * @interface CreateEventDetailedDescription
     */
    export interface CreateEventDetailedDescription {
        /**
         * created event resource or the input event in case of failure
         * @type {string}
         * @memberof CreateEventDetailedDescription
         */
        event?: string;
        /**
         * status code of event creation
         * @type {string}
         * @memberof CreateEventDetailedDescription
         */
        resultCode?: string;
        /**
         * details about failing event creation
         * @type {string}
         * @memberof CreateEventDetailedDescription
         */
        errorMessage?: string;
    }

    /**
     *
     * @export
     * @interface CreateEventsJob
     */
    export interface CreateEventsJob {
        /**
         * - List of events to create
         * @type {Array<CustomEvent>}
         * @memberof CreateEventsJob
         */
        events: Array<CustomEvent>;
    }

    /**
     * Details about the job in case of FINISHED and FINISHED_WITH_ERROR
     * @export
     * @interface CreateJobDetails
     */
    export interface CreateJobDetails {
        /**
         *
         * @type {Array<CreateEventDetailedDescription>}
         * @memberof CreateJobDetails
         */
        resultDescription?: Array<CreateEventDetailedDescription>;
    }

    /**
     *
     * @export
     * @interface CreateJobResource
     */
    export interface CreateJobResource extends JobResource {
        /**
         *
         * @type {CreateJobDetails}
         * @memberof CreateJobResource
         */
        details?: CreateJobDetails;
    }

    /**
     * @export
     * @namespace CreateJobResource
     */
    export namespace CreateJobResource {}

    /**
     *
     * @export
     * @interface CustomEvent
     */
    export interface CustomEvent extends BaseEvent {}

    /**
     *
     * @export
     * @interface CustomEventCreated
     */
    export interface CustomEventCreated extends BaseEventResponse {}

    /**
     *
     * @export
     * @interface CustomEventResponse
     */
    export interface CustomEventResponse extends BaseEventResponse {}

    /**
     *
     * @export
     * @interface CustomEventUpdated
     */
    export interface CustomEventUpdated extends BaseEventResponse {}

    /**
     *
     * @export
     * @interface DeleteEventsJob
     */
    export interface DeleteEventsJob {
        /**
         * - The `timestamp` property can be filtered by `before`, `after` and `between` functions. - At least `typeId` property must be provided in filter expression. - Multiple `typeId` expressions (by using and, or logical operators) in filter parameter is not allowed. Only equality function is supported on it. - Negation of `typeId` in filter expression is not allowed.
         * @type {any}
         * @memberof DeleteEventsJob
         */
        filter: any;
    }

    /**
     * Details about the job in case of FINISHED and FINISHED_WITH_ERROR
     * @export
     * @interface DeleteJobDetails
     */
    export interface DeleteJobDetails {
        /**
         * status code describes the job's execution result
         * @type {string}
         * @memberof DeleteJobDetails
         */
        resultCode?: string;
        /**
         * information about - how many events deleted or - what error happened
         * @type {string}
         * @memberof DeleteJobDetails
         */
        resultDescription?: string;
    }

    /**
     *
     * @export
     * @interface DeleteJobResource
     */
    export interface DeleteJobResource extends JobResource {
        /**
         *
         * @type {DeleteJobDetails}
         * @memberof DeleteJobResource
         */
        details?: DeleteJobDetails;
    }

    /**
     * @export
     * @namespace DeleteJobResource
     */
    export namespace DeleteJobResource {}

    /**
     *
     * @export
     * @interface Errors
     */
    export interface Errors extends Array<ErrorsInner> {}

    /**
     *
     * @export
     * @interface ErrorsInner
     */
    export interface ErrorsInner {
        /**
         *
         * @type {string}
         * @memberof ErrorsInner
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof ErrorsInner
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface EventType
     */
    export interface EventType {
        /**
         * ID of the created event type
         * @type {string}
         * @memberof EventType
         */
        id?: string;
        /**
         * Name of the event type
         * @type {string}
         * @memberof EventType
         */
        name: string;
        /**
         * Parent event type ID
         * @type {string}
         * @memberof EventType
         */
        parentId?: string;
        /**
         * Time to live in days
         * @type {number}
         * @memberof EventType
         */
        ttl?: number;
        /**
         * Scope of the event type
         * @type {string}
         * @memberof EventType
         */
        scope?: EventType.ScopeEnum;
        /**
         *
         * @type {Array<Field>}
         * @memberof EventType
         */
        fields: Array<Field>;
    }

    /**
     * @export
     * @namespace EventType
     */
    export namespace EventType {
        /**
         * @export
         * @enum {string}
         */
        export enum ScopeEnum {
            LOCAL = "LOCAL",
            GLOBAL = "GLOBAL",
        }
    }

    /**
     *
     * @export
     * @interface EventTypePatch
     */
    export interface EventTypePatch {
        /**
         * Type of the operation to be made
         * @type {string}
         * @memberof EventTypePatch
         */
        op: EventTypePatch.OpEnum;
        /**
         * Identifying a specific attribute/field whereon the operation should be made
         * @type {string}
         * @memberof EventTypePatch
         */
        path: string;
        /**
         * New value for the given attribute or the field, that should be added, depending on the *op* value
         * @type {string}
         * @memberof EventTypePatch
         */
        value: string;
    }

    /**
     * @export
     * @namespace EventTypePatch
     */
    export namespace EventTypePatch {
        /**
         * @export
         * @enum {string}
         */
        export enum OpEnum {
            Add = "add",
            Replace = "replace",
        }
    }

    /**
     *
     * @export
     * @interface EventTypeResponse
     */
    export interface EventTypeResponse {
        /**
         * ID of the created event type
         * @type {string}
         * @memberof EventTypeResponse
         */
        id: string;
        /**
         * Name of the event type
         * @type {string}
         * @memberof EventTypeResponse
         */
        name: string;
        /**
         * Parent event type ID
         * @type {string}
         * @memberof EventTypeResponse
         */
        parentId: string;
        /**
         * Time to live in days
         * @type {number}
         * @memberof EventTypeResponse
         */
        ttl: number;
        /**
         *
         * @type {number}
         * @memberof EventTypeResponse
         */
        etag: number;
        /**
         * The owner who created the event type
         * @type {string}
         * @memberof EventTypeResponse
         */
        owner: string;
        /**
         * Scope of the event type
         * @type {string}
         * @memberof EventTypeResponse
         */
        scope: EventTypeResponse.ScopeEnum;
        /**
         *
         * @type {Array<Field>}
         * @memberof EventTypeResponse
         */
        fields: Array<Field>;
        /**
         *
         * @type {SharingResource}
         * @memberof EventTypeResponse
         */
        sharing?: SharingResource;
        /**
         *
         * @type {EventTypeResponseLinks}
         * @memberof EventTypeResponse
         */
        _links: EventTypeResponseLinks;
    }

    /**
     * @export
     * @namespace EventTypeResponse
     */
    export namespace EventTypeResponse {
        /**
         * @export
         * @enum {string}
         */
        export enum ScopeEnum {
            LOCAL = "LOCAL",
            GLOBAL = "GLOBAL",
        }
    }

    /**
     *
     * @export
     * @interface EventTypeResponseLinks
     */
    export interface EventTypeResponseLinks {
        /**
         *
         * @type {RelSelf}
         * @memberof EventTypeResponseLinks
         */
        self?: RelSelf;
        /**
         *
         * @type {RelEvents}
         * @memberof EventTypeResponseLinks
         */
        events?: RelEvents;
    }

    /**
     *
     * @export
     * @interface Field
     */
    export interface Field {
        /**
         *
         * @type {string}
         * @memberof Field
         */
        name: string;
        /**
         *
         * @type {boolean}
         * @memberof Field
         */
        filterable?: boolean;
        /**
         *
         * @type {boolean}
         * @memberof Field
         */
        required?: boolean;
        /**
         *
         * @type {boolean}
         * @memberof Field
         */
        updatable?: boolean;
        /**
         * Note that the LINK type is not a plain HREF. The value for the LINK type should be given between quotation marks.
         * @type {string}
         * @memberof Field
         */
        type: Field.TypeEnum;
        /**
         * This field is applicable only if the field's type is ENUM, otherwise it should be skipped. The values must be strings.
         * @type {Array<string>}
         * @memberof Field
         */
        values?: Array<string>;
    }

    /**
     * @export
     * @namespace Field
     */
    export namespace Field {
        /**
         * @export
         * @enum {string}
         */
        export enum TypeEnum {
            STRING = "STRING",
            INTEGER = "INTEGER",
            DOUBLE = "DOUBLE",
            BOOLEAN = "BOOLEAN",
            LINK = "LINK",
            TIMESTAMP = "TIMESTAMP",
            UUID = "UUID",
            ENUM = "ENUM",
        }
    }

    /**
     *
     * @export
     * @interface InfoResponse
     */
    export interface InfoResponse {
        /**
         *
         * @type {InfoResponseSelf}
         * @memberof InfoResponse
         */
        self?: InfoResponseSelf;
        /**
         *
         * @type {InfoResponseEvents}
         * @memberof InfoResponse
         */
        events?: InfoResponseEvents;
        /**
         *
         * @type {InfoResponseEventTypes}
         * @memberof InfoResponse
         */
        eventTypes?: InfoResponseEventTypes;
        /**
         *
         * @type {InfoResponseDeleteEventsJobs}
         * @memberof InfoResponse
         */
        deleteEventsJobs?: InfoResponseDeleteEventsJobs;
        /**
         *
         * @type {InfoResponseCreateEventsJobs}
         * @memberof InfoResponse
         */
        createEventsJobs?: InfoResponseCreateEventsJobs;
    }

    /**
     *
     * @export
     * @interface InfoResponseCreateEventsJobs
     */
    export interface InfoResponseCreateEventsJobs {
        /**
         *
         * @type {string}
         * @memberof InfoResponseCreateEventsJobs
         */
        href?: string;
        /**
         *
         * @type {boolean}
         * @memberof InfoResponseCreateEventsJobs
         */
        templated?: boolean;
    }

    /**
     *
     * @export
     * @interface InfoResponseDeleteEventsJobs
     */
    export interface InfoResponseDeleteEventsJobs {
        /**
         *
         * @type {string}
         * @memberof InfoResponseDeleteEventsJobs
         */
        href?: string;
        /**
         *
         * @type {boolean}
         * @memberof InfoResponseDeleteEventsJobs
         */
        templated?: boolean;
    }

    /**
     *
     * @export
     * @interface InfoResponseEventTypes
     */
    export interface InfoResponseEventTypes {
        /**
         *
         * @type {string}
         * @memberof InfoResponseEventTypes
         */
        href?: string;
        /**
         *
         * @type {boolean}
         * @memberof InfoResponseEventTypes
         */
        templated?: boolean;
    }

    /**
     *
     * @export
     * @interface InfoResponseEvents
     */
    export interface InfoResponseEvents {
        /**
         *
         * @type {string}
         * @memberof InfoResponseEvents
         */
        href?: string;
        /**
         *
         * @type {boolean}
         * @memberof InfoResponseEvents
         */
        templated?: boolean;
    }

    /**
     *
     * @export
     * @interface InfoResponseSelf
     */
    export interface InfoResponseSelf {
        /**
         *
         * @type {string}
         * @memberof InfoResponseSelf
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface JobResource
     */
    export interface JobResource {
        /**
         * Unique identifier of the job
         * @type {string}
         * @memberof JobResource
         */
        id?: string;
        /**
         * State of the job
         * @type {string}
         * @memberof JobResource
         */
        state?: JobResource.StateEnum;
    }

    /**
     * @export
     * @namespace JobResource
     */
    export namespace JobResource {
        /**
         * @export
         * @enum {string}
         */
        export enum StateEnum {
            ACCEPTED = "ACCEPTED",
            INPROGRESS = "IN_PROGRESS",
            FINISHED = "FINISHED",
            FINISHEDWITHERROR = "FINISHED_WITH_ERROR",
        }
    }

    /**
     *
     * @export
     * @interface MindsphereStandardEvent
     */
    export interface MindsphereStandardEvent extends BaseEvent {
        /**
         *
         * @type {number}
         * @memberof MindsphereStandardEvent
         */
        severity?: number;
        /**
         *
         * @type {string}
         * @memberof MindsphereStandardEvent
         */
        description?: string;
        /**
         *
         * @type {string}
         * @memberof MindsphereStandardEvent
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof MindsphereStandardEvent
         */
        source?: string;
        /**
         *
         * @type {boolean}
         * @memberof MindsphereStandardEvent
         */
        acknowledged?: boolean;
    }

    /**
     *
     * @export
     * @interface MindsphereStandardEventResponse
     */
    export interface MindsphereStandardEventResponse extends BaseEventResponse {
        /**
         *
         * @type {number}
         * @memberof MindsphereStandardEventResponse
         */
        severity?: number;
        /**
         *
         * @type {string}
         * @memberof MindsphereStandardEventResponse
         */
        description?: string;
        /**
         *
         * @type {string}
         * @memberof MindsphereStandardEventResponse
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof MindsphereStandardEventResponse
         */
        source?: string;
        /**
         *
         * @type {boolean}
         * @memberof MindsphereStandardEventResponse
         */
        acknowledged?: boolean;
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
     * @interface PagingLinks
     */
    export interface PagingLinks {
        /**
         *
         * @type {RelFirst}
         * @memberof PagingLinks
         */
        first?: RelFirst;
        /**
         *
         * @type {SelfLink}
         * @memberof PagingLinks
         */
        self?: SelfLink;
        /**
         *
         * @type {RelNext}
         * @memberof PagingLinks
         */
        next?: RelNext;
        /**
         *
         * @type {RelPrev}
         * @memberof PagingLinks
         */
        prev?: RelPrev;
        /**
         *
         * @type {RelLast}
         * @memberof PagingLinks
         */
        last?: RelLast;
    }

    /**
     *
     * @export
     * @interface QueryEventTypesResponse
     */
    export interface QueryEventTypesResponse {
        /**
         *
         * @type {QueryEventTypesResponseEmbedded}
         * @memberof QueryEventTypesResponse
         */
        _embedded?: QueryEventTypesResponseEmbedded;
        /**
         *
         * @type {PagingLinks}
         * @memberof QueryEventTypesResponse
         */
        _links?: PagingLinks;
        /**
         *
         * @type {Page}
         * @memberof QueryEventTypesResponse
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface QueryEventTypesResponseEmbedded
     */
    export interface QueryEventTypesResponseEmbedded {
        /**
         *
         * @type {Array<EventTypeResponse>}
         * @memberof QueryEventTypesResponseEmbedded
         */
        eventTypes?: Array<EventTypeResponse>;
    }

    /**
     *
     * @export
     * @interface QueryEventsResponse
     */
    export interface QueryEventsResponse {
        /**
         *
         * @type {QueryEventsResponseEmbedded}
         * @memberof QueryEventsResponse
         */
        _embedded?: QueryEventsResponseEmbedded;
        /**
         *
         * @type {PagingLinks}
         * @memberof QueryEventsResponse
         */
        _links?: PagingLinks;
        /**
         *
         * @type {Page}
         * @memberof QueryEventsResponse
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface QueryEventsResponseEmbedded
     */
    export interface QueryEventsResponseEmbedded {
        /**
         *
         * @type {Array<MindsphereStandardEventResponse>}
         * @memberof QueryEventsResponseEmbedded
         */
        events?: Array<MindsphereStandardEventResponse>;
    }

    /**
     *
     * @export
     * @interface RelEvents
     */
    export interface RelEvents {
        /**
         *
         * @type {string}
         * @memberof RelEvents
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface RelFirst
     */
    export interface RelFirst {
        /**
         *
         * @type {string}
         * @memberof RelFirst
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface RelLast
     */
    export interface RelLast {
        /**
         *
         * @type {string}
         * @memberof RelLast
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface RelNext
     */
    export interface RelNext {
        /**
         *
         * @type {string}
         * @memberof RelNext
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface RelPrev
     */
    export interface RelPrev {
        /**
         *
         * @type {string}
         * @memberof RelPrev
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface RelSelf
     */
    export interface RelSelf {
        /**
         *
         * @type {string}
         * @memberof RelSelf
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface SelfLink
     */
    export interface SelfLink {
        /**
         *
         * @type {string}
         * @memberof SelfLink
         */
        href?: string;
        /**
         *
         * @type {boolean}
         * @memberof SelfLink
         */
        templated?: boolean;
    }

    /**
     * Contains sharing information. This sharing information will be available only if 'includeShared' query parameter is 'true' in request.
     * @export
     * @interface SharingResource
     */
    export interface SharingResource {
        /**
         * List of sharing modes applicable for this resource. The currently supported modes are SHARER, RECEIVER and DEFAULT.  SHARER means this resource is shared by my tenant. RECEIVER means this resource is shared with my tenant. DEFAULT means this resource is provide by default. An empty array means this resource is not shared. New modes might be introduced later and clients must expect additional items to be contained in the array.
         * @type {Array<string>}
         * @memberof SharingResource
         */
        modes?: Array<SharingResource.ModesEnum>;
    }

    /**
     * @export
     * @namespace SharingResource
     */
    export namespace SharingResource {
        /**
         * @export
         * @enum {string}
         */
        export enum ModesEnum {
            SHARER = "SHARER",
            RECEIVER = "RECEIVER",
            DEFAULT = "DEFAULT",
        }
    }

    // ! fix: compatibility with old naming

    export interface Billboard extends InfoResponse {}
    export interface EmbeddedEventsTypesList extends QueryEventTypesResponse {}
    export interface EmbeddedEventsList extends QueryEventsResponse {}
}
