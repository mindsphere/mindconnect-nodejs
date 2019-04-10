import chalk from "chalk";
import { log } from "console";

export const serviceCredentialLog = () => {
    log(`\n  Important: \n`);
    log(
        `    you need to supply the ${chalk.magentaBright(
            "service credentials"
        )} for this operation and provide the passkey \n`
    );
    log(`    how to get service credentials: `);
    log(
        chalk.magentaBright(
            `    https://developer.mindsphere.io/howto/howto-selfhosted-api-access.html#creating-service-credentials`
        )
    );
};
