import { TokenRotation } from "./mindconnect-base";

export class TokenManagerAuth implements TokenRotation {
    public async RenewToken(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}
