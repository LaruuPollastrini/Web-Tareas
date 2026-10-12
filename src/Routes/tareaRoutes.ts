import { Router } from "express";
import {
  crearTarea,
  obtenerTareas,
  actualizarTarea,
  borrarTarea,
} from "../controllers/TareaControllers.js";
import { validateBody } from "../middlewares/validate.js";
import { createTareaSchema, updateTareaSchema } from "../schemas/tarea.schema.js";

const router = Router();

router.get("/", obtenerTareas);
router.post("/", validateBody(createTareaSchema), crearTarea);
router.put("/:id", validateBody(updateTareaSchema), actualizarTarea);
router.delete("/:id", borrarTarea);

export default router;