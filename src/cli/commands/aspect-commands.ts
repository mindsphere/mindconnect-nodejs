import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import { retry } from "../..";
import { MindSphereSdk } from "../../api/sdk";
import { AssetManagementModels } from "../../api/sdk/asset/asset-models";
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

const trimLeft = (str: string, charlist: string) => {
    if (charlist === undefined) charlist = "s";
    return str.replace(new RegExp("^[" + charlist + "]+"), "");
};

interface JSONSchemaProperty {
    type: string;
    format?: string;
    unit?: string;
    default?: number | string;
    target?: string | string[];
}

function getLength(dataType: string, options: any) {
    if (dataType === "STRING") return parseInt(options.length);
    if (dataType === "BIG_STRING") return parseInt(options.biglength);
    return null;
}

function toMindSphereDataType(schemaProperty: JSONSchemaProperty, options: any): string {
    let result = undefined;
    verboseLog(JSON.stringify(schemaProperty), options.verbose);
    if (!schemaProperty.type) {
        console.log("Invalid property in Schema");
        console.log(JSON.stringify(schemaProperty));
    }

    switch (schemaProperty.type.toLowerCase()) {
        case "integer":
            result = "INT";
            break;
        case "number":
            result = "DOUBLE";
            break;
        case "boolean":
            result = "BOOLEAN";
            break;
        case "array":
            result = "BIG_STRING";
            break;
        case "string":
            result = schemaProperty.format === "date-time" ? "TIMESTAMP" : "STRING";
            break;
        default:
            throw new Error(`Unsupported Type ${JSON.stringify(schemaProperty)}`);
    }

    return result;
}

interface JSONSchema {
    properties: object;
    [index: string]: any;
}

export default (program: CommanderStatic) => {
    program
        .command("aspects")
        .alias("as")
        .option(
            "-m, --mode [list|create|delete|convert|template|info]",
            "list | create | delete | convert | template | info",
            "list"
        )
        .option("-f, --file <file>", ".mdsp.json file with aspect type definition")
        .option("-s, --schema <schema>", "JSON Schema")
        .option("-n, --aspect <aspect>", "the aspect type name")
        .option("-p, --prefixflattened", "prefix variable names with previous name when flattening schema")
        .option("-t, --targetonly", "consider only variables which have target equal to aspect in schema")
        .option("-u, --untargeted", "consider only variables which don't have target in schema")
        .option("-l, --length <length>", "default string length", "255")
        .option("-b, --biglength <biglength>", "default bigstring length", "5000")
        .option("-i, --idonly", "list only ids")
        .option("-c, --includeshared", "include shared aspect types")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete aspects *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParamaters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    switch (options.mode) {
                        case "convert":
                            const aspectType = convertAspectType(options);
                            verboseLog(aspectType, options.verbose);
                            writeAspectTypeToFile(options, aspectType);
                            break;

                        case "list":
                            await listAspectTypes(sdk, options);
                            break;

                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to mindsphere.");
                            break;
                        case "delete":
                            await deleteAspectType(options, sdk);
                            break;

                        case "create":
                            await createAspectType(options, sdk);
                            break;

                        case "info":
                            await aspectTypeInfo(options, sdk);
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
            log(`    mc aspects --mode list \t\t\t\t\t list all aspect types`);
            log(
                `    mc aspects --mode list --aspect Environment\t\t list all aspect types which are named Environment`
            );
            log(
                `    mc aspects --mode template --aspect Environment \n\tcreate a template file (Enironment.aspect.mdsp.json) for aspect Environment`
            );
            log(
                `    mc aspects --mode create --file Environment.aspects.mdsp.json \n\tcreate aspect type Environment in MindSphere`
            );
            log(
                `    mc aspects --mode convert --schema Environment.schema.json --aspect Environment \n\t create a template file for aspect type Environment from JSON schema`
            );
            log(
                `    mc aspects --mode convert --schema Environment.schema.json --aspect Environment --prefixflattened \n\t prefixes the variable names with parent object names (e.g. Environment_Temperature)`
            );
            log(
                `    mc aspects --mode convert --schema Environment.schema.json --aspect Environment --targetonly \n\t select only variables from json schema with target property equal to assettype`
            );

            serviceCredentialLog();
        });
};

