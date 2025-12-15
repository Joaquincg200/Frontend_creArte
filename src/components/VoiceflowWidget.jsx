import { useEffect } from "react";

// Componente que integra el widget de Voiceflow en la aplicación
const VoiceflowWidget = () => {
  useEffect(() => {
    // 1️⃣ Creamos un elemento <script> para cargar el bundle de Voiceflow
    const script = document.createElement("script");
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"; // URL del script oficial
    script.type = "text/javascript"; // Tipo de script
    script.async = true; // Carga asincrónica para no bloquear el render

    // 2️⃣ Cuando el script se carga, inicializamos el widget
    script.onload = () => {
      window.voiceflow.chat.load({
        verify: { projectID: "693f780a00184fa65dc2015e" }, // ID del proyecto actualizado
        url: "https://general-runtime.voiceflow.com",
        versionID: "production",
        voice: {
          url: "https://runtime-api.voiceflow.com",
        },
      });
    };

    // 3️⃣ Añadimos el script al body del documento
    document.body.appendChild(script);

    // 4️⃣ Cleanup: eliminamos el script cuando el componente se desmonta
    return () => {
      document.body.removeChild(script);
    };
  }, []); // Dependencia vacía: se ejecuta solo al montar

  // Este componente no renderiza nada en el DOM
  return null;
};

export default VoiceflowWidget;
