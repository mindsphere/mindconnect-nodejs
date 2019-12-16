import { CommanderStatic } from "commander";
import { log } from "console";
import * as path from "path";
import * as util from "util";
import { MindSphereSdk } from "../../api/sdk/";
import { decrypt, loadAuth, retry } from "../../api/utils";
import {
  errorLog,
  getColor,
  humanFileSize,
  serviceCredentialLog,
  verboseLog
} from "./command-utils";
import ora = require("ora");
const streamPipeline = util.promisify(require("stream").pipeline);

const color = getColor("magenta");

export default (program: CommanderStatic) => {
  program
    .command("delete-file")
    .alias("de")
    .option("-f, --file <fileToDelete>", "file to delete from the file service")
    .option("-h, --filepath [filepath]", "file path in the mindsphere", "")
    .option("-i, --assetid <assetid>", "asset id from the mindsphere")
    .option("-p, --passkey <passkey>", `passkey`)
    .option("-y, --retry <number>", "retry attempts before giving up", 3)
    .option("-v, --verbose", "verbose output")
    .description(`${color("delete the file from mindsphere file service *")}`)
    .action(options => {
      (async () => {
        try {
          checkParameters(options);

          const auth = loadAuth();
          const sdk = new MindSphereSdk({
            gateway: auth.gateway,
            basicAuth: decrypt(auth, options.passkey),
            tenant: auth.tenant
          });
          const iotFileClient = sdk.GetIoTFileClient();
          let fullpath = options.filepath
            ? `${options.filepath}/${options.file}`
            : `${options.file}`;
          fullpath = fullpath.replace("//", "/");

          let filter = `name eq ${path.basename(fullpath)}`;
          if (path.dirname(fullpath) !== ".")
            filter += ` and path eq ${path.dirname(fullpath)}/`;

          const fileInfo = await iotFileClient.GetFiles(options.assetid, {
            filter: filter
          });

          fileInfo.length !== 1 &&
            errorLog(
              `There were ${color(
                fileInfo.length
              )} files found with that name and path.`,
              true
            );

          const spinner = ora("deleting file");
          !options.verbose && spinner.start();

          verboseLog(JSON.stringify(fileInfo, null, 2), options.verbose);
          verboseLog(
            `Deleting file ${color(fileInfo[0].name)} with size of ${color(
              humanFileSize(fileInfo[0].size || 0)
            )} from MindSphere.`,
            options.verbose,
            spinner
          );

          await retry(options.retry, () =>
            iotFileClient.DeleteFile(options.assetid, fullpath)
          );

          !options.verbose && spinner.succeed("Done");

          log(`\nYour file ${color(fullpath)} was sucessfully deleted`);
        } catch (err) {
          errorLog(err, options.verbose);
        }
      })();
    })
    .on("--help", () => {
      log("\n  Examples:\n");
      log(
        `    mc delete-file -f CHANGELOG.md  --assetid 5..f  \t\t\t\t delete file ${color(
          "CHANGELOG.md"
        )} from specified asset`
      );
      log(
        `    mc delete-file --file  CHANGELOG.md  --assetid 5...f --filepath upload \t delete file ${color(
          "upload/CHANGELOG.md"
        )} from specified asset`
      );
      log(
        `    mc delete-file --file  upload/CHANGELOG.md  --assetid 5...f \t\t delete file ${color(
          "upload/CHANGELOG.md"
        )} from specified asset`
      );
      serviceCredentialLog();
    });
};

function checkParameters(options: any) {
  !options.passkey &&
    errorLog(
      "you have to provide a passkey to get the service token (run mc de --help for full description)",
      true
    );
  !options.file &&
    errorLog(
      "Missing file name for delete-file command. Run mc de --help for full syntax and examples.",
      true
    );

  !options.assetid &&
    errorLog(
      " You have to specify assetid. Run  mc de --help for full syntax and examples.",
      true
    );
}
