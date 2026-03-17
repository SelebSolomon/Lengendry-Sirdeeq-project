import { prisma } from "../../lib/prisma.js";
import { CategoryDto } from "./dto/category.dto.js";

const categoryResponse = {
  id: true,
  name: true,
  description: true,
  slug: true,
  image: true,
  parentId: true,
  createdAt: true,
};
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


export const updateCategory = async (id: string) => {
    
}