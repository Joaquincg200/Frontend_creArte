import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Cookies from "universal-cookie";

/**
 * Componente ProfileSeller
 * ------------------------
 * Permite al vendedor:
 * - Visualizar y actualizar su perfil (nombre, teléfono, avatar, contraseña).
 * - Manejar la sesión (logout).
 * - Mostrar menú desplegable con opciones de perfil y cerrar sesión.
 *
 * Dependencias:
 * - axios para llamadas a la API.
 * - react-router-dom para navegación y parámetros de URL.
 * - universal-cookie para manejo de cookies de sesión.
 */
function ProfileSeller() {
  // ID del vendedor desde la URL
  const { id } = useParams();
  const navigate = useNavigate();
  const cookies = new Cookies();

  /** Estado para abrir/cerrar menú del header */
  const [openMenu, setOpenMenu] = useState(false);

  /** Estado del usuario actual */
  const [user, setUser] = useState(null);

  /** Estado de los datos del usuario obtenidos desde la API */
  const [users, setUsers] = useState(null);

  /** Estado del formulario de perfil */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    phone: "",
    avatar: "/img/sbcf-default-avatar.webp",
  });

  /** Vista previa del avatar */
  const [preview, setPreview] = useState("/img/sbcf-default-avatar.webp");

  /** Archivo de imagen seleccionado */
  const [imageFile, setImageFile] = useState(null);

  /** Hover sobre avatar */
  const [hoverImg, setHoverImg] = useState(false);

  /** Ref para input file del avatar */
  const fileInputRef = useRef(null);

  /**
   * Logout
   * --------
   * Elimina las cookies de sesión y usuario y redirige a login
   */
  const handleLogout = () => {
    cookies.remove("session", { path: "/" });
    cookies.remove("user", { path: "/" });
    window.location.href = "/login";
  };

  /**
   * Normaliza avatar
   * ----------------
   * @param {string} img - Imagen del usuario
   * @returns {string} URL o dataURL para mostrar
   */
  const normalizeAvatar = (img) => {
    if (!img) return "/img/sbcf-default-avatar.webp"; // fallback
    if (img.startsWith("data:image")) return img; // Base64 con prefijo
    if (/^[A-Za-z0-9+/=]+$/.test(img)) return `data:image/png;base64,${img}`; // Base64 sin prefijo
    return img; // URL normal
  };

  /**
   * Carga los datos del usuario desde la API al montar el componente
   * ----------------------------------------------
   * Actualiza también la cookie con los datos normalizados
   */
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/users/user/${id}`)
      .then((response) => {
        const normalized = normalizeAvatar(response.data.avatar);

        // Actualiza el formulario
        setFormData({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          avatar: normalized,
          oldPassword: "",
          newPassword: "",
        });

        setPreview(normalized);
        setUsers(response.data);

        // Actualiza cookie y estado global
        const updatedUser = { ...response.data, avatar: normalized };
        cookies.set("user", updatedUser, { path: "/" });
        setUser(updatedUser);
      })
      .catch((err) => console.error(err));
  }, [id]);

  /**
   * Redirección segura
   * ------------------
   * Si el usuario tiene rol COMPRADOR, redirige al inicio
   */
  useEffect(() => {
    if (user && user.role === "COMPRADOR") {
      navigate("/");
    }
  }, [user, navigate]);

  /** Maneja cambios en inputs del formulario */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /** Abre selector de archivo al hacer clic sobre el avatar */
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  /** Maneja selección de archivo para avatar */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);

    // Vista previa
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  /** Convierte un archivo a Base64 */
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  /**
   * Submit formulario de perfil
   * ---------------------------
   * Actualiza datos en backend
   */
  const handleSubmit = async () => {

    let avatarToSend = preview;
    if (imageFile) avatarToSend = await toBase64(imageFile);

    const payload = {
      name: formData.name,
      phone: formData.phone,
      avatar: avatarToSend,
    };

    if (formData.newPassword?.trim() !== "") {
      payload.password = formData.newPassword;
      payload.oldPassword = formData.oldPassword;
    }

    axios
      .put(`${import.meta.env.VITE_API_URL}/api/users/update/${id}`, payload)
      .then((response) => {
        const updatedAvatar = normalizeAvatar(response.data.avatar || avatarToSend);
        setPreview(updatedAvatar);
        setFormData({ ...formData, avatar: updatedAvatar });
        alert("Perfil actualizado correctamente");
      })
      .catch((err) => {
        console.error(err);
        alert("Error al actualizar perfil");
      });
  };

  /** Espera a cargar usuario antes de renderizar */
  if (!user) return null;

  return (
    <div>
      {/* Header */}
      <header className="border-bottom" style={{ backgroundColor: "#C77C57" }}>
        <nav className="navbar navbar-expand-lg w-75 mx-auto container">
          <div className="container-fluid px-4">
            <div className="d-flex align-items-center justify-content-between w-100">
              {/* Logo */}
              <Link
                style={{ color: "#FFFFFF" }}
                className="navbar-brand fw-bold me-2"
                to="/sellerDashboard"
              >
                <img
                  src="/img/unnamed-removebg-preview.png"
                  alt="Logo"
                  style={{ width: "40px", height: "40px" }}
                />
              </Link>

              {/* Menú usuario */}
              <div className="d-flex align-items-center">
                <div
                  className="links-Header shadow rounded d-flex justify-content-center align-items-center me-3"
                  onClick={() => setOpenMenu(!openMenu)}
                  style={{ height: "40px", cursor: "pointer" }}
                >
                  {users?.avatar ? (
                    <img
                      src={users.avatar}
                      className="img-fluid rounded-circle me-2 mx-2"
                      alt="Foto usuario"
                      style={{ width: "30px", height: "30px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-secondary d-flex justify-content-center align-items-center me-2 mx-2"
                      style={{
                        width: "30px",
                        height: "30px",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      {users?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span
                    className="me-2"
                    style={{
                      color: "#FFFFFF",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {users?.name}
                  </span>

                  {/* Dropdown menú */}
                  {openMenu && (
                    <div
                      className="menu position-absolute shadow-lg rounded bg-white"
                      style={{
                        top: "50px",
                        right: "0",
                        width: "145px",
                        zIndex: 1000,
                        animation: "fadeIn 0.2s ease-in-out",
                      }}
                    >
                      <ul className="list-unstyled mb-0">
                        <li>
                          <Link
                            to={`/sellerDashboard/profile/${user.id}`}
                            className="dropdown-item py-2 px-3 text-dark text-decoration-none d-block"
                          >
                            <i className="bi bi-person me-2"></i> Perfil
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="dropdown-item py-2 px-3 w-100 text-start text-danger border-0 bg-transparent"
                          >
                            <i className="bi bi-box-arrow-right me-2"></i>
                            Cerrar sesión
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main */}
      <main>
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-lg-6 mb-4">
              {/* Formulario de perfil */}
              <div className="p-4 border rounded shadow" style={{ backgroundColor: "#F5EDE0" }}>
                <h4 className="mb-4 text-center">Perfil</h4>
                <form onSubmit={handleSubmit}>
                  <div className="row align-items-center justify-content-center">
                    {/* Avatar */}
                    <div className="col-md-4 text-center mb-3">
                      <div
                        className="position-relative d-inline-block"
                        style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden" }}
                        onMouseEnter={() => setHoverImg(true)}
                        onMouseLeave={() => setHoverImg(false)}
                        onClick={handleImageClick}
                      >
                        <img
                          src={preview}
                          alt="Usuario"
                          className="w-100 h-100"
                          style={{
                            objectFit: "cover",
                            filter: hoverImg ? "grayscale(50%)" : "none",
                            transition: "0.3s",
                            cursor: "pointer",
                          }}
                        />
                        {hoverImg && (
                          <div
                            className="position-absolute top-50 start-50 translate-middle"
                            style={{
                              width: "100%",
                              height: "100%",
                              backgroundColor: "rgba(0,0,0,0.3)",
                              color: "#FFF",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: "1.5rem",
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>

                    {/* Campos del formulario */}
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Nombre</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Email</label>
                        <input type="email" className="form-control" value={formData.email} disabled />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Contraseña antigua</label>
                        <input
                          type="password"
                          className="form-control"
                          name="oldPassword"
                          value={formData.oldPassword}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Nueva contraseña</label>
                        <input
                          type="password"
                          className="form-control"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Teléfono</label>
                        <input
                          type="text"
                          className="form-control"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn-hero btn px-4 py-2 fw-semibold rounded-pill w-100"
                        style={{ backgroundColor: "#D28C64", color: "#FAF6F0", border: "none" }}
                      >
                        Guardar cambios
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfileSeller;
