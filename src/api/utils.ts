// Copyright (C), Siemens AG 2017
import chalk from "chalk";
import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import { URL } from "url";
import { TimeStampedDataPoint } from "..";
import { IMindConnectConfiguration } from "./mindconnect-models";
import debug = require("debug");
const groupby = require("json-groupby");
const log = debug("mindconnect-util");

export const convertToTdpArray = (data: any[]): TimeStampedDataPoint[] => {
    const tdpArray: TimeStampedDataPoint[] = [];
    const groupedData = groupby(data, ["timestamp"]);
    for (const element in groupedData) {
        groupedData[element].forEach((x: any) => {
            delete x["timestamp"];
        });
        const tdp: TimeStampedDataPoint = {
            timestamp: element,
            values: groupedData[element]
        };
        tdpArray.push(tdp);
    }
    return tdpArray;
};

export type authJson = { auth: string; iv: string; gateway: string; tenant: string };

export const isUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

export const getPiamUrl = (gateway: string, tenant: string): string => {
    const piamUrl = gateway.replace("gateway", `${tenant}.piam`);
    return piamUrl.endsWith("/") ? piamUrl : piamUrl + "/";
};

const normalizePasskey = (passkey: string): string => {
    return passkey.length < 32 ? passkey + new Array(33 - passkey.length).join("$") : passkey.substr(0, 32);
};

export const encrypt = (user: string, password: string, passkey: string, gateway: string, tenant: string): authJson => {
    const base64encoded = new Buffer(`${user}:${password}`).toString("base64");
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv("aes-256-ctr", Buffer.from(normalizePasskey(passkey)), iv);
    let crypted = cipher.update(`Basic ${base64encoded}`, "utf8", "hex");
    crypted += cipher.final("hex");
    const encryptedAuth = {
        auth: crypted.toString(),
        iv: iv.toString("base64"),
        gateway: gateway,
        tenant: tenant
    };
    console.log(encryptedAuth);
    return encryptedAuth;
};

export const decrypt = (encryptedAuth: authJson, passkey: string): string => {
    const decipher = crypto.createDecipheriv(
        "aes-256-ctr",
        normalizePasskey(passkey),
        Buffer.from(encryptedAuth.iv, "base64")
    );
    let dec = decipher.update(encryptedAuth.auth, "hex", "utf8");
    dec += decipher.final("utf8");
    return dec;
};

export const getHomeDotMcDir = () => {
    return `${os.homedir()}/.mc/`;
};

export const storeAuth = (encryptedAuth: authJson) => {
    const homeDir = getHomeDotMcDir();
    if (!fs.existsSync(homeDir)) {
        fs.mkdirSync(homeDir);
    }

    const pathName = `${getHomeDotMcDir()}auth.json`;
    fs.writeFileSync(pathName, JSON.stringify(encryptedAuth));
    log(`The technical user data has been stored in: ${chalk.magentaBright(pathName)}.`);
};

export const loadAuth = (): authJson => {
    const pathName = `${getHomeDotMcDir()}auth.json`;
    log(`Loading the data from: ${chalk.magentaBright(pathName)}.`);
    const buffer = fs.readFileSync(pathName);
    return <authJson>JSON.parse(buffer.toString());
};

export const errorLog = (err: any, verbose: any) => {
    if (err.message) {
        console.error(`\n${chalk.redBright(err.message.toString())}`);
        if (verbose && err.stack) {
            console.error(chalk.redBright(err.stack));
        }
    } else {
        console.error(chalk.redBright(err.toString()));
    }
    process.exit(1);
};

export const verboseLog = (message: any, verbose: any, spinner?: any) => {
    verbose && console.log(`... ${message}`);
    if (!verbose && spinner) {
        spinner.text = `... ${message}`;
    }
};

export const proxyLog = (verbose: any, color?: Function) => {
    const proxy = process.env.HTTP_PROXY || process.env.http_proxy;
    if (!color) {
        color = chalk.cyanBright;
    }
    verboseLog(proxy ? `Using ${color(proxy)} as proxy server` : "No proxy configured.", verbose);
};

export const homeDirLog = (verbose: any, color?: Function) => {
    if (!color) {
        color = chalk.cyanBright;
    }
    verboseLog(`Using configuration stored in ${color(getHomeDotMcDir())}`, verbose);
};

export const getConfigProfile = (config: IMindConnectConfiguration): string => {
    try {
        const result = `${config.content.clientCredentialProfile}`;
        if (["SHARED_SECRET", "RSA_3072"].indexOf(result) < 0) {
            throw new Error(
                "Configuration profile not supported. The library only supports the shared_secret and RSA_3072 config profiles"
            );
        }
        return result;
    } catch (err) {
        throw new Error(
            "Configuration profile not supported. The library only supports the shared_secret and RSA_3072 config profiles"
        );
    }
};

export const checkCertificate = (config: IMindConnectConfiguration, options: any): boolean => {
    const profile = getConfigProfile(config);

    if (profile === "RSA_3072") {
        if (!options.cert) {
            throw new Error("You have to specify --cert parameter for RSA_3072 agents");
        }

        if (!fs.existsSync(options.cert)) {
            throw new Error(`Can't find file ${options.cert}`);
        }
    }
    return profile === "RSA_3072";
};

const sleep = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * retry the function n times (while progressively waiting for the success) until success
 * the waiting schema is iteration * timeoutInMiliseconds (default is 300ms)
 *
 * @param {number} n
 * @param {Function} func
 * @param {number} [timoutinMilliseconds=300]
 * @param {Function} [logFunction]
 * @returns
 */
export const retry = async (n: number, func: Function, timoutinMilliseconds: number = 300, logFunction?: Function) => {
    let error;
    for (let i = 0; i < n; i++) {
        try {
            if (logFunction) {
                logFunction();
            }
            if (i > 0) {
                await sleep(i * timoutinMilliseconds);
            }
            return await func();
        } catch (err) {
            error = err;
        }
    }
    throw error;
};

export const retrylog = function(operation: string, c: Function = chalk.cyanBright) {
    let x = 0;
    return () => {
        if (x > 0) {
            console.log(`Retry no ${c("" + x)} for ${c(operation)} operation.`);
        }
        x++;
    };
};

export const checkAssetId = (agentId: string) => {
    if (!/[a-f0-9]{32}/gi.test(agentId)) {
        throw new Error("You have to pass valid 32 char long asset id");
    }
};

export const throwError = (error: string) => {
    throw new Error(error);
};

export const toQueryString = (qs: any) => {
    return Object.keys(qs || {})
        .map(key => {
            const value = qs[key] instanceof Date ? qs[key].toISOString() : qs[key];
            return encodeURIComponent(key) + "=" + encodeURIComponent(value);
        })
        .join("&");
};
