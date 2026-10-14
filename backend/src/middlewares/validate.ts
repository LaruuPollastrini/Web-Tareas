// Middleware generico y reusable: valida req.body contra cualquier schema de Zod que se le pase.
import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          message: "Los datos enviados no son validos",
          details: result.error.flatten().fieldErrors,
        },
      });
      return;
    }
    // Reemplaza el body por la version parseada: con defaults aplicados y tipos ya coercionados.
    req.body = result.data;
    next();
  };
}