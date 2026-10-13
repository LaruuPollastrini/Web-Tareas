import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_URL, useAuth } from "./AuthContext";

interface Tarea {
  _id: string;
  titulo: string;
  completada: boolean;
  fechaCreacion?: string;
}

interface UsuarioLista {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
}

function mensajeError(data: unknown, porDefecto: string): string {
  if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
    return data.error;
  }
  return porDefecto;
}

// Maneja la lista de tareas contra el backend (siempre con el token)
function useTareas(token: string | null) {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/tareas`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(mensajeError(data, "No se pudieron cargar las tareas"));
      }
      setTareas(Array.isArray(data) ? data : (data.items ?? []));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const ejecutar = async (url: string, method: string, body?: unknown): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(mensajeError(data, "Los datos enviados no son válidos"));
      }
      await cargar();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar la acción");
      return false;
    }
  };

  return {
    tareas,
    cargando,
    error,
    crear: (titulo: string) => ejecutar("/tareas", "POST", { titulo }),
    editar: (id: string, titulo: string) => ejecutar(`/tareas/${id}`, "PUT", { titulo }),
    alternar: (t: Tarea) => ejecutar(`/tareas/${t._id}`, "PUT", { completada: !t.completada }),
    borrar: (id: string) => ejecutar(`/tareas/${id}`, "DELETE"),
  };
}

// Lista y elimina usuarios (solo funciona con rol admin)
function useUsuarios(token: string | null) {
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/auth/usuarios`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(mensajeError(data, "No se pudieron cargar los usuarios"));
      }
      setUsuarios(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo conectar con el servidor");
    }
  }, [token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const borrar = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(mensajeError(data, "No se pudo eliminar el usuario"));
      }
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar la acción");
    }
  };

  return { usuarios, error, borrar };
}

function fechaCorta(fecha?: string) {
  return fecha ? new Date(fecha).toLocaleDateString("es-AR") : "";
}

function Resumen({ tareas }: { tareas: Tarea[] }) {
  const hechas = tareas.filter((t) => t.completada).length;
  return (
    <div className="stats">
      <div className="stat">
        <strong>{tareas.length}</strong>
        <span>Total</span>
      </div>
      <div className="stat">
        <strong>{tareas.length - hechas}</strong>
        <span>Pendientes</span>
      </div>
      <div className="stat">
        <strong>{hechas}</strong>
        <span>Completadas</span>
      </div>
    </div>
  );
}

function Encabezado({ etiqueta, titulo, texto }: { etiqueta: string; titulo: string; texto: string }) {
  return (
    <div className="page-head">
      <p className="eyebrow dark">{etiqueta}</p>
      <h1>{titulo}</h1>
      <p>{texto}</p>
    </div>
  );
}

