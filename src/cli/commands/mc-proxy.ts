import { Command } from "commander";
import { log } from "console";
import fetch from "cross-fetch";
import * as http from "http";
import * as https from "https";
import * as url from "url";
import * as util from "util";
import { MindSphereSdk } from "../../api/sdk";
import { authJson, decrypt, loadAuth, throwError } from "../../api/utils";
import { errorLog, getColor, homeDirLog, proxyLog, verboseLog } from "./command-utils";
import chalk = require("chalk");

const streamPipeline = util.promisify(require("stream").pipeline);
const HttpsProxyAgent = require("https-proxy-agent");

const magenta = getColor("magenta");
const red = getColor("red");
const yellow = getColor("yellow");
const green = getColor("green");

let color = yellow;

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": 2592000, // 30 days
    "cache-control": "no-cache",
    "x-proxied-by": "mindsphere development proxy",
};

export default (program: Command) => {
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
        .option("-d, --dontkeepalive", "don't keep the session alive")
        .option("-v, --verbose", "verbose output")
        .option("-s, --session <session>", "borrowed SESSION cookie from brower")
        .option("-x, --xsrftoken <xsrftoken>", "borrowed XSRF-TOKEN cookie from browser")
        .option("-h, --host <host>", "the address where SESSION and XSRF-TOKEN have been borrowed from")
        .option("-t, --timeout <timeout>", "keep alive timeout in seconds", "60")
        .option("-k, --passkey <passkey>", "passkey")
        .description(color(`starts mindsphere development proxy & ${magenta("(optional passkey) *")}`))
        .action((options) => {
            (async () => {
                try {
                    color = options.mode === "credentials" ? magenta : yellow;
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    if (options.mode === "session") {
                        options.session = options.session || process.env.MDSP_SESSION;
                        options.xsrftoken = options.xsrftoken || process.env.MDSP_XSRF_TOKEN;
                        options.host = options.host || process.env.MDSP_HOST;
                        verboseLog(
                            `${color("cookies:")} ${options.session}, ${options.xsrftoken}, ${options.host}`,
                            options.verbose
                        );
                    }

                    checkRequiredParamaters(options);

                    console.log(`\nMode ${color(options.mode)}`);
                    console.log(`\nCORS support ${green("on")}`);
                    options.mode === "session" &&
                        !options.dontkeepalive &&
                        console.log(
                            `\nKeep alive session ${color(options.session)} on ${color(options.host)} every ${color(
                                options.timeout
                            )} seconds: ${green("on")} `
                        );
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
            log(`    mc dev-proxy  \t\t\t\t runs on default port (7707) using ${yellow("cookies")}`);
            log(
                `    mc dev-proxy --mode credentials --port 7777 --passkey $MDSP_PASSKEY 
                                        \t runs on port 7777 using ${magenta("app/service credentials")}`
            );

            log("\n  Configuration:\n");
            log(
                `    \t- create environment variables: ${color("MDSP_HOST")}, ${color("MDSP_SESSION")} and ${color(
                    "MDSP_XSRF_TOKEN"
                )} using borrowed cookies `
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

    keepAliveIfConfigured(options, proxyHttpAgent);

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
                options.verbose &&
                    console.log(
                        `[${green(new Date().toISOString())}] Setting X-Dev-Proxy-For to ${
                            requestOptions.headers.origin
                        }}`
                    );
            }

            if (options.mode === "credentials") {
                (requestOptions.headers as any)["Authorization"] = `Bearer ${await sdk.GetToken()}`;
                options.verbose &&
                    console.log(
                        `[${green(new Date().toISOString())}] Setting authorization to Bearer ${
                            requestOptions.headers["Authorization"]
                        }`
                    );
            } else {
                if (requestOptions.headers.origin) {
                    requestOptions.headers.origin = `https://${options.host}`;

                    options.verbose &&
                        console.log(
                            `[${green(new Date().toISOString())}] Setting origin to ${requestOptions.headers.origin}}`
                        );
                }

                let newCookie = `SESSION=${options.session}; XSRF-TOKEN=${options.xsrftoken}`;
                if (region && region !== "") {
                    newCookie += `;REGION-SESSION=${region}`;
                    options.verbose &&
                        console.log(`[${green(new Date().toISOString())}] Adding REGION-SESSION cookie ${newCookie}}`);
                }

                (requestOptions.headers as any)["cookie"] = newCookie;
                options.verbose &&
                    console.log(
                        `[${green(new Date().toISOString())}] Setting mindsphere request cookies to ${newCookie}`
                    );

                (requestOptions.headers as any)["x-xsrf-token"] = options.xsrftoken;
                options.verbose &&
                    console.log(
                        `[${green(new Date().toISOString())}] Setting mindsphere request x-xsrf-token to ${
                            options.xsrftoken
                        }`
                    );
            }

            const proxy = https.request(requestOptions, function (proxyres) {
                const allHeaders = { ...headers, ...proxyres.headers };
                const logColor = res.statusCode >= 200 && res.statusCode < 400 ? green : red;

                if (req.method === "OPTIONS") {
                    res.writeHead(204, allHeaders);
                    console.log(
                        `[${color(new Date().toISOString())}] ${logColor(res.statusCode)} ${requestOptions.method} ${
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
                        const target = `http://localhost:${port}`;
                        replaced = body.replace(regex, target);
                        options.verbose &&
                            console.log(
                                `[${green(new Date().toISOString())}] adjusting body (replacing ${
                                    requestOptions.hostname
                                } with ${target})`
                            );
                    }

                    if (responseHeaders["transfer-encoding"] === "chunked") {
                        delete responseHeaders["content-length"];
                        options.verbose &&
                            console.log(
                                `[${green(
                                    new Date().toISOString()
                                )}] deleted content-length (transfer-encoding was chunked)`
                            );
                    }

                    if (options.mode === "session") {
                        const cookies: string[] = [];

                        responseHeaders["set-cookie"]?.forEach((element) => {
                            const elements = element.split("=");

                            if (elements[0] === "REGION-SESSION") {
                                region = elements[1].split(";")[0];
                            }
                        });

                        if (responseHeaders["set-cookie"] && responseHeaders["set-cookie"].length > 0 && region) {
                            cookies.push(`REGION-SESSION=${region}; Path=/;`);
                        }

                        if (responseHeaders["set-cookie"] && responseHeaders["set-cookie"].length > 0) {
                            cookies.push(`SESSION=${options.session}; Path=/;`);
                            cookies.push(`XSRF-TOKEN=${options.xsrftoken}; Path=/;`);

                            options.verbose &&
                                console.log(
                                    `[${green(new Date().toISOString())}] changing cookies from \n ${JSON.stringify(
                                        responseHeaders["set-cookie"],
                                        null,
                                        2
                                    )}`
                                );

                            responseHeaders["set-cookie"] = cookies;
                            options.verbose &&
                                console.log(
                                    `[${green(
                                        new Date().toISOString()
                                    )}] rewriting response cookies to \n ${JSON.stringify(cookies)})}`
                                );
                        }
                    }

                    res.writeHead(proxyres.statusCode || 500, responseHeaders);
                    res.statusCode = proxyres.statusCode || 500;
                    res.end(replaced);

                    const okColor = res.statusCode >= 200 && res.statusCode <= 399 ? green : red;
                    const finalLogColor = res.statusCode >= 300 && res.statusCode <= 399 ? chalk.grey : okColor;

                    console.log(
                        `[${color(new Date().toISOString())}] ${finalLogColor(res.statusCode)} ${
                            requestOptions.method
                        } ${requestOptions.path}`
                    );
                });
            });

            await streamPipeline(req, proxy);
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

function keepAliveIfConfigured(options: any, proxyHttpAgent: any) {
    options.mode === "session" &&
        !options.dontkeepalive &&
        setInterval(async () => {
            const host = `https://${options.host}`;
            const newCookie = `SESSION=${options.session}; XSRF-TOKEN=${options.xsrftoken}`;
            const keepAlive = await fetch(host, {
                method: "GET",
                headers: { cookie: newCookie },
                agent: proxyHttpAgent,
            } as RequestInit);

            const okColor = keepAlive.status >= 200 && keepAlive.status <= 399 ? green : red;
            const finalLogColor = keepAlive.status >= 300 && keepAlive.status <= 499 ? chalk.gray : okColor;

            console.log(
                `[${finalLogColor(new Date().toISOString())}] ${finalLogColor(keepAlive.status)} keep alive ${
                    options.host
                } `
            );
        }, options.timeout * 1000);
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
        throwError("you have to specify session, xsrftoken and host for session mode");
}
