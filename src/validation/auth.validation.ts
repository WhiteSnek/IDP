import { z } from "zod";

const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "Phone must be in E.164 format (e.g. +919876543210)");

const registerUserSchema = z.object({
  email: z.string().email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),

  first_name: z.string().min(1, "First name is required"),

  last_name: z.string().min(1, "Last name is required"),

  phone: phoneSchema,
});

const loginUserSchema = z
  .object({
    email: z.email().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: phoneSchema.optional(),
  })
  .refine((data) => !!data.email || (!!data.phone), {
    message: "Either email or phone number must be provided",
    path: ["email"],
  });

export { registerUserSchema, loginUserSchema };
