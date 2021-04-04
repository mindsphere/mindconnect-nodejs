import { CommanderStatic } from "commander";
import { log } from "console";
import { verboseLog } from "../../../dist/src/cli/commands/command-utils";
import { TenantManagementModels } from "../../api/sdk";
import { retry } from "../../api/utils";
import { adjustColor, errorLog, getColor, getSdk, homeDirLog, proxyLog, serviceCredentialLog } from "./command-utils";

let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("tenant-info")
        .alias("ti")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`get infos about current tenant *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

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
                    } catch {
                        console.log("\tNo logo found");
                    }

                    console.log("Regions:");
                    for (const x of tenantLegalConfig.regions) {
                        console.log(
                            `\t${color(x.regionId)} ${x.regionName} - Countries: ${JSON.stringify(x.regionCountries)}`
                        );

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
                    console.log(
                        color(`\t${sdk.GetGateway().replace("gateway", sdk.GetTenant() + "-settings")}/provider/`)
                    );
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc tenant-info \tprints out the tenant info`);
            serviceCredentialLog();
        });
};

function checkRequiredParameters(options: any) {}
