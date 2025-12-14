import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD9j0zqQVr2yKkQrphqSPTrxousWb0Se80",
  authDomain: "chat-mensajeria-1d42d.firebaseapp.com",
  projectId: "chat-mensajeria-1d42d",
  storageBucket: "chat-mensajeria-1d42d.firebasestorage.app",
  messagingSenderId: "960676466134",
  appId: "1:960676466134:web:40b72c61c1489ae09de877"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Instancia de Firestore
export const db = getFirestore(app);

export default app;
