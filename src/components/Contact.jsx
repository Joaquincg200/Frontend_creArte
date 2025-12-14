import React, { useState } from "react"; 
import Header from "./Header"; 
import Footer from "./Footer"; 
import VoiceflowWidget from "./VoiceflowWidget";

// Componente principal de Contacto
function Contact() {
  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState({
    name: "",     // Nombre del usuario
    email: "",    // Correo electrónico del usuario
    subject: "",  // Asunto del mensaje
    message: "",  // Cuerpo del mensaje
  });

  // Estado para mostrar mensaje de éxito después de enviar
  const [submitted, setSubmitted] = useState(false);

  // Función que actualiza el estado formData cuando el usuario escribe
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSubmitted(false); // Oculta el mensaje de éxito si el usuario modifica el formulario
  };

  // Función que maneja el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Limpia el formulario
    setFormData({ name: "", email: "", subject: "", message: "" });
    setSubmitted(true); // Muestra mensaje de éxito
  };

  return (
    <div>
      {/* Header de la página */}
      <Header></Header>

      {/* Contenedor principal del formulario y la info de contacto */}
      <div className="container my-5" style={{ backgroundColor: "#FFFDF6" }}>
        <h2 className="mb-4 text-center">Contáctanos</h2>

        <div className="row">
          {/* Información de contacto */}
          <div className="col-md-4 mb-4">
            <div
              className="p-3 border rounded shadow-sm"
              style={{ backgroundColor: "#F5EDE0" }}
            >
              <h5>Información de Contacto</h5>
              <p>
                <strong>Correo:</strong> info@crearte.com
              </p>
              <p>
                <strong>Teléfono:</strong> +34 600 123 456
              </p>
              <p>
                <strong>Dirección:</strong> Calle País de las maravillas 2,
                Murcia, España
              </p>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="col-md-8">
            <div
              className="p-4 border rounded shadow-sm"
              style={{ backgroundColor: "#F5EDE0" }}
            >
              <h5>Envíanos un mensaje</h5>

              {/* Mensaje de éxito */}
              {submitted && (
                <div className="alert alert-success">
                  ¡Mensaje enviado correctamente!
                </div>
              )}

              {/* Formulario */}
              <form
                action={`mailto:joaquincaravacagarcia200@gmail.com`} // Envía el formulario al correo especificado
                method="POST"
                encType="text/plain" // Envia los datos como texto plano
                onSubmit={handleSubmit} // Maneja el estado al enviar
              >
                {/* Campo Nombre */}
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name} // Valor del estado
                    onChange={handleChange} // Actualiza el estado
                    required
                  />
                </div>

                {/* Campo Correo */}
                <div className="mb-3">
                  <label className="form-label">Correo</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Campo Asunto */}
                <div className="mb-3">
                  <label className="form-label">Asunto</label>
                  <input
                    type="text"
                    name="subject"
                    className="form-control"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Campo Mensaje */}
                <div className="mb-3">
                  <label className="form-label">Mensaje</label>
                  <textarea
                    name="message"
                    className="form-control"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                {/* Botón de envío y mensaje de éxito inline */}
                <div className="d-flex align-items-center">
                  <button
                    type="submit"
                    className="btn-hero btn px-4 py-2 fw-semibold rounded-pill"
                    style={{
                      backgroundColor: "#D28C64",
                      color: "#FAF6F0",
                      border: "none",
                    }}
                  >
                    Enviar
                  </button>
                  {submitted && (
                    <span className="text-success fw-semibold mx-2">
                      ¡Mensaje enviado!
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Widget de Voiceflow para asistencia */}
        <VoiceflowWidget />
      </div>

      {/* Footer de la página */}
      <Footer></Footer>
    </div>
  );
}

export default Contact;
