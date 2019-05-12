import { CommanderStatic } from "commander";
import { log } from "console";
import { decrypt, encrypt, getPiamUrl, isUrl, storeAuth } from "../../api/utils";
import { errorLog, getColor, serviceCredentialLog } from "./command-utils";

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("service-credentials")
        .alias("sc")
        .option("-u, --user <username>", "service credentials: username")
        .option("-p, --password <password>", "service credendials: password")
        .option(
            "-g, --gateway <gateway>",
            "region string or full gateway url (e.g. eu1, eu2 or https://gateway.eu1.mindsphere.io)"
        )
        .option("-t, --tenant <tenant>", "your tenant name")
        .option(
            "-k, --passkey <passkey>",
            "passkey (you will use this in the commands which require service credentials)"
        )
        .option("-v, --verbose", "verbose output")
        .description(color("provide login for commands which require technical user credentials *"))
        .action(options => {
            (async () => {
                try {
                    if (!options.gateway || !options.user || !options.tenant || !options.passkey) {
                        errorLog(
                            "Invalid/missing parameters for service-credentials command. Run mc sc --help for full syntax and examples.",
                            true
                        );
                        process.exit(1);
                    }
                    const gateway = isUrl(options.gateway)
                        ? options.gateway
                        : `https://gateway.${options.gateway}.mindsphere.io`;
                    log(getPiamUrl(gateway, options.tenant));
                    const encrypted = encrypt(options.user, options.password, options.passkey, gateway, options.tenant);
                    storeAuth(encrypted);
                    const decrypted = decrypt(encrypted, options.passkey);
                    console.log(decrypted);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log(`\n  Example:\n`);
            log(
                `    mc service-credentials --user tenantx001 --password xxxx-xxx-x-x --gateway eu1 --tenant tenantx --passkey mypasskey`
            );
            serviceCredentialLog();
        });
};
