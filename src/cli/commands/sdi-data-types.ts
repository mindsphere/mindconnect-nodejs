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
const green = getColor("green");

export default (program: CommanderStatic) => {
    program
        .command("sdi-data-types")
        .alias("sdy")
        .option("-m, --mode [list|create|template|info|delete|addpatterns|suggest]", "command mode", "list")
        .option("-f, --for [datatype|pattern|suggest]", "parameter for --mode template", "datatype")
        .option("-d, --datatype <datatype>", "data type file with definition for --mode create or update command")
        .option("-p, --pattern <pattern>", "pattern file with definition for --mode addpatterns command")
        .option("-s, --samplevalues <samplevalues>", "file with sample values")
        .option("-t, --testvalues <templates>", "file with sample values")
        .option("-i, --datatypename <datatypename>", "the datatype id")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("manage data types for SDI *"))
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
                            await listDataTypes(sdk, options);
                            break;

                        case "info":
                            await dataTypeInfo(sdk, options);
                            break;

                        case "template": {
                            switch (options.for) {
                                case "datatype":
                                    createTemplate(options);
                                    break;
                                case "pattern":
                                    createPatternTemplate(options);
                                    break;
                                case "suggest":
                                    createSampleValues(options);
                                    break;

                                default:
                                    throwError(`${options.for} is not a valid option for template creation`);
                                    break;
                            }
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        }
                        case "create":
                            await createDataType(options, sdk);
                            break;

                        case "delete":
                            await deleteDataType(options, sdk);
                            break;

                        case "addpatterns":
                            await addPatterns(options, sdk);
                            break;

                        case "suggest":
                            await suggestPatterns(options, sdk);
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
            log(`    mc sdi-data-types --mode list \t\t\t\t list all sdi data types`);
            log(
                `    mc sdi-data-types --mode template --for datatype \t\t create template file for --mode create command`
            );
            log(
                `    mc sdi-data-types --mode template --for pattern \t\t create pattern file for --mode addpattern command`
            );
            log(
                `    mc sdi-data-types --mode template --for suggest \t\t create samples files for --mode suggest command`
            );
            log(`    mc sdi-data-types --mode create --datatype <datatypefile> \t create sdi data type`);
            log(`    mc sdi-data-types --mode info --datatypename <datatypename>   \t\t get sdi data type info`);
            log(`    mc sdi-data-types --mode delete --datatypename <datatypename> \t\t delete sdi data type`);
            log(`    mc sdi-data-types --mode suggest --samplevalues <samplesfile> --testvalues <testfile> \
                                                                             \t\t suggest patterns from sample data`);

            serviceCredentialLog();
        });
};

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.datatype &&
        errorLog(
            "you have to provide a datatype template file to create a sdi datatype (see mc sdi-data-types --help for more details)",
            true
        );

    options.mode === "addpatterns" &&
        !options.pattern &&
        errorLog(
            "you have to provide a pattern template file to add patterns to sdi datatype (see mc sdi-data-types --help for more details)",
            true
        );

    options.mode === "addpatterns" &&
        !options.datatypename &&
        errorLog(
            "you have to provide data type name to add patterns to sdi datatype (see mc sdi-data-types --help for more details)",
            true
        );

    options.mode === "info" &&
        !options.datatypename &&
        errorLog(
            "you have to provide the data type name to get infos about the sdi data type (see mc sdi-data-types --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.datatypename &&
        errorLog(
            "you have to provide the data type name to delete the sdi data type (see mc sdi-data-types --help for more details)",
            true
        );

    options.mode === "suggest" &&
        !options.samplevalues &&
        errorLog(
            "you have to provide the samplevalues for pattern suggestion (see mc sdi-data-types --help for more details)",
            true
        );

    options.mode === "suggest" &&
        !options.testvalues &&
        errorLog(
            "you have to provide the testvalues for pattern suggestion (see mc sdi-data-types --help for more details)",
            true
        );
}

async function listDataTypes(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    let pageToken = undefined;
    let count = 0;
    console.log(`${color("name")} ${"patterns"} `);
    do {
        const dataTypes: SemanticDataInterconnectModels.ListOfDataTypeDefinition = await sdiClient.GetDataTypes({
            pageToken: pageToken,
        });
        dataTypes.dataTypes?.forEach((type) => {
            console.log(`${color(type.name)}  ${type.patterns}`);
            verboseLog(JSON.stringify(type, null, 2), options.verbose);
            count++;
        });
        pageToken = dataTypes.page?.nextToken;
    } while (pageToken);
    console.log(`${color(count)} sdi data types listed.`);
}

