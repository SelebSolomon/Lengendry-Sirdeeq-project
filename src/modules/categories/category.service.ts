import { prisma } from "../../lib/prisma.js";
import { CategoryDto } from "./dto/category.dto.js";
import { categoryResponse } from "./response/category.response.js";
export const createCategory = async (dto: CategoryDto) => {
  if (dto.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: dto.parentId },
    });
    if (!parent) return null;
  }

  const slug = dto.name.toLowerCase().replace(/\s+/g, "-");

  const category = await prisma.category.create({
    data: { ...dto, slug },
    select: categoryResponse,
  });

  return category;
};

export const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    select: categoryResponse,
  });

  return categories;
};

export const getCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    select: categoryResponse,
  });

  return category;
};

// Internal use only — includes imagePublicId for Cloudinary cleanup on update
export const getCategoryForUpdate = async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    select: { ...categoryResponse, imagePublicId: true },
  });
};

export const updateCategory = async (
  id: string,
  data: Partial<CategoryDto>,
) => {
  const updateData: Record<string, unknown> = { ...data };

  if (data.name) {
    updateData.slug = data.name.toLowerCase().replace(/\s+/g, "-");
  }

  const category = await prisma.category.update({
    where: { id },
    data: updateData,
    select: categoryResponse,
  });

  return category;
};

export const getCategoryForDelete = async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    select: { ...categoryResponse, imagePublicId: true },
  });
};

export const hasChildCategories = async (id: string) => {
  const child = await prisma.category.findFirst({ where: { parentId: id } });
  return !!child;
};

export const deleteCategory = async (id: string) => {
  await prisma.category.delete({ where: { id } });
};
