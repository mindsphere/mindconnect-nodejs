import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as http from "http";
import * as path from "path";
import * as url from "url";
import {
    addAndStoreConfiguration,
    checkList,
    credentialEntry,
    getFullConfig,
    storeAuth,
    throwError,
} from "../../api/utils";
import { errorLog, getColor, homeDirLog, proxyLog, serviceCredentialLog, verboseLog } from "./command-utils";
const mime = require("mime-types");

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("service-credentials")
        .alias("sc")
        .option("-m, --mode [config|list|select|add]", "config | list | select | add", "config")
        .option("-i, --index <index>", "select credentials with specified index")
        .option("-y, --type <type>", "type (APP | SERVICE)", "APP")
        .option("-o, --port <port>", "port for config web server", 4994)
        .option("-u, --user <user>", "credentials: username")
        .option("-p, --password <password>", "credendials: password")
        .option(
            "-g, --gateway <gateway>",
            "region string or full gateway url (e.g. eu1, eu2 or https://gateway.eu1.mindsphere.io)"
        )
        .option("-t, --tenant <tenant>", "your tenant name")
        .option("-s, --usertenant <usertenant>", "your user tenant name")
        .option("-a, --appName <appName>", "your application name (e.g. cli)")
        .option("-p, --appVersion <appVersion>", "your application version (e.g. 1.0.0)")
        .option(
            "-k, --passkey <passkey>",
            "passkey (you will use this in the commands which require service credentials)"
        )
        .option("-v, --verbose", "verbose output")
        .description(color("provide login for commands which require technical user credentials *"))
        .action((options) => {
            (async () => {
                try {
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);
                    checkRequiredParamaters(options);
                    options.mode === "config" && (await serve(options.port));
                    options.mode === "list" && listEntries(options);
                    options.mode === "select" && selectEntry(options);
                    options.mode === "add" && addEntry(options);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log(`\n  Example:\n`);
            log(
                `    mc service-credentials --mode config \t\t\t start configuration web server on ${color(
                    "http://localhost:4994"
                )}`
            );
            log(
                `    mc service-credentials --mode config --port 10000 \t\t start configuration web server on ${color(
                    "http://localhost:10000"
                )}`
            );

            log(`    mc service-credentials --mode list  \t\t\t list all configured credentials`);
            log(
                `    mc service-credentials --mode select --index <index> \t select credentials with index <index> from the list`
            );

            log(`    mc service-credentials --mode add --type APP ... \t\t add new APP credentials`);
            serviceCredentialLog();
        });
};

function listEntries(options: any) {
    const config = getFullConfig();
    for (let index = 0; index < config.credentials.length; index++) {
        const element = config.credentials[index];
        const highlight = element.selected
            ? color
            : (x: string) => {
                  return x;
              };
        const selected = element.selected ? color(" -> ") : "    ";
        console.log(
            `${selected} ${highlight(index)} ${highlight(element.type)}\t ${element.tenant} ${element.gateway} ${
                element.createdAt
            } ${element.appName} ${element.appVersion} ${element.usertenant} `
        );
    }
    verboseLog(JSON.stringify(config, null, 2), options.verbose);
}

async function serve(configPort?: number) {
    const server = http.createServer();
    const port = configPort || 4994;

    server.on("request", async (req, res) => {
        const uri = url.parse(req.url);

        try {
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

function selectEntry(options: any) {
    const config = getFullConfig();

    const optionIndex = parseInt(options.index);

    (optionIndex < 0 || optionIndex > config.credentials.length - 1) &&
        throwError(`the index has to be between 0 and ${config.credentials.length - 1}`);

    for (let index = 0; index < config.credentials.length; index++) {
        const element = config.credentials[index];
        element.selected = index === parseInt(options.index);
    }

    checkList(config.credentials);
    storeAuth(config);
    listEntries(options);
}

function addEntry(options: any) {
    const config = getFullConfig();

    config.credentials.forEach((x) => (x.selected = false));

    const newEntry: credentialEntry = {
        user: options.user,
        password: options.password,
        passkey: options.passkey,
        gateway: options.gateway,
        tenant: `${options.tenant}`,
        type: options.type,
        usertenant: `${options.usertenant}`,
        appName: `${options.appName}`,
        appVersion: `${options.appVersion}`,
        createdAt: new Date().toISOString(),
        selected: true,
    };

    (config.credentials as any[]).push(newEntry);
    addAndStoreConfiguration(config);
}

function checkRequiredParamaters(options: any) {
    !(["config", "list", "select", "add"].indexOf(options.mode) >= 0) &&
        throwError(`invalid mode ${options.mode} (must be config, list, select or add)`);

    options.mode === "select" && !options.index && throwError("you have to specify a configuration index to select");
    options.mode === "add" &&
        options.type !== "APP" &&
        options.type !== "SERVICE" &&
        throwError("the credential type has to be either APP or SERVICE");

    options.mode === "add" &&
        options.type === "SERVICE" &&
        (!options.user || !options.tenant || !options.passkey || !options.gateway) &&
        throwError("you have to specify user, tenant, gateway and passkey for SERVICE credentials");

    options.mode === "add" &&
        options.type === "SERVICE" &&
        (options.usertenant || options.appName || options.appVersion) &&
        throwError("you must not use appName, appVersion or usertenant option with SERVICE credentials");

    options.mode === "add" &&
        options.type === "APP" &&
        (!options.user ||
            !options.tenant ||
            !options.passkey ||
            !options.gateway ||
            !options.usertenant ||
            !options.appName ||
            !options.appVersion) &&
        throwError(
            "you have to specify user, tenant, gateway, passkey, usertenant, appName and appVersion for APP credentials"
        );
}
