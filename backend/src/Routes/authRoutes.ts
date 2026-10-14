import { Router } from "express";
import type { Request, Response } from "express";
import { register, login, listarUsuarios, borrarUsuario } from "../controllers/authController.js";
import { validateBody } from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { verificarToken, requerirRol } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas publicas: cualquiera puede entrar, sin token
router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);

router.get("/publica", (_req: Request, res: Response) => {
  res.json({ mensaje: "Ruta publica: cualquiera puede verla" });
});

// Ruta privada: solo con token valido
router.get("/privada", verificarToken, (_req: Request, res: Response) => {
  res.json({
    mensaje: "Ruta privada: estas autenticada",
    user: res.locals.user,
  });
});

// Ruta privada protegida por rol: solo con token valido y rol admin
router.get("/admin", verificarToken, requerirRol("admin"), (_req: Request, res: Response) => {
  res.json({
    mensaje: "Ruta de admin: tenes el rol requerido",
    user: res.locals.user,
  });
});

// Gestion de usuarios: solo admin
router.get("/usuarios", verificarToken, requerirRol("admin"), listarUsuarios);
router.delete("/usuarios/:id", verificarToken, requerirRol("admin"), borrarUsuario);

export default router;