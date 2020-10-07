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

export default (program: CommanderStatic) => {
    program
        .command("asset-types")
        .alias("at")
        .option("-m, --mode [list|create|delete|template]", "list | create | delete | template", "list")
        .option("-f, --file <file>", ".mdsp.json file with asset type definition")
        .option("-i, --idonly", "list only ids")
        .option("-s, --schema <schema>", "JSON Schema")
        .option("-n, --assettype <assettype>", "the asset type name")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete asset types in mindsphere *"))
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
                            await listAssetTypes(sdk, options);
                            break;

                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "delete":
                            await deleteAssetType(options, sdk);
                            break;

                        case "create":
                            await createAssetType(options, sdk);
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
            log(`    mc asset-types --mode list \t\t\t\t\t list all assettype types`);
            log(`    mc asset-types --mode list --assettype Pump\t\t list all assettype types which are named Pump`);
            log(
                `    mc asset-types --mode template --assettype Pump \n\tcreate a template file (Enironment.assettype.mdsp.json) for assettype Pump`
            );
            log(
                `    mc asset-types --mode create --file Pump.assettypes.mdsp.json \n\tcreate asset type Pump in MindSphere`
            );

            serviceCredentialLog();
        });
};

async function createAssetType(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const assettype = JSON.parse(file.toString());

    const name = assettype.name!.includes(".") ? assettype.name : `${sdk.GetTenant()}.${assettype.name}`;
    await sdk.GetAssetManagementClient().PutAssetType(name, assettype);
    console.log(`creted asset type ${color(name)}`);
}

function createTemplate(options: any) {
    const templateType = {
        name: options.assettype,
        description: "",
        parentTypeId: "core.basicasset",
        instantiable: true,
        scope: "private",
        aspects: [
            {
                name: "leftWing",
                aspectTypeId: "mdsp.wing",
            },
        ],
        variables: [
            {
                name: "temperature",
                dataType: "STRING",
                unit: "C/F",
                searchable: true,
                length: 5,
                defaultValue: "25/77",
            },
        ],
        fileAssignments: [
            {
                key: "logo_small",
                fileId: "c27a28b6eb16b507fabc11e75da8b4ce",
            },
        ],
    };
    verboseLog(templateType, options.verbose);
    writeAssetTypeToFile(options, templateType);
}

function writeAssetTypeToFile(options: any, AssetType: any) {
    const fileName = `${options.assettype}.assettype.mdsp.json`;
    fs.writeFileSync(fileName, JSON.stringify(AssetType, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc asset-types --mode create --file ${fileName} \n\nto create the asset type`
    );
}

async function deleteAssetType(options: any, sdk: MindSphereSdk) {
    const id = (options.assettype! as string).includes(".")
        ? options.assettype
        : `${sdk.GetTenant()}.${options.assettype}`;
    const aspType = await sdk.GetAssetManagementClient().GetAssetType(id);
    await sdk.GetAssetManagementClient().DeleteAssetType(id, { ifMatch: aspType.etag! });
    console.log(`assettype with id ${color(id)} deleted.`);
}

async function listAssetTypes(sdk: MindSphereSdk, options: any) {
    const assetMgmt = sdk.GetAssetManagementClient();

    let page = 0;
    let assettypes;

    const filter = buildFilter(options);
    verboseLog(JSON.stringify(filter, null, 2), options.verbose);

    !options.idonly && console.log(`id  etag aspects name`);

    let assetCount = 0;

    do {
        assettypes = (await retry(options.retry, () =>
            assetMgmt.GetAssetTypes({
                page: page,
                size: 100,
                filter: Object.keys(filter).length === 0 ? undefined : JSON.stringify(filter),
                sort: "name,asc",
            })
        )) as AssetManagementModels.AssetTypeListResource;

        assettypes._embedded = assettypes._embedded || { assetTypes: [] };

        assettypes.page = assettypes.page || { totalPages: 0 };

        for (const assettype of assettypes._embedded.assetTypes || []) {
            assetCount++;
            !options.idonly &&
                console.log(
                    `${assettype.id}\t${assettype.etag} aspects[${assettype.aspects?.length}]\t${color(assettype.name)}`
                );

            options.idonly && console.log(`${assettype.id}`);

            verboseLog(JSON.stringify(assettype, null, 2), options.verbose);
        }
    } while (page++ < (assettypes.page.totalPages || 0));

    console.log(`${color(assetCount)} asset types listed.\n`);
}

function buildFilter(options: any) {
    const filter = (options.filter && JSON.parse(options.filter)) || {};
    let pointer = filter;
    if (options.assettype !== undefined) {
        filter.and = {};
        pointer = filter.and;
    }
    if (options.assettype) {
        pointer.id = { contains: `${options.assettype}` };
    }
    if (options.typeid) {
        pointer.id = { contains: `${options.typeid}` };
    }
    return filter;
}

function checkRequiredParamaters(options: any) {
    options.mode === "template" &&
        !options.assettype &&
        errorLog(
            "you have to provide asset type to create a template (see mc asset-types --help for more details)",
            true
        );

    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with asset type to create an asset type (see mc asset-types --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.assettype &&
        errorLog("you have to provide the asset type to delete (see mc asset-types --help for more details)", true);
}
