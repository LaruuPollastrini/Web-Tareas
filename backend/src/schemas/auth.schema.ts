import { z } from "zod";

export const registerSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  email: z.string().trim().email("Email invalido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(100),
  rol: z.enum(["user", "admin"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email invalido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;