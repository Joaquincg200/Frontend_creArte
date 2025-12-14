import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import VoiceflowWidget from "./VoiceflowWidget";

/**
 * Componente AboutUs
 * -------------------
 * Página informativa que muestra datos sobre la historia, el equipo
 * y los valores de la empresa. Incluye un banner con imagen,
 * componentes de cabecera y pie de página, y un widget interactivo.
 */
const AboutUs = () => {
  return (
    // Contenedor principal con color de fondo y altura mínima de pantalla completa
    <div style={{ backgroundColor: "#FFFDF6", minHeight: "100vh" }}>
      {/* Encabezado del sitio */}
      <Header />

      {/* Banner superior con imagen de fondo */}
      <div
        style={{
          height: "250px",
          backgroundImage:
            'url("/img/imgi_5_generated-image-edb10665-d6fa-4908-aad6-850410c594d1.jpg")',
          backgroundSize: "cover", // La imagen cubre todo el contenedor
          backgroundPosition: "center", // Centrado de la imagen
        }}
        className="position-relative" // Se usa para posicionar texto encima de la imagen
      >
        {/* Título centrado dentro del banner */}
        <h1
          className="position-absolute top-50 start-50 translate-middle text-white fw-bold"
          style={{ fontSize: "2.5rem" }}
        >
          Sobre Nosotros
        </h1>
      </div>

      {/* Contenido principal de la página */}
      <div className="container my-5">
        {/* Caja con sombra y fondo suave para el contenido textual */}
        <div
          className="p-4 rounded shadow"
          style={{ backgroundColor: "#F5EDE0" }}
        >
          {/* Sección: Historia */}
          <h2 className="mb-3">Nuestra Historia</h2>
          <p>
            CreArte nace con la misión de ofrecer productos únicos y
            personalizados, creados con pasión y creatividad. Nuestro objetivo
            es acercar el arte y la artesanía a todos nuestros clientes.
          </p>

          {/* Sección: Equipo */}
          <h2 className="mb-3 mt-4">Nuestro Equipo</h2>
          <p>
            Contamos con un equipo de diseñadores, artesanos y profesionales del
            marketing, todos comprometidos con brindar la mejor experiencia de
            compra.
          </p>

          {/* Sección: Valores */}
          <h2 className="mb-3 mt-4">Nuestros Valores</h2>
          <ul>
            <li>Calidad y creatividad en todos nuestros productos.</li>
            <li>Atención cercana y personalizada al cliente.</li>
            <li>Compromiso con la sostenibilidad y el medio ambiente.</li>
          </ul>
        </div>

        {/* Widget interactivo (ej. chatbot) */}
        <VoiceflowWidget />
      </div>

      {/* Pie de página del sitio */}
      <Footer />
    </div>
  );
};

export default AboutUs;
