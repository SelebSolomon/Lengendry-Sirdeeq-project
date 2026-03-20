export interface PaystackMetadata {
  orderId: string;
  userId: string;
}

export interface PaystackChargeData {
  reference: string;
  amount: number; // in kobo
  status: string;
  metadata: PaystackMetadata;
}

export interface PaystackWebhookEvent {
  event: string;
  data: PaystackChargeData;
}