/* ---------- Gestión de tareas (la usan usuario y administrador) ---------- */
function GestorTareas({ token }: { token: string | null }) {
  const { tareas, cargando, error, crear, editar, alternar, borrar } = useTareas(token);
  const [nuevo, setNuevo] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitulo, setEditTitulo] = useState("");

  const agregar = async (e: FormEvent) => {
    e.preventDefault();
    if (!nuevo.trim()) return;
    if (await crear(nuevo.trim())) setNuevo("");
  };

  const guardarEdicion = async (id: string) => {
    if (!editTitulo.trim()) return;
    if (await editar(id, editTitulo.trim())) setEditId(null);
  };

  const eliminar = async (t: Tarea) => {
    if (window.confirm(`¿Eliminar la tarea "${t.titulo}"?`)) {
      await borrar(t._id);
    }
  };

  return (
    <>
      <Resumen tareas={tareas} />

      <section className="panel">
        <div className="panel-title">Nueva tarea</div>
        <form className="add-form" onSubmit={agregar}>
          <input
            type="text"
            placeholder="Descripción de la tarea"
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Agregar
          </button>
        </form>
      </section>

      {error && <p className="error-msg">{error}</p>}

      <section className="panel">
        <div className="panel-title">Listado de tareas</div>
        {cargando ? (
          <p className="empty">Cargando...</p>
        ) : tareas.length === 0 ? (
          <p className="empty">No hay tareas. Agregue la primera desde el formulario.</p>
        ) : (
          <ul className="task-list">
            {tareas.map((t) => (
              <li key={t._id} className="task">
                <input
                  className="check"
                  type="checkbox"
                  checked={t.completada}
                  onChange={() => void alternar(t)}
                  aria-label="Marcar como completada"
                />
                {editId === t._id ? (
                  <input
                    className="edit-input"
                    type="text"
                    value={editTitulo}
                    onChange={(e) => setEditTitulo(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <div className="task-main">
                    <span className={`task-title ${t.completada ? "done" : ""}`}>{t.titulo}</span>
                    <span className="task-date">{fechaCorta(t.fechaCreacion)}</span>
                  </div>
                )}
                <div className="task-actions">
                  {editId === t._id ? (
                    <>
                      <button className="btn btn-primary small" onClick={() => void guardarEdicion(t._id)}>
                        Guardar
                      </button>
                      <button className="btn btn-outline small" onClick={() => setEditId(null)}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-outline small"
                        onClick={() => {
                          setEditId(t._id);
                          setEditTitulo(t.titulo);
                        }}
                      >
                        Editar
                      </button>
                      <button className="btn btn-danger small" onClick={() => void eliminar(t)}>
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/* ---------- Gestión de usuarios (solo administrador) ---------- */
function GestorUsuarios({ token, miId }: { token: string | null; miId: string }) {
  const { usuarios, error, borrar } = useUsuarios(token);

  const eliminar = async (u: UsuarioLista) => {
    if (window.confirm(`¿Eliminar al usuario "${u.nombre}" (${u.email})? Esta acción no se puede deshacer.`)) {
      await borrar(u._id);
    }
  };

  return (
    <section className="panel">
      <div className="panel-title">Usuarios registrados</div>
      {error && <p className="error-msg">{error}</p>}
      <div className="table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u._id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`pill role-${u.rol}`}>
                    {u.rol === "admin" ? "Administrador" : "Usuario"}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="btn btn-danger small"
                    disabled={u._id === miId}
                    title={u._id === miId ? "No puede eliminar su propia cuenta" : ""}
                    onClick={() => void eliminar(u)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------- Ruta pública: portada ---------- */
export function Inicio() {
  const { user } = useAuth();
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Plataforma de gestión de tareas</p>
        <h1>Orden y seguimiento para el trabajo diario</h1>
        <p className="hero-text">
          Web-Tareas centraliza las tareas de la organización en un único espacio, con acceso
          controlado según el rol de cada usuario.
        </p>
        <div className="hero-actions">
          {user ? (
            <Link className="btn btn-light" to={user.rol === "admin" ? "/admin" : "/privada"}>
              Ir a mi espacio
            </Link>
          ) : (
            <Link className="btn btn-light" to="/login">
              Iniciar sesión
            </Link>
          )}
        </div>
      </section>

      <section className="features">
        <article>
          <span className="num">01</span>
          <h3>Acceso protegido</h3>
          <p>Cada usuario ingresa con su propia cuenta. La información solo es visible con sesión iniciada.</p>
        </article>
        <article>
          <span className="num">02</span>
          <h3>Control por roles</h3>
          <p>Cada usuario gestiona sus tareas y los administradores, además, administran las cuentas.</p>
        </article>
        <article>
          <span className="num">03</span>
          <h3>Seguimiento claro</h3>
          <p>Estado de cada tarea y resumen de pendientes y completadas, siempre actualizado.</p>
        </article>
      </section>
    </>
  );
}

/* ---------- Login ---------- */
export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const from = (location.state as { from?: string } | null)?.from;
  const aviso =
    from === "/admin"
      ? "Debe iniciar sesión para acceder al panel de administración."
      : from === "/privada"
        ? "Debe iniciar sesión para ver sus tareas."
        : "";

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      const guardado = localStorage.getItem("user");
      const rol = guardado ? (JSON.parse(guardado) as { rol: string }).rol : "user";
      navigate(from ?? (rol === "admin" ? "/admin" : "/privada"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  return (
    <section className="login">
      <div className="login-side">
        <p className="eyebrow">Acceso al sistema</p>
        <h2>Gestione sus tareas con respaldo y control</h2>
        <p>Ingrese con su cuenta para continuar.</p>
      </div>
      <div className="login-form">
        <h1>Iniciar sesión</h1>
        {aviso && <p className="aviso">{aviso}</p>}
        <form className="form" onSubmit={enviar}>
          <label>
            Correo electrónico
            <input
              type="email"
              placeholder="nombre@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="btn btn-primary" type="submit">
            Ingresar
          </button>
        </form>
        {error && <p className="error-msg">{error}</p>}
        <p className="hint">Cuentas de prueba: lara@test.com (usuario) · admin@test.com (administrador)</p>
      </div>
    </section>
  );
}

/* ---------- Ruta privada: cualquier usuario autenticado ---------- */
export function Privada() {
  const { token, user } = useAuth();
  return (
    <>
      <Encabezado
        etiqueta="Espacio personal"
        titulo={`Bienvenido/a, ${user?.nombre ?? ""}`}
        texto="Cree, modifique, complete o elimine sus tareas."
      />
      <GestorTareas token={token} />
    </>
  );
}

/* ---------- Ruta privada por rol: administrador ---------- */
export function Admin() {
  const { token, user } = useAuth();
  return (
    <>
      <Encabezado
        etiqueta="Panel de administración"
        titulo="Administración"
        texto="Gestione las tareas y las cuentas de usuario. Esta sección es exclusiva para administradores."
      />
      <GestorUsuarios token={token} miId={user?.id ?? ""} />
      <GestorTareas token={token} />
    </>
  );
}

export function NoAutorizado() {
  return (
    <section className="denied">
      <p className="eyebrow dark">Error 403</p>
      <h1>Acceso no autorizado</h1>
      <p>Su cuenta no cuenta con el rol necesario para ver esta sección.</p>
      <Link className="btn btn-primary" to="/privada">
        Volver a mis tareas
      </Link>
    </section>
  );
}