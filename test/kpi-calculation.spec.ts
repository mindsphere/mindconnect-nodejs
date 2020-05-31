import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src/api/sdk";
import { KPICalculationModels } from "../src/api/sdk/kpi/kpi-models";
import { decrypt, loadAuth } from "../src/api/utils";
chai.should();

describe("[SDK] KPICalculationClient", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, "passkey.4.unit.test"),
    });

    const kpiCalculationClient = sdk.GetKPICalculationClient();

    const data = [
        {
            _time: "2017-05-04T00:00:00.000Z",
        },
        {
            _time: "2017-05-04T00:30:00.000Z",
        },
        {
            _time: "2017-05-04T01:00:00.000Z",
            kpistatus: "UNKNOWN",
        },
        {
            _time: "2017-05-04T01:30:00.000Z",
            kpistatus: "UNKNOWN",
        },
        {
            _time: "2017-05-04T02:00:00.000Z",
            kpistatus: "UNKNOWN",
        },
        {
            _time: "2017-05-04T02:30:00.000Z",
            kpistatus: "SH",
        },
        {
            _time: "2017-05-04T03:00:00.000Z",
            kpistatus: "SH",
        },
        {
            _time: "2017-05-04T03:30:00.000Z",
            kpistatus: "POH",
        },
        {
            _time: "2017-05-04T04:00:00.000Z",
            kpistatus: "SH",
        },
        {
            _time: "2017-05-04T04:30:00.000Z",
            kpistatus: "SH",
        },
        {
            _time: "2017-05-04T05:00:00.000Z",
            kpistatus: "POH",
        },
        {
            _time: "2017-05-04T05:30:00.000Z",
        },
        {
            _time: "2017-05-04T06:00:00.000Z",
        },
        {
            _time: "2017-05-04T06:30:00.000Z",
            kpistatus: "UNKNOWN",
        },
        {
            _time: "2017-05-04T07:00:00.000Z",
            kpistatus: "FOH",
        },
        {
            _time: "2017-05-04T07:30:00.000Z",
            kpistatus: "FOH",
        },
        {
            _time: "2017-05-04T08:00:00.000Z",
            kpistatus: "POH",
        },
    ];

    const stateCalculationData = {
        ControlSystemEvents: [
            {
                _time: "2017-01-01T01:29:57.000Z",
                type: "NORMAL_STOP",
            },
            {
                _time: "2017-01-01T01:30:00.000Z",
                type: "SHUTDOWN",
            },
            {
                _time: "2017-01-01T04:30:01.000Z",
                type: "SHUTDOWN",
            },
        ],
        calendar: {
            PlannedOutage: [
                {
                    from: "2017-01-01T10:00:00.000Z",
                    to: "2017-01-01T11:00:00.000Z",
                },
                {
                    from: "2017-01-01T06:00:00.000Z",
                    to: "2017-01-01T07:00:00.000Z",
                },
                {
                    from: "2017-01-01T00:00:00.000Z",
                    to: "2017-01-01T01:00:00.000Z",
                },
                {
                    from: "2017-01-01T04:00:00.000Z",
                    to: "2017-01-01T05:00:00.000Z",
                },
                {
                    from: "2017-01-01T02:00:00.000Z",
                    to: "2017-01-01T03:00:00.000Z",
                },
                {
                    from: "2017-01-01T08:00:00.000Z",
                    to: "2017-01-01T09:00:00.000Z",
                },
                {
                    from: "2016-12-31T22:00:00.000Z",
                    to: "2016-12-31T23:00:00.000Z",
                },
                {
                    from: "2017-01-01T03:00:00.000Z",
                    to: "2017-01-01T04:00:00.000Z",
                },
            ],
        },
        timeseries: [
            {
                _time: "2017-01-01T00:10:00.000Z",
                sensor: "2.0",
                sensor1: "2.0",
            },
            {
                _time: "2017-01-01T00:50:00.000Z",
                sensor: "1.0",
            },
            {
                _time: "2017-01-01T01:00:00.000Z",
                sensor: "2.0",
            },
            {
                _time: "2017-01-01T01:30:00.000Z",
                sensor: "1.0",
            },
            {
                _time: "2017-01-01T02:00:00.000Z",
                sensor: "2.0",
            },
            {
                _time: "2017-01-01T03:00:00.000Z",
                sensor: "1.0",
            },
            {
                _time: "2017-01-01T03:30:00.000Z",
                sensor: "2.0",
            },
            {
                _time: "2017-01-01T04:30:00.000Z",
                sensor: "1.0",
            },
            {
                _time: "2017-01-01T05:10:00.000Z",
                sensor: "1.0",
            },
            {
                _time: "2017-01-01T05:30:00.000Z",
                sensor1: "1.0",
            },
            {
                _time: "2017-01-01T05:50:00.000Z",
                sensor: "2.0",
            },
            {
                _time: "2017-01-01T06:30:00.000Z",
                sensor2: "3.0",
            },
            {
                _time: "2017-01-01T07:10:00.000Z",
                sensor: "1.0",
            },
            {
                _time: "2017-01-01T07:20:00.000Z",
                sensor: "2.0",
            },
        ],
    };

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
        kpiCalculationClient.should.not.be.undefined;
    });

    it("should calculate kpis", async () => {
        sdk.should.not.be.undefined;
        kpiCalculationClient.should.not.be.undefined;

        const from = new Date();
        from.setDate(from.getDate() - 2);
        // console.log(data);
        const result = await kpiCalculationClient.ComputeKPI(data as KPICalculationModels.Timeseries, {
            from: new Date(data[0]["_time"]),
            to: new Date(data[data.length - 1]["_time"]),
            variableName: "kpiStatus",
            initialState: "RSH",
        });

        result.should.not.be.undefined;
    });

    it("should calculate KPI states", async () => {
        sdk.should.not.be.undefined;
        kpiCalculationClient.should.not.be.undefined;

        const from = new Date();
        from.setDate(from.getDate() - 2);
        // console.log(data);
        const result = await kpiCalculationClient.CaclulateKpiStates(
            stateCalculationData as KPICalculationModels.RequestParametersBundle,
            {
                from: new Date(data[0]["_time"]),
                to: new Date(data[data.length - 1]["_time"]),
                variableName: "kpiStatus",
                initialState: "RSH",
                defaultState: "FOH",
                threshold: 1.1,
                shutdownCorrelationThreshold: 5000,
            }
        );

        result.should.not.be.undefined;
    });
});
