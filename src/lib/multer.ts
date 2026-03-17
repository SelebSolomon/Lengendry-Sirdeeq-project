import multer from "multer";
import path from "path";

// Use memory storage for Cloudinary uploads
const multerStorage = multer.memoryStorage();

// File filter helper
const imageFilter = (req: any, file: any, cb: Function) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed!"));
  }
};

// Main uploader
const upload = multer({
  storage: multerStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// Export different field configurations
export const uploadProductImages = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

export const uploadCategoryImage = upload.single("image");
