export namespace EventManagementModels {
    /**
     *
     * @export
     * @interface BaseEvent
     */
    export interface BaseEvent {
        /**
         * Unique identifier of the event
         * @type {string}
         * @memberof BaseEvent
         */
        id?: string;
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
        /**
         * Incremental counter for optimistic concurrency control
         * @type {number}
         * @memberof BaseEvent
         */
        etag?: number;
        /**
         *
         * @type {BaseEventLinks}
         * @memberof BaseEvent
         */
        _links?: BaseEventLinks;
    }

    /**
     *
     * @export
     * @interface BaseEventLinks
     */
    export interface BaseEventLinks {
        /**
         *
         * @type {RelSelf}
         * @memberof BaseEventLinks
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
    export interface CustomEventCreated extends BaseEvent {}

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
         *
         * @type {number}
         * @memberof EventType
         */
        etag?: number;
        /**
         * The owner who created the event type
         * @type {string}
         * @memberof EventType
         */
        owner?: string;
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
        fields?: Array<Field>;
        /**
         *
         * @type {EventTypeLinks}
         * @memberof EventType
         */
        _links?: EventTypeLinks;
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
            LOCAL = <any>"LOCAL",
            GLOBAL = <any>"GLOBAL"
        }
    }

    /**
     *
     * @export
     * @interface EventTypeLinks
     */
    export interface EventTypeLinks {
        /**
         *
         * @type {RelSelf}
         * @memberof EventTypeLinks
         */
        self?: RelSelf;
        /**
         *
         * @type {RelEvents}
         * @memberof EventTypeLinks
         */
        events?: RelEvents;
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
            Add = <any>"add",
            Replace = <any>"replace"
        }
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
            STRING = <any>"STRING",
            INTEGER = <any>"INTEGER",
            DOUBLE = <any>"DOUBLE",
            BOOLEAN = <any>"BOOLEAN",
            LINK = <any>"LINK",
            TIMESTAMP = <any>"TIMESTAMP",
            UUID = <any>"UUID",
            ENUM = <any>"ENUM"
        }
    }

    /**
     *
     * @export
     * @interface InlineResponse200
     */
    export interface InlineResponse200 {
        /**
         *
         * @type {InlineResponse200Self}
         * @memberof InlineResponse200
         */
        self?: InlineResponse200Self;
        /**
         *
         * @type {InlineResponse200Events}
         * @memberof InlineResponse200
         */
        events?: InlineResponse200Events;
        /**
         *
         * @type {InlineResponse200EventTypes}
         * @memberof InlineResponse200
         */
        eventTypes?: InlineResponse200EventTypes;
        /**
         *
         * @type {InlineResponse200DeleteEventsJobs}
         * @memberof InlineResponse200
         */
        deleteEventsJobs?: InlineResponse200DeleteEventsJobs;
        /**
         *
         * @type {InlineResponse200CreateEventsJobs}
         * @memberof InlineResponse200
         */
        createEventsJobs?: InlineResponse200CreateEventsJobs;
    }

    // ! fix for reasonable name

    export interface Billboard extends InlineResponse200 {}

    /**
     *
     * @export
     * @interface InlineResponse2001
     */
    export interface InlineResponse2001 {
        /**
         *
         * @type {InlineResponse2001Embedded}
         * @memberof InlineResponse2001
         */
        _embedded?: InlineResponse2001Embedded;
        /**
         *
         * @type {PagingLinks}
         * @memberof InlineResponse2001
         */
        _links?: PagingLinks;
        /**
         *
         * @type {Page}
         * @memberof InlineResponse2001
         */
        page?: Page;
    }

    // ! fix: manual fix for the Event Management API to get a reasonable name
    export interface EmbeddedEventsList extends InlineResponse2001 {}

    /**
     *
     * @export
     * @interface InlineResponse2001Embedded
     */
    export interface InlineResponse2001Embedded {
        /**
         *
         * @type {Array<MindsphereStandardEvent>}
         * @memberof InlineResponse2001Embedded
         */
        events?: Array<MindsphereStandardEvent>;
    }

    /**
     *
     * @export
     * @interface InlineResponse2002
     */
    export interface InlineResponse2002 {
        /**
         *
         * @type {InlineResponse2002Embedded}
         * @memberof InlineResponse2002
         */
        _embedded?: InlineResponse2002Embedded;
    }

    /**
     *
     * @export
     * @interface InlineResponse2002Embedded
     */
    export interface InlineResponse2002Embedded {
        /**
         *
         * @type {Array<EventType>}
         * @memberof InlineResponse2002Embedded
         */
        eventTypes?: Array<EventType>;
        /**
         *
         * @type {PagingLinks}
         * @memberof InlineResponse2002Embedded
         */
        _links?: PagingLinks;
        /**
         *
         * @type {Page}
         * @memberof InlineResponse2002Embedded
         */
        page?: Page;
    }

    // ! fix: manual fix to have a reasonable type name
    export interface EmbeddedEventsTypesList extends InlineResponse2002 {}

    /**
     *
     * @export
     * @interface InlineResponse200CreateEventsJobs
     */
    export interface InlineResponse200CreateEventsJobs {
        /**
         *
         * @type {string}
         * @memberof InlineResponse200CreateEventsJobs
         */
        href?: string;
        /**
         *
         * @type {boolean}
         * @memberof InlineResponse200CreateEventsJobs
         */
        templated?: boolean;
    }

    /**
     *
     * @export
     * @interface InlineResponse200DeleteEventsJobs
     */
    export interface InlineResponse200DeleteEventsJobs {
        /**
         *
         * @type {string}
         * @memberof InlineResponse200DeleteEventsJobs
         */
        href?: string;
        /**
         *
         * @type {boolean}
         * @memberof InlineResponse200DeleteEventsJobs
         */
        templated?: boolean;
    }

    /**
     *
     * @export
     * @interface InlineResponse200EventTypes
     */
    export interface InlineResponse200EventTypes {
        /**
         *
         * @type {string}
         * @memberof InlineResponse200EventTypes
         */
        href?: string;
        /**
         *
         * @type {boolean}
         * @memberof InlineResponse200EventTypes
         */
        templated?: boolean;
    }

    /**
     *
     * @export
     * @interface InlineResponse200Events
     */
    export interface InlineResponse200Events {
        /**
         *
         * @type {string}
         * @memberof InlineResponse200Events
         */
        href?: string;
        /**
         *
         * @type {boolean}
         * @memberof InlineResponse200Events
         */
        templated?: boolean;
    }

    /**
     *
     * @export
     * @interface InlineResponse200Self
     */
    export interface InlineResponse200Self {
        /**
         *
         * @type {string}
         * @memberof InlineResponse200Self
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
            ACCEPTED = <any>"ACCEPTED",
            INPROGRESS = <any>"IN_PROGRESS",
            FINISHED = <any>"FINISHED",
            FINISHEDWITHERROR = <any>"FINISHED_WITH_ERROR"
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
         * @type {RelSelf}
         * @memberof PagingLinks
         */
        self?: RelSelf;
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
}
