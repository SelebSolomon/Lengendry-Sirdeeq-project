import cloudinary from "../config/cloudinary.config.js";
// Upload a single file buffer to Cloudinary
export const uploadImage = (
  file: Express.Multer.File,
  subFolder: string,
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `sirdeaq/${subFolder}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      },
    );
    uploadStream.end(file.buffer);
  });
};

// Delete an image from Cloudinary by its public ID
export const deleteImage = async (public_id: string): Promise<void> => {
  await cloudinary.uploader.destroy(public_id);
};
