import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import Cookies from "universal-cookie";

/**
 * Componente que muestra un producto concreto,
 * permite añadirlo al carrito y escribir reseñas.
 */
function Product() {
  // Obtiene el ID desde la URL (/product/:id)
  const { id } = useParams();

  // Gestión de cookies
  const cookies = new Cookies();

  // Producto actual
  const [product, setProduct] = useState(null);

  // Reseñas con usuario asociado
  const [reviewsWithUsers, setReviewsWithUsers] = useState([]);

  // Comentario que escribe el usuario
  const [comment, setComment] = useState("");

  // Valoración seleccionada por el usuario (1 a 5)
  const [rating, setRating] = useState(0);

  // Control del efecto hover para media estrella
  const [hover, setHover] = useState(0);

  // Productos similares del mismo tipo
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Para redirecciones
  const navigate = useNavigate();

  // Usuario logueado leído de cookie
  const user = cookies.get("user");

  // Token JWT para autenticación
  const token = user?.token;

  // Generador de estrellas
  const stars = [1, 2, 3, 4, 5];

  /**
   * Obtiene el producto desde el backend cuando cambia el ID
   */
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/product/${id}`)
      .then((res) => setProduct(res.data)) // Guarda producto en estado
      .catch((err) => console.error(err)); // Muestra errores
  }, [id]);

  /**
   * Obtiene reseñas del producto y asocia usuario a cada una
   */
  useEffect(() => {
    const fetchReviewsWithUsers = async () => {
      try {
        // Petición de reseñas del producto
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/reviews/product/${id}`
        );

        const reviewsData = res.data;

        // Para cada reseña, busca su usuario
        const reviewsWithUser = await Promise.all(
          reviewsData.map(async (review) => {
            const userRes = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/users/user/${review.userId}`
            );

            // Combina reseña con usuario
            return { ...review, user: userRes.data };
          })
        );

        // Guarda lista final
        setReviewsWithUsers(reviewsWithUser);
      } catch (error) {
        console.error(error);
      }
    };

    fetchReviewsWithUsers();
  }, [id]);

  /**
   * Carga productos relacionados usando la misma categoría
   */
  useEffect(() => {
    if (!product) return;

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/products`)
      .then((res) => {
        // Filtra por categoría y excluye el actual
        const filtered = res.data.filter(
          (p) => p.category === product.category && p.id !== product.id
        );

        // Máximo 4 productos sugeridos
        setRelatedProducts(filtered.slice(0, 4));
      })
      .catch((err) => console.error(err));
  }, [product]);

  /**
   * Guarda el último producto visitado en localStorage
   */
  useEffect(() => {
    if (product) {
      localStorage.setItem("lastSearchProductId", product.id);
    }
  }, [product]);

  /**
   * Envía una reseña nueva al backend
   */
  const submitReview = () => {
    // Objeto enviado al backend
    const payload = {
      comment,
      rating,
      productId: id,
      userId: user?.id,
    };

    axios
      .post(`${import.meta.env.VITE_API_URL}/api/reviews/new`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Seguridad
        },
      })
      .then((res) => {
        // Añade reseña sin recargar la página
        setReviewsWithUsers([res.data, ...reviewsWithUsers]);

        // Limpia formulario
        setComment("");
        setRating(0);

        alert("Reseña agregada correctamente!");
      })
      .catch((err) => {
        console.error(err);
        alert("Error al agregar la reseña");
      });
  };

  /**
   * Añade el producto al carrito
   * Si ya existe, aumenta la cantidad
   */
  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Busca si ya está en el carrito
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
      // Incrementa cantidad respetando stock
      if (existingProduct.quantity < existingProduct.stock) {
        existingProduct.quantity += 1;
      }
    } else {
      // Primera vez que se añade
      cart.push({ ...product, quantity: 1 });
    }

    // Guarda carrito actualizado
    localStorage.setItem("cart", JSON.stringify(cart));

    // Redirige al carrito
    navigate("/cart");
  };

  return (
    <div style={{ backgroundColor: "#FFFDF6", minHeight: "100vh" }}>
      <Header />

      <div className="container my-5">
        {/* Espera mientras carga */}
        {!product ? (
          <p>Cargando producto...</p>
        ) : (
          <>
            {/* CONTENEDOR PRODUCTO */}
            <div className="row align-items-start">
              {/* IMAGEN */}
              <div className="col-md-5 mb-3 d-flex flex-column align-items-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="img-fluid rounded"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>

              {/* INFORMACIÓN */}
              <div className="col-md-7">
                <div
                  className="p-4 border rounded shadow"
                  style={{ backgroundColor: "#F5EDE0" }}
                >
                  <h2>{product.name}</h2>

                  <p>
                    <strong>Precio:</strong> {product.price} €
                  </p>

                  <p>
                    <strong>Descripción:</strong> {product.description}
                  </p>

                  {/* MEDIA DE ESTRELLAS */}
                  <p>
                    <strong>Valoración:</strong>{" "}
                    {reviewsWithUsers.length > 0 ? (
                      <>
                        {(
                          reviewsWithUsers.reduce(
                            (acc, r) => acc + r.rating,
                            0
                          ) / reviewsWithUsers.length
                        ).toFixed(1)}
                        / 5 <span style={{ color: "#ffc107" }}>★</span> (
                        {reviewsWithUsers.length} reseñas)
                      </>
                    ) : (
                      "N/A"
                    )}
                  </p>

                  {/* BOTÓN CARRITO */}
                  {product.stock > 0 ? (
                    <p>
                      <button
                        className="btn mt-3 rounded-pill"
                        style={{
                          backgroundColor: "#D28C64",
                          color: "#FAF6F0",
                          border: "none",
                        }}
                        onClick={handleAddToCart}
                      >
                        Añadir al carrito
                      </button>
                    </p>
                  ) : (
                    <button className="btn btn-danger fw-bold" disabled>
                      Producto agotado
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* FORMULARIO DE RESEÑAS */}
            <div
              className="mt-5 p-4 border rounded shadow"
              style={{ backgroundColor: "#F5EDE0" }}
            >
              {/* TITULO DEL FORMULARIO */}
              <h4 className="fw-bold mb-3">Escribir una reseña</h4>

              {/* VALORACIÓN */}
              <div className="mb-3">
                <label className="form-label">Valoración</label>
                <div className="d-flex">
                  {stars.map((star) => (
                    <div
                      key={star}
                      style={{
                        position: "relative",
                        cursor: "pointer",
                        width: "32px",
                      }}
                      // Detecta posición del ratón para media estrella
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        setHover(x < rect.width / 2 ? star - 0.5 : star);
                      }}
                      onMouseLeave={() => setHover(0)}
                      // Click para asignar puntuación
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        setRating(x < rect.width / 2 ? star - 0.5 : star);
                      }}
                    >
                      {/* SVG de estrella */}
                      <svg width="32" height="32" viewBox="0 0 24 24">
                        <polygon
                          points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9"
                          fill={
                            (hover || rating) >= star ? "#ffc107" : "#C6A667"
                          }
                        />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>

              {/* COMENTARIO */}
              <div className="mb-3">
                <label className="form-label">Comentario</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {/* BOTÓN ENVIAR */}
              <button
                className="btn btn-primary rounded-pill"
                style={{
                  backgroundColor: "#D28C64",
                  color: "#FAF6F0",
                  border: "none",
                }}
                onClick={submitReview}
              >
                Enviar reseña
              </button>
            </div>

            {/* LISTA DE COMENTARIOS */}
            <div
              className="mt-5 p-4 border rounded shadow w-100"
              style={{ backgroundColor: "#F5EDE0" }}
            >
              <h4 className="fw-bold mb-3">Comentarios</h4>

              {reviewsWithUsers.length === 0 ? (
                <p className="text-muted">No hay comentarios todavía.</p>
              ) : (
                reviewsWithUsers.map((comment) => (
                  <div key={comment.id} className="border-bottom py-3">
                    {/* CABECERA DE COMENTARIO */}
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center">
                        {/* AVATAR */}
                        {comment.user?.avatar ? (
                          <img
                            src={comment.user?.avatar}
                            className="img-fluid rounded-circle me-2 mx-2"
                            alt="Foto usuario"
                            style={{
                              width: "30px",
                              height: "30px",
                              objectFit: "cover",
                            }}
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
                            {comment.user?.name?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </div>
                        )}

                        {/* NOMBRE DEL USUARIO */}
                        <strong>{comment.user?.name || "Usuario"}</strong>
                        <strong>{}</strong>
                      </div>

                      {/* ESTRELLAS DEL USUARIO */}
                      <div>
                        {Array.from({ length: 5 }, (_, i) => {
                          const starValue = i + 1;
                          return (
                            <span
                              key={i}
                              style={{ color: "#ffc107", fontSize: "16px" }}
                            >
                              {
                                comment.rating >= starValue
                                  ? "★" // completa
                                  : comment.rating >= starValue - 0.5
                                  ? "⯨" // media estrella
                                  : "☆" // vacía
                              }
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* TEXTO DEL COMENTARIO */}
                    <p className="mb-1">{comment.comment}</p>

                    {/* FECHA */}
                    <small className="text-muted">
                      {comment.createdAt?.slice(0, 10)}
                    </small>
                  </div>
                ))
              )}
            </div>

            {/* PRODUCTOS RELACIONADOS */}
            {relatedProducts.length > 0 && (
              <div className="mt-5">
                <h4 className="fw-bold mb-3">Productos relacionados</h4>
                <div className="row g-3">
                  {relatedProducts.map((prod) => (
                    <div className="col-md-3 col-sm-6" key={prod.id}>
                      <Link
                        to={`/product/${prod.id}`}
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
                          {/* IMAGEN DEL PRODUCTO RELACIONADO */}
                          <img
                            src={prod.image || "img/shopping.webp"}
                            className="card-img-top img-fluid rounded-top"
                            alt={prod.name}
                            style={{ height: "200px", objectFit: "cover" }}
                          />

                          {/* NOMBRE Y PRECIO */}
                          <div className="card-body d-flex flex-column">
                            <h5
                              className="card-title"
                              style={{ color: "#6B4F3A" }}
                            >
                              {prod.name}
                            </h5>
                            <p
                              className="card-text fw-bold mt-auto"
                              style={{ color: "#C77C57" }}
                            >
                              {prod.price} €
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default Product;
