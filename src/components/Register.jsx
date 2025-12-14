import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Componente Register
 * -------------------
 * Permite crear una nueva cuenta de usuario, ya sea como COMPRADOR o VENDEDOR.
 * 
 * Funcionalidades:
 * - Registro de usuario con nombre, email, contraseña y rol.
 * - Validación básica de campos requeridos.
 * - Feedback de carga mientras se procesa el registro.
 * - Manejo de errores y mensajes de alerta.
 */
function Register() {
  const navigate = useNavigate();

  /** Estados para inputs del formulario */
  const [name, setName] = useState(""); // Nombre del usuario
  const [email, setEmail] = useState(""); // Email
  const [password, setPassword] = useState(""); // Contraseña
  const [role, setRole] = useState("COMPRADOR"); // Rol seleccionado, default COMPRADOR

  /** Estado para mostrar spinner durante la petición */
  const [loading, setLoading] = useState(false);

  /** Estado para mostrar errores de registro */
  const [error, setError] = useState("");

  /**
   * Maneja el submit del formulario de registro
   * ------------------------------------------
   * Hace una petición POST a la API para crear un usuario.
   * Redirige a /login si es exitoso.
   * Muestra mensaje de error si falla.
   */
  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Limpiar errores previos

    const payload = { name, email, password, role };

    axios
      .post(`${import.meta.env.VITE_API_URL}/api/users/register`, payload)
      .then((response) => {
        // Registro exitoso, redirigir a login
        navigate("/login");
      })
      .catch((error) => {
        // Mostrar mensaje de error
        setError(
          "Error al crear usuario: " +
            (error.response?.data?.message || error.message)
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#FFFDF6" }}
    >
      <div
        className="border rounded-4 shadow p-5"
        style={{
          backgroundColor: "#F5EDE0",
          borderColor: "#D9CFC3",
          width: "400px",
        }}
      >
        {/* Título */}
        <h2 className="text-center mb-4" style={{ color: "#2B2B2B" }}>
          Crear Cuenta
        </h2>

        {/* Formulario de registro */}
        <form onSubmit={handleRegister}>
          {/* Nombre */}
          <div className="mb-3">
            <label
              htmlFor="name"
              className="form-label"
              style={{ color: "#2B2B2B" }}
            >
              Nombre
            </label>
            <input
              type="name"
              id="name"
              name="name"
              className="form-control"
              placeholder="Introduce el nombre"
              style={{ backgroundColor: "#FCFBF9" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label
              htmlFor="email"
              className="form-label"
              style={{ color: "#2B2B2B" }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Introduce el email"
              style={{ backgroundColor: "#FCFBF9" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Contraseña */}
          <div className="mb-3">
            <label
              htmlFor="pass"
              className="form-label"
              style={{ color: "#2B2B2B" }}
            >
              Contraseña
            </label>
            <input
              type="password"
              id="pass"
              name="pass"
              className="form-control"
              placeholder="Introduce la contraseña"
              style={{ backgroundColor: "#FCFBF9" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Selección de rol */}
          <div className="mb-3">
            <label className="form-label d-block" style={{ color: "#2B2B2B" }}>
              Selecciona tu rol:
            </label>

            {/* Comprador */}
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="role"
                id="purchaser"
                value="COMPRADOR"
                checked={role === "COMPRADOR"}
                onChange={(e) => setRole(e.target.value)}
              />
              <label className="form-check-label" htmlFor="purchaser">
                Comprador
              </label>
            </div>

            {/* Vendedor */}
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="role"
                id="seller"
                value="VENDEDOR"
                checked={role === "VENDEDOR"}
                onChange={(e) => setRole(e.target.value)}
              />
              <label className="form-check-label" htmlFor="seller">
                Vendedor
              </label>
            </div>
          </div>

          {/* Botón de submit */}
          <button
            type="submit"
            className="btn w-100 fw-semibold"
            style={{
              backgroundColor: "#E3B23C",
              color: "#2B2B2B",
              border: "none",
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creando...
              </>
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        {/* Mensaje de error */}
        {error && <p className="text-danger mt-2">{error}</p>}
      </div>
    </div>
  );
}

export default Register;
