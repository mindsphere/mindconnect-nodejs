export namespace EventAnalyticsModels {
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
     * @interface DuplicateEventArrayOutput
     */
    export interface DuplicateEventArrayOutput {
        /**
         *
         * @type {Array<Event>}
         * @memberof DuplicateEventArrayOutput
         */
        output: Array<Event>;
    }

    /**
     * An event object (a tuple of time and text)
     * @export
     * @interface Event
     */
    export interface Event {
        /**
         * Timestamp of the event in the ISO 8601
         * @type {string}
         * @memberof Event
         */
        _time: string;
        /**
         * The text of the event
         * @type {string}
         * @memberof Event
         */
        text: string;
        /**
         * Quality check flag
         * @type {number}
         * @memberof Event
         */
        textQc?: number;
    }

    /**
     *
     * @export
     * @interface EventArrayOutput
     */
    export interface EventArrayOutput {
        /**
         *
         * @type {Array<Event>}
         * @memberof EventArrayOutput
         */
        output: Array<Event>;
    }

    /**
     * Model containing startTime, endTime and number of events produced between startTime and endTime
     * @export
     * @interface EventCountOutput
     */
    export interface EventCountOutput {
        /**
         *
         * @type {Array<EventCountOutputItem>}
         * @memberof EventCountOutput
         */
        output: Array<EventCountOutputItem>;
    }

    /**
     * Item containing one element from the count output
     * @export
     * @interface EventCountOutputItem
     */
    export interface EventCountOutputItem {
        /**
         * Timestamp of the event in the ISO 8601
         * @type {string}
         * @memberof EventCountOutputItem
         */
        startTime?: string;
        /**
         * Timestamp of the event in the ISO 8601
         * @type {string}
         * @memberof EventCountOutputItem
         */
        endTime?: string;
        /**
         *
         * @type {number}
         * @memberof EventCountOutputItem
         */
        eventCount?: number;
    }

    /**
     * Contains the events and the metadata regarding the events structure
     * @export
     * @interface EventInput
     */
    export interface EventInput {
        /**
         *
         * @type {EventInputEventsMetadata}
         * @memberof EventInput
         */
        eventsMetadata: EventInputEventsMetadata;
        /**
         *
         * @type {Array<Event>}
         * @memberof EventInput
         */
        events: Array<Event>;
    }

    /**
     * Metadata for the events list
     * @export
     * @interface EventInputEventsMetadata
     */
    export interface EventInputEventsMetadata {
        /**
         * The property name of the events list objects that contains the text of the event
         * @type {string}
         * @memberof EventInputEventsMetadata
         */
        eventTextPropertyName?: string;
        /**
         * The window length represents the value in milliseconds of the period in which user wants to split input interval
         * @type {number}
         * @memberof EventInputEventsMetadata
         */
        splitInterval?: number;
    }

    /**
     * Data model describing the input for the <b>eventsSearch</b> functionality
     * @export
     * @interface EventSearchInputDataModel
     */
    export interface EventSearchInputDataModel extends EventsInputModel {
        /**
         * List of events which will be removed from the input list
         * @type {Array<string>}
         * @memberof EventSearchInputDataModel
         */
        filterList?: Array<string>;
    }

    /**
     * Contains the events and the metadata regarding the events structure
     * @export
     * @interface EventsInputModel
     */
    export interface EventsInputModel {
        /**
         *
         * @type {EventsInputModelEventsMetadata}
         * @memberof EventsInputModel
         */
        eventsMetadata: EventsInputModelEventsMetadata;
        /**
         *
         * @type {Array<Event>}
         * @memberof EventsInputModel
         */
        events: Array<Event>;
    }

    /**
     * Metadata for the events list
     * @export
     * @interface EventsInputModelEventsMetadata
     */
    export interface EventsInputModelEventsMetadata {
        /**
         * The property name of the events list objects that contains the text of the event
         * @type {string}
         * @memberof EventsInputModelEventsMetadata
         */
        eventTextPropertyName?: string;
    }

    /**
     * Object containing an event description and an operator that specifies the number of appearances required for the event
     * @export
     * @interface MatchingPattern
     */
    export interface MatchingPattern {
        /**
         * Event identifier.
         * @type {string}
         * @memberof MatchingPattern
         */
        eventText: string;
        /**
         * The minimum number of desired repetitions of the event inside the pattern.
         * @type {number}
         * @memberof MatchingPattern
         */
        minRepetitions?: number;
        /**
         * The maximum number of desired repetitions of the event inside the pattern.
         * @type {number}
         * @memberof MatchingPattern
         */
        maxRepetitions?: number;
    }

    /**
     * The collection of patterns used for matching into the events list.
     * @export
     * @interface PatternDefinition
     */
    export interface PatternDefinition {
        /**
         * The id used to reference the folder where the file with the pattern is stored.
         * @type {string}
         * @memberof PatternDefinition
         */
        folderId?: string;
        /**
         * The id used to reference the file where the pattern is stored.
         * @type {string}
         * @memberof PatternDefinition
         */
        fileId?: string;
        /**
         * The id used to reference a specific pattern. It is unique inside this collection.
         * @type {string}
         * @memberof PatternDefinition
         */
        patternId?: string;
        /**
         *
         * @type {Array<MatchingPattern>}
         * @memberof PatternDefinition
         */
        pattern?: Array<MatchingPattern>;
    }

    /**
     * Data model describing one sequence that matches a pattern
     * @export
     * @interface PatternFoundByMatching
     */
    export interface PatternFoundByMatching {
        /**
         * The index of the pattern based on request object
         * @type {number}
         * @memberof PatternFoundByMatching
         */
        patternIndex?: number;
        /**
         *
         * @type {any}
         * @memberof PatternFoundByMatching
         */
        timeWindow?: any;
        /**
         *
         * @type {Array<MatchingPattern>}
         * @memberof PatternFoundByMatching
         */
        pattern?: Array<MatchingPattern>;
        /**
         *
         * @type {Array<Event>}
         * @memberof PatternFoundByMatching
         */
        matchedEvents?: Array<Event>;
    }

    /**
     * Data model describing the input for the <b>Pattern Matching</b> functionality
     * @export
     * @interface PatternMatchingInputDataModel
     */
    export interface PatternMatchingInputDataModel {
        /**
         * The maximum time length (in milliseconds) of the sliding window where the pattern occurs
         * @type {number}
         * @memberof PatternMatchingInputDataModel
         */
        maxPatternInterval?: number;
        /**
         *
         * @type {Array<PatternDefinition>}
         * @memberof PatternMatchingInputDataModel
         */
        patternsList?: Array<PatternDefinition>;
        /**
         * List of events which will be removed from the input list
         * @type {Array<string>}
         * @memberof PatternMatchingInputDataModel
         */
        nonEvents?: Array<string>;
        /**
         *
         * @type {EventsInputModel}
         * @memberof PatternMatchingInputDataModel
         */
        eventsInput?: EventsInputModel;
    }

    /**
     * Data model describing the output for the <b>Pattern Matching</b> functionality
     * @export
     * @interface PatternMatchingOutput
     */
    export interface PatternMatchingOutput {
        /**
         *
         * @type {Array<PatternFoundByMatching>}
         * @memberof PatternMatchingOutput
         */
        output?: Array<PatternFoundByMatching>;
    }

    /**
     * The time interval of matched pattern, containing the following information startTimestam, endTimestamp.
     * @export
     * @interface TimeWindow
     */
    export interface TimeWindow {
        /**
         * The start timestamp of the matched pattern.
         * @type {string}
         * @memberof TimeWindow
         */
        startTimestamp: string;
        /**
         * The end timestamp of the matched pattern.
         * @type {string}
         * @memberof TimeWindow
         */
        endTimestamp: string;
    }

    /**
     * Tuple containing frequency of event and event text
     * @export
     * @interface TopEventOutput
     */
    export interface TopEventOutput extends Array<TopEventOutputInner> {}

    /**
     *
     * @export
     * @interface TopEventOutputInner
     */
    export interface TopEventOutputInner {
        /**
         *
         * @type {number}
         * @memberof TopEventOutputInner
         */
        appearances?: number;
        /**
         *
         * @type {string}
         * @memberof TopEventOutputInner
         */
        text?: string;
    }

    /**
     * Data model describing the input for the <b>findTopEvents</b> functionality
     * @export
     * @interface TopEventsInputDataModel
     */
    export interface TopEventsInputDataModel extends EventsInputModel {
        /**
         * How many top positions will be returned in the response. Has to be a positive integer. If not specified, the default value 10 will be used.
         * @type {number}
         * @memberof TopEventsInputDataModel
         */
        numberOfTopPositionsRequired?: number;
    }

    /**
     *
     * @export
     * @interface VndError
     */
    export interface VndError {
        /**
         *
         * @type {string}
         * @memberof VndError
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof VndError
         */
        message?: string;
    }
}
