const config = require(process.argv[2]);
const versionconfig = require("../package.json");

config.dependencies["@mindconnect/mindconnect-nodejs"] = `file:mindconnect-mindconnect-nodejs-${versionconfig.version}.tgz`;

console.log(JSON.stringify(config, null, 2));