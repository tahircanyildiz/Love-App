// API bağlantı ayarları
import axios from 'axios';

// Backend API adresi
// Production: Render URL kullan
// Development: Local IP kullan
const IS_PRODUCTION = true; // true = production, false = local

// Local için bilgisayarının IP adresini kullan (ipconfig ile bul)
const LOCAL_IP = '192.168.1.9'; // BUNU KENDİ IP ADRESİNE GÖRe GÜNCELLE

export const API_BASE_URL = IS_PRODUCTION
  ? 'REMOVED_SECRET'
  : `http://${LOCAL_IP}:5000/api`;

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
