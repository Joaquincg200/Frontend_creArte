import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import axios from "axios";

function Header() {
  // --- ESTADOS ---
  const [openHamburger, setOpenHamburger] = useState(false); // menú móvil
  const [openMenu, setOpenMenu] = useState(false); // menú de usuario desplegable
  const [searchTerm, setSearchTerm] = useState(""); // texto del buscador
  const [suggestions, setSuggestions] = useState([]); // sugerencias de búsqueda
  const [showDropdown, setShowDropdown] = useState(false); // mostrar dropdown de sugerencias
  const [users, setUsers] = useState(""); // información completa del usuario
  const [user, setUser] = useState({}); // información del usuario almacenada en cookie
  const navigate = useNavigate(); // hook para redirección
  const cookies = new Cookies(); // manejo de cookies

  // --- VARIABLES DE SESIÓN ---
  const session = cookies.get("session"); // verifica si hay sesión activa
  const userId = user?.id; // ID del usuario

  // --- CARGA DE USUARIO DESDE COOKIES ---
  useEffect(() => {
    const storedUser = cookies.get("user"); // obtiene usuario guardado
    if (storedUser) setUser(storedUser); // actualiza estado
  }, []);

  // --- ACTUALIZA INFORMACIÓN DEL USUARIO DESDE API ---
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/users/user/${user?.id}`)
      .then((response) => {
        // Actualiza avatar si ha cambiado
        const updatedUser = { ...user, img: response.data.avatar || user.img };
        cookies.set("user", updatedUser, { path: "/" });
        setUsers(response.data);
      })
      .catch((err) => console.error(err));
  }, [user?.id]);

  // --- REFERENCIA PARA DETECTAR CLICS FUERA DEL BUSCADOR ---
  const wrapperRef = useRef(null);

  // --- REDIRECCIÓN AUTOMÁTICA PARA VENDEDORES ---
  if (user?.role === "VENDEDOR") {
    navigate("/sellerDashboard");
  }

  // --- CERRAR SESIÓN ---
  const handleLogout = () => {
    cookies.remove("session", { path: "/" });
    cookies.remove("user", { path: "/" });
    window.location.href = "/";
  };

  // --- BÚSQUEDA DINÁMICA ---
  const handleChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    try {
      // Llama a la API para obtener productos que coincidan con la búsqueda
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/products/search/${encodeURIComponent(value)}`
      );
      setSuggestions(res.data.slice(0, 5)); // muestra máximo 5 sugerencias
      setShowDropdown(true);
    } catch (error) {
      console.error("Error al buscar productos:", error);
    }
  };

  // --- SELECCIONAR PRODUCTO DE SUGERENCIAS ---
  const handleSelect = (product) => {
    localStorage.setItem("lastSearchProductId", product.id); // guarda último producto buscado
    setSearchTerm(""); // limpia buscador
    setSuggestions([]); // limpia sugerencias
    setShowDropdown(false); // oculta dropdown
    navigate(`/product/${product.id}`); // redirige a la página del producto
  };

  // --- CERRAR DROPDOWN AL HACER CLIC FUERA ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- JSX DEL HEADER ---
  return (
    <div className="border-bottom" style={{ backgroundColor: "#C77C57" }}>
      <nav className="navbar navbar-expand-lg container">
        <div className="container-fluid px-2 d-flex align-items-center justify-content-between">
          {/* --- IZQUIERDA: Logo --- */}
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <img
              src="/img/unnamed-removebg-preview.png"
              alt="Logo"
              style={{ width: "40px", height: "40px" }}
            />
            <span className="ms-2 text-white fw-bold d-none d-lg-inline">
              Mi Tienda
            </span>
          </Link>

          {/* --- BOTÓN HAMBURGUESA MÓVIL --- */}
          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={() => setOpenHamburger(!openHamburger)}
          >
            <span style={{ color: "#FFFFFF", fontSize: "1.5rem" }}>
              &#9776;
            </span>
          </button>

          {/* --- CENTRO: Buscador --- */}
          <div className="flex-grow-1 mx-3 position-relative" ref={wrapperRef}>
            <input
              className="form-control"
              type="search"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={handleChange}
              onFocus={() => searchTerm && setShowDropdown(true)}
            />
            {showDropdown && suggestions.length > 0 && (
              <div
                className="position-absolute bg-white shadow rounded w-100"
                style={{ zIndex: 1000, maxHeight: "250px", overflowY: "auto" }}
              >
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    className="d-flex align-items-center p-2 border-bottom"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSelect(product)}
                  >
                    <img
                      src={product.image || "img/shopping.webp"}
                      alt={product.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "5px",
                      }}
                    />
                    <span className="ms-2 flex-grow-1">{product.name}</span>
                    <span className="fw-bold" style={{ color: "#C77C57" }}>
                      {product.price} €
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- DERECHA: Usuario + Carrito --- */}
          <div className="d-flex align-items-center">
            {/* Usuario */}
            <div
              className="links-Header shadow rounded d-flex justify-content-center align-items-center me-2"
              onClick={() => setOpenMenu(!openMenu)}
              style={{ height: "40px", cursor: "pointer" }}
            >
              {session ? (
                <>
                  {users?.avatar ? (
                    <img
                      src={users?.avatar}
                      className="rounded-circle me-2"
                      alt="Foto usuario"
                      style={{
                        width: "30px",
                        height: "30px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-secondary d-flex justify-content-center align-items-center me-2"
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
                  <span className="text-white d-none d-lg-inline">
                    {users?.name}
                  </span>

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
                            to={`/profile/${user.id}`}
                            className="dropdown-item py-2 px-3 text-dark text-decoration-none d-block"
                          >
                            Perfil
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="dropdown-item py-2 px-3 w-100 text-start text-danger border-0 bg-transparent"
                          >
                            Cerrar sesión
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login">
                  <i className="bi bi-person fs-4 text-white"></i>
                </Link>
              )}
            </div>

            {/* Carrito */}
            <div
              className="links-Header shadow rounded d-flex justify-content-center align-items-center"
              style={{ width: "40px", height: "40px" }}
            >
              <Link to="/cart">
                <i className="bi bi-cart fs-4 text-white"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* --- MENÚ HAMBURGUESA MÓVIL --- */}
        {openHamburger && (
          <div
            className="d-lg-none position-fixed start-0 end-0 px-3 pt-3 pb-3"
            style={{ backgroundColor: "#C77C57", zIndex: 2000, top: "56px" }}
          >
            <Link
              to="/shop"
              className="d-block py-2 text-white fs-5 text-decoration-none"
              onClick={() => setOpenHamburger(false)}
            >
              Tienda
            </Link>
            <Link
              to="/aboutUs"
              className="d-block py-2 text-white fs-5 text-decoration-none"
              onClick={() => setOpenHamburger(false)}
            >
              Sobre nosotros
            </Link>
            <Link
              to="/contact"
              className="d-block py-2 text-white fs-5 text-decoration-none"
              onClick={() => setOpenHamburger(false)}
            >
              Contacto
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
}

export default Header;
