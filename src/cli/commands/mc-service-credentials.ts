import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as http from "http";
import * as path from "path";
import * as url from "url";
import { addAndStoreConfiguration, getFullConfig } from "../../api/utils";
import { errorLog, getColor, serviceCredentialLog } from "./command-utils";
const mime = require("mime-types");

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("service-credentials")
        .alias("sc")
        .option("-m, --mode [settings]", "settings | list | select", "")
        .option("-u, --user <username>", "service credentials: username")
        .option("-p, --password <password>", "service credendials: password")
        .option(
            "-g, --gateway <gateway>",
            "region string or full gateway url (e.g. eu1, eu2 or https://gateway.eu1.mindsphere.io)"
        )
        .option("-t, --tenant <tenant>", "your tenant name")
        .option("-s, --usertenant <usertenant>", "your user tenant name")
        .option("-a, --appname <appname>", "your application name (e.g. cli)")
        .option("-p, --appversion <appversion>", "your application version (e.g. 1.0.0)")
        .option(
            "-k, --passkey <passkey>",
            "passkey (you will use this in the commands which require service credentials)"
        )
        .option("-v, --verbose", "verbose output")
        .description(color("provide login for commands which require technical user credentials *"))
        .action((options) => {
            (async () => {
                try {
                    serve();
                    // if (!options.gateway || !options.user || !options.tenant || !options.passkey) {
                    //     errorLog(
                    //         "Invalid/missing parameters for service-credentials command. Run mc sc --help for full syntax and examples.",
                    //         true
                    //     );
                    //     process.exit(1);
                    // }
                    // const gateway = isUrl(options.gateway)
                    //     ? options.gateway
                    //     : `https://gateway.${options.gateway}.mindsphere.io`;
                    // log(getPiamUrl(gateway, options.tenant));
                    // const encrypted = encrypt(options.user, options.password, options.passkey, gateway, options.tenant);
                    // storeAuth(encrypted);
                    // const decrypted = decrypt(encrypted, options.passkey);
                    // console.log(decrypted);
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

async function serve() {
    const server = http.createServer();
    const port = process.env.PORT || 4994;

    server.on("request", async (req, res) => {
        const uri = url.parse(req.url);

        try {
            // console.log(uri.path);

            const filePath = uri.path === "/" ? "index.html" : uri.path;
            const fullName = path.resolve(`${__dirname}/html/sc/${filePath}`);

            if (uri.path?.startsWith("/sc/config") && req.method === "GET") {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(getFullConfig()));
                console.log(`${color(new Date().toISOString())} Acquired the CLI settings`);
            } else if (uri.path?.startsWith("/sc/save") && req.method === "POST") {
                const data: string[] = [];

                req.on("data", (chunk: any) => {
                    data.push(chunk);
                });
                req.on("end", () => {
                    const configuration = JSON.parse(data.join());
                    addAndStoreConfiguration(configuration);

                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(getFullConfig()));
                    console.log(
                        `${color(new Date().toISOString())} Stored the configuration. Press ${color(
                            "CTRL + C"
                        )} to exit`
                    );
                });
            } else if (fs.existsSync(fullName)) {
                res.writeHead(200, { "Content-Type": mime.lookup(filePath) });
                const stream = fs.createReadStream(fullName);
                stream.pipe(res);
            } else {
                res.writeHead(404);
                res.end();
            }
        } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: error.message }, null, 2));
        }
    });

    server.listen(port);

    console.log(`navigate to ${color("http://localhost:" + port)} to configure the CLI`);
    console.log(`press ${color("CTRL + C")} to exit`);
}
