export namespace AdvancedTokenExchangeModels {
    export interface AdvancedTokenExchangeRequest {
        subject_token: string;
        subject_token_type: string;
        grant_type: string;
        resource: string;
    }

    export interface AdvancedTokenExchangeResponse {}
}
