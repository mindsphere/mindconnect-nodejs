import { CommanderStatic } from "commander";
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

export default (program: CommanderStatic) => {
    program
        .command("sdi-data-queries")
        .alias("sdq")
        .option(
            "-m, --mode [list|create|update|template|info|delete|latest]",
            "list | create | update | template | info | delete | latest",
            "list"
        )
        .option("-d, --query <query>", "data query file with definition for --mode create or update command")
        .option("-i, --queryid <queryid>", "the query id for --mode info, update or delete command")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-r, --result <result>", "result file for --mode latest", "sdi.query.latest.mdsp.json")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("manage data queries for SDI *"))
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
                            await listDataQueries(sdk, options);
                            break;

                        case "info":
                            await queryInfo(sdk, options);
                            break;

                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "update":
                            await updateQuery(options, sdk);
                            break;
                        case "create":
                            await createQuery(options, sdk);
                            break;

                        case "delete":
                            await deleteQuery(options, sdk);
                            break;

                        case "latest":
                            await queryResults(options, sdk);
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
            log(`    mc sdi-data-queries --mode list \t\t list all sdi dataqueries`);
            log(`    mc sdi-data-queries --mode template \t create template file`);
            log(`    mc sdi-data-queries --mode create --query <queryfile> \t create sdi data query`);
            log(`    mc sdi-data-queries --mode update --query <queryfile> --queryid <queryid> \
                                                                                             \t\t update sdi data query`);
            log(`    mc sdi-data-queries --mode info --queryid <queryid>   \t\t get sdi data query info`);
            log(`    mc sdi-data-queries --mode latest --queryid <queryid>   \t\t get latest query results`);
            log(`    mc sdi-data-queries --mode delete --queryid <queryid> \t\t delete sdi data query`);

            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.query &&
        errorLog(
            "you have to provide a query template file to create a sdi query (see mc sdi-data-queries --help for more details)",
            true
        );

    options.mode === "update" &&
        !options.queryid &&
        errorLog(
            "you have to provide the queryid of the query you want to update (see mc sdi-data-queries --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.queryid &&
        errorLog(
            "you have to provide the queryid to get infos about the sdi data query (see mc sdi-data-queries --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.queryid &&
        errorLog(
            "you have to provide the queryid to delete the sdi data query (see mc sdi-data-queries --help for more details)",
            true
        );
}

async function listDataQueries(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    let pageToken = undefined;
    let count = 0;
    console.log(`${color("id")}  ${"name"}  ${"description"} `);
    do {
        const queries: SemanticDataInterconnectModels.ResponseAllDataSQLQuery = await sdiClient.GetQueries({
            pageToken: pageToken,
        });
        queries.queries?.forEach((query) => {
            console.log(`${color(query.id)}  ${query.name}  ${query.description} `);
            verboseLog(JSON.stringify(query, null, 2), options.verbose);
            count++;
        });
        pageToken = queries.page?.nextToken;
    } while (pageToken);
    console.log(`${color(count)} sdi data queries listed.`);
}

async function queryInfo(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    const query = await sdiClient.GetQuery(`${options.queryid}`);
    printQueryInfos(query, options);
}

function printQueryInfos(query: object, options: any) {
    printObjectInfo("Data Query:", query, options, ["id", "sqlStatement"], color);
}

function createTemplate(options: any) {
    const templateType = {
        description: "<enter description>",
        isBusinessQuery: true,
        ontologyId: "<enter ontology id>",
        isDynamic: true,
        name: "<enter name>",
        sqlStatement:
            "base 64 encoded spark sql query statement: example U0VMRUNUIHZlaGljbGUudmluLCBtYWtlLmRlZiBGUk9NIHZlaGljbGUsIG1ha2UgV0hFUkUgdmVoaWNsZS5tYWtlID0gbWFrZS5pZA==",
    };
    verboseLog(JSON.stringify(templateType, null, 2), options.verbose);
    writeToFile(options, templateType);
}

function writeToFile(options: any, query: any) {
    const fileName = options.file || `sdi.query.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(query, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc sdi-data-queries --mode create --query ${fileName} \n\nto create the sdi data query`
    );
}
async function createQuery(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.query);
    const file = fs.readFileSync(filePath);
    const query = JSON.parse(file.toString());

    const result = await sdk.GetSemanticDataInterConnectClient().PostQuery(query);
    printQueryInfos(result, options);
}

async function updateQuery(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.query);
    const file = fs.readFileSync(filePath);
    const query = JSON.parse(file.toString());

    const result = await sdk.GetSemanticDataInterConnectClient().PatchQuery(`${options.queryid}`, query);
    printQueryInfos(result, options);
}
async function deleteQuery(options: any, sdk: MindSphereSdk) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();
    await sdiClient.DeleteQuery(`${options.queryid}`);
    console.log(`The sdi data query with id : ${color(options.queryid)} was deleted.`);
}

async function queryResults(options: any, sdk: MindSphereSdk) {
    const fileName = options.results || `sdi.query.latest.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);
    const sdiClient = sdk.GetSemanticDataInterConnectClient();
    const result = await sdiClient.GetQueryExecutionJobLatestResults(`${options.queryid}`);
    verboseLog(JSON.stringify(result, null, 2), options.verbose);

    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
    console.log(`The result data was written into ${color(fileName)}.`);
}
