import { z } from "zod";

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

  ISD_code: z
    .string()
    .regex(/^\+(?:\d{1,3})(?:\s\d{1,3})*$/, "Invalid ISD code")
    .refine((v) => v.replace(/\D/g, "").length <= 6, "Invalid ISD code"),

  phone_no: z.string().regex(/^[1-9]\d{6,14}$/, "Invalid phone number"),
});

const loginUserSchema = z
  .object({
    email: z.email().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone_no: z
      .string()
      .regex(/^[0-9]{10}$/, "Mobile number must be digits only (10 digits)")
      .optional(),
    ISD_code: z
      .string()
      .regex(/^\+\d{1,3}$/, "ISD Code must be like +91, +1, +44")
      .optional(),
  })
  .refine((data) => !!data.email || (!!data.phone_no && !!data.ISD_code), {
    message: "Either email or both ISD code and phone number must be provided",
    path: ["email"],
  });

export { registerUserSchema, loginUserSchema };
