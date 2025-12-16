import { z } from "zod";

const registerUserSchema = z.object({
  email: z.email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone_no: z
    .string()
    .regex(/^[0-9]{10}$/, "Mobile number must be digits only (10 digits)"),
  ISD_code: z
    .string()
    .regex(/^\+\d{1,3}$/, "ISD Code must be like +91, +1, +44")
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
  .refine(
    (data) => !!data.email || (!!data.phone_no && !!data.ISD_code),
    {
      message: "Either email or both ISD code and phone number must be provided",
      path: ["email"],
    }
  );

export { registerUserSchema, loginUserSchema };
