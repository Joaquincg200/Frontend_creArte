import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Cookies from "universal-cookie";

/**
 * Componente Cart
 * ----------------
 * Muestra los productos añadidos al carrito, permite modificar cantidades,
 * eliminar productos, calcular subtotal, envío y total.
 * También valida si el usuario tiene sesión para poder continuar al pedido.
 */
export default function Cart() {
  // Estado del carrito
  const [cart, setCart] = useState([]);

  // Manejo de cookies (para verificar si el usuario está logueado)
  const cookies = new Cookies();
  const session = cookies.get("session");

  /**
   * useEffect:
   * Se ejecuta al montar el componente.
   * Carga el carrito previamente guardado en localStorage.
   */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
  }, []);

  /**
   * decreaseQuantity:
   * Reduce en 1 la cantidad del producto (mínimo 1).
   */
  const decreaseQuantity = (id) => {
    const updated = cart.map((product) => {
      if (product.id === id) {
        product.quantity = Math.max(1, product.quantity - 1);
      }
      return product;
    });

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  /**
   * increaseQuantity:
   * Aumenta la cantidad siempre que no supere el stock disponible.
   */
  const increaseQuantity = (id) => {
    const updated = cart.map((product) => {
      if (product.id === id) {
        if (product.quantity < product.stock) {
          product.quantity += 1;
        }
      }
      return product;
    });

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  /**
   * removeFromCart:
   * Elimina un producto del carrito.
   */
  const removeFromCart = (id) => {
    const newcart = cart.filter((product) => product.id !== id);
    setCart(newcart);
    localStorage.setItem("cart", JSON.stringify(newcart));
  };

  /**
   * Cálculo del subtotal:
   * Suma precio × cantidad de todos los productos.
   */
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  /**
   * Costo del envío:
   * Gratis si el subtotal supera 10€.
   */
  const shippingCost = subtotal > 10 ? 0 : 3.99;

  /**
   * Total final:
   * Subtotal + envío.
   */
  const total = subtotal + shippingCost;

  return (
    <div style={{ backgroundColor: "#FFFDF6", minHeight: "100vh" }}>
      <header>
        <Header />
      </header>

      <div className="container my-5">
        {/* TÍTULO PRINCIPAL */}
        <h1 className="fw-bold">Tu carrito de compra</h1>

        <div className="row mt-4">
          {/* ========================================
                 COLUMNA IZQUIERDA: LISTA DE PRODUCTOS
              ======================================== */}
          <div className="col-md-8">
            {/* Encabezado de tabla */}
            <div className="d-flex border-bottom pb-2 fw-semibold">
              <div className="col-6">Producto</div>
              <div className="col-3 text-end">Cantidad</div>
            </div>

            {/* Si el carrito está vacío */}
            {cart.length === 0 ? (
              <p className="mt-3">Tu carrito está vacío.</p>
            ) : (
              /* Listado de productos */
              cart.map((product) => (
                <div
                  key={product.id}
                  className="d-flex align-items-center py-3 border-bottom"
                >
                  {/* Imagen + nombre y precio */}
                  <div className="col-6 d-flex align-items-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="img-thumbnail me-3"
                      style={{
                        width: "90px",
                        height: "90px",
                        objectFit: "cover",
                      }}
                    />

                    <div className="d-flex flex-column">
                      <span className="fw-medium">{product.name}</span>
                      <span className="fw-semibold text-muted">
                        {product.price} €
                      </span>

                      {/* Botón eliminar */}
                      <button
                        className="btn btn-link text-danger p-0"
                        onClick={() => removeFromCart(product.id)}
                        style={{
                          textDecoration: "none",
                          fontWeight: "500",
                          cursor: "pointer",
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="col-3 d-flex justify-content-end align-items-center">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => decreaseQuantity(product.id)}
                    >
                      -
                    </button>

                    <span className="mx-3 fw-bold">{product.quantity}</span>

                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => increaseQuantity(product.id)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Botón volver a la tienda */}
            <Link to="/shop" className="btn mt-4" style={{ color: "#000000" }}>
              <i className="bi bi-arrow-left"></i> Volver a la tienda
            </Link>
          </div>

          {/* ========================================
                 COLUMNA DERECHA: RESUMEN DEL PEDIDO
              ======================================== */}
          <div className="col-md-4">
            <div
              className="p-4 border rounded shadow-sm"
              style={{ backgroundColor: "#F5EDE0" }}
            >
              <h4 className="fw-bold mb-3">Resumen del pedido</h4>

              {/* Subtotal */}
              <div className="d-flex justify-content-between">
                <span>Subtotal:</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>

              {/* Envío */}
              <div className="d-flex justify-content-between">
                <span>Envío:</span>
                <span>{shippingCost.toFixed(2)} €</span>
              </div>

              <hr />

              {/* Total */}
              <div className="d-flex justify-content-between fw-bold mt-2">
                <span>Total:</span>
                <span>{total.toFixed(2)} €</span>
              </div>

              {/* Botón “Realizar pedido”:  
                  - Si hay sesión → ir a dirección
                  - Si NO → ir a login */}
              {session ? (
                <Link
                  to={"/cart/address"}
                  className="btn w-100 mt-4"
                  style={{ backgroundColor: "#C1A16A", color: "#FFFFFF" }}
                >
                  Realizar pedido
                </Link>
              ) : (
                <Link
                  to={"/login"}
                  className="btn w-100 mt-4"
                  style={{ backgroundColor: "#C1A16A", color: "#FFFFFF" }}
                >
                  Realizar pedido
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
