import { Command } from "commander";
import { log } from "console";
import { MindSphereSdk, SemanticDataInterconnectModels } from "../../api/sdk";
import { throwError } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    printObjectInfo,
    proxyLog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";
import fs = require("fs");
import path = require("path");

let color = getColor("magenta");

export default (program: Command) => {
    program
        .command("sdi-search-schemas")
        .alias("sds")
        .option("-m, --mode [template|search]", "search | template", "search")
        .option(
            "-s, --searchrequest <searchrequest>",
            "search request for --search command",
            "sdi.searchrequest.mdsp.json"
        )
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("search SDI schemas *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    switch (options.mode) {
                        case "search":
                            await searchSchemas(sdk, options);
                            break;
                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to MindSphere.");
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
            log(`    mc sdi-search-schemas --mode template \t create template file`);
            log(
                `    mc sdi-search-schemas --mode search --searchrequest <searchrequestfile> \t search for sdi schemas`
            );
            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    options.mode === "search" &&
        !options.searchrequest &&
        errorLog(
            "you have to provide a searchrequest file to search the SDI schemas (see mc sdi-search-schemas --help for more details)",
            true
        );
}

async function searchSchemas(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    const searchFilePath = path.resolve(options.searchrequest);
    const searchData = fs.readFileSync(searchFilePath);
    const searchRequest = JSON.parse(searchData.toString());

    let pageToken = undefined;
    let count = 0;
    do {
        const schemas: SemanticDataInterconnectModels.ListOfSchemaRegistry = await sdiClient.SearchSchemas(
            searchRequest
        );

        schemas.schemas?.forEach((schema) => {
            printObjectInfo(
                `Schema Properties for ${color(schema.schemaName)}:\n`,
                schema || {},
                options,
                ["id", "registryId", "category"],
                color
            );
            console.log("\n");
            count++;
        });
        pageToken = schemas.page?.nextToken;
    } while (pageToken);
    console.log(`${color(count)} sdi schemas listed.`);
}

function createTemplate(options: any) {
    const templateType = {
        schemas: [
            {
                dataTag: "string",
                schemaName: "string",
                category: "ENTERPRISE",
                aspectName: "string",
                assetId: "string",
                sourceName: "string",
                metaDataTags: ["teamcenter"],
            },
        ],
    };

    verboseLog(JSON.stringify(templateType, null, 2), options.verbose);
    writeToFile(options, templateType);
}

function writeToFile(options: any, schema: any) {
    const fileName = options.file || `sdi.searchrequest.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(schema, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc sdi-search-schemas --mode search --searchrequest ${fileName} \n\nto search the schemas`
    );
}
