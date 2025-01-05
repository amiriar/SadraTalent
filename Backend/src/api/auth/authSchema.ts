import { z } from "zod";

export const AuthSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(25, "Username must not exceed 25 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(32, "Password must not exceed 32 characters"),
});

export const LoginSchema = z.object({
  usernameOrEmail: z.string().min(3, "UsernameOrEmail must be at least 3 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(32, "Password must not exceed 32 characters"),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
});

export const RefreshTokenSchema = z.object({
  token: z.string(),
});

export const SendOtpSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required").max(12, "Phone number should be less than 12"),
});

export const VerifyOtpSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required").max(12, "Phone number is should be less than 12"),
  otp: z.string().length(5, "OTP must be 5 digits"),
});
