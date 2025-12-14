import React, { useEffect, useState } from "react"; // Importa React y hooks para estado y efectos
import Header from "./Header"; // Componente de encabezado
import Footer from "./Footer"; // Componente de pie de página
import { Link } from "react-router-dom"; // Para enlaces internos
import axios from "axios"; // Para llamadas HTTP
import VoiceflowWidget from "./VoiceflowWidget"; // Widget de chat/IA

function Home() {
  // Estado para almacenar todos los productos obtenidos
  const [products, setProducts] = useState([]);
  // Estado para almacenar productos aleatorios para mostrar como sugerencias
  const [randomProducts, setRandomProducts] = useState([]);
  // Estado para almacenar el último producto buscado por el usuario
  const [lastSearchProduct, setLastSearchProduct] = useState(null);
  // Estado para productos relacionados al último buscado
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    // Llamada al backend para obtener todos los productos
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/products`)
      .then((response) => {
        setProducts(response.data); // Guardamos todos los productos en estado

        // Seleccionamos 4 productos aleatorios para sugerencias
        const shuffled = [...response.data].sort(() => 0.5 - Math.random());
        setRandomProducts(shuffled.slice(0, 4));

        // Revisamos si hay un producto buscado previamente guardado en localStorage
        const lastSearchId = localStorage.getItem("lastSearchProductId");
        if (lastSearchId) {
          const searchedProduct = response.data.find(
            (p) => p.id.toString() === lastSearchId
          );
          if (searchedProduct) {
            setLastSearchProduct(searchedProduct);

            // Filtramos productos de la misma categoría, excepto el propio
            const related = response.data.filter(
              (p) =>
                p.category === searchedProduct.category &&
                p.id !== searchedProduct.id
            );
            setRelatedProducts(related.slice(0, 4)); // Limitar a 4 productos
          }
        }
      })
      .catch((error) => {
        console.error("Error al obtener productos:", error); // Manejo de errores
      });
  }, []); // Se ejecuta solo al montar el componente

  return (
    <div>
      {/* Encabezado sticky */}
      <header style={{ position: "sticky", top: "0", zIndex: "1000" }}>
        <Header />
      </header>

      <main style={{ backgroundColor: "#FFFDF6" }}>
        {/* Imagen principal/banner */}
        <div className="container p-3 position-relative">
          <img
            className="img-fluid w-100 rounded"
            src="img/imgi_5_generated-image-edb10665-d6fa-4908-aad6-850410c594d1.jpg"
            alt="Banner principal de creArte"
            style={{
              objectFit: "cover",
              height: "auto",
            }}
          />
          {/* Texto encima de la imagen */}
          <div
            className="position-absolute top-50 start-50 translate-middle text-center px-3"
            style={{ width: "100%", maxWidth: "600px" }}
          >
            <h2
              className="fw-bold display-5"
              style={{
                color: "#FAF6F0",
                textShadow: "0 2px 6px rgba(0,0,0,0.4)",
              }}
            >
              Hecho a mano, diseñado para la vida
            </h2>
            <p
              className="lead mb-4"
              style={{
                color: "#000000",
                textShadow: "0 2px 6px rgba(0,0,0,0.6)",
              }}
            >
              Descubre productos de alta calidad elaborados por talentosos
              artesanos de todo el mundo.
            </p>
            <Link
              to={"/shop"}
              className="btn-hero btn px-4 py-2 fw-semibold rounded-pill"
              style={{
                backgroundColor: "#D28C64",
                color: "#FAF6F0",
                border: "none",
              }}
            >
              Explora nuestra colección
            </Link>
          </div>
        </div>

        {/* Productos sugeridos */}
        <div className="container p-3">
          <div className="row g-3">
            <h1>Sugerencias para ti</h1>
            {randomProducts.map((product) => (
              <div className="col-lg-3 col-md-6" key={product.id}>
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
                      src={product.image || "img/shopping.webp"}
                      className="card-img-top img-fluid rounded-top"
                      alt={product.name}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title" style={{ color: "#6B4F3A" }}>
                        {product.name}
                      </h5>
                      <p
                        className="card-text fw-bold mt-auto"
                        style={{ color: "#C77C57" }}
                      >
                        {product.price} €
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Productos relacionados al último buscado */}
        {lastSearchProduct && relatedProducts.length > 0 && (
          <div className="container p-3 mt-5">
            <h2>Porque has buscado: {lastSearchProduct.name}</h2>
            <div className="row g-3">
              {relatedProducts.map((product) => (
                <div className="col-lg-3 col-md-6" key={product.id}>
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
                        src={product.image || "img/shopping.webp"}
                        className="card-img-top img-fluid rounded-top"
                        alt={product.name}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <div className="card-body d-flex flex-column">
                        <h5
                          className="card-title"
                          style={{ color: "#6B4F3A" }}
                        >
                          {product.name}
                        </h5>
                        <p
                          className="card-text fw-bold mt-auto"
                          style={{ color: "#C77C57" }}
                        >
                          {product.price} €
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Widget de chat/IA */}
        <VoiceflowWidget />
      </main>

      {/* Pie de página */}
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default Home;
