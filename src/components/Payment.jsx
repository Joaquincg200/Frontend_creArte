import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js"; // Carga la librería Stripe JS
import { Elements } from "@stripe/react-stripe-js"; // Proporciona contexto para componentes Stripe
import Checkout from "./Checkout"; // Formulario de pago personalizado
import Header from "./Header"; // Componente Header

// Inicializamos Stripe con la clave pública de prueba
const stripePromise = loadStripe(
  "pk_test_51SYA87FnwawMWZ7RHM3xMTL0yqohQkSUH3H88iok5dCOEBHACcDem0gIE3Zym828WRrZx8yYQFXUSamPJJGyHn7R00Wxx105Bu"
);

export default function PaymentPage() {
  const [cart, setCart] = useState([]); // Estado para almacenar los productos del carrito

  // Cargar carrito desde localStorage al montar el componente
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
  }, []);

  // Calculamos subtotal sumando precio*cantidad de cada producto
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  // Envío gratuito si subtotal > 10 €, si no, 3.99 €
  const shippingCost = subtotal > 10 ? 0 : 3.99;
  const total = subtotal + shippingCost; // Total final

  return (
    <div style={{ backgroundColor: "#FFFDF6", minHeight: "100vh" }}>
      {/* Header fijo */}
      <Header />

      <div className="container my-5">
        <h1 className="fw-bold mb-4">Pago y resumen del pedido</h1>
        <div className="row">

          {/* FORMULARIO DE PAGO CON STRIPE */}
          <div className="col-md-6">
            {/* Proporcionamos el contexto Stripe a nuestro formulario Checkout */}
            <Elements stripe={stripePromise}>
              <Checkout amount={total} /> {/* Pasamos el total al checkout */}
            </Elements>
          </div>

          {/* RESUMEN DEL CARRITO */}
          <div className="col-md-6 mb-3 mb-md-0">
            <div
              className="p-4 border rounded shadow-sm"
              style={{ backgroundColor: "#F5EDE0" }}
            >
              <h4 className="fw-bold mb-3">Carrito</h4>

              {cart.length === 0 ? (
                <p>Tu carrito está vacío.</p>
              ) : (
                // Listado de productos en el carrito
                cart.map((product) => (
                  <div key={product.id} className="d-flex justify-content-between mb-2">
                    <div>
                      {product.name} x {product.quantity}
                    </div>
                    <div>{(product.price * product.quantity).toFixed(2)} €</div>
                  </div>
                ))
              )}

              <hr />

              {/* Subtotal y envío */}
              <div className="d-flex justify-content-between">
                <span>Subtotal:</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Envío:</span>
                <span>{shippingCost.toFixed(2)} €</span>
              </div>

              <hr />

              {/* Total final */}
              <div className="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
