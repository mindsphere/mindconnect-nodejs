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

    it("should acquire token", async () => {
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
                            value:
                                "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyHR/ozntSL7UvB0B2zlV\nfj1DoO5IlFLc9Mn9g73DElwSNcWf2cjlSPfjaDj9J602Wm4tI/aqm1CdbhvYzHd8\n9yHdDlQWmFjdsTeA8um6E3e3xIaYBa/RKbbGdSxEC33boAWXdFWsxPGyHkGyKxqv\n8H0Lj2xZSv/LsMO5XCro/+DNl4y/KDUL+gJF6JkSklmVwcnFeCMHi93SD3Bxbqsq\njLUxpypYII2X1AtIjK1HvWeJPiQEYnCxbfYMZsDmCg80HKfc+PTcZD5ZZu30YwhE\nBUFCbmH/GUsbIkIXBb9+GpfecVagHYGPpW3eBzn9cWeqA/CHXafpZfk3yw/RMPAe\nOQIDAQAB\n-----END PUBLIC KEY-----",
                            n:
                                "AMh0f6M57Ui-1LwdAds5VX49Q6DuSJRS3PTJ_YO9wxJcEjXFn9nI5Uj342g4_SetNlpuLSP2qptQnW4b2Mx3fPch3Q5UFphY3bE3gPLpuhN3t8SGmAWv0Sm2xnUsRAt926AFl3RVrMTxsh5Bsisar_B9C49sWUr_y7DDuVwq6P_gzZeMvyg1C_oCReiZEpJZlcHJxXgjB4vd0g9wcW6rKoy1MacqWCCNl9QLSIytR71niT4kBGJwsW32DGbA5goPNByn3Pj03GQ-WWbt9GMIRAVBQm5h_xlLGyJCFwW_fhqX3nFWoB2Bj6Vt3gc5_XFnqgPwh12n6WX5N8sP0TDwHjk",
                        },
                        {
                            kty: "RSA",
                            e: "AQAB",
                            use: "sig",
                            kid: "key-id-4",
                            alg: "RS256",
                            value:
                                "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyHR/ozntSL7UvB0B2zlV\nfj1DoO5IlFLc9Mn9g73DElwSNcWf2cjlSPfjaDj9J602Wm4tI/aqm1CdbhvYzHd8\n9yHdDlQWmFjdsTeA8um6E3e3xIaYBa/RKbbGdSxEC33boAWXdFWsxPGyHkGyKxqv\n8H0Lj2xZSv/LsMO5XCro/+DNl4y/KDUL+gJF6JkSklmVwcnFeCMHi93SD3Bxbqsq\njLUxpypYII2X1AtIjK1HvWeJPiQEYnCxbfYMZsDmCg80HKfc+PTcZD5ZZu30YwhE\nBUFCbmH/GUsbIkIXBb9+GpfecVagHYGPpW3eBzn9cWeqA/CHXafpZfk3yw/RMPAe\nOQIDAQAB\n-----END PUBLIC KEY-----",
                            n:
                                "AMh0f6M57Ui-1LwdAds5VX49Q6DuSJRS3PTJ_YO9wxJcEjXFn9nI5Uj342g4_SetNlpuLSP2qptQnW4b2Mx3fPch3Q5UFphY3bE3gPLpuhN3t8SGmAWv0Sm2xnUsRAt926AFl3RVrMTxsh5Bsisar_B9C49sWUr_y7DDuVwq6P_gzZeMvyg1C_oCReiZEpJZlcHJxXgjB4vd0g9wcW6rKoy1MacqWCCNl9QLSIytR71niT4kBGJwsW32DGbA5goPNByn3Pj03GQ-WWbt9GMIRAVBQm5h_xlLGyJCFwW_fhqX3nFWoB2Bj6Vt3gc5_XFnqgPwh12n6WX5N8sP0TDwHjk",
                        },
                    ],
                });

            const token = await agentManagement.GetToken();
            token.should.not.be.undefined;
        })
    );

    it(
        "should throw error if there is no key",
        mochaAsync(async () => {
            const sdk = new MindSphereSdk({
                ...auth,
                basicAuth: decrypt(auth, getPasskeyForUnitTest()),
            });
            const assetManagement = sdk.GetAssetManagementClient();
            nock(`https://${sdk.GetTenant()}.piam.eu1.mindsphere.io:443`, {
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
                            value:
                                "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyHR/ozntSL7UvB0B2zlV\nfj1DoO5IlFLc9Mn9g73DElwSNcWf2cjlSPfjaDj9J602Wm4tI/aqm1CdbhvYzHd8\n9yHdDlQWmFjdsTeA8um6E3e3xIaYBa/RKbbGdSxEC33boAWXdFWsxPGyHkGyKxqv\n8H0Lj2xZSv/LsMO5XCro/+DNl4y/KDUL+gJF6JkSklmVwcnFeCMHi93SD3Bxbqsq\njLUxpypYII2X1AtIjK1HvWeJPiQEYnCxbfYMZsDmCg80HKfc+PTcZD5ZZu30YwhE\nBUFCbmH/GUsbIkIXBb9+GpfecVagHYGPpW3eBzn9cWeqA/CHXafpZfk3yw/RMPAe\nOQIDAQAB\n-----END PUBLIC KEY-----",
                            n:
                                "AMh0f6M57Ui-1LwdAds5VX49Q6DuSJRS3PTJ_YO9wxJcEjXFn9nI5Uj342g4_SetNlpuLSP2qptQnW4b2Mx3fPch3Q5UFphY3bE3gPLpuhN3t8SGmAWv0Sm2xnUsRAt926AFl3RVrMTxsh5Bsisar_B9C49sWUr_y7DDuVwq6P_gzZeMvyg1C_oCReiZEpJZlcHJxXgjB4vd0g9wcW6rKoy1MacqWCCNl9QLSIytR71niT4kBGJwsW32DGbA5goPNByn3Pj03GQ-WWbt9GMIRAVBQm5h_xlLGyJCFwW_fhqX3nFWoB2Bj6Vt3gc5_XFnqgPwh12n6WX5N8sP0TDwHjk",
                        },
                        {
                            kty: "RSA",
                            e: "AQAB",
                            use: "sig",
                            kid: "key-id-1132",
                            alg: "RS256",
                            value:
                                "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyHR/ozntSL7UvB0B2zlV\nfj1DoO5IlFLc9Mn9g73DElwSNcWf2cjlSPfjaDj9J602Wm4tI/aqm1CdbhvYzHd8\n9yHdDlQWmFjdsTeA8um6E3e3xIaYBa/RKbbGdSxEC33boAWXdFWsxPGyHkGyKxqv\n8H0Lj2xZSv/LsMO5XCro/+DNl4y/KDUL+gJF6JkSklmVwcnFeCMHi93SD3Bxbqsq\njLUxpypYII2X1AtIjK1HvWeJPiQEYnCxbfYMZsDmCg80HKfc+PTcZD5ZZu30YwhE\nBUFCbmH/GUsbIkIXBb9+GpfecVagHYGPpW3eBzn9cWeqA/CHXafpZfk3yw/RMPAe\nOQIDAQAB\n-----END PUBLIC KEY-----",
                            n:
                                "AMh0f6M57Ui-1LwdAds5VX49Q6DuSJRS3PTJ_YO9wxJcEjXFn9nI5Uj342g4_SetNlpuLSP2qptQnW4b2Mx3fPch3Q5UFphY3bE3gPLpuhN3t8SGmAWv0Sm2xnUsRAt926AFl3RVrMTxsh5Bsisar_B9C49sWUr_y7DDuVwq6P_gzZeMvyg1C_oCReiZEpJZlcHJxXgjB4vd0g9wcW6rKoy1MacqWCCNl9QLSIytR71niT4kBGJwsW32DGbA5goPNByn3Pj03GQ-WWbt9GMIRAVBQm5h_xlLGyJCFwW_fhqX3nFWoB2Bj6Vt3gc5_XFnqgPwh12n6WX5N8sP0TDwHjk",
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
