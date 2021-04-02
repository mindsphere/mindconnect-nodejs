import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { retry } from "../..";
import { EventManagementModels, MindSphereSdk } from "../../api/sdk";
import { isGuid } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    proxyLog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";
import { createFilter } from "./download-events";
import path = require("path");

let color = getColor("magenta");
const red = getColor("red");
const yellow = getColor("yellow");
const blue = getColor("blue");

export default (program: CommanderStatic) => {
    program
        .command("events")
        .alias("ev")
        .option(
            "-m, --mode [list|create|delete|template|filtertemplate|info]",
            "list | create | delete | template | filtertemplate | info",
            "list"
        )
        .option("-f, --file <file>", ".mdsp.json file with event definition")
        .option("-i, --assetid <assetid>", "mindsphere asset id ")
        .option("-e, --eventid <eventid>", "event id ")
        .option(
            "-f, --filter [filter]",
            `JSON file with filter (see: ${color(
                "https://developer.mindsphere.io/apis/advanced-eventmanagement/api-eventmanagement-best-practices.html"
            )}) `
        )
        .option("-n, --eventtype <eventtype>", "the event type name")
        .option("-s, --size <size>", "max. number of events to list", "100")
        .option("-c, --includeshared", "include shared event types")
        .option("-g, --includeglobal", "include global event types")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete events in mindsphere *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    switch (options.mode) {
                        case "list":
                            await listEvents(sdk, options);
                            break;

                        case "template":
                            await createEventTemplate(options, sdk);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;

                        case "filtertemplate":
                            createFilter(options);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "delete":
                            await deleteEvent(options, sdk);
                            break;

                        case "create":
                            await createEvent(options, sdk);
                            break;

                        case "info":
                            await eventInfo(options, sdk);
                            break;

                        default:
                            throw Error(`no such option: ${options.mode}`);
                    }
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc events --mode list \t\t\t\t list last <size> events (default:100)`);
            log(`    mc events --mode list --eventtype PumpEvent\t\t list last <size> PumpEvents (default: 100)`);
            log(`    mc events --mode info --eventid <eventid>\t\t get info about event with specified id`);
            log(`    mc events --mode delete --eventid <eventid>\t\t delete event with specified id`);
            log(`    mc events --mode filtertemplate \t\t\t create filter template for --mode list command`);
            log(`    mc events --mode template --eventtype PumpEvent \t create a template file for event `);
            log(`    mc events --mode create --file PumpEvent.eventtype.mdsp.json \t create event`);

            serviceCredentialLog();
        });
};

async function createEvent(options: any, sdk: MindSphereSdk) {
    const includeShared = options.includeshared;
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const event = JSON.parse(file.toString());

    const result = await sdk.GetEventManagementClient().PostEvent(event, { includeShared: includeShared });

    console.log(`creted event  ${result.id}`);
}

async function createEventTemplate(options: any, sdk: MindSphereSdk) {
    const eventType = extractEventType(options, sdk.GetTenant());

    const templateType = await sdk
        .GetEventManagementClient()
        .GetEventType(eventType, { includeShared: options.includeshared });

    verboseLog(templateType, options.verbose);
    writeEventToFile(options, templateType);
}

function extractEventType(options: any, tenant: string) {
    let eventType = options.eventtype || "com.siemens.mindsphere.eventmgmt.event.type.MindSphereStandardEvent";

    eventType = isGuid(eventType) || (eventType! as string).includes(".") ? eventType : `${tenant}.${eventType}`;
    return eventType;
}

function writeEventToFile(options: any, templateType: EventManagementModels.EventTypeResponse) {
    const fileName = options.file || `${templateType.name}.event.mdsp.json`;

    const template: any = {};
    template.entityId = options.assetid || "AssetID";
    template.timestamp = new Date().toISOString();
    template.typeId = templateType.id;

    templateType.fields.forEach((element) => {
        template[element.name] = `${element.type}${element.required ? " ,required" : ""}`;
    });

    fs.writeFileSync(fileName, JSON.stringify(template, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc events --mode create --file ${fileName} \n\nto create the event.`
    );
}

