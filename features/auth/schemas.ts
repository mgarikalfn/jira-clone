import {z} from "zod";

export const loginSchema = z.object({
    email:z.string().email(),
    password:z.string().min(1,"Required"),
});

export const registerSchema = z.object({
  email: z.email().trim().min(8, "atleast 8 chararcter"),
  name: z.string().trim().min(5,"minimum of 5 characters"),
  password: z.string().min(8, "atleast 8 characters"),
});