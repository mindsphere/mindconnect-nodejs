import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import { CaseManagementModels, MindSphereSdk } from "../../api/sdk";
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

export default (program: Command) => {
    program
        .command("cases")
        .alias("cs")
        .option(
            "-m, --mode [list|create|update|delete|template|info]",
            "list | create | update | delete | template | info",
            "list"
        )
        .option("-f, --file <file>", ".mdsp.json file with case definition", "case.mdsp.json")
        .option("-n, --case <case>", "the case name")
        .option("-i, --handle <handle>", "the case handle")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("list, create or delete cases *"))
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
                            await listCases(sdk, options);
                            break;

                        case "template":
                            createTemplate(options);
                            console.log("Edit the file before submitting it to Siemens Insights Hub.");
                            break;
                        case "delete":
                            await deleteCase(options, sdk);
                            break;

                        case "update":
                            await updateCase(options, sdk);
                            break;

                        case "create":
                            await createCase(options, sdk);
                            break;

                        case "info":
                            await caseInfo(options, sdk);
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
            log(`    mdsp cases --mode list \t\t\t\tlist all cases`);
            log(`    mdsp cases --mode template --case <case> \tcreate a template file for <case>`);
            log(`    mdsp cases --mode create --file <case> \t\tcreate case `);
            log(`    mdsp cases --mode update --file <case> --handle <handle> \t update case `);
            log(`    mdsp cases --mode info --handle <handle> \case info for specified id`);
            log(`    mdsp cases --mode delete --handle <handle> \tdelete case with specified id`);

            serviceCredentialLog();
        });
};

async function createCase(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const case_ = JSON.parse(file.toString());
    const result = await sdk.GetCaseManagementClient().CreateCase(case_);
    console.log(`creted case : ${color(result.handle)} message: ${color(result.message)}`);
}

async function updateCase(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const updatedCase = JSON.parse(file.toString());
    const cm = sdk.GetCaseManagementClient();
    const case_ = await cm.GetCase(options.handle);
    const result = await cm.UpdateCase(options.handle!, updatedCase, { ifMatch: case_.eTag! });
    console.log(`updated case : ${color(result.handle)} message: ${color(result.message)}`);
}

function createTemplate(options: any) {
    const case_ = {
        notifyAssignee: false,
        dueDate: "2021-11-25",
        title: "template case",
        assignedTo: null,
        priority: "LOW",
        status: "OPEN",
        type: "PLANNED",
        description: "template",
        attachments: [
            {
                name: "iris.csv",
                assetId: "cb72dfd7400e4fc6a275f22e6751cce6",
                path: "AA-019/2021-11-26T04:27:15.933Z",
            },
        ],
        associations: [
            {
                id: "cb72dfd7400e4fc6a275f22e6751cce6",
                type: "ASSET",
            },
        ],
    };

    verboseLog(case_, options.verbose);
    writeCaseToFile(options, case_);
}

function writeCaseToFile(options: any, case_: any) {
    const fileName = options.file || `case.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(fileName, JSON.stringify(case_, null, 2));
    console.log(
        `The data was written into ${color(
            fileName
        )} run \n\n\tmdsp case --mode create --file ${fileName} \n\nto create the case`
    );
}

async function deleteCase(options: any, sdk: MindSphereSdk) {
    const id = options.handle;
    const cm = sdk.GetCaseManagementClient();
    const _case = await cm.GetCase(id);
    await retry(options.retry, () => sdk.GetCaseManagementClient().DeleteCase(id, { ifMatch: _case.eTag! }));
    console.log(`case with id ${color(id)} deleted.`);
}

async function listCases(sdk: MindSphereSdk, options: any) {
    const cases_ = (await retry(options.retry, () =>
        sdk.GetCaseManagementClient().GetCases()
    )) as CaseManagementModels.CaseListResponse;

    // console.log(workorders);

    console.log(
        `${color("handle")} title type dueDate ${color("status")} priority createdBy ->  ${color("assignedTo")} `
    );
    cases_.cases?.forEach((case_) => {
        console.log(
            `${color(case_.handle)} ${case_.title} ${case_.type} ${case_.dueDate} ${color(case_.status)} ${
                case_.priority
            } ${case_.createdBy} -> ${color(case_.assignedTo || "<none>")}`
        );
    });

    console.log(`${color(cases_.cases?.length || 0)} cases listed.\n`);
}

async function caseInfo(options: any, sdk: MindSphereSdk) {
    const case_ = await retry(options.retry, () => sdk.GetCaseManagementClient().GetCase(options.handle));
    verboseLog(JSON.stringify(case_, null, 2), options.verbose);

    printObjectInfo("Case", case_, options, ["handle", "id", "status", "type", "priority"], color);
}

function checkRequiredParamaters(options: any) {
    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with case definition to create an workorder (see mdsp cases --help for more details)",
            true
        );

    options.mode === "delete" &&
        !options.handle &&
        errorLog("you have to provide the handle to delete (see mdsp cases --help for more details)", true);

    options.mode === "delete" &&
        !options.handle &&
        errorLog("you have to provide the handle to delete (see mdsp cases --help for more details)", true);

    options.mode === "info" &&
        !options.handle &&
        errorLog("you have to provide the handle (see mdsp cases --help for more details)", true);
}
