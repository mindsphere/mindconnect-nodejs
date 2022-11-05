import { Command } from "commander";
import { log } from "console";
import * as fs from "fs";
import { MindSphereSdk, VisualFlowCreatorModels } from "../../api/sdk";
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
        .command("visual-flow-creator")
        .alias("vfc")
        .option(
            "-m, --mode [list|create|update|delete|template|get-nodes|put-nodes|info]",
            "list | create | update | delete | template | get-nodes | put-nodes | info",
            "list"
        )
        .option("-u, --user <user>", "user email")
        .option("-f, --file <file>", ".mdsp.json file with vfc project definition", "vfc.project.mdsp.json")
        .option("-n, --nodes <nodes>", ".mdsp.json file with vfc project nodes", "vfc.nodes.mdsp.json")
        .option("-p, --project <project>", "the project name", `vfc-project-${new Date().getTime()}`)
        .option("-i, --id <id>", "the vfc project id")
        .option("-o, --overwrite", "overwrite template file if it already exists")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color("manage vfc projects and nodes *"))
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
                            await listVfcProjects(sdk, options);
                            break;

                        case "template":
                            createTemplate(options, sdk.GetTenant());
                            console.log("Edit the file before submitting it to MindSphere.");
                            break;
                        case "delete":
                            await deleteVfcProject(options, sdk);
                            break;

                        case "update":
                            await updateVfcProject(options, sdk);
                            break;

                        case "create":
                            await createVfcProject(options, sdk);
                            break;

                        case "info":
                            await vfcProjectInfo(options, sdk);
                            break;

                        case "get-nodes":
                            await getNodes(options, sdk);
                            break;

                        case "put-nodes":
                            await putNodes(options, sdk);
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
            log(`    mc vfc --user <email> --mode list \t\t\t\tlist all vfc projects`);
            log(
                `    mc vfc --user <email> --mode template --project <projectname> \tcreate a template file for vfc project <project>`
            );
            log(`    mc vfc --user <email> --mode create --file <vfc project> \t\tcreate vfc project `);
            log(`    mc vfc --user <email> --mode update --file <vfc project> --id <id> \t update project `);
            log(`    mc vfc --user <email> --mode info --id <id> \tvfc project info for specified id`);
            log(`    mc vfc --user <email> --mode delete --handle <handle> \tdelete vfc project with specified id`);

            serviceCredentialLog();
        });
};

async function createVfcProject(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const project = JSON.parse(file.toString());
    const result = await sdk.GetVisualFlowCreatorClient().PostProject(project, { userId: options.user });
    console.log(`creted vfc project with id: ${color(result.id)}`);
}

async function updateVfcProject(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.file);
    const file = fs.readFileSync(filePath);
    const project = JSON.parse(file.toString());
    await sdk.GetVisualFlowCreatorClient().GetProject(options.id, { userId: options.user });
    const result = await sdk.GetVisualFlowCreatorClient().PatchProject(options.id, project, { userId: options.user });
    console.log(`updated vfc project with id: ${color(result.id)}`);
}

function createTemplate(options: any, tenant: string) {
    const project: VisualFlowCreatorModels.Project = {
        name: options.project,
    };

    verboseLog(project, options.verbose);
    writeVfcProjectToFile(options, project);
}

function writeVfcProjectToFile(options: any, project: any) {
    const fileName = options.file || `vfc.project.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(fileName, JSON.stringify(project, null, 2));
    console.log(
        `The data was written into ${color(fileName)} run \n\n\tmc vfc --mode create --file ${fileName} --user ${
            options.user || "<user email>"
        } \n\nto create the vfc project`
    );
}

function writeNodesToFile(options: any, nodes: any) {
    const fileName = options.nodes || `vfc.nodes.mdsp.json`;
    const filePath = path.resolve(fileName);

    fs.existsSync(filePath) &&
        !options.overwrite &&
        throwError(`The ${filePath} already exists. (use --overwrite to overwrite) `);

    fs.writeFileSync(fileName, JSON.stringify(nodes));
    console.log(`The data was written into ${color(fileName)}`);
}

async function deleteVfcProject(options: any, sdk: MindSphereSdk) {
    const id = options.handle;
    await retry(options.retry, () => sdk.GetVisualFlowCreatorClient().DeleteProject(id, { userId: options.user }));
    console.log(`vfc project with id ${color(id)} deleted.`);
}

async function listVfcProjects(sdk: MindSphereSdk, options: any) {
    const projects = (await retry(options.retry, () =>
        sdk.GetVisualFlowCreatorClient().GetProjects({ userId: options.user })
    )) as VisualFlowCreatorModels.Projects;

    // console.log(projects);

    console.log(`${color("id")} name ${color("userId")} tenant `);
    projects.projects?.forEach((project) => {
        console.log(`${color(project.id)} ${project.name} ${color(project.userId)} ${project.tenant} `);
    });

    console.log(`${color(projects.projects?.length || 0)} vfc projects listed.\n`);
}

async function vfcProjectInfo(options: any, sdk: MindSphereSdk) {
    const project = await retry(options.retry, () =>
        sdk.GetVisualFlowCreatorClient().GetProject(options.id, { userId: options.user })
    );
    verboseLog(JSON.stringify(project, null, 2), options.verbose);
    printObjectInfo("Visual Flow Creator Project", project, options, ["id", "userId"], color);

    const nodes = (await retry(options.retry, () =>
        sdk.GetVisualFlowCreatorClient().GetProjecNodes(options.id, { userId: options.user })
    )) as VisualFlowCreatorModels.Nodes;

    console.log(`The project has ${color(nodes.nodes?.length || 0)} vfc nodes`);
}

async function getNodes(options: any, sdk: MindSphereSdk) {
    const nodes = (await retry(options.retry, () =>
        sdk.GetVisualFlowCreatorClient().GetProjecNodes(options.id, { userId: options.user })
    )) as VisualFlowCreatorModels.Nodes;

    verboseLog(JSON.stringify(nodes, null, 2), options.verbose);
    writeNodesToFile(options, nodes);
}

async function putNodes(options: any, sdk: MindSphereSdk) {
    const filePath = path.resolve(options.nodes);
    const file = fs.readFileSync(filePath);
    let nodes = JSON.parse(file.toString());

    if (nodes.nodes) {
        nodes = nodes.nodes;
    }

    !Array.isArray(nodes) && throwError("the nodes must be an array");

    await sdk.GetVisualFlowCreatorClient().PutProjectNodes(options.id, nodes, { userId: options.user });
    console.log(`updated nodes of the vfc project with id: ${color(options.id)}`);
}

function checkRequiredParamaters(options: any) {
    !options.user &&
        options.mode !== "template" &&
        errorLog("You must specify the user id (email) (see mc vfc --help for more details)", true);

    options.mode === "create" &&
        !options.file &&
        errorLog(
            "you have to provide a file with vfc project definition to create a vfc project (see mc vfc --help for more details)",
            true
        );

    options.mode === "put-nodes" &&
        !options.nodes &&
        errorLog("you have to provide a file with vfc nodes (see mc vfc --help for more details)", true);

    ["info", "update", "delete", "get-nodes", "put-nodes"].indexOf(options.mode) > 0 &&
        !options.id &&
        errorLog("you have to provide the vfc project id (see mc vfc --help for more details)", true);
}
