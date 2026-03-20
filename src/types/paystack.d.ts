declare module "@paystack/paystack-sdk" {
  interface TransactionInitializeParams {
    email: string;
    amount: string;
    channels?: string[];
    metadata?: Record<string, unknown>;
  }

  interface TransactionInitializeResponse {
    status: boolean;
    message: string;
    data: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  }

  class Paystack {
    constructor(secretKey: string);
    transaction: {
      initialize(
        params: TransactionInitializeParams,
      ): Promise<TransactionInitializeResponse>;
    };
    refund: {
      create(params: { transaction: string; amount?: string }): Promise<void>;
    };
  }

  export default Paystack;
}
