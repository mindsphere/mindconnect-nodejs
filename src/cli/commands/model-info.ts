import { CommanderStatic } from "commander";
import { log } from "console";
import { ModelManagementModels } from "../../api/sdk";
import { retry } from "../../api/utils";
import { adjustColor, errorLog, getColor, getSdk, homeDirLog, proxyLog, serviceCredentialLog } from "./command-utils";

let color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("models-info")
        .alias("mi")
        .option("-i, --modelid <modelid>", "mindsphere model id ")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-y, --retry <number>", "retry attempts before giving up", "3")
        .option("-v, --verbose", "verbose output")
        .description(color(`get infos about a model *`))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const modelMgmt = sdk.GetModelManagementClient();
                    const model = (await retry(options.retry, () =>
                        modelMgmt.GetModel(options.modelid)
                    )) as ModelManagementModels.Model;

                    const modelVersion = (await retry(options.retry, () =>
                        modelMgmt.GetModelLastVersion(`${model.id}`)
                    )) as ModelManagementModels.Version;

                    console.log(`\nModel Information for Model with Model Id: ${color(model.id)}\n`);
                    console.log(`Id: ${color(model.id)}`);
                    console.log(`Name: ${color(model.name)}`);
                    console.log(`Type: ${color(model.type)} ${color(":")} ${color(modelVersion.number)}`);
                    console.log(`Author: ${color(model.author)}`);
                    console.log(`Description: ${color(model.description)}`);
                    console.log("Last version:");
                    console.log(`- Id: ${color(model.lastVersion?.id)}`);
                    console.log(`- Version nummer: ${color(model.lastVersion?.number)}`);
                    console.log(`- Author: ${color(model.lastVersion?.author)}`);
                    console.log(`- Creation date: ${color(model.lastVersion?.creationDate)}`);
                    console.log(`- Expiation date: ${color(model.lastVersion?.expirationDate)}`);

                    console.log("\nLastest version entries:");
                    const versions = await retry(options.retry, () =>
                        sdk
                            .GetModelManagementClient()
                            .GetModelVersions({ modelId:model.id, pageNumber: 0, pageSize:100 })
                    ) as ModelManagementModels.VersionArray;
                    console.table(versions.versions?.slice(0, 5) || [], [
                        "number",
                        "author",
                        "creationDate",
                        "expirationDate"
                    ]);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc model-info --modelid 123456...ef \t print out infos about model with id 132456...ef`);
            serviceCredentialLog();
        });
};

function checkRequiredParameters(options: any) {
    !options.modelid && errorLog("you have to provide a modelid", true);
}
