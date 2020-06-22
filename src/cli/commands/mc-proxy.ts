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
        .option(
            "-m, --mode [credentials|session]",
            "service/app credentials authentication of session authentication",
            "session"
        )
        .option("-o, --port <port>", "port for web server", "7707")
        .option("-r, --norewrite", "don't rewrite hal+json urls")
        .option("-w, --nowarn", "don't warn for missing headers")
        .option("-v, --verbose", "verbose output")
        .option("-s, --session <session>", "borrowed SESSION cookie from brower")
        .option("-x, --xsrftoken <xsrftoken>", "borrowed XSRF-TOKEN cookie from browser")
        .option("-h, --host <host>", "the address where SESSION and XSRF-TOKEN have been borrowed from")
        .option("-k, --passkey <passkey>", "passkey")
        .description(color("starts mindsphere development proxy *"))
        .action((options) => {
            (async () => {
                try {
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    checkRequiredParamaters(options);

                    console.log(`\nMode ${color(options.mode)}`);
                    console.log(`\CORS support ${green("on")}`);
                    console.log(
                        `Rewrite hal+json support ${options.host || loadAuth().gateway} -> ${
                            "http://localhost:" + options.port
                        } ${options.norewrite ? red("off") : green("on")}`
                    );

                    console.log(`warn on missing x-xsrf-token ${options.nowarn ? red("off") : green("on")}\n`);
                    await serve({ configPort: options.port, options: options });
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

async function serve({ configPort, options }: { configPort?: number; options: any }) {
    const proxy = process.env.http_proxy || process.env.HTTP_PROXY;
    const proxyHttpAgent = proxy ? new HttpsProxyAgent(proxy) : undefined;

    const server = http.createServer();
    const port = configPort || 7707;

    let sdk: MindSphereSdk;
    let auth: authJson;
    if (options.mode === "credentials") {
        auth = loadAuth();
        sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, options.passkey) });
    }

    server.on("error", (err) => {
        console.log(`[${red(new Date().toISOString())}] ${red(err)}`);
    });

    let region: string | undefined;

    server.on("request", async (req, res: http.ServerResponse) => {
        try {
            const hostname = options.host ? options.host : url.parse(auth.gateway).host;
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
            if (requestOptions.headers.origin) {
                requestOptions.headers["X-DevProxy-For"] = requestOptions.headers.origin;
            }

            if (req.method === "GET") {
                delete requestOptions.headers["sec-fetch-mode"];
                delete requestOptions.headers["sec-fetch-dest"];
                delete requestOptions.headers["sec-fetch-site"];
            }

            if (options.mode === "credentials") {
                (requestOptions.headers as any)["Authorization"] = `Bearer ${await sdk.GetToken()}`;
            } else {
                if (requestOptions.headers.origin) {
                    requestOptions.headers.origin = `https://${options.host}`;
                }

                let newCookie = `SESSION=${options.session}; XSRF-TOKEN=${options.xsrftoken}`;
                if (region && region !== "") {
                    newCookie += `;REGION-SESSION=${region}`;
                }

                console.log(newCookie, region);

                (requestOptions.headers as any)["cookie"] = newCookie;

                (requestOptions.headers as any)["x-xsrf-token"] = options.xsrftoken;
                console.log(requestOptions.headers);
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

                    const logColor = res.statusCode >= 200 && res.statusCode < 400 ? color : red;

                    if (options.mode === "session") {
                        const cookies: string[] = [];

                        responseHeaders["set-cookie"]?.forEach((element) => {
                            const elements = element.split("=");

                            if (elements[0] === "REGION-SESSION") {
                                region = elements[1].split(";")[0];
                            }
                        });

                        if (region) {
                            cookies.push(`REGION-SESSION=${region}; Path=/;`);
                        }

                        if (responseHeaders["set-cookie"]) {
                            cookies.push(`SESSION=${options.session}; Path=/;`);
                            cookies.push(`XSRF-TOKEN=${options.xsrftoken}; Path=/;`);

                            console.log(
                                `[${logColor(new Date().toISOString())}] changing cookies from ${JSON.stringify(
                                    responseHeaders["set-cookie"]
                                )}`
                            );
                        }

                        responseHeaders["set-cookie"] = cookies;

                        options.verbose &&
                            console.log(
                                `[${logColor(new Date().toISOString())}] setting the cookies to ${JSON.stringify(
                                    responseHeaders["set-cookie"]
                                )}`
                            );
                    }

                    res.writeHead(proxyres.statusCode || 500, responseHeaders);
                    res.statusCode = proxyres.statusCode || 500;
                    res.end(replaced);

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
                "WARN: x-xsrf-token is missing. the app will not work after deployment if you use frontend authentication"
            )}`
        );
        console.log(
            `[${color(new Date().toISOString())}] ${yellow("WARN: see")}: ${yellow(
                "https://developer.mindsphere.io/concepts/concept-authentication.html#calling-apis-from-frontend"
            )}`
        );
    }
}

function checkRequiredParamaters(options: any) {
    ["credentials", "session"].indexOf(options.mode) < 0 &&
        throwError("the mode must be either credentials or session");

    options.mode === "credentials" &&
        !options.passkey &&
        throwError("you have to specify passkey for credentials mode");

    options.mode === "credentials" &&
        (options.session || options.xsrftoken || options.host) &&
        throwError("session, xsrftoken and host are invalid options more credentials mode");

    options.mode === "session" && options.passkey && throwError("you don't have to specify passkey for session mode");

    options.mode === "session" &&
        (!options.session || !options.xsrftoken || !options.host) &&
        throwError("you have to specifiy session, xsrftoken and host for session mode");
}
