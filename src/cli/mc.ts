#!/usr/bin/env node
import * as program from "commander";
import aggregatesCommand from "./commands/aggregates";
import eventAnalyticsCommand from "./commands/analyze-events";
import aspectCommands from "./commands/aspect-commands";
import assetInfoCommand from "./commands/asset-info";
import assetTypeCommand from "./commands/asset-types";
import assetsCommand from "./commands/assets";
import deviceTypeCommand from "./commands/device-types";
import dataExchangeCommand from "./commands/data-exchange";
import dataLakeCommand from "./commands/data-lake";
import deleteAssetCommand from "./commands/delete-asset";
import deleteFileCommand from "./commands/delete-file";
import downloadEventsCommand from "./commands/download-events";
import eventTypesCommand from "./commands/event-types";
import eventsCommand from "./commands/events";
import identityCommand from "./commands/identity";
import iotCheckBulkComand from "./commands/iot-bulk-check";
import iotBulkRunCommand from "./commands/iot-bulk-run";
import iotDownloadBulkCommand from "./commands/iot-download-bulk";
import iotBulkDirCommand from "./commands/iot-prepare-bulk-dir";
import jobsCommand from "./commands/jobmanager-jobs";
import scheduleCommand from "./commands/jobmanager-schedules";
import kpicalculationCommand from "./commands/kpi-calculation";
import agentStatusCommand from "./commands/mc-agent-status";
import agentTokenCommand from "./commands/mc-agent-token";
import agentAutoConfigCommand from "./commands/mc-automap";
import createAgentCommand from "./commands/mc-create-agent";
import createEventCommand from "./commands/mc-create-event";
import downloadFileCommand from "./commands/mc-download-file";
import getDiagnosticCommand from "./commands/mc-get-diagnostic";
import listAssetsCommand from "./commands/mc-list-assets";
import listFilesCommand from "./commands/mc-list-files";
import offboardCommand from "./commands/mc-offboard-agent";
import onboardCommand from "./commands/mc-onboard";
import devProxyCommand from "./commands/mc-proxy";
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
import mobileAppInstancesCommand from "./commands/mobile-app-instances";
import mobileAppsCommand from "./commands/mobile-apps";
import modelsCommand from "./commands/models";
import anomalydetectionCommand from "./commands/anomaly-detection";
import mqttCreateCommand from "./commands/mqtt-create-jwt";
import notificationCommand from "./commands/notifications";
import signalCalculationCommand from "./commands/signal-calculation";
import signalValidationCommand from "./commands/signal-validation";
import spectrumAnalysisCommand from "./commands/spectrum-analysis";
import subtenantCommand from "./commands/subtenant";
import tenantCommand from "./commands/tenant";
import trendPredictionCommand from "./commands/trend-prediction";

// * generic commands

versionAndHelp(program);

// * agent commands
onboardCommand(program);
agentAutoConfigCommand(program);
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

// * assets files and event handling commands
assetInfoCommand(program);
assetsCommand(program);
assetTypeCommand(program);
aspectCommands(program);
eventTypesCommand(program);
eventsCommand(program);
downloadEventsCommand(program);
aggregatesCommand(program);
notificationCommand(program);
deviceTypeCommand(program);

// * tenant commands

tenantCommand(program);
subtenantCommand(program);

// * deprecated commands for 4.0.0

listAssetsCommand(program);
deleteAssetCommand(program);
listFilesCommand(program);
downloadFileCommand(program);
deleteFileCommand(program);

// * identity access management commands

identityCommand(program);

// * data lake
dataLakeCommand(program);

// * mobileApps

mobileAppsCommand(program);
mobileAppInstancesCommand(program);

// * analytics command

spectrumAnalysisCommand(program);
signalValidationCommand(program);
signalCalculationCommand(program);
trendPredictionCommand(program);
kpicalculationCommand(program);
eventAnalyticsCommand(program);
// * models commnds
modelsCommand(program);
jobsCommand(program);
scheduleCommand(program);
dataExchangeCommand(program);

// * anomaly detection commands
anomalydetectionCommand(program);

// * dev proxy command
devProxyCommand(program);

// * opcua pub sub commands
mqttCreateCommand(program);

// * cli for starter projects
starterTsCommand(program);
starterJsCommand(program);

program.on("command:*", function () {
    console.error("Invalid command: %s\nSee --help for a list of available commands.", program.args.join(" "));
    process.exit(1);
});

program.parse(process.argv);

if (process.argv.length < 3) {
    program.outputHelp();
}

export default program;
