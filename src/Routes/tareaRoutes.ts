import { Router } from "express";
import {
  crearTarea,
  obtenerTareas,
  actualizarTarea,
  borrarTarea,
} from "../controllers/TareaControllers.js";

const router = Router();

router.post("/tareas", crearTarea);
router.get("/tareas", obtenerTareas);
router.put("/tareas/:id", actualizarTarea);
router.delete("/tareas/:id", borrarTarea);

export default router;