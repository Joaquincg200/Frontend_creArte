import React, { useState, useEffect } from "react";
import Header from "./Header";
import { Link, useNavigate } from "react-router-dom";

/**
 * Componente Address
 * -------------------
 * Permite al usuario ingresar y guardar su dirección de envío.
 * La dirección se almacena en localStorage y se reutiliza en pedidos futuros.
 * También muestra un resumen del carrito y los costos.
 */
function Address() {
  const navigate = useNavigate();

  // Carrito cargado desde localStorage
  const [cart, setCart] = useState([]);

  // Indica si la dirección ya ha sido guardada
  const [saved, setSaved] = useState(false);

  // Formulario controlado con todos los campos de la dirección
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    phone: "",
    address: "",
    number: "",
    floor: "",
    city: "",
    postalCode: "",
  });

  /**
   * useEffect: Se ejecuta al cargar el componente.
   * - Recupera el carrito del localStorage.
   * - Recupera la dirección si ya existe guardada.
   */
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);

    const storedAddress = JSON.parse(localStorage.getItem("address"));
    if (storedAddress) {
      setForm(storedAddress);
      setSaved(true); // Muestra resumen en vez del formulario
    }
  }, []);

  /**
   * Calcula subtotales sumando precio * cantidad por cada producto
   */
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  /**
   * Coste de envío: Gratis si supera 10€
   */
  const shippingCost = subtotal > 10 ? 0 : 3.99;

  /**
   * Total final (subtotal + envío)
   */
  const total = subtotal + shippingCost;

  /**
   * handleChange:
   * Actualiza los valores del formulario cuando el usuario escribe.
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * handleSubmit:
   * Guarda la dirección en localStorage y cambia a "modo resumen".
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("address", JSON.stringify(form));
    setSaved(true);
  };

  return (
    <div style={{ backgroundColor: "#FFFDF6", minHeight: "100vh" }}>
      <Header />

      <div className="container my-5">
        <h1 className="fw-bold mb-4">Dirección de envío</h1>

        <div className="row">

          {/* =======================
              COLUMNA IZQUIERDA
             ======================= */}
          <div className="col-md-8 mb-3 mb-md-0">
            <div
              className="p-4 border rounded shadow-sm"
              style={{ backgroundColor: "#F5EDE0" }}
            >

              {/* Si NO está guardada → mostrar formulario */}
              {!saved ? (

                <form onSubmit={handleSubmit}>
                  <h5 className="fw-bold mb-3">Introduce tu dirección</h5>

                  {/* Nombre */}
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Apellidos */}
                  <div className="mb-3">
                    <label className="form-label">Apellidos</label>
                    <input
                      name="lastname"
                      value={form.lastname}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Dirección */}
                  <div className="mb-3">
                    <label className="form-label">Dirección</label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Número y Piso */}
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label">Número</label>
                      <input
                        name="number"
                        value={form.number}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="col-6 mb-3">
                      <label className="form-label">Piso</label>
                      <input
                        name="floor"
                        value={form.floor}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  {/* Ciudad */}
                  <div className="mb-3">
                    <label className="form-label">Ciudad</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Código postal */}
                  <div className="mb-3">
                    <label className="form-label">Código postal</label>
                    <input
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Botón guardar */}
                  <button
                    type="submit"
                    className="btn w-100"
                    style={{ backgroundColor: "#C1A16A", color: "#FFF" }}
                  >
                    Guardar dirección
                  </button>
                </form>

              ) : (

                /* =======================
                   MODO RESUMEN
                   ======================= */
                <div
                  className="p-3 rounded shadow-sm"
                  style={{ backgroundColor: "#FFFDF6" }}
                >
                  <h5 className="fw-bold">Dirección guardada ✅</h5>

                  {/* Mostrar dirección guardada */}
                  <p className="mb-1">
                    {form.name} {form.lastname}
                  </p>
                  <p className="mb-1">
                    {form.address}, Nº {form.number}{" "}
                    {form.floor && `(Piso ${form.floor})`}
                  </p>
                  <p className="mb-1">
                    {form.city} - {form.postalCode}
                  </p>
                  <p>Tel: {form.phone}</p>

                  {/* Editar dirección */}
                  <button
                    className="btn btn-sm"
                    style={{ backgroundColor: "#D28C64", color: "#fff" }}
                    onClick={() => setSaved(false)}
                  >
                    Editar dirección
                  </button>

                  {/* Continuar al pago */}
                  <button
                    className="btn w-100 mt-2"
                    style={{ backgroundColor: "#C1A16A", color: "#fff" }}
                    onClick={() => navigate("/cart/payment")}
                  >
                    Continuar pedido
                  </button>
                </div>

              )}
            </div>

            {/* Botón volver al carrito */}
            <Link
              to="/cart"
              className="btn mt-4 text-dark d-none d-md-inline-block"
            >
              <i className="bi bi-arrow-left"></i> Volver al carrito
            </Link>
          </div>

          {/* =======================
              COLUMNA DERECHA
             ======================= */}
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

export default Address;
