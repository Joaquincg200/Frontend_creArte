import React, { useEffect, useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

/**
 * Componente Checkout
 * Permite realizar pagos con tarjeta usando Stripe y crear órdenes por vendedor.
 *
 * Props:
 *  - amount: número, total a cobrar (en €)
 */
function Checkout({ amount }) {
  const stripe = useStripe();          // Instancia Stripe
  const elements = useElements();      // Instancia de Elements de Stripe
  const navigate = useNavigate();      // Navegación entre rutas
  const cookies = new Cookies();       // Manejo de cookies
  const user = cookies.get("user");    // Usuario logueado

  // Estado del carrito, errores, carga y éxito del pago
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Cargar dirección desde localStorage
  const address = JSON.parse(localStorage.getItem("address"));

  // Cargar carrito desde localStorage al montar el componente
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
  }, []);

  /**
   * handleSubmit
   * Maneja el envío del formulario de pago
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validación de Stripe y Elements
    if (!stripe || !elements) {
      setError("Stripe no está inicializado");
      setLoading(false);
      return;
    }

    // Obtener token de la tarjeta
    const cardNumber = elements.getElement(CardNumberElement);

    stripe.createToken(cardNumber).then(({ error: stripeError, token }) => {
      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      // Agrupar productos del carrito por vendedor
      const ordersBySeller = {};
      cart.forEach((item) => {
        const sellerId = item.sellerId || item.idUser;
        if (!ordersBySeller[sellerId]) ordersBySeller[sellerId] = [];
        ordersBySeller[sellerId].push({
          productId: item.id,
          quantity: item.quantity,
        });
      });

      // Validar que la dirección exista
      if (!address) {
        setError("No se proporcionó la dirección del usuario");
        setLoading(false);
        return;
      }

      // Crear ordenes por vendedor
      Object.keys(ordersBySeller).forEach((sellerId) => {
        const orderData = {
          idUser: parseInt(sellerId),       // ID del vendedor
          buyer: user.id,                   // ID del comprador
          orderItems: ordersBySeller[sellerId], // Productos para este vendedor
          stripeToken: token?.id,           // Token Stripe
          // Información de la dirección
          name: address?.name,
          lastname: address?.lastname,
          phone: address?.phone,
          address: address?.address,
          number: address?.number,
          floor: address?.floor,
          city: address?.city,
          postalCode: address?.postalCode,
        };

        // Enviar orden a backend
        axios
          .post(`${import.meta.env.VITE_API_URL}/api/orders/new`, orderData, {
            headers: { "Content-Type": "application/json" },
          })
          .then((response) => {
            // Orden creada con éxito (puedes agregar notificación aquí)
          })
          .catch((err) => {
            console.error(
              "Error al crear orden:",
              err.response?.data?.message || err.message
            );
          });
      });

      // Limpiar carrito y marcar éxito
      localStorage.removeItem("cart");
      setCart([]);
      setSuccess(true);
      setLoading(false);

      // Redirigir al home después de 1 segundo
      setTimeout(() => navigate("/"), 1000);
    });
  };

  // Estilo base para los inputs de Stripe
  const baseStyle = {
    fontSize: "16px",
    color: "#000",
    "::placeholder": { color: "#888" },
  };

  return (
    <div
      className="p-4 border rounded shadow-sm"
      style={{ backgroundColor: "#F5EDE0" }}
    >
      <h4 className="fw-bold mb-4">Pago con tarjeta</h4>

      {success ? (
        // Mensaje de pago exitoso
        <div className="alert alert-success">Pago realizado con éxito ✅</div>
      ) : (
        // Formulario de pago
        <form onSubmit={handleSubmit}>
          {/* Número de tarjeta */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Número de tarjeta</label>
            <div className="form-control">
              <CardNumberElement options={{ style: { base: baseStyle } }} />
            </div>
          </div>

          {/* Expiración y CVV */}
          <div className="row mb-3">
            <div className="col-6">
              <label className="form-label fw-semibold">Expiración</label>
              <div className="form-control">
                <CardExpiryElement options={{ style: { base: baseStyle } }} />
              </div>
            </div>
            <div className="col-6">
              <label className="form-label fw-semibold">CVV</label>
              <div className="form-control">
                <CardCvcElement options={{ style: { base: baseStyle } }} />
              </div>
            </div>
          </div>

          {/* Mostrar errores */}
          {error && <div className="text-danger mb-3">{error}</div>}

          {/* Botón de pago */}
          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: "#C1A16A", color: "#fff" }}
            disabled={!stripe || loading}
          >
            {loading ? "Procesando..." : `Pagar ${amount?.toFixed(2)} €`}
          </button>
        </form>
      )}
    </div>
  );
}

export default Checkout;
