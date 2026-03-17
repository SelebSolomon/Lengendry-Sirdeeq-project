import { z } from "zod";

export const registerSchema = z
  .object({
    userName: z.string().trim().min(3, "Username must be at least 3 characters"),
    DOB: z.coerce.date(),
    gender: z.enum(["Male", "Female"]),
    email: z.string().email("Invalid email"),
    phone: z.string().trim().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email().optional(),
  userName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  password: z.string().min(1, "Password is required"),
}).refine(
  (data) => data.email || data.userName || data.phone,
  { message: "Provide email, username, or phone" }
);

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updatePasswordSchema = z
  .object({
    passwordCurrent: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
