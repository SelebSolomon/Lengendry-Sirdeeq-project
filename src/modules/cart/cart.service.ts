import { prisma } from "../../lib/prisma.js";
import { AddToCartDto, UpdateCartDto } from "./dto/cart.dto.js";

const cartWithItems = {
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

const recalculateTotal = async (cartId: string) => {
  const items = await prisma.cartItem.findMany({ where: { cartId } });
  const totalPrice = items.reduce(
    (acc, item) => acc + item.priceSnapshot * item.quantity,
    0,
  );
  return prisma.cart.update({
    where: { id: cartId },
    data: { totalPrice },
    select: cartWithItems,
  });
};

export const addToCart = async (userId: string, dto: AddToCartDto) => {
  const product = await prisma.product.findUnique({
    where: { id: dto.productId },
    select: { id: true, price: true },
  });
  if (!product) return null;

  // Find or create cart
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId, totalPrice: 0 } });
  }

  // Check if item already in cart
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId: dto.productId },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + dto.quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
        priceSnapshot: product.price,
      },
    });
  }

  return recalculateTotal(cart.id);
};

export const getCart = async (userId: string) => {
  return prisma.cart.findUnique({
    where: { userId },
    select: cartWithItems,
  });
};

export const updateCart = async (
  itemId: string,
  dto: UpdateCartDto,
  userId: string,
) => {
  // Verify item belongs to this user's cart
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
  });

  if (!item) return null;

  // quantity 0 = remove item
  if (dto.quantity === 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });
  }

  return recalculateTotal(item.cartId);
};

export const removeItemFromCart = async (userId: string, itemId: string) => {
  // Verify item belongs to this user's cart before deleting
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
  });

  if (!item) return null;

  await prisma.cartItem.delete({ where: { id: itemId } });

  return recalculateTotal(item.cartId);
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return null;

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return prisma.cart.update({
    where: { id: cart.id },
    data: { totalPrice: 0 },
    select: cartWithItems,
  });
};
