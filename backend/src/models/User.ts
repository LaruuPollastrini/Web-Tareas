import mongoose, { Schema } from "mongoose";

export type Rol = "user" | "admin";

export interface IUser {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

const userSchema = new Schema<IUser>(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);