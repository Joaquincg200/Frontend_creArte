import axios from "axios";

// ------------------------------
// Configuración base de Axios
// ------------------------------

// Creamos una instancia de Axios con una URL base común para todas las peticiones
const api = axios.create({
    baseURL: "http://localhost:8080/api" // Todas las solicitudes usarán este prefijo
    // Ejemplo: api.get('/products') → hace GET a http://localhost:8080/api/products
});

// Exportamos la instancia para usarla en cualquier parte de la app
export default api;
