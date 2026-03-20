export const cartResponse = {
  id: true,
  totalPrice: true,
  items: {
    select: {
      id: true,
      productId: true,
      quantity: true,
      priceSnapshot: true,
    },
  },
};
