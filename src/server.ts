import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tareaRoutes from "./Routes/tareaRoutes.js";
import { connectMongoDB } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("¡Servidor funcionando!");
});

app.use("/tareas", tareaRoutes);

connectMongoDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("No se pudo iniciar el servidor:", error);
  });