async function createAspectType(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const aspect = JSON.parse(file.toString());
    const includeShared = options.includeshared;

    const name = aspect.name!.includes(".") ? aspect.name : `${sdk.GetTenant()}.${aspect.name}`;
    await sdk.GetAssetManagementClient().PutAspectType(name, aspect, { includeShared: includeShared });
    console.log(`creted aspect ${color(name)}`);
}

function createTemplate(options: any) {
    const templateType = {
        name: options.aspect,
        category: AssetManagementModels.AspectResource.CategoryEnum.Dynamic,
        scope: AssetManagementModels.AspectType.ScopeEnum.Private,
        description: "generated by MindSphere CLI",
        variables: [
            {
                name: "var1",
                dataType: "BOOLEAN",
                unit: ".",
                searchable: true,
                length: null,
                qualityCode: true,
            },
            {
                name: "var2",
                dataType: "INT",
                unit: ".",
                searchable: true,
                length: null,
                qualityCode: true,
            },
            {
                name: "var3",
                dataType: "DOUBLE",
                unit: ".",
                searchable: true,
                length: null,
                qualityCode: true,
            },
            {
                name: "var4",
                dataType: "STRING",
                unit: ".",
                searchable: true,
                length: 255,
                qualityCode: true,
            },
            {
                name: "var5",
                dataType: "BIG_STRING",
                unit: ".",
                searchable: true,
                length: 1000,
                qualityCode: true,
            },
            {
                name: "var6",
                dataType: "TIMESTAMP",
                unit: ".",
                searchable: true,
                length: null,
                qualityCode: true,
            },
        ],
    };
    verboseLog(templateType, options.verbose);
    writeAspectTypeToFile(options, templateType);
}

