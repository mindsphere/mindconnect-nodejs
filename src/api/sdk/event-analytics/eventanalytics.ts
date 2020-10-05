import { SdkClient } from "../common/sdk-client";
import { EventAnalyticsModels } from "./eventanalytics-models";
/**
 * * Provides the essential functionality for a data-driven analysis of the event data.
 *
 * @export
 * @class EventAnalyticsClient
 * @extends {SdkClient}
 */
export class EventAnalyticsClient extends SdkClient {
    private _baseUrl = "/api/eventanalytics/v3";

    /**
     * * Finds the most frequent events, which are sorted by the number of appearances in a dataset in a descending order.
     *
     * @param {EventAnalyticsModels.TopEventsInputDataModel} data
     * Data structure with three parts - numberOfTopPositionsRequired, eventsMetadata, and events.
     * * numberOfTopPositionsRequired
     * How many top positions will be returned in the response. Has to be a positive integer.
     * If not specified, the default value 10 will be used.
     * * eventsMetadata
     * Metadata for the events list specifying the property name of the item in the events list that contains the text of the event.
     * * events
     * List with the events that will be processed.
     * @returns {Promise<EventAnalyticsModels.TopEventOutput>}
     * * Tuple containing frequency of event and event text
     * @example
     * [ { "appearances": 2, "text": "StatusFlame On" },  { "appearances": 1, "text": "INTRODUCING FUEL" } ]
     * @memberOf EventAnalyticsClient
     */
    public async FindTopEvents(
        data: EventAnalyticsModels.TopEventsInputDataModel
    ): Promise<EventAnalyticsModels.TopEventOutput> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/findTopEvents`,
            message: "FindTopEvents",
            body: data,
        })) as EventAnalyticsModels.TopEventOutput;
    }

    /**
     * * Finds the most frequent events, which are sorted by the number of appearances in a dataset in a descending order.
     *
     * @param {EventAnalyticsModels.EventSearchInputDataModel} data
     * Data structure with three parts - numberOfTopPositionsRequired, eventsMetadata, and events.
     * *numberOfTopPositionsRequired
     * How many top positions will be returned in the response. Has to be a positive integer. If not specified, the default value 10 will be used.
     * *eventsMetadata
     * Metadata for the events list specifying the property name of the item in the events list that contains the text of the event.
     * *events
     * List with the events that will be processed.
     * @returns {Promise<EventAnalyticsModels.EventArrayOutput>}
     * Tuple containing frequency of event and event text
     * @example
     * [ { "appearances": 2, "text": "Status@Flame On" },  { "appearances": 1, "text": "INTRODUCING FUEL" } ]
     * @memberOf EventAnalyticsClient
     */
    public async FilterEvents(
        data: EventAnalyticsModels.EventSearchInputDataModel
    ): Promise<EventAnalyticsModels.EventArrayOutput> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/filterEvents`,
            message: "FilterEvents",
            body: data,
        })) as EventAnalyticsModels.EventArrayOutput;
    }

    /**
     * * The microservice takes as an input the entire dataset and the time resolution (example 100ms).
     * * The micro service will output the given time interval (startTime, endTime) and the resulted number of event occurrences.
     *
     * @param {EventAnalyticsModels.EventInput} data
     * Data structure with two parts eventsMetadata, events.
     * * eventsMetadata
     * Metadata for the events list specifying the property name of the item in the events list that contains the text of the event (eventTextPropertyName) and time window length in miliseconds of the period in which time interval will be split (splitInterval).
     * * events
     * List with the events that will be processed.
     * @returns {Promise<EventAnalyticsModels.EventCountOutput>}
     * Model containing startTime, endTime and number of events produced between startTime and endTime
     * @memberOf EventAnalyticsClient
     */
    public async CountEvents(data: EventAnalyticsModels.EventInput): Promise<EventAnalyticsModels.EventCountOutput> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/countEvents`,
            message: "CountEvents",
            body: data,
        })) as EventAnalyticsModels.EventCountOutput;
    }

    /**
     * * Determine pre-existing relationships between events for a requested temporal resolution (example 500ms) and reduce the data set by aggregating events with duplicate value.
     *
     * @param {EventAnalyticsModels.EventInput} data
     * Data structure with two parts eventsMetadata, events.
     * * eventsMetadata
     * Metadata for the events list specifying the property name of the item in the events list that contains the text of the event (eventTextPropertyName) and time window length in miliseconds of the period in which time interval will be split (splitInterval).
     * *events
     * List with the events that will be processed.
     * @returns {Promise<EventAnalyticsModels.DuplicateEventArrayOutput>}
     *
     * @memberOf EventAnalyticsClient
     */
    public async RemoveDuplicateEvents(
        data: EventAnalyticsModels.EventInput
    ): Promise<EventAnalyticsModels.DuplicateEventArrayOutput> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/removeDuplicateEvents`,
            message: "RemoveDuplicateEvents",
            body: data,
        })) as EventAnalyticsModels.DuplicateEventArrayOutput;
    }

    /**
     * Finds all instances of the specified pattern(s) in a collection of events.
     *
     * @param {EventAnalyticsModels.PatternMatchingInputDataModel} data
     * Data structure with four parts - maxPatternInterval, patternsList, nonEvents and eventsInput.
     * * maxPatternInterval
     * The maximum time length (in milliseconds) of the sliding window where the pattern occurs (Maximum difference allowed between the first event of the pattern and the last one).
     * * patternsList
     * The patterns to be found in events. The eventText can contain regular expressions. The acceptable syntax for the regular expressions is the java syntax. minRepetitions and maxRepetitions represent the minimum and maximum number of events of the specified type that are allowed to occur in order for the pattern to be matched on the events.
     * * nonEvents
     * A list of events that is not allowed to be part of a pattern. Any pattern which contains a non-event is excluded from the final report.
     * * eventsInput
     * Metadata for the events list specifying the property name of the item in the events list that contains the text of the event and the list with the events that will be processed.
     * @returns {Promise<EventAnalyticsModels.PatternMatchingOutput>}
     * Data model describing the output for the Pattern Matching functionality
     * @memberOf EventAnalyticsClient
     */
    public async MatchEventPatterns(
        data: EventAnalyticsModels.PatternMatchingInputDataModel
    ): Promise<EventAnalyticsModels.PatternMatchingOutput> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/matchEventPatterns`,
            message: "MatchEventPatterns",
            body: data,
        })) as EventAnalyticsModels.PatternMatchingOutput;
    }
}
