import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as uuid from "uuid";
import { retry } from "../..";
import { MindSphereSdk, TenantManagementModels } from "../../api/sdk";
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

export default (program: Command) => {
    program
        .command("subtenants")
        .alias("st")
        .option("-m, --mode [list|create|delete|template | info]", "list | create | delete | template | info", "list")
        .option("-f, --file <file>", ".mdsp.json file with subtenant definition")
        .option("-n, --subtenant <subtenant>", "the subtenant name")
        .option("-i, --subtenantid <subtenantid>", "the subtenant id")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete subtenants *"))
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
                            await listSubTenants(sdk, options);
                            break;

                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "delete":
                            await deleteSubtenant(options, sdk);
                            break;

                        case "create":
                            await createSubtenant(options, sdk);
                            break;

                        case "info":
                            await subtenantInfo(options, sdk);
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
            log(`    mdsp subtenants --mode list \t\t\t\t\tlist all subtenants`);
            log(`    mdsp subtenants --mode template --subtenant <subtenant> \tcreate a template file for <subtenant>`);
            log(`    mdsp subtenants --mode create --file <subtenant> \t\tcreate subtenant `);
            log(`    mdsp subtenants --mode info --subtenantid <subtenantid> \tsubtenant info for specified id`);
            log(`    mdsp subtenants --mode delete --subtenantid <subtenantid> \tdelete subtenant with specified id`);

            serviceCredentialLog();
        });
};

async function createSubtenant(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const subtenant = JSON.parse(file.toString());
    const result = await sdk.GetTenantManagementClient().PostSubtenant(subtenant);
    console.log(`creted subtenant Id: ${color(result.id)} displayname: ${color(result.displayName)}`);
}

function createTemplate(options: any) {
    const subTenant = {
        id: uuid.v4().toString(),
        displayName: `${options.subtenant}`,
        description: `${options.subtenant} created on ${new Date().toISOString()} with MindSphere CLI`,
    };

    verboseLog(subTenant, options.verbose);
    writesubtenantToFile(options, subTenant);
}

function writesubtenantToFile(options: any, subtenant: any) {
    const fileName = options.file || `${options.subtenant}.subtenant.mdsp.json`;
    fs.writeFileSync(fileName, JSON.stringify(subtenant, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmdsp subtenants --mode create --file ${fileName} \n\nto create the subtenant`
    );
}

async function deleteSubtenant(options: any, sdk: MindSphereSdk) {
    const id = options.subtenantid;
    await sdk.GetTenantManagementClient().DeleteSubtenant(id);
    console.log(`subtenant with id ${color(id)} deleted.`);
}

async function listSubTenants(sdk: MindSphereSdk, options: any) {
    const tenantManagement = sdk.GetTenantManagementClient();
    let subtenantCount = 0;

    const subtenants = (await retry(options.retry, () =>
        tenantManagement.GetSubtenants()
    )) as TenantManagementModels.PageSubtenantResource;

    console.log(`id  ${color("displayName")} description`);
    (subtenants.content || []).forEach((element) => {
        console.log(`${element.id}  ${color(element.displayName)} ${element.description}`);
        subtenantCount++;
    });

    console.log(`${color(subtenantCount)} subtenants listed.\n`);
}

async function subtenantInfo(options: any, sdk: MindSphereSdk) {
    const subtenant = await sdk.GetTenantManagementClient().GetSubtenant(options.subtenantid);
    verboseLog(JSON.stringify(subtenant, null, 2), options.verbose);
    console.log(`Subtenant Id: ${subtenant.id}`);
    console.log(`Display Name: ${color(subtenant.displayName)}`);
    console.log(`Description: ${subtenant.description}`);
    console.log(`ETag: ${subtenant.ETag}`);
    console.log(`EntityId: ${subtenant.entityId}`);
    console.log("Asset Manager:");
    console.log(
        "\t" +
            color(
                `${sdk
                    .GetGateway()
                    .replace("gateway", sdk.GetTenant() + "-assetmanager")}/entity/${subtenant.entityId!}`
            )
    );
}

function checkRequiredParamaters(options: any) {
    options.mode === "template" &&
        !options.subtenant &&
        errorLog(
            "you have to provide subtenant to create a template (see mdsp subtenants --help for more details)",
            true
        );

    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with subtenant definition to create an subtenant (see mdsp subtenants --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.subtenantid &&
        errorLog("you have to provide the subtenantid to delete (see mdsp subtenants --help for more details)", true);

    options.mode === "info" &&
        !options.subtenantid &&
        errorLog("you have to provide the subtenantid (see mdsp subtenants --help for more details)", true);
}
