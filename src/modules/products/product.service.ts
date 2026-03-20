import { ParsedQs } from "qs";
import { prisma } from "../../lib/prisma.js";
import { APIFeatures } from "../../utils/api-features.util.js";
import { ProductDto } from "./dto/product.dto.js";
import { productResponse } from "./response/product.response.js";

export const getAllProducts = async (query: ParsedQs) => {
  const features = new APIFeatures(query)
    .filter()
    .sort()
    .fieldsLimit()
    .paginate();

  const args = features.build();

  const [products, total] = await Promise.all([
    prisma.product.findMany(args),
    prisma.product.count({ where: args.where }),
  ]);

  return { products, total };
};

export const postProduct = async (dto: ProductDto) => {
  const category = await prisma.category.findUnique({
    where: { id: dto.categoryId },
  });
  if (!category) return null;

  const slug = dto.name.toLowerCase().replace(/\s+/g, "-");

  const product = await prisma.product.create({
    data: { ...dto, slug },
    select: productResponse,
  });

  return product;
};

export const getOne = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    select: { ...productResponse, reviews: true },
  });
};

export const updateProduct = async (id: string, data: Partial<ProductDto>) => {
  const updateData: Record<string, unknown> = { ...data };

  if (data.name) {
    updateData.slug = data.name.toLowerCase().replace(/\s+/g, "-");
  }

  return prisma.product.update({
    where: { id },
    data: updateData,
    select: { ...productResponse, reviews: true },
  });
};

export const deleteProduct = async (id: string) => {
  const product = await prisma.product.delete({
    where: { id },
    select: { thumbnailPublicId: true, imagePublicIds: true },
  });
  return product;
};
