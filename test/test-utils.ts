export const mochaAsync = (fn: any) => {
    return (done: any) => {
        fn.call().then(done, (err: any) => {
            done(err);
        });
    };
};

export const sleep = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

export const errorHelper = async (fn: Function): Promise<boolean> => {
    let errorOccured = false;
    try {
        await fn();
    } catch (err) {
        errorOccured = true;
    }
    return errorOccured;
};

/**
 * passkey for unit tests. if the environment variable is not set it is using the default passkey.
 *
 * @export
 * @returns {string}
 */
export function getPasskeyForUnitTest(): string {
    if (!process.env.MDSP_PASSKEY) {
        console.error("--------------------------------------------------------------------------------------------");
        console.error(
            "\x1b[31m%s\x1b[0m",
            "\nPlease set the MDSP_PASSKEY environment variable for your passkey before running unit tests."
        );
        console.error("\nsee: https://opensource.mindsphere.io/docs/mindconnect-nodejs/cli/setting-up-the-cli.html\n");
        console.error("--------------------------------------------------------------------------------------------");
        process.exit(-1);
    }
    return process.env.MDSP_PASSKEY;
}
