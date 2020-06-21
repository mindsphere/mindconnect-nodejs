import { CommanderStatic } from "commander";
import { log } from "console";
import * as http from "http";
import * as https from "https";
import * as url from "url";
import { MindSphereSdk } from "../../api/sdk";
import { authJson, decrypt, loadAuth, throwError } from "../../api/utils";
import { errorLog, getColor, homeDirLog, proxyLog } from "./command-utils";
const HttpsProxyAgent = require("https-proxy-agent");

const color = getColor("magenta");
const red = getColor("red");
const yellow = getColor("yellow");
const green = getColor("green");

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": 2592000, // 30 days
    "cache-control": "no-cache",
    "x-proxied-by": "mindsphere development proxy",
};

export default (program: CommanderStatic) => {
    program
        .command("dev-proxy")
        .alias("px")
        .option("-o, --port <port>", "port for web server", "7707")
        .option("-r, --norewrite", "don't rewrite hal+json urls")
        .option("-w, --nowarn", "don't warn for missing headers")
        .option("-v, --verbose", "verbose output")
        .option("-s, --session <session>", "User Session")
        .option("-x, --xsrftoken <xsrftoken>", "XSRF-Token")
        .option("-h, --host <host>", "host")
        .option("-k, --passkey <passkey>", "passkey")
        .description(color("starts mindsphere development proxy *"))
        .action((options) => {
            (async () => {
                try {
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    checkRequiredParamaters(options);

                    const auth = loadAuth();
                    const sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, options.passkey) });

                    console.log(`\nCORS support ${green("on")}`);
                    console.log(
                        `Rewrite hal+json support ${auth.gateway} -> ${"http://localhost:" + options.port} ${
                            options.norewrite ? red("off") : green("on")
                        }`
                    );

                    console.log(`warn on missing x-xsrf-token ${options.nowarn ? red("off") : green("on")}\n`);
                    await serve({ auth, configPort: options.port, sdk, options });
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(
                `    mc dev-proxy --passkey <yourpasskey> \t\t\t starts mindsphere development proxy on default port (7707)`
            );
            log(
                `    mc dev-proxy --port 7777 --passkey <yourpasskey> \t\t starts mindsphere development proxy on port 7777`
            );

            log(
                `\n    see more documentation at ${color(
                    "https://opensource.mindsphere.io/docs/mindconnect-nodejs/development-proxy.html"
                )}\n`
            );
        });
};

async function serve({
    auth,
    configPort,
    sdk,
    options,
}: {
    auth: authJson;
    configPort?: number;
    sdk: MindSphereSdk;
    options: any;
}) {
    const proxy = process.env.http_proxy || process.env.HTTP_PROXY;
    const proxyHttpAgent = proxy ? new HttpsProxyAgent(proxy) : undefined;

    const server = http.createServer();
    const port = configPort || 7707;

    server.on("error", (err) => {
        console.log(`[${red(new Date().toISOString())}] ${red(err)}`);
    });

    server.on("request", async (req, res: http.ServerResponse) => {
        try {
            console.log((req as Request).headers);
            const hostname = options.host || url.parse(auth.gateway).host;

            const requestOptions = {
                hostname: hostname,
                port: 443,
                path: req.url,
                method: req.method,
                headers: req.headers,
                agent: proxyHttpAgent,
            };

            !options.nowarn && addWarning(req);

            requestOptions.headers.host = hostname;
            if (!options.xsrftoken) {
                (requestOptions.headers as any)["Authorization"] = `Bearer ${await sdk.GetToken()}`;
            } else {
                delete requestOptions.headers["sec-fetch-mode"];
                delete requestOptions.headers["sec-fetch-dest"];
                delete requestOptions.headers["sec-fetch-site"];
                (requestOptions.headers as any)["Cookie"] = `SESSION=${options.session}`;
                (requestOptions.headers as any)["x-xsrf-token"] = options.xsrftoken;
            }
            const proxy = https.request(requestOptions, function (proxyres) {
                const allHeaders = { ...headers, ...proxyres.headers };
                const logColor = res.statusCode >= 200 && res.statusCode < 400 ? color : red;

                if (req.method === "OPTIONS") {
                    res.writeHead(204, allHeaders);
                    console.log(
                        `[${logColor(new Date().toISOString())}] ${logColor(res.statusCode)} ${requestOptions.method} ${
                            requestOptions.path
                        }`
                    );
                    res.end();
                    return;
                }

                let body = "";

                proxyres.on("data", (data) => {
                    if (data) {
                        body += data;
                    }
                });

                proxyres.on("end", (data: any) => {
                    if (data) {
                        body += data;
                    }

                    let replaced = body;

                    const responseHeaders = { ...proxyres.headers, ...headers };

                    if (!options.norewrite) {
                        const regex = new RegExp(`https://${requestOptions.hostname}`, "g");
                        replaced = body.replace(regex, `http://localhost:${port}`);
                        responseHeaders["content-length"] = `${replaced.length}`;
                    }

                    if (responseHeaders["transfer-encoding"] === "chunked") {
                        delete responseHeaders["content-length"];
                    }

                    // if (responseHeaders["set-cookie"]) {
                    //     ((responseHeaders["set-cookie"] as string[]) || []).forEach((x) => {
                    //         x = x.replace("Secure;", "");
                    //         x = x.replace("Secure", "");
                    //         x = x.replace("HttpOnly", "");
                    //         x = x.trim();
                    //     });
                    // }

                    if (options.xsrftoken) {
                        responseHeaders["set-cookie"] = [
                            `SESSION=${options.session}; Path=/;`,
                            `XSRF-TOKEN=${options.xsrftoken}; Path=/`,
                        ];
                    }

                    res.writeHead(proxyres.statusCode || 500, responseHeaders);
                    res.statusCode = proxyres.statusCode || 500;
                    res.end(replaced);

                    const logColor = res.statusCode >= 200 && res.statusCode < 300 ? color : red;
                    console.log(
                        `[${logColor(new Date().toISOString())}] ${logColor(res.statusCode)} ${requestOptions.method} ${
                            requestOptions.path
                        }`
                    );
                });
            });

            req.pipe(proxy, {
                end: true,
            });
        } catch (error) {
            console.log(`[${red(new Date().toISOString())}] ${error.message}`);
            res.writeHead(500, "Internal server error");
            res.end(JSON.stringify({ error: error.message }));
        }
    });

    server.listen(port);

    console.log(`proxy is available at ${color("http://localhost:" + port)}`);
    console.log(
        `example api call (list of assets): ${color("http://localhost:" + port + "/api/assetmanagement/v3/assets")}`
    );
    console.log(`API documentation: ${color("https://developer.mindsphere.io/apis/index.html")}`);
    console.log(`press ${color("CTRL + C")} to exit`);
}

function addWarning(req: any) {
    if (!req.headers["x-xsrf-token"] && !req.headers["X-XSRF-TOKEN"] && !(req.method === "GET")) {
        console.log(
            `[${color(new Date().toISOString())}] ${yellow(
                "WARN: x-xsrf-token is missing. the app will not work after deployment."
            )}`
        );
        console.log(
            `[${color(new Date().toISOString())}] ${yellow("WARN: see")}: ${color(
                "https://developer.mindsphere.io/concepts/concept-authentication.html#calling-apis-from-frontend"
            )}`
        );
    }
}

function checkRequiredParamaters(options: any) {
    !options.passkey &&
        throwError(
            "you have to provide the passkey to start development proxy (see mc dev-proxy --help for more help) "
        );
}
