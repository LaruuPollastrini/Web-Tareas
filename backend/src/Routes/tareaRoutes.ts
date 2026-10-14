import { Router } from "express";
import {
  crearTarea,
  obtenerTareas,
  actualizarTarea,
  borrarTarea,
} from "../controllers/TareaControllers.js";
import { validateBody } from "../middlewares/validate.js";
import { createTareaSchema, updateTareaSchema } from "../schemas/tarea.schema.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, obtenerTareas);
router.post("/", verificarToken, validateBody(createTareaSchema), crearTarea);
router.put("/:id", verificarToken, validateBody(updateTareaSchema), actualizarTarea);
router.delete("/:id", verificarToken, borrarTarea);

export default router;