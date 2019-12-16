import { CommanderStatic } from "commander";
import { log } from "console";
import { MindSphereSdk } from "../../api/sdk";
import { decrypt, loadAuth, retry } from "../../api/utils";
import {
  errorLog,
  getColor,
  homeDirLog,
  proxyLog,
  serviceCredentialLog,
  verboseLog
} from "./command-utils";

const color = getColor("magenta");

export default (program: CommanderStatic) => {
  program
    .command("delete-asset")
    .alias("da")
    .option("-i, --assetid <assetid>", "asset id from the mindsphere ")
    .option("-k, --passkey <passkey>", "passkey")
    .option("-y, --retry <number>", "retry attempts before giving up", 3)
    .option("-v, --verbose", "verbose output")
    .description(color(`delete asset with id <assetid>`))
    .action(options => {
      (async () => {
        try {
          homeDirLog(options.verbose, color);
          proxyLog(options.verbose, color);

          checkRequiredParameters(options);
          const auth = loadAuth();
          const sdk = new MindSphereSdk({
            gateway: auth.gateway,
            basicAuth: decrypt(auth, options.passkey),
            tenant: auth.tenant
          });

          const assetMgmt = sdk.GetAssetManagementClient();
          const asset = await retry(options.retry, () =>
            assetMgmt.GetAsset(options.assetid)
          );
          verboseLog(JSON.stringify(asset, null, 2), options.verbose);

          await retry(options.retry, () =>
            assetMgmt.DeleteAsset(options.assetid, {
              ifMatch: asset?.etag || "0"
            })
          );

          console.log(
            `Asset with assetid ${color(asset.assetId)} (${color(
              asset.name
            )}) was deleted.`
          );
        } catch (err) {
          errorLog(err, options.verbose);
        }
      })();
    })
    .on("--help", () => {
      log("\n  Examples:\n");
      log(
        `    mc delete-asset --assetid 123456...ef --passkey mypasskey \t\tdelete asset with id 132456...ef`
      );
      serviceCredentialLog();
    });
};

function checkRequiredParameters(options: any) {
  !options.passkey &&
    errorLog(
      "you have to provide a passkey to get the service token (run mc la --help for full description)",
      true
    );

  !options.assetid && errorLog("you have to provide a assetid", true);
}
