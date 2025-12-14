import React from "react";
import { Link } from "react-router-dom";

// Componente Footer
function Footer() {
  return (
    // Contenedor principal del footer con fondo y color de texto
    <div style={{ backgroundColor: "#A3B18A", color: "#FAF7F2" }}>
      
      {/* Sección superior con borde */}
      <div className="border-top border-bottom">
        
        {/* Contenedor interno */}
        <div className="container p-3 ">
          <div className="row">

            {/* Columna 1: Emporio artesanal */}
            <div className="col-4 d-column align-items-center justify-content-center">
              <h5>Emporio artesanal</h5>
              <p className="mb-0">Celebramos la artesanía de todo el mundo.</p>
              <p>
                Descubre productos únicos, hechos a mano, que cuentan una historia.
              </p>
            </div>

            {/* Columna 2: Servicio al cliente */}
            <div className="col-4 d-column align-items-center justify-content-center">
              <h5>Servicio al cliente</h5>
              {/* Enlaces de navegación interna */}
              <Link to={"/contact"} className="mb-0 text-decoration-none" style={{color:"#FFFFFF"}}>Contacto</Link><br />
              <Link to={"/faq"} className="mb-0 text-decoration-none" style={{color:"#FFFFFF"}}>FAQ</Link><br />
              <Link to={"/privacyPolicy"} className="mb-0 text-decoration-none" style={{color:"#FFFFFF"}}>Política de privacidad</Link>
            </div>

            {/* Columna 3: Redes sociales */}
            <div className="col-4 flex-column align-items-center justify-content-center">
              <h5>Siguenos</h5>
              <div className="row gap-3">
                {/* Primera fila de iconos */}
                <div className="col-6 mx-3">
                  <a href="https://www.instagram.com/">
                    <i style={{ color: "#FAF7F2" }} className="bi bi-instagram fs-5 me-3"></i>
                  </a>
                  <a href="https://www.instagram.com/">
                    <i style={{ color: "#FAF7F2" }} className="bi bi-twitter-x fs-5"></i>
                  </a>
                </div>
                {/* Segunda fila de iconos */}
                <div className="col-6 mx-3">
                  <a href="https://www.instagram.com/">
                    <i style={{ color: "#FAF7F2" }} className="bi bi-facebook fs-5 me-3"></i>
                  </a>
                  <a href="https://www.instagram.com/">
                    <i style={{ color: "#FAF7F2" }} className="bi bi-tiktok fs-5"></i>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Sección inferior: derechos reservados */}
      <div className="text-center p-4">
        @2025 Emporio artesanal. Reservados todos los derechos
      </div>
    </div>
  );
}

export default Footer;
