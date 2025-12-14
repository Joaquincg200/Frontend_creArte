import axios from "axios";

// Usamos la variable de entorno VITE_API_URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api"
    // Ejemplo: api.get('/products') → hace GET a https://backend-production.up.railway.app/api/products
});

export default api;