async function dataTypeInfo(sdk: MindSphereSdk, options: any) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();

    const dataType = await sdiClient.GetDataType(`${options.datatypename}`);
    printDataTypeInfos(dataType, options);
}

function printDataTypeInfos(dataType: object, options: any) {
    printObjectInfo("SDI Data Type:", dataType, options, ["name"], color);
}

function createTemplate(options: any) {
    const templateType = {
        name: "VIN_NUMBER",
        patterns: ["[A-HJ-NPR-Z0-9]{17}"],
    };
    verboseLog(JSON.stringify(templateType, null, 2), options.verbose);
    options.datatype = options.datatype || `sdi.datatype.mdsp.json`;
    const fileName = writeToFile(options, templateType);
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc sdi-data-types --mode create --datatype ${fileName} \n\nto create the sdi data type`
    );
}

function createPatternTemplate(options: any) {
    const templateType = {
        patterns: ["[A-HJ-NPR-Z0-9]{17}"],
    };
    verboseLog(JSON.stringify(templateType, null, 2), options.verbose);
    options.datatype = options.datatype || `sdi.pattern.mdsp.json`;
    const fileName = writeToFile(options, templateType);
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc sdi-data-types --mode addpatterns --datatypename <name> --pattern ${fileName} \n\nto create the sdi data type`
    );
}

function createSampleValues(options: any) {
    const sampleData = ["Q-01234567891-ABC", "Q-01234567892-ABC", "Q-01234567893-ABC", "Q-01234567894-ABC"];
    verboseLog(JSON.stringify(sampleData, null, 2), options.verbose);
    options.datatype = options.samplevalues || `sdi.samplevalues.mdsp.json`;
    const fileNameSamples = writeToFile(options, sampleData);

    const testData = ["Q-01234567891-CBA", "Q-01234567892-CBA"];

    verboseLog(JSON.stringify(testData, null, 2), options.verbose);
    options.datatype = options.testvalues || `sdi.testvalues.mdsp.json`;
    const fileNameTest = writeToFile(options, sampleData);

    console.log(
        `The data was written into ${color(fileNameSamples)} and  ${color(
            fileNameTest
        )} run \n\n\tmc sdi-data-types --mode suggest --samplevalues ${fileNameSamples} --testvalues ${fileNameTest} \n\nto suggest patterns`
    );
}

function writeToFile(options: any, dataType: any): string {
    const fileName = options.datatype;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(filePath, JSON.stringify(dataType, null, 2));
    return fileName;
}
async function createDataType(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.datatype);
    const file = fs.readFileSync(filePath);
    const dataType = JSON.parse(file.toString());
    const result = await sdk.GetSemanticDataInterConnectClient().PostDataType(dataType);
    printDataTypeInfos(result, options);
}

async function addPatterns(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.pattern);
    const file = fs.readFileSync(filePath);
    const pattern = JSON.parse(file.toString());

    const result = await sdk.GetSemanticDataInterConnectClient().AddPatternToDataType(options.datatypename, pattern);
    printDataTypeInfos(result, options);
}

async function suggestPatterns(options: any, sdk: MindSphereSdk) {
    const samplesPath = path.resolve(options.samplevalues);
    const testPath = path.resolve(options.samplevalues);
    const samples = JSON.parse(fs.readFileSync(samplesPath).toString());
    const test = JSON.parse(fs.readFileSync(testPath).toString());

    const request = { sampleValues: samples, testValues: test };
    const result = await sdk.GetSemanticDataInterConnectClient().SuggestPatterns(request);
    verboseLog(JSON.stringify(result, null, 2), options.verbose);

    result.suggestPatterns?.forEach((x) => {
        const converted = `${(
            100 * (x.matches?.length ? x.matches.filter((x) => x === true.toString()).length / x.matches.length : 0)
        ).toFixed(2)} %`;

        console.log(`${converted === "100.00 %" ? green(converted) : " " + converted}\t${x.schema}`);
        verboseLog(JSON.stringify(x.matches), options.verbose);
    });
}

async function deleteDataType(options: any, sdk: MindSphereSdk) {
    const sdiClient = sdk.GetSemanticDataInterConnectClient();
    await sdiClient.DeleteDataType(`${options.datatypename}`);
    console.log(`The sdi data type with id : ${color(options.datatypename)} was deleted.`);
}
