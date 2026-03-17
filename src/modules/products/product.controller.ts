import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch-async.js";
import AppError from "../../utils/app-error.js";
import { response } from "../../utils/response.util.js";
import { getPagination, paginate } from "../../utils/pagination.util.js";
import client from "../../lib/redis.js";
import * as productService from "./product.service.js";
import { uploadImage, deleteImage } from "../../lib/cloudinary.js";

const CACHE_TTL = 60 * 60; // 1 hour

export const getAllProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = `products:${JSON.stringify(req.query)}`;

    const cached = await client.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .json({ status: "success", source: "cache", ...JSON.parse(cached) });
    }

    const { products, total } = await productService.getAllProducts(req.query);

    if (!products.length) {
      return next(new AppError("No products found", 404));
    }

    const pagination = getPagination(req);
    const result = paginate(products, total, pagination);

    // 4. Cache result
    await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));

    response(res, 200, result);
  },
);

export const postProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.thumbnail?.[0]) {
      return next(new AppError("Thumbnail image is required", 400));
    }

    // Upload thumbnail
    const thumbnailUpload = await uploadImage(
      files.thumbnail[0],
      "products/thumbnails",
    );

    // Upload gallery images (optional)
    const galleryUploads = files?.images?.length
      ? await Promise.all(
          files.images.map((file) => uploadImage(file, "products/gallery")),
        )
      : [];

    const dto = {
      ...req.body,
      vendorId: req.user!.id,
      thumbnail: thumbnailUpload.secure_url,
      thumbnailPublicId: thumbnailUpload.public_id,
      images: galleryUploads.map((img) => img.secure_url),
      imagePublicIds: galleryUploads.map((img) => img.public_id),
    };

    const product = await productService.postProduct(dto);
    if (!product) return next(new AppError("Category does not exist", 404));

    // Bust all product list caches
    const cacheKeys = await client.keys("products:*");
    if (cacheKeys.length)
      await Promise.all(cacheKeys.map((key) => client.del(key)));

    response(res, 201, product);
  },
);

export const getOne = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const cacheKey = `product:${id}`;

    const cached = await client.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .json({ status: "success", source: "cache", data: JSON.parse(cached) });
    }

    const product = await productService.getOne(id);
    if (!product) return next(new AppError("Product not found", 404));

    await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(product));

    response(res, 200, product);
  },
);

export const updateProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    // Fetch existing product to get old Cloudinary public IDs
    const existing = await productService.getOne(id);
    if (!existing) return next(new AppError("Product not found", 404));

    const allowedFields = [
      "name",
      "price",
      "description",
      "stock",
      "categoryId",
    ];

    const updateData: Record<string, unknown> = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
    );

    // Replace thumbnail if a new one was uploaded — delete old from Cloudinary
    if (files?.thumbnail?.[0]) {
      await deleteImage(existing.thumbnailPublicId);
      const thumbnailUpload = await uploadImage(
        files.thumbnail[0],
        "products/thumbnails",
      );
      updateData.thumbnail = thumbnailUpload.secure_url;
      updateData.thumbnailPublicId = thumbnailUpload.public_id;
    }

    // Replace gallery images if new ones were uploaded — delete old from Cloudinary
    if (files?.images?.length) {
      await Promise.all(existing.imagePublicIds.map((pid) => deleteImage(pid)));
      const galleryUploads = await Promise.all(
        files.images.map((file) => uploadImage(file, "products/gallery")),
      );
      updateData.images = galleryUploads.map((img) => img.secure_url);
      updateData.imagePublicIds = galleryUploads.map((img) => img.public_id);
    }

    const product = await productService.updateProduct(id, updateData);

    // Bust caches
    const cacheKeys = await client.keys("products:*");
    if (cacheKeys.length)
      await Promise.all(cacheKeys.map((key) => client.del(key)));
    await client.del(`product:${id}`);

    response(res, 200, product);
  },
);

export const deleteProduct = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const id = req.params.id as string;

    const { thumbnailPublicId, imagePublicIds } = await productService.deleteProduct(id);

    // Clean up Cloudinary assets in parallel
    await Promise.all([
      deleteImage(thumbnailPublicId),
      ...imagePublicIds.map((pid) => deleteImage(pid)),
    ]);

    // Bust caches
    const cacheKeys = await client.keys("products:*");
    if (cacheKeys.length) await Promise.all(cacheKeys.map((key) => client.del(key)));
    await client.del(`product:${id}`);

    res.status(204).send();
  },
);
