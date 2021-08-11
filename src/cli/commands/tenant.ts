import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as path from "path";
import * as uuid from "uuid";
import { MindSphereSdk, TenantManagementModels } from "../../api/sdk";
import { retry } from "../../api/utils";
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

const mime = require("mime-types");

let color = getColor("magenta");

export default (program: Command) => {
    program
        .command("tenant")
        .alias("ti")
        .option(
            "-m, --mode [info|create|delete|upload|template]",
            "mode [info | create | delete | upload | template]",
            "info"
        )
        .option("-f, --file <file>", ".mdsp.json file with legal configuration or logo")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`create or delete tenant legal configuration and logo *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    switch (options.mode) {
                        case "info":
                            await tenantInfo(sdk, options);
                            break;
                        case "upload":
                            await uploadFile(sdk, options);
                            break;
                        case "create":
                            await createLegal(sdk, options);
                            break;
                        case "template":
                            writeTemplate(sdk, options);
                            break;
                        case "delete":
                            deleteLegal(sdk, options);
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
            log(`    mc tenant \t\t\t\t\t prints out the tenant information`);
            log(`    mc tenant --mode info \t\t\t prints out the tenant information`);
            log(`    mc tenant --mode template \t\t\t creates template file with legal configuration`);
            log(`    mc tenant --mode delete \t\t\t deletes legal configuration`);
            log(`    mc tenant --mode create --file <filename> \t creates legal configuration`);
            log(`    mc tenant --mode upload --file <filename> \t uploads the company logo`);
            serviceCredentialLog();
        });
};

async function uploadFile(sdk: MindSphereSdk, options: any) {
    const tenantManagement = sdk.GetTenantManagementClient();

    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const mimeType = mime.lookup(options.file);

    await tenantManagement.PostTenantInfoLogo(file, path.basename(filePath), mimeType);

    console.log("File successfully uploaded.");
    console.log(
        `Logo: ${color(
            sdk.GetGateway().replace("gateway", sdk.GetTenant()) + "/api/tenantmanagement/v4/tenantInfo/logo"
        )}`
    );
}

async function deleteLegal(sdk: MindSphereSdk, options: any) {
    const tenantManagement = sdk.GetTenantManagementClient();
    await tenantManagement.DeleteLegalConfigRegions();
    console.log("Legal configuration successfully deleted.");
    console.log("Settings application (not available in start for free tenants):");
    console.log(color(`\t${sdk.GetGateway().replace("gateway", sdk.GetTenant() + "-settings")}/provider/`));
}

async function createLegal(sdk: MindSphereSdk, options: any) {
    const tenantManagement = sdk.GetTenantManagementClient();

    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const fileAsJson = JSON.parse(file.toString()) as TenantManagementModels.LegalConfiguration;

    await tenantManagement.PostLegalConfigRegions(fileAsJson);

    console.log("Legal configuration successfully created.");
    console.log("Settings application (not available in start for free tenants):");
    console.log(color(`\t${sdk.GetGateway().replace("gateway", sdk.GetTenant() + "-settings")}/provider/`));
}

function writeTemplate(sdk: MindSphereSdk, options: any) {
    const fileName = options.file || `${sdk.GetTenant()}.tenant.mdsp.json`;

    fs.writeFileSync(fileName, JSON.stringify(createTemplate(), null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmc tenant --mode create --file ${fileName} \n\nto create the legal information of the tenant`
    );
}

async function tenantInfo(sdk: MindSphereSdk, options: any) {
    const tenantManagement = sdk.GetTenantManagementClient();

    const tenantInfo = (await retry(options.retry, () =>
        tenantManagement.GetTenantInfo()
    )) as TenantManagementModels.TenantInfo;

    console.log("Tenant Info:");
    console.log(`\tName: ${color(tenantInfo.name)}`);
    console.log(`\tPrefix: ${tenantInfo.prefix}`);
    console.log(`\tDisplay Name: ${tenantInfo.displayName}`);
    console.log(`\tCountry: ${tenantInfo.country}`);
    console.log(`\tType: ${color(tenantInfo.type)}`);
    console.log(`\tCompany Name: ${color(tenantInfo.companyName)}`);
    console.log(`\tAllowed to create subtenants: ${color(tenantInfo.allowedToCreateSubtenant)}`);

    verboseLog(JSON.stringify(tenantInfo, null, 2), options.verbose);

    const tenantLegalConfig = (await retry(options.retry, () =>
        tenantManagement.GetLegalConfigRegions()
    )) as TenantManagementModels.LegalConfiguration;

    console.log("Logo:");

    try {
        const logoMetaData = await tenantManagement.GetTenantInfoLogoMetaData();
        console.log(`\tName: ${color(logoMetaData.name)}`);
        console.log(`\tSize: ${logoMetaData.size}`);
        console.log(
            `\tURL: ${color(
                sdk.GetGateway().replace("gateway", sdk.GetTenant()) + "/api/tenantmanagement/v4/tenantInfo/logo"
            )}`
        );
    } catch {
        console.log("\tNo logo found");
    }

    console.log("Regions:");
    for (const x of tenantLegalConfig.regions) {
        console.log(`\t${color(x.regionId)} ${x.regionName} - Countries: ${JSON.stringify(x.regionCountries)}`);

        console.log("Links:");
        x.links?.forEach((link) => {
            for (const language of Object.keys(link.languages)) {
                console.log(
                    `\t[${link.type}] [${language}] ${link.languages[language].name} -> ${color(
                        link.languages[language].value
                    )}`
                );
            }
        });
    }

    verboseLog(JSON.stringify(tenantLegalConfig, null, 2), options.verbose);

    console.log("Settings application (not available in start for free tenants):");
    console.log(color(`\t${sdk.GetGateway().replace("gateway", sdk.GetTenant() + "-settings")}/provider/`));
}

function createTemplate() {
    return {
        regions: [
            {
                regionId: "global",
                regionName: "global",
                regionCountries: [],
                links: [
                    {
                        id: uuid.v4().toString(),
                        type: "www",
                        sorting: 1,
                        languages: {
                            default: {
                                name: "Connectivity Playground",
                                value: "https://playground.mindconnect.rocks",
                            },
                        },
                    },
                    {
                        id: uuid.v4().toString(),
                        type: "www",
                        sorting: 2,
                        languages: {
                            default: {
                                name: "Open Source Software",
                                value: "https://opensource.mindsphere.io",
                            },
                        },
                    },
                    {
                        id: "a785dd65-5470-4c1f-9e56-6a17ef73ceaf",
                        type: "www",
                        sorting: 3,
                        languages: {
                            default: {
                                name: "MindSphere GitHub",
                                value: "https://github.com/mindsphere/",
                            },
                        },
                    },
                ],
            },
        ],
    };
}

function checkRequiredParameters(options: any) {
    options.mode === "upload" &&
        !options.file &&
        errorLog("You have to specify the file to upload in --file parameter", true);
    options.mode === "create" &&
        !options.file &&
        errorLog("You have to specify the file with legal configuration in --file parameter", true);
}
