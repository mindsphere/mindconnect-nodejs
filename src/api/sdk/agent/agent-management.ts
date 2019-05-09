import { SdkClient } from "../common/sdk-client";

export class AgentManagementClient extends SdkClient {
    public async Test() {
        return "123";
    }
}
// export class XX extends MindConnectBase {
//     private _baseUrl: string = "/api/agentmanagement/v3";
//     public test() {}
// }
