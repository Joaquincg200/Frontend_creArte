import React from "react"; 
import Header from "./Header"; 
import Footer from "./Footer"; 
import VoiceflowWidget from "./VoiceflowWidget";

// Componente principal de Preguntas Frecuentes (FAQ)
function FAQ() {
  // Array de objetos con las preguntas y respuestas
  const faqs = [
    {
      question: "¿Cómo puedo realizar un pedido?",
      answer:
        "Para realizar un pedido, selecciona los productos que deseas, añádelos al carrito y completa el proceso de pago.",
    },
    {
      question: "¿Puedo devolver un producto?",
      answer:
        "Sí, puedes devolver los productos que estén en estado 'PENDIENTE' o según nuestra política de devoluciones en un plazo determinado.",
    },
    {
      question: "¿Cuál es el tiempo de entrega?",
      answer:
        "El tiempo de entrega depende de tu ubicación, pero generalmente los pedidos se entregan entre 2 y 5 días hábiles.",
    },
    {
      question: "¿Cómo contacto con soporte?",
      answer:
        "Puedes utilizar nuestro formulario de contacto o enviarnos un correo a info@crearte.com.",
    },
  ];

  return (
    <div style={{ backgroundColor: "#FFFDF6" }}> {/* Fondo general de la página */}
      
      {/* Header */}
      <header>
        <Header></Header>
      </header>

      {/* Contenedor principal */}
      <div className="container my-5 d-flex flex-column min-vh-100">
        <h2 className="mb-4 text-center">Preguntas Frecuentes</h2>

        {/* Accordion de preguntas */}
        <div className="accordion" id="faqAccordion">
          {faqs.map((faq, index) => (
            <div className="accordion-item" key={index}>
              
              {/* Título de la pregunta */}
              <h2 className="accordion-header" id={`heading${index}`}>
                <button
                  className="accordion-button collapsed" // Componente de Bootstrap
                  type="button"
                  data-bs-toggle="collapse" // Controla la expansión
                  data-bs-target={`#collapse${index}`} // Relación con el cuerpo
                  aria-expanded="false"
                  aria-controls={`collapse${index}`}
                  style={{ backgroundColor: "#F5EDE0" }} // Color del botón
                >
                  {faq.question} {/* Muestra la pregunta */}
                </button>
              </h2>

              {/* Contenido de la respuesta */}
              <div
                id={`collapse${index}`}
                className="accordion-collapse collapse" // Clase inicial colapsada
                aria-labelledby={`heading${index}`}
                data-bs-parent="#faqAccordion" // Para que solo un item se abra a la vez
              >
                <div className="accordion-body">{faq.answer}</div> {/* Muestra la respuesta */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Widget de Voiceflow para asistencia */}
      <VoiceflowWidget />

      {/* Footer */}
      <footer>
        <Footer></Footer>
      </footer>
    </div>
  );
}

export default FAQ;
