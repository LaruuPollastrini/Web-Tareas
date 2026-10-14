import { z } from "zod";

export const ALLOWED_SORT_FIELDS = ["fechaCreacion", "titulo"] as const;

export const listTareasSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(ALLOWED_SORT_FIELDS).default("fechaCreacion"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  completada: z.boolean().optional(),
  search: z.string().trim().min(1).max(120).optional(),
});

export const createTareaSchema = z.object({
  titulo: z.string().trim().min(1, "El titulo es obligatorio").max(120),
  completada: z.boolean().optional(),
});

export const updateTareaSchema = createTareaSchema.partial();

export type ListTareasInput = z.infer<typeof listTareasSchema>;
export type CreateTareaInput = z.infer<typeof createTareaSchema>;
export type UpdateTareaInput = z.infer<typeof updateTareaSchema>;