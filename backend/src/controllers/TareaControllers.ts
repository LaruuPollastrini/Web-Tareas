import { type Request, type Response } from "express";
import Tarea from "../models/Tarea.js";

// Crear una tarea
export const crearTarea = async (req: Request, res: Response) => {
  try {
    const nuevaTarea = await Tarea.create(req.body);
    res.status(201).json(nuevaTarea);
  } catch (error) {
    res.status(400).json({ error: "No se pudo crear la tarea" });
  }
};

// Ver todas las tareas
export const obtenerTareas = async (req: Request, res: Response) => {
  const tareas = await Tarea.find();
  res.json(tareas);
};

// Actualizar una tarea
export const actualizarTarea = async (req: Request, res: Response) => {
  try {
    const tareaActualizada = await Tarea.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!tareaActualizada) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json(tareaActualizada);
  } catch (error) {
    res.status(400).json({ error: "No se pudo actualizar la tarea" });
  }
};

// Borrar una tarea
export const borrarTarea = async (req: Request, res: Response) => {
  try {
    const tareaBorrada = await Tarea.findByIdAndDelete(req.params.id);
    if (!tareaBorrada) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json({ mensaje: "Tarea borrada", tarea: tareaBorrada });
  } catch (error) {
    res.status(400).json({ error: "No se pudo borrar la tarea" });
  }
};