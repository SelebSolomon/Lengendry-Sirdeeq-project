import { PaymentMethod } from "../../../../generated/prisma/enums.js";

export interface ShippingAddressDto {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderDto {
  userId: string;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddressDto;
}

export interface CancelOrderReason {
  canceledReason: string;
}
