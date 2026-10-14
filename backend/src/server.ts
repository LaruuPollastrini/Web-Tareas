import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tareaRoutes from "./Routes/tareaRoutes.js";
import { connectMongoDB } from "./config/db.js";
import authRoutes from "./Routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("¡Servidor funcionando!");
});

app.use("/tareas", tareaRoutes);
app.use("/auth", authRoutes);

connectMongoDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("No se pudo iniciar el servidor:", error);
  });