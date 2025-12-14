import axios from "axios"; // Librería para hacer peticiones HTTP
import React, { useState } from "react"; // React y hook para manejar estado
import { useNavigate } from "react-router-dom"; // Hook para navegación programática
import Cookies from "universal-cookie"; // Para manejar cookies en el navegador

function Login() {
  // Estados para almacenar el email y la contraseña
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Estado para indicar si se está procesando la petición de login
  const [loading, setLoading] = useState(false);
  // Estado para almacenar mensajes de error
  const [error, setError] = useState("");

  const navigate = useNavigate(); // Hook para redirecciones

  // Función que se ejecuta al enviar el formulario
  const login = (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setLoading(true); // Mostramos spinner de carga
    setError(""); // Limpiamos errores previos

    const payload = { email, password }; // Creamos el payload para el backend
    const cookies = new Cookies(); // Inicializamos cookies

    // Configuramos expiración de la cookie: 1 hora desde ahora
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 1);

    // Petición al backend para iniciar sesión
    axios
      .post(`${import.meta.env.VITE_API_URL}/api/users/login`, payload)
      .then((response) => {
        const token = response.data.token; // asegúrate de que el backend lo envíe
        localStorage.setItem("token", token);
        // Guardamos token JWT en cookies
        cookies.set("token", response.data.jwt, {
          path: "/",
          expires: expiracion,
        });

        // ---- GUARDAR USUARIO EN COOKIE ----
        const usuario = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          img: response.data.img,
          token: response.data.token,
        };

        cookies.set("user", JSON.stringify(usuario), {
          path: "/",
          expires: expiracion,
        });

        // ---- GUARDAR SESIÓN ----
        cookies.set("session", "active", {
          path: "/",
          expires: expiracion,
        });

        // ---- REDIRECCIÓN SEGÚN ROLE ----
        if (response.data.role === "ADMIN") {
          navigate("/admin");
        } else if (response.data.role === "COMPRADOR") {
          navigate("/");
        } else if (response.data.role === "VENDEDOR") {
          navigate("/sellerDashboard");
        }
      })
      .catch((error) => {
        // Captura de errores y muestra mensaje
        setError(
          "Error al iniciar sesión: " +
            (error.response?.data?.message || error.message)
        );
      })
      .finally(() => setLoading(false)); // Terminamos la carga
  };

  // Función para redirigir a la página de registro
  const goToRegister = () => navigate("/register");

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#FFFDF6" }}
    >
      <div
        className="border rounded-4 shadow p-5"
        style={{ backgroundColor: "#F5EDE0", width: "400px" }}
      >
        <h2 className="text-center mb-4" style={{ color: "#2B2B2B" }}>
          Iniciar sesión
        </h2>

        {/* Formulario de login */}
        <form onSubmit={login}>
          {/* Campo Email */}
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
              className="form-control"
              placeholder="Introduce el email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ backgroundColor: "#FCFBF9" }}
            />
          </div>

          {/* Campo Contraseña */}
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
              className="form-control"
              placeholder="Introduce la contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ backgroundColor: "#FCFBF9" }}
            />
          </div>

          {/* Botón de login */}
          <button
            type="submit"
            className="btn w-100 fw-semibold"
            style={{
              backgroundColor: "#E3B23C",
              color: "#2B2B2B",
              border: "none",
            }}
            disabled={loading} // Deshabilita mientras carga
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Iniciando...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <hr className="my-4" style={{ backgroundColor: "#D9CFC3" }} />

        <p className="text-center" style={{ color: "#2B2B2B" }}>
          ¿No tienes una cuenta?
        </p>

        {/* Botón de registro */}
        <button
          onClick={goToRegister}
          type="button"
          className="btn w-100 fw-semibold mt-3"
          style={{
            backgroundColor: "#C89A2F",
            color: "#FAF6F0",
            border: "none",
          }}
        >
          Crear cuenta
        </button>

        {/* Mensaje de error */}
        {error && <p className="text-danger mt-2">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