async function deleteEvent(options: any, sdk: MindSphereSdk) {
    const includeShared = options.includeshared;
    const id = options.eventid;
    const event = await retry(options.retry, () =>
        sdk.GetEventManagementClient().GetEvent(id, { includeShared: includeShared })
    );
    const result = await retry(options.retry, () =>
        sdk.GetEventManagementClient().PostDeleteEventsJob({
            filter: {
                id: `${event.id}`,
                typeId: `${event.typeId}`,
            },
        })
    );
    console.log(`Deletion job with id ${color(result.id)} is in state ${color(result.state)}.`);
    result.details && console.log(`Details: ${JSON.stringify(result.details)}.`);
    console.log(`Run\n\n\tmc events-bulk --mode check --jobid ${result.id}\n\nto check the state of the job.\n `);
}

async function listEvents(sdk: MindSphereSdk, options: any) {
    const assetNames: any = {};
    const includeShared = options.includeshared;
    const eventMgmt = sdk.GetEventManagementClient();
    let page = 0;
    let events;
    const filter = buildFilter(options, sdk.GetTenant());
    // // verboseLog(JSON.stringify(filter, null, 2), options.verbose);
    // !options.idonly && console.log(`id etag aspects name owner scope sharing`);
    console.log(`eventid ${color("asset")} (assetid) severity type description`);
    let eventCount = 0;
    do {
        events = (await retry(options.retry, () =>
            eventMgmt.GetEvents({
                page: page,
                size: 100,
                filter: Object.keys(filter).length === 0 ? undefined : JSON.stringify(filter),
                sort: "timestamp,desc",
                includeShared: includeShared,
            })
        )) as EventManagementModels.QueryEventsResponse;
        events._embedded = events._embedded || { events: [] };
        events.page = events.page || { totalPages: 0 };
        for (const event of events._embedded.events || []) {
            if (!assetNames[event.entityId]) {
                assetNames[event.entityId] = (await sdk.GetAssetManagementClient().GetAsset(event.entityId)).name;
            }

            eventCount++;
            !options.idonly &&
                console.log(
                    `${event.id} ${color(assetNames[event.entityId])} (${event.entityId}) ${toSeverityString(
                        event.severity
                    )} ${shortEvent(event.typeId)} ${event.timestamp} ${event.description || "<no description>"}`
                );
            options.idonly && console.log(`${event.id}`);
            verboseLog(JSON.stringify(event, null, 2), options.verbose);
        }
    } while (page++ < (events.page.totalPages || 0) && eventCount < options.size);
    console.log(`${color(eventCount)} events listed.\n`);
}

function toSeverityString(severity: number | undefined) {
    let result: number | string | undefined = severity;
    result = severity === 20 ? red("Error") : result;
    result = severity === 30 ? yellow("Warning") : result;
    result = severity === 40 ? blue("Info") : result;
    return result || "<no severity>";
}

function shortEvent(eventType: string) {
    const ev = eventType.split(".");
    const short = ev[ev.length - 1];
    return short === "MindSphereStandardEvent" ? "MSE" : short;
}

function buildFilter(options: any, tenant: string) {
    const filter = (options.filter && JSON.parse(options.filter)) || {};

    if (options.assetid) {
        filter.entityId = `${options.assetid}`;
    }

    if (options.eventtype) {
        const eventType = extractEventType(options, tenant);
        filter.typeId = `${eventType}`;
    }
    return filter;
}

async function eventInfo(options: any, sdk: MindSphereSdk) {
    const includeShared = options.includeshared;
    const id = options.eventid;
    const event = await sdk.GetEventManagementClient().GetEvent(id, { includeShared: includeShared });
    console.log(JSON.stringify(event, null, 2));
}

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with event type to create an event type (see mc events --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.eventid &&
        errorLog("you have to provide the eventid to delete (see mc events --help for more details)", true);

    options.mode === "info" &&
        !options.eventid &&
        errorLog("you have to provide the eventid  (see mc events --help for more details)", true);
}