function writeAspectTypeToFile(
    options: any,
    aspectType: {
        name: any;
        category: AssetManagementModels.AspectResource.CategoryEnum;
        scope: AssetManagementModels.AspectType.ScopeEnum;
        description: any;
        variables: any[];
    }
) {
    const fileName = options.file || `${options.aspect}.aspect.mdsp.json`;
    fs.writeFileSync(fileName, JSON.stringify(aspectType, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc aspects --mode create --file ${fileName} \n\nto create the aspect`
    );
}

async function deleteAspectType(options: any, sdk: MindSphereSdk) {
    const includeShared = options.includeshared;
    const id = (options.aspect! as string).includes(".") ? options.aspect : `${sdk.GetTenant()}.${options.aspect}`;
    const aspType = await sdk.GetAssetManagementClient().GetAspectType(id, { includeShared: includeShared });
    await sdk.GetAssetManagementClient().DeleteAspectType(id, { ifMatch: aspType.etag!, includeShared: includeShared });
    console.log(`Aspect with id ${color(id)} deleted.`);
}

function convertAspectType(options: any) {
    const schemaPath = path.resolve(options.schema);
    const inputSchemaBuffer = fs.readFileSync(schemaPath).toString();
    const inputSchema = JSON.parse(inputSchemaBuffer) as JSONSchema;
    const variables: any[] = [];
    generateVariables("", inputSchema, options, variables);

    const aspectType = {
        name: options.aspect,
        category: AssetManagementModels.AspectResource.CategoryEnum.Dynamic,
        scope: AssetManagementModels.AspectType.ScopeEnum.Private,
        description: inputSchema.description || ("source:" + options.schema).substr(0, 100),
        variables: variables,
    };
    return aspectType;
}

async function listAspectTypes(sdk: MindSphereSdk, options: any) {
    const includeShared = options.includeshared;
    const assetMgmt = sdk.GetAssetManagementClient();

    let page = 0;
    let aspects;

    const filter = buildFilter(options);
    verboseLog(JSON.stringify(filter, null, 2), options.verbose);

    !options.idonly && console.log(`id  etag  type variables name\tsharing`);

    let assetCount = 0;

    do {
        aspects = (await retry(options.retry, () =>
            assetMgmt.GetAspectTypes({
                page: page,
                size: 100,
                filter: Object.keys(filter).length === 0 ? undefined : JSON.stringify(filter),
                sort: "id,asc",
                includeShared: includeShared,
            })
        )) as AssetManagementModels.AspectTypeListResource;

        aspects._embedded = aspects._embedded || { aspectTypes: [] };

        aspects.page = aspects.page || { totalPages: 0 };

        for (const aspect of aspects._embedded.aspectTypes || []) {
            assetCount++;
            !options.idonly &&
                console.log(
                    `${aspect.id}\t${aspect.etag} ${aspect.category} [${aspect.variables.length}]\t${color(
                        aspect.name
                    )}\t${aspect.sharing?.modes}`
                );

            options.idonly && console.log(`${aspect.id}`);
            verboseLog(JSON.stringify(aspect, null, 2), options.verbose);
        }
    } while (page++ < (aspects.page.totalPages || 0));

    console.log(`${color(assetCount)} aspects listed.\n`);
}

function buildFilter(options: any) {
    const filter = (options.filter && JSON.parse(options.filter)) || {};
    let pointer = filter;
    if (options.aspect !== undefined) {
        filter.and = {};
        pointer = filter.and;
    }
    if (options.aspect) {
        pointer.id = { contains: `${options.aspect}` };
    }
    if (options.typeid) {
        pointer.id = { contains: `${options.typeid}` };
    }
    return filter;
}

function generateVariables(prefix: string, inputSchema: JSONSchema, options: any, variables: Array<any>) {
    for (const key in inputSchema.properties!) {
        const obj = (inputSchema.properties! as any)[key]! as JSONSchemaProperty;
        if (obj.type !== "object") {
            const type = toMindSphereDataType(obj, options);

            // helper to deal with targets being string or string[]
            const isTarget = (aspect: any, target?: string | string[]) => {
                if (!target) {
                    return false;
                } else {
                    const targets: string[] = target instanceof Array ? target : [target];
                    return targets.includes(aspect);
                }
            };

            // only targeted properties
            if (options.targetonly && !isTarget(options.aspect, obj.target)) continue;
            if (options.untargeted && isTarget(options.aspect, obj.target)) continue;

            let name = options.prefixflattened ? `${prefix}_${key}` : key;

            const originalName = name;
            name = name.replace(" ", "_");
            name = name.replace("-", "_");
            name = name.replace(/[\W_]/g, "_");
            name = name.trim();
            name = trimLeft(name, "_");
            if (name !== originalName) {
                console.log(`replaced ${originalName} with ${name}`);
            }
            const variable = {
                name: name,
                dataType: type,
                unit: obj.unit || ".",
                searchable: type !== "BIG_STRING",
                length: getLength(type, options),
                qualityCode: true,
            };

            variables.push(variable);
        } else {
            generateVariables(
                options.prefixflattened ? `${prefix}_${key}` : "",
                (obj as unknown) as JSONSchema,
                options,
                variables
            );
        }
    }
}

async function aspectTypeInfo(options: any, sdk: MindSphereSdk) {
    const includeShared = options.includeshared;
    const id = (options.aspect! as string).includes(".") ? options.aspect : `${sdk.GetTenant()}.${options.aspect}`;
    const aspType = await sdk.GetAssetManagementClient().GetAspectType(id, { includeShared: includeShared });
    console.log(JSON.stringify(aspType, null, 2));
}

function checkRequiredParamaters(options: any) {
    options.mode === "template" &&
        !options.aspect &&
        errorLog("you have to provide aspect type to create a template (see mc aspects --help for more details)", true);

    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with aspect type to create an aspect type (see mc aspects --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.aspect &&
        errorLog("you have to provide the aspect type to delete (see mc aspects --help for more details)", true);
    options.mode === "convert" &&
        !options.schema &&
        errorLog("you have to provide the json schema to convert (see mc aspects --help for more details)", true);
    options.mode === "convert" &&
        !options.aspect &&
        errorLog("you have to provide the aspect name for the schema (see mc aspects --help for more details)", true);
}
