import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import { MindSphereSdk, ResourceAccessManagementModels } from "../../api/sdk";
import { retry, throwError } from "../../api/utils";
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
import path = require("path");

let color = getColor("magenta");
const green = getColor("green");
const red = getColor("red");

export default (program: Command) => {
    program
        .command("policy")
        .alias("po")
        .option(
            "-m, --mode [list|create|update|delete|template|info]",
            "list | create | update | delete | template | info",
            "list"
        )
        .option("-f, --file <file>", ".mdsp.json file with policy definition", "policy.mdsp.json")
        .option("-n, --policy <policy>", "the policy name")
        .option("-i, --policyid <policyid>", "the policy id")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete policies *"))
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
                            await listPolicies(sdk, options);
                            break;

                        case "template":
                            createTemplate(options, sdk.GetTenant());
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "delete":
                            await deletePolicy(options, sdk);
                            break;

                        case "update":
                            await updatePolicy(options, sdk);
                            break;

                        case "create":
                            await createPolicy(options, sdk);
                            break;

                        case "info":
                            await policyInfo(options, sdk);
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
            log(`    mdsp policy --mode list \t\t\t\tlist all policies`);
            log(`    mdsp policy --mode template --policy <policy> \tcreate a template file for <policy>`);
            log(`    mdsp policy --mode create --file <policy> \t\tcreate policy `);
            log(`    mdsp policy --mode update --file <policy> --policyid <policyid> \t update policy `);
            log(`    mdsp policy --mode info --policyid <policyid> \tpolicy info for specified id`);
            log(`    mdsp policy --mode delete --policyid <policyid> \tdelete policy with specified id`);

            serviceCredentialLog();
        });
};

async function createPolicy(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const policy = JSON.parse(file.toString());
    const result = await sdk.GetResourceManagementClient().PostPolicy(policy);
    console.log(`creted policy Id: ${color(result.id)} displayname: ${color(result.name)}`);
}

async function updatePolicy(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const policy = JSON.parse(file.toString());
    const oldPolicy = await sdk.GetResourceManagementClient().GetPolicy(options.policyid);
    const result = await sdk
        .GetResourceManagementClient()
        .PutPolicy(options.policyid!, policy, { ifMatch: oldPolicy.eTag.toString() });
    console.log(`updated policy Id: ${color(result.id)} displayname: ${color(result.name)}`);
}

function createTemplate(options: any, tenant: string) {
    const policy = {
        name: "Policy",
        description: "Created with MindSphere CLI",
        active: true,
        subjects: [`mdsp:core:identitymanagement:eu1:${tenant}:user:test@example.com`],
        rules: [
            {
                name: "Rule1",
                comment:
                    "see https://developer.mindsphere.io/apis/core-resourceaccessmanagement/api-resourceaccessmanagement-actions-list.html for actions",
                actions: ["mdsp:core:assetmanagement:asset:read"],

                resources: [`mdsp:core:assetmanagement:eu1:${tenant}:asset:dfb0d2961a224a259c44d8c3f76204fe`],
                propagationDepth: -1,
            },
        ],
    };

    verboseLog(policy, options.verbose);
    writepolicyToFile(options, policy);
}

function writepolicyToFile(options: any, policy: any) {
    const fileName = options.file || `policy.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(fileName, JSON.stringify(policy, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmdsp policy --mode create --file ${fileName} \n\nto create the policy`
    );
}

async function deletePolicy(options: any, sdk: MindSphereSdk) {
    const id = options.policyid;
    await retry(options.retry, () => sdk.GetResourceManagementClient().DeletePolicy(id));
    console.log(`policy with id ${color(id)} deleted.`);
}

async function listPolicies(sdk: MindSphereSdk, options: any) {
    const policies = [];
    let startIndex = 0;
    let count = 500;
    let policyPage;

    do {
        policyPage = await retry(options.retry, () =>
            sdk.GetResourceManagementClient().GetPolicies({ page: startIndex, size: count })
        );
        policies.push(...policyPage.policies!);
        startIndex += count;
    } while (startIndex < (policyPage.page?.totalElements || 1));

    policies.forEach((policy: ResourceAccessManagementModels.PolicyResponse) => {
        console.log(
            `${color(policy.id)} ${color(policy.name)} [${policy.eTag}] ${
                policy.active ? green("active") : red("inactive")
            }`
        );
    });

    console.log(`${color(policies.length)} policies listed.\n`);
}

async function policyInfo(options: any, sdk: MindSphereSdk) {
    const policy = (await retry(options.retry, () =>
        sdk.GetResourceManagementClient().GetPolicy(options.policyid)
    )) as ResourceAccessManagementModels.PolicyResponse;
    verboseLog(JSON.stringify(policy, null, 2), options.verbose);

    printObjectInfo("Policy", policy, options, ["owner", "id", "active"], color);
}

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with policy definition to create an policy (see mdsp policy --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.policyid &&
        errorLog("you have to provide the policyid to delete (see mdsp policy --help for more details)", true);

    options.mode === "delete" &&
        !options.policyid &&
        errorLog("you have to provide the policyid to delete (see mdsp policy --help for more details)", true);

    options.mode === "info" &&
        !options.policyid &&
        errorLog("you have to provide the policyid (see mdsp policy --help for more details)", true);
}
