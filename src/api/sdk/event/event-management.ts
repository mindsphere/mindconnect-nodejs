import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { EventManagementModels } from "./event-models";

export class EventManagementClient extends SdkClient {
    private _baseUrl: string = "/api/eventmanagement/v3";

    /**
     * Ideally, the billboard URI is the only address a REST client needs to know.
     * From there onwards, it must be able to discover all other URIs of the service by using the returned
     *
     * @returns {Promise<EventManagementModels.Billboard>}
     *
     * @memberOf EventManagementClient
     */
    public async GetBillboard(): Promise<EventManagementModels.InfoResponse> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/`,
        })) as EventManagementModels.InfoResponse;
    }

    /**
     * * Events
     *
     * Creates an event with the provided content (Event model can be used).
     * If no typeId is given in the request, then a MindsphereStandardEvent will be created.
     * A standard event has 5 additional fields beside the fields defined in the Event data model description (string, not required, not filterable, updatable)
     * severity (integer, not required, filterable, updatable)
     * code (string, not required, filterable, updatable)
     * source (string, not required, filterable, updatable)
     * acknowledged (boolean, not required, filterable, updatable
     * If there is a valid typeId in the request body then the event DTO must match to the corresponding event type given by the typeId.
     *
     * !Restriction! After successful response, it may take 100ms to make it visible to the user.
     *
     * @param {EventManagementModels.CustomEvent} event
     * @param {{
     *         includeShared?: boolean;
     *     }} [params]
     * @param {{boolean}} [params.includeShared] To specify if received event or eventTypes should be consider for the API operation.
     * @returns {Promise<EventManagementModels.CustomEventCreated>}
     *
     * @memberOf EventManagementClient
     */
    public async PostEvent(
        event: EventManagementModels.CustomEvent,
        params?: { includeShared?: boolean }
    ): Promise<EventManagementModels.CustomEventCreated> {
        const parameters = params || {};
        const { includeShared } = parameters;

        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/events?${toQueryString({ includeShared })}`,
            body: event,
        })) as EventManagementModels.CustomEventCreated;
    }

    /**
     * * Events
     *
     * Returns events based on the request parameters. If no typeId is given in the filter expression then MindsphereStandardEvent typed events (and its descendants excluding descendant specific fields) will be returned.
     * Note: Clients must always expect incompleteness of the list of returned events, as internal processing is limited by eventual consistency.
     *
     * @param {{
     *         page?: number;
     *         size?: number;
     *         sort?: string;
     *         filter?: string;
     *         ifNoneMatch?: string;
     *         history?: boolean;
     *         includeShared?: boolean;
     *     }} [params]
     *
     * @param {number} [params.size] Specifes the number of element in the page. Default is 20 , minimum is 1, maximum is 100.
     * @param {number} [params.page] Specifies the request page (Default is 0)
     * @param {string} [params.filter]
     *
     * If timestamp is not provided in the filter, the events from the 7 days will be filtered for by default.
     * The timestamp property can be filtered by before, after and between functions.
     * Multiple typeId expressions (by using and, or logical operators) in filter parameter is not allowed. Only equality function is supported on it.
     * Filtering with typeId having BaseEvent is not supported.
     * If typeId is missing from filter expression then MindsphereStandardEvent typed (including) descendants - polymorphic query) events will be returned
     * Negation of typeId in filter expression is not allowed.
     * If there are multiple events that have the same correlationId, entityId and typeId then only the latest one will be present in the returning list of events if history is false (false is default value)
     *
     * @param {string} [params.sort] Order in which events are returned. Supported only on filterable fields. Default is timestamp descending order
     * @param {string} [params.ifNoneMatch] ETag hash of previous request to allow caching
     * @param {boolean} [params.history]
     * Optional paramater, if we want to retrieve the history of an event which is based on using the same correlationID, entityID, typeID.
     * If the latest event instance in a history of an event is deleted then the history of the event will be deleted.Default value : false
     * @param {boolean} [params.includeShared]
     * Specifies if received event or eventTypes should be consider for the API operation.
     * @returns {Promise<EventManagementModels.QueryEventsResponse>}
     *
     * @memberOf EventManagementClient
     */
    public async GetEvents(params?: {
        page?: number;
        size?: number;
        sort?: string;
        filter?: string;
        ifNoneMatch?: string;
        history?: boolean;
        includeShared?: boolean;
    }): Promise<EventManagementModels.QueryEventsResponse> {
        const parameters = params || {};
        const { page, size, sort, filter, ifNoneMatch, history, includeShared } = parameters;

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/events?${toQueryString({ page, size, sort, filter, history, includeShared })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
        });

        return result as EventManagementModels.QueryEventsResponse;
    }

    /**
     * * Events
     *
     * Returns an event by Id.
     *
     * @param {string} eventId
     * @param {{ ifNoneMatch?: string; includeShared?: boolean }} [params]
     * @returns {Promise<EventManagementModels.CustomEventResponse>}
     *
     * @memberOf EventManagementClient
     */
    public async GetEvent(
        eventId: string,
        params?: { ifNoneMatch?: string; includeShared?: boolean }
    ): Promise<EventManagementModels.CustomEventResponse> {
        const parameters = params || {};
        const { ifNoneMatch, includeShared } = parameters;
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/events/${eventId}?${toQueryString({ includeShared })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
        })) as EventManagementModels.CustomEventResponse;
    }

    /**
     * Update an existing event by ID.
     *
     * @param {string} eventId
     * @param {EventManagementModels.CustomEvent} event
     * @param {{ ifMatch: number }} params
     * @returns {Promise<EventManagementModels.CustomEvent>}
     *
     * If user wants to have history of an event, it can be done to use POST request having the same typeId, correlationId and entityId in the payload.
     * !Restriction!
     *
     * PUT endpoint can only be used for content adjustments (corrections) but not for status changes (e.g. tickets use case).
     * The time range for changes (updating an event by ID) might be limited in upcoming versions.
     * Recommended usage for status changes is the update simulation based on an existing event's correlation ID and entity ID via POST endpoint.
     * After successful response, it may take 100ms to make it visible to the user.
     * The following fields are required and their value cannot be changed
     * correlationId
     * timestamp
     * entityId
     * typeId cannot be changed, and is required for Custom events
     *
     * @memberOf EventManagementClient
     */
    public async PutEvent(
        eventId: string,
        event: EventManagementModels.CustomEvent,
        params: { ifMatch: number; includeShared?: boolean }
    ): Promise<EventManagementModels.CustomEvent> {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;

        return (await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/events/${eventId}?${toQueryString({ includeShared })}`,
            body: event,
            additionalHeaders: { "If-Match": ifMatch },
        })) as EventManagementModels.CustomEvent;
    }

    /**
     * * Event Types
     * * Creates an event type with the provided content.
     * * Default id is generated UUID. If id is provided then it has to be prefixed with the current tenant and has to be followed by a dot.
     * * Default parentId is BaseEvent
     * * Default ttl value is 35
     * * Default scope is LOCAL
     * * Default filterable value for a field is false
     * * Default required value for a field is false
     * * Default updatable value for a field is true
     * * Clients must provide values field in case of ENUM type and must not provide in case of any other field type.
     *
     * !Restriction!
     * ! After successful response, it may take 100ms to make it visible to the user.
     *
     * Create new event type
     *
     * @param {EventManagementModels.EventType} eventType
     * @param {{
     *         includeShared?: boolean;
     *     }} [params]
     * @param {{boolean}} [params.includeShared] To specify if received event or eventTypes should be consider for the API operation.
     * @returns {Promise<EventManagementModels.EventTypeResponse>}
     *
     * @memberOf EventManagementClient
     */
    public async PostEventType(
        eventType: EventManagementModels.EventType,
        params?: { includeShared?: boolean }
    ): Promise<EventManagementModels.EventTypeResponse> {
        const parameters = params || {};
        const { includeShared } = parameters;

        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/eventTypes?${toQueryString({ includeShared })}`,
            body: eventType,
        })) as EventManagementModels.EventTypeResponse;
    }

    /**
     * Returns event types based on the request parameters.
     *
     * !Note!
     * !In case of sub-tenant user, global and related T1 local event types are also visible.
     *
     * @param {{
     *         page?: number;
     *         size?: number;
     *         sort?: string;
     *         filter?: string;
     *         ifNoneMatch?: string;
     *         includeShared?: boolean;
     *     }} [params]
     * @returns {Promise<EventManagementModels.QueryEventTypesResponse>}
     *
     * @memberOf EventManagementClient
     */
    public async GetEventTypes(params?: {
        page?: number;
        size?: number;
        sort?: string;
        filter?: string;
        ifNoneMatch?: string;
        includeShared?: boolean;
    }): Promise<EventManagementModels.QueryEventTypesResponse> {
        const parameters = params || {};
        const { page, size, sort, filter, ifNoneMatch, includeShared } = parameters;

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/eventTypes?${toQueryString({ page, size, sort, filter, includeShared })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
        });

        return result as EventManagementModels.QueryEventTypesResponse;
    }

    /**
     * Returns an event type by ID.
     * !Note!
     * ! In case of sub-tenant user, global and related T1 local event types are also visible.
     *
     * @param {string} eventTypeId
     * @param {{ ifNoneMatch?: string; includeShared ?: boolean }} [params]
     * @returns {Promise<EventManagementModels.EventTypeResponse>}
     *
     * @memberOf EventManagementClient
     */
    public async GetEventType(
        eventTypeId: string,
        params?: { ifNoneMatch?: string; includeShared?: boolean }
    ): Promise<EventManagementModels.EventTypeResponse> {
        const parameters = params || {};
        const { ifNoneMatch, includeShared } = parameters;

        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/eventTypes/${eventTypeId}?${toQueryString({ includeShared })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
        })) as EventManagementModels.EventTypeResponse;
    }

    /**
     * * Event Types
     *
     * Updates an event type by ID by only sending the changed content.
     * !Restriction!
     * !After successful response, it may take 100ms to make it visible to the user.
     *
     * @param {string} eventTypeId
     * @param {EventManagementModels.EventTypePatch} eventTypePatch
     * New value for the given attribute or the field, that should be applied, depending on the op value. Structure is varying
     *
     * If patch operation would modify attribute properties (ttl, scope, required) then value property of the patch content must be the type of the specified attribute (eg. SCOPE, 45, false)
     * If patch operation would add new field then value property of the patch content must be an object describing field properties
     *
     * @example
     *
     * Example 1:
     * {
     *   "op": "replace",
     *   "path": "/scope",
     *   "value": "GLOBAL"
     * }
     *
     * Example 2:
     * {
     *   "op": "add",
     *   "path": "/fields",
     *   "value": {
     *     "name": "newFieldName",
     *     "updatable": false,
     *     "type": "INTEGER"
     *   }
     * }
     *
     * Example 3:
     * {
     *   "op": "replace",
     *   "path": "/fields/originalField/required",
     *   "value": false
     * }
     *
     *
     *
     * @param {{ ifMatch: number }} params
     * @returns {Promise<EventManagementModels.EventType>}
     *
     * @memberOf EventManagementClient
     */
    public async PatchEventType(
        eventTypeId: string,
        eventTypePatch: EventManagementModels.EventTypePatch,
        params: { ifMatch: number; includeShared?: boolean }
    ): Promise<EventManagementModels.EventTypeResponse> {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;

        return (await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/eventTypes/${eventTypeId}?${toQueryString({ includeShared })}`,
            body: eventTypePatch,
            additionalHeaders: { "If-Match": ifMatch },
        })) as EventManagementModels.EventTypeResponse;
    }

    /**
     * * Event Type
     *
     * Deletes an event type by ID.
     *
     * @param {string} eventTypeId
     * @param {{ ifMatch: number }} params
     * @returns
     *
     * @memberOf EventManagementClient
     */
    public async DeleteEventType(eventTypeId: string, params: { ifMatch: number; includeShared?: boolean }) {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;

        return await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/eventTypes/${eventTypeId}?${toQueryString({ includeShared })}`,
            additionalHeaders: { "If-Match": ifMatch },
            noResponse: true,
        });
    }

    /**
     * * Jobs
     *
     * Creates an asynchronous job which deletes events based on filter expression.
     * Maximum 1.000.000 events can be deleted at once. T
     * he job status can be queried for 2 hours at most after the jobID is returned.
     * If the latest event instance in a history of an event is deleted then the history of the event will be deleted.
     *
     * !Restriction!
     * Job will result in FINISHED_WITH_ERROR state in cases you can find below
     * Concurrent event deletion on the same event type is not allowed.
     * Concurrent event deletion and event type modification for the same event type is not allowed.
     *
     * @param {EventManagementModels.DeleteEventsJob} deleteEventsJob
     * @returns {Promise<EventManagementModels.JobResource>}
     *
     * @memberOf EventManagementClient
     */
    public async PostDeleteEventsJob(
        deleteEventsJob: EventManagementModels.DeleteEventsJob
    ): Promise<EventManagementModels.JobResource> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/deleteEventsJobs`,
            body: deleteEventsJob,
        })) as EventManagementModels.JobResource;
    }

    /**
     * * Jobs
     *
     * Returns a delete events job state by ID.
     *
     * @param {string} jobId
     * @returns {Promise<EventManagementModels.DeleteJobResource>}
     *
     * @memberOf EventManagementClient
     */
    public async GetDeleteEventsJob(jobId: string): Promise<EventManagementModels.DeleteJobResource> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/deleteEventsJobs/${jobId}`,
        })) as EventManagementModels.DeleteJobResource;
    }

    /**
     * * Jobs
     *
     * Creates an asynchronous job which creates events with the provided content.
     * Maximum 50 events can be created at once.
     * The job status can be queried for 2 hours at most after the jobID is returned.
     *
     * @param {EventManagementModels.DeleteEventsJob} createEventsJob
     * @returns {Promise<EventManagementModels.JobResource>}
     *
     * @memberOf EventManagementClient
     */
    public async PostCreateEventsJob(
        createEventsJob: EventManagementModels.DeleteEventsJob
    ): Promise<EventManagementModels.JobResource> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/createEventsJobs`,
            body: createEventsJob,
        })) as EventManagementModels.JobResource;
    }

    /**
     * Returns a create events job state by ID.
     *
     * @param {string} jobId
     * @returns {Promise<EventManagementModels.CreateJobResource>}
     *
     * @memberOf EventManagementClient
     */
    public async GetCreateEventsJob(jobId: string): Promise<EventManagementModels.CreateJobResource> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/createEventsJobs/${jobId}`,
        })) as EventManagementModels.CreateJobResource;
    }
}
