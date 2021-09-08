// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import { it } from "mocha";
import * as nock from "nock";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src/api/sdk/";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest, mochaAsync } from "./test-utils";

chai.should();

describe("[SDK] Credential Auth", () => {
    const auth = loadAuth();

    beforeEach(() => {
        nock.cleanAll();
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it("should acquire token @sanity @s4f", async () => {
        const sdk = new MindSphereSdk({
            ...auth,
            basicAuth: decrypt(auth, getPasskeyForUnitTest()),
        });
        const agentManagement = sdk.GetAgentManagementClient();
        const token = await agentManagement.GetToken();
        token.should.not.be.undefined;
    });

    it(
        "should validate token during key rotation",
        mochaAsync(async () => {
            const sdk = new MindSphereSdk({
                ...auth,
                basicAuth: decrypt(auth, getPasskeyForUnitTest()),
            });
            const agentManagement = sdk.GetAgentManagementClient();

            nock(`https://${sdk.GetTenant()}.piam.eu1.mindsphere.io:443`, {
                allowUnmocked: true,
            })
                .get("/token_keys")
                .once()
                .reply(200, {
                    keys: [
                        {
                            kty: "RSA",
                            e: "AQAB",
                            use: "sig",
                            kid: "key-id-3",
                            alg: "RS256",
                            value: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy2HAjZ9NX9EwatR7QgUk\nomMSUK/zhdKBkU1VwJUUDFNAhtUILd0yULVczPCa+gjfnW+xSpXOigfn5lw4bEiR\nFA7Xly8I0hPD0hUK0Dgl2nwkHi8J61p+q8uAHq9AQQmV1lS+rNH6u64V2gu6QIED\ndeQ3CcfFkROkus66rxfp9w9CiM7WudJKrSBRoYeA2pnP2axh1jLZJni6JA3/NhDR\nqvKLUsfMyukaBzB0FcJE++iyh0i+3Rl1hkq5/H3BECF2PHTfK2afZlN6Kg1+3u5v\nVXZZ0cun4JttxtkEMqBau3sdx5LtoHRaGIO0EYgmzHk4+sLC8mweSruuSnUK7ZVg\nRQIDAQAB\n-----END PUBLIC KEY-----",
                            n: "AMthwI2fTV_RMGrUe0IFJKJjElCv84XSgZFNVcCVFAxTQIbVCC3dMlC1XMzwmvoI351vsUqVzooH5-ZcOGxIkRQO15cvCNITw9IVCtA4Jdp8JB4vCetafqvLgB6vQEEJldZUvqzR-ruuFdoLukCBA3XkNwnHxZETpLrOuq8X6fcPQojO1rnSSq0gUaGHgNqZz9msYdYy2SZ4uiQN_zYQ0aryi1LHzMrpGgcwdBXCRPvosodIvt0ZdYZKufx9wRAhdjx03ytmn2ZTeioNft7ub1V2WdHLp-CbbcbZBDKgWrt7HceS7aB0WhiDtBGIJsx5OPrCwvJsHkq7rkp1Cu2VYEU",
                        },
                        {
                            kty: "RSA",
                            e: "AQAB",
                            use: "sig",
                            kid: "key-id-4",
                            alg: "RS256",
                            value: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyHR/ozntSL7UvB0B2zlV\nfj1DoO5IlFLc9Mn9g73DElwSNcWf2cjlSPfjaDj9J602Wm4tI/aqm1CdbhvYzHd8\n9yHdDlQWmFjdsTeA8um6E3e3xIaYBa/RKbbGdSxEC33boAWXdFWsxPGyHkGyKxqv\n8H0Lj2xZSv/LsMO5XCro/+DNl4y/KDUL+gJF6JkSklmVwcnFeCMHi93SD3Bxbqsq\njLUxpypYII2X1AtIjK1HvWeJPiQEYnCxbfYMZsDmCg80HKfc+PTcZD5ZZu30YwhE\nBUFCbmH/GUsbIkIXBb9+GpfecVagHYGPpW3eBzn9cWeqA/CHXafpZfk3yw/RMPAe\nOQIDAQAB\n-----END PUBLIC KEY-----",
                            n: "AMh0f6M57Ui-1LwdAds5VX49Q6DuSJRS3PTJ_YO9wxJcEjXFn9nI5Uj342g4_SetNlpuLSP2qptQnW4b2Mx3fPch3Q5UFphY3bE3gPLpuhN3t8SGmAWv0Sm2xnUsRAt926AFl3RVrMTxsh5Bsisar_B9C49sWUr_y7DDuVwq6P_gzZeMvyg1C_oCReiZEpJZlcHJxXgjB4vd0g9wcW6rKoy1MacqWCCNl9QLSIytR71niT4kBGJwsW32DGbA5goPNByn3Pj03GQ-WWbt9GMIRAVBQm5h_xlLGyJCFwW_fhqX3nFWoB2Bj6Vt3gc5_XFnqgPwh12n6WX5N8sP0TDwHjk",
                        },
                    ],
                });

            const token = await agentManagement.GetToken();
            token.should.not.be.undefined;
        })
    );

    it("should use correct URL in tests @sanity @s4f", () => {
        const sdk = new MindSphereSdk({
            ...auth,
            basicAuth: decrypt(auth, getPasskeyForUnitTest()),
        });

        const url = sdk.GetGateway().replace("gateway", `${sdk.GetTenant()}.piam`);
        url.should.contain(".piam.");
    });

    it(
        "should throw error if there is no key",
        mochaAsync(async () => {
            const sdk = new MindSphereSdk({
                ...auth,
                basicAuth: decrypt(auth, getPasskeyForUnitTest()),
            });
            const assetManagement = sdk.GetAssetManagementClient();
            const url = sdk.GetGateway().replace("gateway", `${sdk.GetTenant()}.piam`);
            nock(`${url}:443`, {
                allowUnmocked: true,
            })
                .get("/token_keys")
                .twice()
                .reply(200, {
                    keys: [
                        {
                            kty: "RSA",
                            e: "AQAB",
                            use: "sig",
                            kid: "key-id-1133",
                            alg: "RS256",
                            value: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyHR/ozntSL7UvB0B2zlV\nfj1DoO5IlFLc9Mn9g73DElwSNcWf2cjlSPfjaDj9J602Wm4tI/aqm1CdbhvYzHd8\n9yHdDlQWmFjdsTeA8um6E3e3xIaYBa/RKbbGdSxEC33boAWXdFWsxPGyHkGyKxqv\n8H0Lj2xZSv/LsMO5XCro/+DNl4y/KDUL+gJF6JkSklmVwcnFeCMHi93SD3Bxbqsq\njLUxpypYII2X1AtIjK1HvWeJPiQEYnCxbfYMZsDmCg80HKfc+PTcZD5ZZu30YwhE\nBUFCbmH/GUsbIkIXBb9+GpfecVagHYGPpW3eBzn9cWeqA/CHXafpZfk3yw/RMPAe\nOQIDAQAB\n-----END PUBLIC KEY-----",
                            n: "AMh0f6M57Ui-1LwdAds5VX49Q6DuSJRS3PTJ_YO9wxJcEjXFn9nI5Uj342g4_SetNlpuLSP2qptQnW4b2Mx3fPch3Q5UFphY3bE3gPLpuhN3t8SGmAWv0Sm2xnUsRAt926AFl3RVrMTxsh5Bsisar_B9C49sWUr_y7DDuVwq6P_gzZeMvyg1C_oCReiZEpJZlcHJxXgjB4vd0g9wcW6rKoy1MacqWCCNl9QLSIytR71niT4kBGJwsW32DGbA5goPNByn3Pj03GQ-WWbt9GMIRAVBQm5h_xlLGyJCFwW_fhqX3nFWoB2Bj6Vt3gc5_XFnqgPwh12n6WX5N8sP0TDwHjk",
                        },
                        {
                            kty: "RSA",
                            e: "AQAB",
                            use: "sig",
                            kid: "key-id-1132",
                            alg: "RS256",
                            value: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyHR/ozntSL7UvB0B2zlV\nfj1DoO5IlFLc9Mn9g73DElwSNcWf2cjlSPfjaDj9J602Wm4tI/aqm1CdbhvYzHd8\n9yHdDlQWmFjdsTeA8um6E3e3xIaYBa/RKbbGdSxEC33boAWXdFWsxPGyHkGyKxqv\n8H0Lj2xZSv/LsMO5XCro/+DNl4y/KDUL+gJF6JkSklmVwcnFeCMHi93SD3Bxbqsq\njLUxpypYII2X1AtIjK1HvWeJPiQEYnCxbfYMZsDmCg80HKfc+PTcZD5ZZu30YwhE\nBUFCbmH/GUsbIkIXBb9+GpfecVagHYGPpW3eBzn9cWeqA/CHXafpZfk3yw/RMPAe\nOQIDAQAB\n-----END PUBLIC KEY-----",
                            n: "AMh0f6M57Ui-1LwdAds5VX49Q6DuSJRS3PTJ_YO9wxJcEjXFn9nI5Uj342g4_SetNlpuLSP2qptQnW4b2Mx3fPch3Q5UFphY3bE3gPLpuhN3t8SGmAWv0Sm2xnUsRAt926AFl3RVrMTxsh5Bsisar_B9C49sWUr_y7DDuVwq6P_gzZeMvyg1C_oCReiZEpJZlcHJxXgjB4vd0g9wcW6rKoy1MacqWCCNl9QLSIytR71niT4kBGJwsW32DGbA5goPNByn3Pj03GQ-WWbt9GMIRAVBQm5h_xlLGyJCFwW_fhqX3nFWoB2Bj6Vt3gc5_XFnqgPwh12n6WX5N8sP0TDwHjk",
                        },
                    ],
                });

            let errorOccured = false;
            try {
                await assetManagement.GetToken();
                // console.log(JSON.stringify((assetManagement as any)._authenticator!._oauthResponse!));
            } catch (err) {
                errorOccured = true;
                // console.log(JSON.stringify((assetManagement as any)._authenticator!._oauthResponse!));
                // console.log(err);
            }
            errorOccured.should.be.true;
        })
    );

    it("should just work", async () => {
        const sdk = new MindSphereSdk({
            ...auth,
            basicAuth: decrypt(auth, getPasskeyForUnitTest()),
        });
        const agentManagement = sdk.GetAgentManagementClient();

        const token1 = await agentManagement.GetToken();
        token1.should.not.be.undefined;
        (agentManagement as any)._accessToken = undefined;

        const token2 = await agentManagement.GetToken();
        token2.should.not.be.undefined;

        (agentManagement as any)._oauthResponse = undefined;
        const token3 = await agentManagement.GetToken();
        token3.should.not.be.undefined;
        (agentManagement as any)._oauthResponse = undefined;
        (agentManagement as any)._accessToken = undefined;
        const token4 = await agentManagement.GetToken();
        token4.should.not.be.undefined;
        for (let index = 0; index < 5; index++) {
            await agentManagement.GetToken();
        }
    });
});
