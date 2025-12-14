import axios from "axios";
import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

/**
 * Componente AddProduct
 * ----------------------
 * Página para que un vendedor agregue nuevos productos.
 * Incluye formulario, vista previa de imagen, subida en Base64,
 * manejo del usuario logueado y envío al backend.
 */
function AddProduct() {
  // Estado para el menú desplegable del usuario
  const [openMenu, setOpenMenu] = useState(false);

  // Referencia al input de archivos (está oculto)
  const fileInputRef = useRef(null);

  // Vista previa de la imagen cargada
  const [preview, setPreview] = useState(null);

  // Hook para redirigir al usuario
  const navigate = useNavigate();

  // Estados controlados para el formulario
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // Obtener usuario almacenado en cookies
  const cookies = new Cookies();
  const user = cookies.get("user");

  const userName = user?.name;
  const token = user?.token;
  const userImg = user?.img;

  /**
   * Cerrar sesión:
   * Elimina cookies y redirige al inicio.
   */
  const handleLogout = () => {
    cookies.remove("session", { path: "/" });
    cookies.remove("user", { path: "/" });
    navigate("/");
  };

  /**
   * Simular clic en el input de archivo oculto
   */
  const handleClick = () => {
    fileInputRef.current.click();
  };

  /**
   * Manejar selección de archivo y generar vista previa
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    // Vista previa Base64
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  /**
   * Enviar formulario
   * Convierte imagen a Base64 y envía datos al backend.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("No hay usuario logueado");

    let image = null;

    // Convertir imagen a Base64 si existe
    if (imageFile) {
      image = await toBase64(imageFile);
    }

    // Cuerpo del producto que enviamos al backend
    const payload = {
      name: productName,
      description: productDescription,
      price: productPrice,
      stock: productQuantity,
      category: productCategory,
      userId: user.id,
      image: image,
    };

    // Llamada HTTP POST al backend
    axios
      .post(`${import.meta.env.VITE_API_URL}/api/products/new`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // autenticación
        },
      })
      .then((response) => {
        alert("Producto agregado correctamente!");
      })
      .catch((error) => {
        console.error("Error al agregar producto:", error);
        alert("Error al agregar el producto");
      });

    // Redirigir después de agregar
    navigate("/sellerDashboard/products");
  };

  /**
   * Convierte un archivo a Base64
   */
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  return (
    <div>
      {/* ===========================
          BARRA SUPERIOR (HEADER)
         =========================== */}
      <header className="border-bottom" style={{ backgroundColor: "#C77C57" }}>
        <nav className="navbar navbar-expand-lg w-75 mx-auto container">
          <div className="container-fluid px-4">
            {/* IZQUIERDA: Logo */}
            <div className="d-flex align-items-center justify-content-between w-100">
              <Link
                to="/sellerDashboard"
                className="navbar-brand fw-bold me-2"
                style={{ color: "#FFFFFF" }}
              >
                creArte
              </Link>

              {/* DERECHA: Usuario */}
              <div className="d-flex align-items-center">
                <div
                  className="links-Header shadow rounded d-flex justify-content-center align-items-center me-3"
                  onClick={() => setOpenMenu(!openMenu)}
                  style={{ height: "40px", cursor: "pointer" }}
                >
                  <>
                    {/* Imagen del usuario */}
                    <img
                      src={userImg || "/img/sbcf-default-avatar.webp"}
                      className="img-fluid rounded-circle h-75 me-2 mx-2"
                      alt="avatar"
                    />

                    {/* Nombre */}
                    <span
                      className="me-2"
                      style={{
                        color: "#FFFFFF",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {userName}
                    </span>

                    {/* MENÚ DESPLEGABLE */}
                    {openMenu && (
                      <div
                        className="menu position-absolute shadow-lg rounded bg-white"
                        style={{
                          top: "50px",
                          right: "0",
                          width: "145px",
                          zIndex: 1000,
                        }}
                      >
                        <ul className="list-unstyled mb-0">
                          <li>
                            <Link
                              to="/perfil"
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
                  </>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* ===========================
          CUERPO DE LA PÁGINA
         =========================== */}
      <main style={{ backgroundColor: "#FFFDF6" }}>
        <div className="container py-5">
          <h1 className="mb-4">Agregar Nuevo Producto</h1>

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* =======================
                  COLUMNA IZQUIERDA
                 ======================= */}
              <div className="col-6">
                <div
                  className="p-4 rounded shadow h-100"
                  style={{ backgroundColor: "#F5EDE0" }}
                >
                  {/* Nombre */}
                  <div className="mb-3">
                    <label htmlFor="productName" className="form-label">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="productName"
                      placeholder="Mesa de madera artesanal"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Descripción */}
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      id="productDescription"
                      rows="10"
                      placeholder="Describe tu producto aquí..."
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  {/* Precio y Cantidad */}
                  <div className="mb-3 row">
                    <div className="col-6">
                      <label className="form-label">Precio (€)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="productPrice"
                        placeholder="10.20 €"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label">Cantidad</label>
                      <input
                        type="number"
                        className="form-control"
                        id="productQuantity"
                        placeholder="10"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Categoría */}
                  <div className="mb-3">
                    <label className="form-label">Categoría</label>
                    <select
                      className="form-select"
                      id="productCategory"
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Selecciona una opción
                      </option>
                      <option value="ROPA">ROPA</option>
                      <option value="BISUTERIA">BISUTERIA</option>
                      <option value="DECORACION">DECORACION</option>
                      <option value="CERAMICA">CERAMICA</option>
                      <option value="MUEBLES">MUEBLES</option>
                      <option value="OTROS">OTROS</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* =======================
                  COLUMNA DERECHA
                 ======================= */}
              <div className="col-6">
                <div
                  className="p-4 rounded shadow h-100 d-flex flex-column justify-content-center align-items-center"
                  style={{ backgroundColor: "#F5EDE0" }}
                >
                  {/* Label */}
                  <label className="form-label align-self-start">
                    Imagen del producto
                  </label>

                  {/* Contenedor clickeable para subir imagen */}
                  <div
                    className="border border-secondary border-2 rounded-3 p-4 text-center bg-light mb-4"
                    style={{
                      cursor: "pointer",
                      height: "250px",
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onClick={handleClick}
                  >
                    {/* Si hay preview, mostrar imagen */}
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="img-fluid"
                        style={{ maxHeight: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      <span className="text-secondary fw-semibold text-center">
                        Haz clic para subir una imagen del producto
                      </span>
                    )}
                  </div>

                  {/* Input de archivo oculto */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="d-none"
                    accept="image/*"
                    id="productImage"
                    onChange={handleFileChange}
                    required
                  />

                  {/* Botón */}
                  <button type="submit" className="btn btn-primary w-100">
                    Agregar Producto
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddProduct;
