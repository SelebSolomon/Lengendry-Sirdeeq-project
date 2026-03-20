export const orderResponse = {
  id: true,
  totalPrice: true,
  paymentMethod: true,
  paymentStatus: true,
  shippingStatus: true,
  street: true,
  city: true,
  postalCode: true,
  country: true,
  createdAt: true,
  items: {
    select: {
      id: true,
      productId: true,
      nameSnapshot: true,
      imageSnapshot: true,
      quantity: true,
      price: true,
    },
  },
};
