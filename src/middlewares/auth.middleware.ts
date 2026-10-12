import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  rol: string;
}

// Ruta privada: exige un token valido en el header Authorization
export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no enviado" });
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Falta JWT_SECRET en el servidor" });
  }

  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    res.locals.user = { id: payload.id, rol: payload.rol };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalido o vencido" });
  }
};

// Ruta privada por rol: exige que el usuario tenga alguno de los roles indicados
export const requerirRol = (...rolesPermitidos: string[]) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user || !rolesPermitidos.includes(user.rol)) {
      return res.status(403).json({ error: "No tenes permiso para acceder a esta ruta" });
    }

    next();
  };
};