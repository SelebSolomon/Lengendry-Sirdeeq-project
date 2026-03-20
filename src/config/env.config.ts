import "dotenv/config";

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env variable: ${key}`);

  return value;
};
export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: required("PORT"),
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: required("JWT_SECRET_EXPIRES_IN"),
  JWT_COOKIE_EXPIRES_IN: Number(required("JWT_COOKIE_EXPIRES_IN")),

  CLOUDINARY_CLOUD_NAME: required("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: required("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: required("CLOUDINARY_API_SECRET"),

  PAYSTACK_SECRET_KEY: required("PAYSTACK_SECRET_KEY"),
  SENDGRID_API_KEY: required("SENDGRID_API_KEY"),
  SENDGRID_FROM: required("SENDGRID_FROM"),
  FRONTEND_URL: required("FRONTEND_URL"),
};
