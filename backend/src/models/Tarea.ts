import mongoose from "mongoose";

const tareaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  completada: {
    type: Boolean,
    default: false,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
});

const Tarea = mongoose.model("Tarea", tareaSchema);

export default Tarea;