# Web-Tareas

Aplicación de gestión de tareas con autenticación JWT y control de acceso por roles.

- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), Zod, JWT y bcrypt.
- **Frontend:** React, TypeScript, Vite y React Router (carpeta `frontend/`).

## Tipos de rutas

| Tipo | Backend | Frontend |
|---|---|---|
| Pública (sin sesión) | `GET /auth/publica`, `POST /auth/register`, `POST /auth/login` | `/` (portada) y `/login` |
| Privada (usuario autenticado) | `GET /auth/privada`, `/tareas` (CRUD) | `/privada` (Mis tareas) |
| Privada por rol (solo `admin`) | `GET /auth/admin`, `GET /auth/usuarios`, `DELETE /auth/usuarios/:id` | `/admin` (Administración) |

Respuestas del backend: sin token devuelve **401**; con token pero sin el rol requerido devuelve **403**.

## Permisos

| Acción | Usuario | Administrador |
|---|---|---|
| Ver, crear, editar, tildar y eliminar tareas | Sí | Sí |
| Ver y eliminar usuarios | No | Sí |

## Cómo ejecutarlo

### 1. Backend

```
npm install
cp .env.example .env
```

Completá el `.env` con tu `MONGODB_URI` (MongoDB Atlas o local) y un `JWT_SECRET` propio. Después:

```
npm run dev
```

El servidor queda en `http://localhost:3000`. Si usás MongoDB Atlas, habilitá tu IP en *Network Access*.

### 2. Frontend

En otra terminal:

```
cd frontend
npm install
npm run dev
```

La aplicación queda en `http://localhost:5173`. El frontend consume el backend en `http://localhost:3000` (constante `API_URL` en `frontend/src/AuthContext.tsx`).

## Usuarios de prueba

Los usuarios se crean con `POST /auth/register`. Para tener uno de cada rol:

```json
{ "nombre": "Admin", "email": "admin@test.com", "password": "123456", "rol": "admin" }
```

```json
{ "nombre": "Lara", "email": "lara@test.com", "password": "123456" }
```

Si no se indica `rol`, el usuario se crea con rol `user`. Dejar elegir el rol al registrarse es solo para facilitar la prueba de la consigna; en una aplicación real el rol no debería poder elegirse.

## Estructura

```
src/
  config/        conexión a MongoDB
  controllers/   lógica de tareas y autenticación
  middlewares/   validación (Zod), verificarToken y requerirRol
  models/        Tarea y User
  Routes/        tareaRoutes y authRoutes
  schemas/       esquemas de validación con Zod
  server.ts      punto de entrada
frontend/
  src/           AuthContext, ProtectedRoute, páginas y estilos
```