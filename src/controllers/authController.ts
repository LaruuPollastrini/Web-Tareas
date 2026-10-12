import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function firmarToken(id: string, rol: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Falta JWT_SECRET en el .env");
  }
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "1h") as NonNullable<
    jwt.SignOptions["expiresIn"]
  >;
  return jwt.sign({ id, rol }, secret, { expiresIn });
}

// Registro: crea el usuario con la contraseña encriptada
export const register = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(409).json({ error: "Ese email ya esta registrado" });
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);
    const user = await User.create({
      nombre,
      email,
      password: passwordEncriptada,
      rol,
    });

    res.status(201).json({
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    });
  } catch (error) {
    res.status(500).json({ error: "No se pudo registrar el usuario" });
  }
};

// Login: verifica email y contraseña, y devuelve un token
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Credenciales invalidas" });
    }

    const coincide = await bcrypt.compare(password, user.password);
    if (!coincide) {
      return res.status(401).json({ error: "Credenciales invalidas" });
    }

    const token = firmarToken(user._id.toString(), user.rol);
    res.json({
      token,
      user: { id: user._id, nombre: user.nombre, email: user.email, rol: user.rol },
    });
  } catch (error) {
    res.status(500).json({ error: "No se pudo iniciar sesion" });
  }
};