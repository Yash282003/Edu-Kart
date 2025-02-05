import { z } from "zod";

export const studentSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have more than 8 characters"),
  name: z.string().min(1, "Name is required"),
  principalId: z.number().int().positive("Principal ID is required"),
  teacherId: z.number().int().optional(), 
});