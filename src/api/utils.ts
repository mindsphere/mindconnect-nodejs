// Copyright (C), Siemens AG 2017
import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import { URL } from "url";
import { TimeStampedDataPoint } from "..";
import { IMindConnectConfiguration } from "./mindconnect-models";
const groupby = require("json-groupby");

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

export const getAgentDir = (path?: string) => {
    let result;
    if (fs.existsSync(`${path}/.mc/`)) {
        result = `${path}/.mc/`;
    } else if (fs.existsSync(`${process.cwd()}/.mc/`)) {
        result = `${process.cwd()}/.mc/`;
    } else {
        result = getHomeDotMcDir();
    }

    return result;
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
};

export const loadAuth = (): authJson => {
    const pathName = `${getHomeDotMcDir()}auth.json`;
    const buffer = fs.readFileSync(pathName);
    return <authJson>JSON.parse(buffer.toString());
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
        .filter(key => {
            return qs[key] !== undefined;
        })
        .map(key => {
            const value = qs[key] instanceof Date ? qs[key].toISOString() : qs[key];
            return encodeURIComponent(key) + "=" + encodeURIComponent(value);
        })
        .join("&");
};

export const removeUndefined = (obj: any) => {
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
    return obj;
};

export async function checksumFile(hashName: string, path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash(hashName);
        const stream = fs.createReadStream(path);
        stream.on("error", err => reject(err));
        stream.on("data", chunk => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex")));
    });
}
