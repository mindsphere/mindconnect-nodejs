import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
chai.should();

describe("[SDK] EventAnalytics Client", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, "passkey.4.unit.test"),
    });

    const eventAnalytics = sdk.GetEventAnalyticsClient();

    it("should instantiate", async () => {
        eventAnalytics.should.not.be.undefined;
    });

    it("should find top events", async () => {
        const example = {
            eventsMetadata: {
                eventTextPropertyName: "text",
            },
            events: [
                {
                    _time: "2017-10-01T12:00:00.001Z",
                    text: "INTRODUCING FUEL",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:01.001Z",
                    text: "Status@Flame On",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:02.001Z",
                    text: "Status@Flame On",
                    text_qc: 0,
                },
            ],
            numberOfTopPositionsRequired: 5,
        };
        const result = await eventAnalytics.FindTopEvents(example);
        result.should.not.be.undefined;
        result.length.should.equal(2);
    });

    it("should filter events", async () => {
        const data = {
            eventsMetadata: {
                eventTextPropertyName: "text",
            },
            events: [
                {
                    _time: "2017-10-01T12:00:00.001Z",
                    text: "INTRODUCING FUEL",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:01.001Z",
                    text: "Status@Flame On",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:02.001Z",
                    text: "Status@Flame Off",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:03.001Z",
                    text: "Error code: 340",
                    text_qc: 0,
                },
            ],
            filterList: ["INTRODUCING FUEL", "MEANINGLESS ALARM", "Status@Flame On"],
        };

        const result = await eventAnalytics.FilterEvents(data);
        result.should.not.be.undefined;
        result.output.length.should.equal(2);
    });

    it("should count events", async () => {
        const data = {
            eventsMetadata: {
                eventTextPropertyName: "text",
                splitInterval: 5000,
            },
            events: [
                {
                    _time: "2017-10-01T12:00:00.001Z",
                    text: "INTRODUCING FUEL",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:01.001Z",
                    text: "Status@Flame On",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:02.001Z",
                    text: "Status@Flame Off",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:03.001Z",
                    text: "Error code: 340",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:04.001Z",
                    text: "Error code: 340",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:06.001Z",
                    text: "INTRODUCING FUEL",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:08.001Z",
                    text: "Status@Flame On",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:09.001Z",
                    text: "Status@Flame Off",
                    text_qc: 0,
                },
            ],
        };

        const result = await eventAnalytics.CountEvents(data);
        result.should.not.be.undefined;
        result.output.length.should.be.equal(2);
        result.output[0].eventCount!.should.be.equal(5); // there are 5 events in the first 5 seconds
        result.output[1].eventCount!.should.be.equal(3); // there are 3 events in the second 5 seconds
    });

    it("should remove duplicate events", async () => {
        const data = {
            eventsMetadata: {
                eventTextPropertyName: "text",
                splitInterval: 5000,
            },
            events: [
                {
                    _time: "2017-10-01T12:00:00.001Z",
                    text: "INTRODUCING FUEL",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:01.001Z",
                    text: "Status@Flame On",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:02.001Z",
                    text: "Status@Flame Off",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:03.001Z",
                    text: "Error code: 340",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:04.001Z",
                    text: "Error code: 340",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:06.001Z",
                    text: "INTRODUCING FUEL",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:08.001Z",
                    text: "Status@Flame On",
                    text_qc: 0,
                },
                {
                    _time: "2017-10-01T12:00:09.001Z",
                    text: "Status@Flame Off",
                    text_qc: 0,
                },
            ],
        };

        const result = await eventAnalytics.RemoveDuplicateEvents(data);
        result.should.not.be.undefined;
        result.output.length.should.equal(7);
    });

    it("should match event patterns", async () => {
        const data = {
            maxPatternInterval: 200000,
            patternsList: [
                {
                    pattern: [
                        {
                            eventText: "INTRODUCING FUEL",
                            minRepetitions: 1,
                            maxRepetitions: 2,
                        },
                        {
                            eventText: "Status@Flame On",
                            minRepetitions: 0,
                            maxRepetitions: 1,
                        },
                        {
                            eventText: "Module STOP due to parameter assignment",
                            minRepetitions: 1,
                            maxRepetitions: 1,
                        },
                    ],
                },
                {
                    pattern: [
                        {
                            eventText: "Downloading the module database causes module .. restart",
                            minRepetitions: 1,
                            maxRepetitions: 1,
                        },
                        {
                            eventText:
                                "The SIMATIC mode was selected for time-of-day synchronization of the module with Id: ..",
                            minRepetitions: 1,
                            maxRepetitions: 1,
                        },
                    ],
                },
            ],
            nonEvents: ["Error 2.. occurred", "STOPPING ENGINE"],
            eventsInput: {
                eventsMetadata: {
                    eventTextPropertyName: "text",
                },
                events: [
                    {
                        _time: "2017-10-01T12:00:00.001Z",
                        text: "Downloading the module database causes module 11 restart",
                        text_qc: 0,
                    },
                    {
                        _time: "2017-10-01T12:00:01.001Z",
                        text: "The direction for forwarding the time of day is recognized automatically by the module",
                        text_qc: 0,
                    },
                    {
                        _time: "2017-10-01T12:00:02.001Z",
                        text: "Status@Flame On",
                        text_qc: 0,
                    },
                    {
                        _time: "2017-10-01T12:00:03.001Z",
                        text: "The SIMATIC mode was selected for time-of-day synchronization of the module with Id: 33",
                        text_qc: 0,
                    },
                    {
                        _time: "2017-10-01T12:00:06.001Z",
                        text: "INTRODUCING FUEL",
                        text_qc: 0,
                    },
                    {
                        _time: "2017-10-01T12:00:09.001Z",
                        text: "Module STOP due to parameter assignment",
                        text_qc: 0,
                    },
                ],
            },
        };

        const result = await eventAnalytics.MatchEventPatterns(data);
        result.should.not.be.undefined;
        result.output?.length.should.equal(2);
    });
});
