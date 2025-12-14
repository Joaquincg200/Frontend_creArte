import React, { useEffect, useState } from "react"; // Importamos React y hooks
import Header from "./Header"; // Componente de cabecera
import Footer from "./Footer"; // Componente de pie de página
import axios from "axios"; // Cliente HTTP para llamadas al backend
import { Link } from "react-router-dom"; // Para navegación interna
import VoiceflowWidget from "./VoiceflowWidget"; // Widget de chat de voz

function Shop() {
  // ------------------- ESTADOS -------------------
  const [products, setProducts] = useState([]); // Lista completa de productos obtenidos
  const [selectedCategories, setSelectedCategories] = useState([]); // Categorías filtradas
  const [minPrice, setMinPrice] = useState(0); // Precio mínimo del filtro
  const [maxPrice, setMaxPrice] = useState(500); // Precio máximo del filtro
  const [sortOrder, setSortOrder] = useState("recent"); // Ordenación de productos
  const [currentPage, setCurrentPage] = useState(1); // Página actual para la paginación

  const productsPerPage = 9; // Número de productos por página

  // ------------------- OBTENER PRODUCTOS -------------------
  useEffect(() => {
    // Se ejecuta al montar el componente para obtener productos desde la API
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/products`)
      .then((response) => {
        setProducts(response.data); // Guardamos los productos en el estado
      })
      .catch((error) => {
        console.error("Error al obtener productos:", error); // Manejamos errores
      });
  }, []); // Dependencia vacía para que se ejecute solo al montar

  // ------------------- FILTROS -------------------
  const filteredProducts = products.filter((product) => {
    // Comprobamos si el producto está en las categorías seleccionadas
    const inCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);

    // Comprobamos si el precio del producto está dentro del rango seleccionado
    const inPriceRange = product.price >= minPrice && product.price <= maxPrice;

    // Retornamos true si cumple ambos filtros
    return inCategory && inPriceRange;
  });

  // ------------------- ORDENACIÓN -------------------
  const sortedProducts = filteredProducts.sort((a, b) => {
    // Ordenamos según la opción seleccionada
    if (sortOrder === "recent") {
      return new Date(b.createdAt) - new Date(a.createdAt); // Más recientes primero
    } else if (sortOrder === "lowToHigh") {
      return a.price - b.price; // Precio de menor a mayor
    } else if (sortOrder === "highToLow") {
      return b.price - a.price; // Precio de mayor a menor
    } else {
      return 0; // Sin orden específico
    }
  });

  // ------------------- PAGINACIÓN -------------------
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage); // Número total de páginas
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage, // Índice inicial
    currentPage * productsPerPage // Índice final
  );

  // ------------------- FUNCIONES AUXILIARES -------------------
  const toggleCategory = (category) => {
    // Añadimos o eliminamos categoría del filtro
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter((cat) => cat !== category) // Quitamos categoría
      );
    } else {
      setSelectedCategories([...selectedCategories, category]); // Añadimos categoría
    }
    setCurrentPage(1); // Reseteamos a la primera página al cambiar filtro
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value); // Cambiamos el criterio de ordenación
  };

  const handlePageChange = (page) => {
    setCurrentPage(page); // Cambiamos la página actual
  };

  // ------------------- RENDERIZADO -------------------
  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "#FFFDF6" }}
    >
      {/* CABECERA */}
      <header className="sticky-top" style={{ zIndex: 1000 }}>
        <Header />
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-fill">
        <div className="container py-4" style={{ maxWidth: "1200px" }}>
          <div className="row">
            {/* FILTROS */}
            <div className="col-md-3 mb-4">
              <div
                className="p-3 rounded shadow"
                style={{
                  backgroundColor: "#A3B18A",
                  border: "2px solid #C77C57",
                  color: "#FAF7F2",
                }}
              >
                <h4 className="fw-bold mb-3">Filtros</h4>

                <h5 className="fw-semibold mt-3">Categoría</h5>
                {[
                  "ROPA",
                  "BISUTERIA",
                  "DECORACION",
                  "CERAMICA",
                  "MUEBLES",
                  "OTROS",
                ].map((cat) => (
                  <div className="form-check mb-1" key={cat}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={cat}
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      style={{ accentColor: "#C77C57" }}
                    />
                    <label className="form-check-label">{cat}</label>
                  </div>
                ))}

                <h5 className="fw-semibold mt-4">Precio</h5>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="form-range mb-2"
                  style={{ accentColor: "#C77C57" }}
                />
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="form-range"
                  style={{ accentColor: "#C77C57" }}
                />
                <div className="d-flex justify-content-between mt-2 fw-semibold">
                  <span>Mín: {minPrice} €</span>
                  <span>Máx: {maxPrice} €</span>
                </div>
              </div>
            </div>

            {/* PRODUCTOS */}
            <div className="col-md-9">
              {/* ORDENACIÓN */}
              <div className="d-flex justify-content-end mb-3">
                <select
                  className="form-select w-auto"
                  value={sortOrder}
                  onChange={handleSortChange}
                  style={{
                    border: "2px solid #C77C57",
                    backgroundColor: "#FAF7F2",
                  }}
                >
                  <option value="recent">Más recientes</option>
                  <option value="lowToHigh">Menor precio</option>
                  <option value="highToLow">Mayor precio</option>
                </select>
              </div>

              {/* GRID */}
              <div className="row g-3">
                {paginatedProducts.map((product) => (
                  <div className="col-lg-4 col-md-6" key={product.id}>
                    <Link
                      to={`/product/${product.id}`}
                      className="text-decoration-none"
                    >
                      <div
                        className="card h-100 shadow-sm"
                        style={{
                          border: "2px solid #C77C57",
                          borderRadius: "12px",
                          backgroundColor: "#FAF7F2",
                        }}
                      >
                        <img
                          src={product.image || "/img/shopping.webp"}
                          className="card-img-top img-fluid"
                          alt={product.name}
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title">{product.name}</h5>
                          <p className="fw-bold mt-auto">{product.price} €</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* PAGINACIÓN — COMO ANTES */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "30px",
                }}
              >
                <ul
                  style={{
                    display: "flex",
                    listStyle: "none",
                    padding: 0,
                    gap: "8px",
                  }}
                >
                  <li>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #C77C57",
                        borderRadius: "6px",
                        backgroundColor: "#FAF7F2",
                        color: "#6B4F3A",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      Anterior
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <li key={i}>
                      <button
                        onClick={() => handlePageChange(i + 1)}
                        style={{
                          padding: "6px 12px",
                          border: "1px solid #C77C57",
                          borderRadius: "6px",
                          backgroundColor:
                            currentPage === i + 1 ? "#C77C57" : "#FAF7F2",
                          color: currentPage === i + 1 ? "#FAF7F2" : "#6B4F3A",
                          cursor: "pointer",
                        }}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}

                  <li>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #C77C57",
                        borderRadius: "6px",
                        backgroundColor: "#FAF7F2",
                        color: "#6B4F3A",
                        cursor:
                          currentPage === totalPages
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Siguiente
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <VoiceflowWidget />
      </main>

      {/* FOOTER */}
      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
}

export default Shop;
