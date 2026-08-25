import cors from "cors";

export const corsMiddleware = cors({
  origin: "*", // en producción, reemplazar por el dominio real del frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});