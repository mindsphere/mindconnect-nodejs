import * as debug from "debug";
import fetch from "node-fetch";
import { DiagnosticInformation, PagedDiagnosticActivation, PagedDiagnosticInformation } from "..";
import { CredentialAuth } from "./credential-auth";
const log = debug("mindconnect-setup");
// Copyright (C), Siemens AG 2017

/**
 * This class can be used to perform some setup tasks
 * which can't be performed with the mindconnect agent itself.
 *
 * It is mostly used by the CLI to offboard the agents, clean up etc.
 *
 * @export
 * @class MindConnectSetup
 */
export class MindConnectSetup extends CredentialAuth {
    /**
     * Register the agent for diagnostics.
     *
     * @param {string} agentId
     * @returns
     *
     * @memberOf MindConnectSetup
     */
    public async RegisterForDiagnostic(agentId: string) {
        if (!/[a-f0-9]{32}/gi.test(agentId)) {
            throw new Error("You have to pass valid 32 char long agent id");
        }

        await this.RenewToken();
        if (!this._accessToken) throw new Error("The agent doesn't have a valid access token.");

        const headers = { ...this._apiHeaders, Authorization: `Bearer ${this._accessToken.access_token}` };
        const url = `${this._gateway}/api/mindconnect/v3/diagnosticActivations`;

        log(`RegisterForDiagnostic Headers ${JSON.stringify(headers)} Url ${url}`);

        const body = { agentId: agentId };

        try {
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(body),
                headers: headers,
                agent: this._proxyHttpAgent
            });
            if (!response.ok) {
                throw new Error(`${response.statusText} ${await response.text()}`);
            }
            if (response.status >= 200 && response.status <= 299) {
                const json = await response.json();
                log(`RegisterForDiagnostic Response ${JSON.stringify(json)}`);
                return json;
            } else {
                throw new Error(`invalid response ${JSON.stringify(response)}`);
            }
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    /**
     * Unregister the agent from the diagnostics.
     *
     * @param {string} agentId
     * @param {boolean} [ignoreError=false]
     * @returns
     *
     * @memberOf MindConnectSetup
     */
    public async DeleteDiagnostic(agentId: string, ignoreError: boolean = false) {
        if (!/[a-f0-9]{32}/gi.test(agentId)) {
            throw new Error("You have to pass valid 32 char long agent id");
        }
        const activations = await this.GetDiagnosticActivations();

        for (const activation of activations.content) {
            if (activation.agentId === agentId) {
                if (!activation.id) {
                    throw new Error("invalid activation id at diagnostic endpoint!");
                }
                await this.DeleteActivation(activation.id);
                return true;
            }
        }

        if (!ignoreError) {
            throw Error("there is no such agent id registered for diagnostic");
        }
    }

    private async DeleteActivation(activationId: string) {
        await this.RenewToken();
        if (!this._accessToken) throw new Error("The agent doesn't have a valid access token.");

        const headers = { ...this._apiHeaders, Authorization: `Bearer ${this._accessToken.access_token}` };
        const url = `${this._gateway}/api/mindconnect/v3/diagnosticActivations/${activationId}`;

        log(`DeleteDiagnostic Headers ${JSON.stringify(headers)} Url ${url}`);

        try {
            const response = await fetch(url, { method: "DELETE", headers: headers, agent: this._proxyHttpAgent });
            if (!response.ok) {
                throw new Error(`${response.statusText} ${await response.text()}`);
            }
            if (response.status >= 200 && response.status <= 299) {
                return true;
            } else {
                throw new Error(`invalid response ${JSON.stringify(response)}`);
            }
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    /**
     * Delete all diagnostic activations. As there are only 5 global diagnostic activations this can have unintended consequences.
     * Use with care.
     *
     * @memberOf MindConnectSetup
     */
    public async DeleteAllDiagnosticActivations() {
        const activations = await this.GetDiagnosticActivations();
        for (const activation of activations.content) {
            if (activation.id) await this.DeleteActivation(activation.id);
            log(`Deleting activation with ${activation.id} for agent ${activation.agentId}`);
        }
    }

    /**
     * Gets all registered agents for diagnostic.
     *
     * @returns {Promise<PagedDiagnosticActivation>}
     *
     * @memberOf MindConnectSetup
     */
    public async GetDiagnosticActivations(): Promise<PagedDiagnosticActivation> {
        await this.RenewToken();
        if (!this._accessToken) throw new Error("The agent doesn't have a valid access token.");

        const headers = { ...this._apiHeaders, Authorization: `Bearer ${this._accessToken.access_token}` };
        const url = `${this._gateway}/api/mindconnect/v3/diagnosticActivations`;

        log(`GetDiagnosticActivations Headers ${JSON.stringify(headers)} Url ${url}`);

        try {
            const response = await fetch(url, { method: "GET", headers: headers, agent: this._proxyHttpAgent });
            if (!response.ok) {
                throw new Error(`${response.statusText} ${await response.text()}`);
            }
            if (response.status >= 200 && response.status <= 299) {
                const json = await response.json();
                log(`GetDiagnosticActivations Response ${JSON.stringify(json)}`);
                return json;
            } else {
                throw new Error(`invalid response ${JSON.stringify(response)}`);
            }
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }

    /**
     * Gets the diagnostic information for the registered agent(s)
     *
     * @param {string} [agentId] - Optional: If passed, only logs for this agent will be retrieved.
     * @param {(x: DiagnosticInformation[], ...args: any[]) => any} [callback] - Optional: pass the function which will handle the paged diagnostic info. The CLI uses printing to console function
     * @param {*} [callbackOptions]
     * @returns
     *
     * @memberOf MindConnectSetup
     */
    public async GetDiagnosticInformation(
        agentId?: string,
        callback?: (x: DiagnosticInformation[], ...args: any[]) => any,
        callbackOptions?: any,
        skipToLast: boolean = true
    ) {
        let pagedInformation: PagedDiagnosticInformation;
        let page = 0;
        do {
            pagedInformation = await this.GetPagedInforamtion(page++, agentId);
            if (skipToLast) {
                page = pagedInformation.totalPages - 2;
                if (page < 0) page = 0;
                skipToLast = false;
                if (!pagedInformation.last) {
                    continue;
                }
            }
            if (callback) {
                callback(pagedInformation.content, callbackOptions);
            }
        } while (!pagedInformation.last);
        return pagedInformation;
    }

    private async GetPagedInforamtion(page: number, agentId?: string): Promise<PagedDiagnosticInformation> {
        await this.RenewToken();
        if (!this._accessToken) throw new Error("The agent doesn't have a valid access token.");

        const headers = { ...this._apiHeaders, Authorization: `Bearer ${this._accessToken.access_token}` };
        let url = `${this._gateway}/api/mindconnect/v3/diagnosticInformation?size=50&page=${page}`;
        if (agentId) {
            url = `${url}&filter={"agentId" : "${agentId}"}`;
        }

        log(`GetDiagnosticInformation Headers ${JSON.stringify(headers)} Url ${url}`);

        try {
            const response = await fetch(url, { method: "GET", headers: headers, agent: this._proxyHttpAgent });
            if (!response.ok) {
                throw new Error(`${response.statusText} ${await response.text()}`);
            }
            if (response.status >= 200 && response.status <= 299) {
                const json = await response.json();
                log(`GetDiagnosticInformation Response ${JSON.stringify(json)}`);
                return json;
            } else {
                throw new Error(`invalid response ${JSON.stringify(response)}`);
            }
        } catch (err) {
            log(err);
            throw new Error(`Network error occured ${err.message}`);
        }
    }
}
