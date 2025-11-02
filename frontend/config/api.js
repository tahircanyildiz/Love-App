// API bağlantı ayarları
import axios from 'axios';

// Backend API adresi
// Production: Render URL kullan
// Development: Local IP kullan
//const IS_PRODUCTION = true; // false yaparak local test edebilirsin

export const API_BASE_URL ='REMOVED_SECRET'

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
