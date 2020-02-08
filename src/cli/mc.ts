#!/usr/bin/env node
import * as program from "commander";
import deleteAssetCommand from "./commands/delete-asset";
import deleteFileCommand from "./commands/delete-file";
import iotCheckBulkComand from "./commands/iot-bulk-check";
import iotBulkRunCommand from "./commands/iot-bulk-run";
import iotDownloadBulkCommand from "./commands/iot-download-bulk";
import iotBulkDirCommand from "./commands/iot-prepare-bulk-dir";
import kpicalculation from "./commands/kpi-calculation";
import agentStatusCommand from "./commands/mc-agent-status";
import agentTokenCommand from "./commands/mc-agent-token";
import createAgentCommand from "./commands/mc-create-agent";
import createEventCommand from "./commands/mc-create-event";
import downloadFileCommand from "./commands/mc-download-file";
import getDiagnosticCommand from "./commands/mc-get-diagnostic";
import listAssetsCommand from "./commands/mc-list-assets";
import listFilesCommand from "./commands/mc-list-files";
import offboardCommand from "./commands/mc-offboard-agent";
import onboardCommand from "./commands/mc-onboard";
import registerDiagnosticCommand from "./commands/mc-register-diagnostic";
import renewAgentCommand from "./commands/mc-renew-agent";
import serviceCredentialsCommand from "./commands/mc-service-credentials";
import serviceTokenCommand from "./commands/mc-service-token";
import starterJsCommand from "./commands/mc-starter-js";
import starterTsCommand from "./commands/mc-starter-ts";
import unregisterDiagnoticCommand from "./commands/mc-unregister-diagnostic";
import uploadFileCommand from "./commands/mc-upload-file";
import uploadTimeSeriesCommand from "./commands/mc-upload-timeseries";
import versionAndHelp from "./commands/mc-version-help";
import signalValidationCommand from "./commands/signal-validation";
import spectrumAnalysisCommand from "./commands/spectrum-analysis";
import trendPrediction from "./commands/trend-prediction";

// * generic commands
versionAndHelp(program);

// * agent commands
onboardCommand(program);
agentTokenCommand(program);
uploadTimeSeriesCommand(program);

// * common commands
uploadFileCommand(program);
createEventCommand(program);
agentStatusCommand(program);

// * setup commands
createAgentCommand(program);
offboardCommand(program);
renewAgentCommand(program);
serviceCredentialsCommand(program);
serviceTokenCommand(program);
registerDiagnosticCommand(program);
getDiagnosticCommand(program);
unregisterDiagnoticCommand(program);

// * setup for iot bulk upload
iotBulkDirCommand(program);
iotBulkRunCommand(program);
iotCheckBulkComand(program);
iotDownloadBulkCommand(program);

// * assets and files handling commands
listAssetsCommand(program);
deleteAssetCommand(program);
listFilesCommand(program);
downloadFileCommand(program);
deleteFileCommand(program);

// * analytics command

spectrumAnalysisCommand(program);
signalValidationCommand(program);
trendPrediction(program);
kpicalculation(program);

// * cli for starter projects
starterTsCommand(program);
starterJsCommand(program);

program.on("command:*", function() {
    console.error("Invalid command: %s\nSee --help for a list of available commands.", program.args.join(" "));
    process.exit(1);
});

program.parse(process.argv);

if (process.argv.length < 3) {
    program.outputHelp();
}

export default program;
