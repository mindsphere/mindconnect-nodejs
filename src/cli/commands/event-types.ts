import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { retry } from "../..";
import { EventManagementModels, MindSphereSdk } from "../../api/sdk";
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
import path = require("path");

let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("event-types")
        .alias("et")
        .option("-m, --mode [list|create|delete|template|info]", "list | create | delete | template | info", "list")
        .option("-f, --file <file>", ".mdsp.json file with event type definition")
        .option("-i, --idonly", "list only ids")
        .option("-s, --schema <schema>", "JSON Schema")
        .option("-n, --eventtype <eventtype>", "the event type name")
        .option("-c, --includeshared", "include shared event types")
        .option("-g, --includeglobal", "include global event types")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete event types *"))
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
                            await listEventTypes(sdk, options);
                            break;

                        case "template":
                            createTemplate(options, sdk);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "delete":
                            await deleteEventType(options, sdk);
                            break;

                        case "create":
                            await createEventType(options, sdk);
                            break;

                        case "info":
                            await eventTypeInfo(options, sdk);
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
            log(`    mc event-types --mode list \t\t\t\t\t list all event types`);
            log(
                `    mc event-types --mode list --eventtype PumpEvent\t\t list all event types which are named PumpEvent`
            );
            log(
                `    mc event-types --mode template --eventtype PumpEvent \n\tcreate a template file (PumpEvent.eventtype.mdsp.json) for event type PumpEvent`
            );
            log(
                `    mc event-types --mode create --file PumpEvent.eventtype.mdsp.json \n\tcreate event type PumpEvent in MindSphere`
            );

            serviceCredentialLog();
        });
};

async function createEventType(options: any, sdk: MindSphereSdk) {
    const includeShared = options.includeshared;
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const eventtype = JSON.parse(file.toString());

    const name = eventtype.name!.includes(".") ? eventtype.name : `${sdk.GetTenant()}.${eventtype.name}`;
    await sdk.GetEventManagementClient().PostEventType(eventtype, { includeShared: includeShared });
    console.log(`creted event type ${color(name)}`);
}

function createTemplate(options: any, sdk: MindSphereSdk) {
    const id = (options.eventtype! as string).includes(".")
        ? options.eventtype
        : `${sdk.GetTenant()}.${options.eventtype}`;
    const templateType = {
        id: `${id}`,
        name: `${options.eventtype}`,
        parentId: "string",
        ttl: 0,
        scope: "LOCAL",
        fields: [
            {
                name: "string",
                filterable: false,
                required: false,
                updatable: false,
                type: "STRING",
                values: ["string"],
            },
        ],
    };
    verboseLog(JSON.stringify(templateType, null, 2), options.verbose);
    writeEventTypeToFile(options, templateType);
}

function writeEventTypeToFile(options: any, EventType: any) {
    const fileName = options.file || `${options.eventtype}.eventtype.mdsp.json`;
    fs.writeFileSync(fileName, JSON.stringify(EventType, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc event-types --mode create --file ${fileName} \n\nto create the event type`
    );
}

async function deleteEventType(options: any, sdk: MindSphereSdk) {
    const includeShared = options.includeshared;
    const id = options.eventtype;
    const eventType = await sdk.GetEventManagementClient().GetEventType(id, { includeShared: includeShared });
    await sdk
        .GetEventManagementClient()
        .DeleteEventType(id, { ifMatch: eventType.etag!, includeShared: includeShared });
    console.log(`eventtype with id ${color(id)} deleted.`);
}

async function listEventTypes(sdk: MindSphereSdk, options: any) {
    const includeShared = options.includeshared;
    const eventMgmt = sdk.GetEventManagementClient();

    let page = 0;
    let eventtypes;

    const filter = buildFilter(options, sdk.GetTenant());
    verboseLog(JSON.stringify(filter, null, 2), options.verbose);

    !options.idonly && console.log(`id etag aspects name owner scope sharing`);

    let eventCount = 0;

    do {
        eventtypes = (await retry(options.retry, () =>
            eventMgmt.GetEventTypes({
                page: page,
                size: 100,
                filter: Object.keys(filter).length === 0 ? undefined : JSON.stringify(filter),
                sort: "id,asc",
                includeShared: includeShared,
            })
        )) as EventManagementModels.QueryEventTypesResponse;

        eventtypes._embedded = eventtypes._embedded || { eventTypes: [] };

        eventtypes.page = eventtypes.page || { totalPages: 0 };

        for (const eventtype of eventtypes._embedded.eventTypes || []) {
            eventCount++;
            !options.idonly &&
                console.log(
                    `${eventtype.id}\t${eventtype.etag} fields[${eventtype.fields?.length}]\t${color(eventtype.name)} ${
                        eventtype.owner
                    } ${eventtype.scope} ${eventtype.sharing?.modes || ""}`
                );

            options.idonly && console.log(`${eventtype.id}`);

            verboseLog(JSON.stringify(eventtype, null, 2), options.verbose);
        }
    } while (page++ < (eventtypes.page.totalPages || 0));

    console.log(`${color(eventCount)} event types listed.\n`);
}

function buildFilter(options: any, tenant: string) {
    const filter = (options.filter && JSON.parse(options.filter)) || {};
    let pointer = filter;
    if (options.eventtype !== undefined) {
        filter.and = {};
        pointer = filter.and;
    }
    if (options.eventtype) {
        pointer.id = { contains: `${options.eventtype}` };
    }
    if (!options.includeglobal) {
        pointer.owner = { eq: `${tenant}` };
    }
    return filter;
}

async function eventTypeInfo(options: any, sdk: MindSphereSdk) {
    const includeShared = options.includeshared;
    const id = options.eventtype;
    const eventType = await sdk.GetEventManagementClient().GetEventType(id, { includeShared: includeShared });
    console.log(JSON.stringify(eventType, null, 2));
}

function checkRequiredParamaters(options: any) {
    options.mode === "template" &&
        !options.eventtype &&
        errorLog(
            "you have to provide event type to create a template (see mc event-types --help for more details)",
            true
        );

    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with event type to create an event type (see mc event-types --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.eventtype &&
        errorLog("you have to provide the event type to delete (see mc event-types --help for more details)", true);

    options.mode === "info" &&
        !options.eventtype &&
        errorLog("you have to provide the event type  (see mc event-types --help for more details)", true);
}
