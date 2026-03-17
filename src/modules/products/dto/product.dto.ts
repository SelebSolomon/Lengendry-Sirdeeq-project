export interface ProductDto {
  name: string;
  price: number;
  description: string;
  stock: number;
  thumbnail: string;
  thumbnailPublicId: string;
  images: string[];
  imagePublicIds: string[];
  categoryId: string;
  vendorId: string;
}
