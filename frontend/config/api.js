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
  timeout: 60000, // 60 saniye - Render cold start için yeterli
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry interceptor - başarısız istekleri tekrar dene
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Retry sayacı yoksa ekle
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    // Maximum 3 deneme
    if (config.__retryCount < 3) {
      config.__retryCount += 1;

      // Timeout veya network hatası varsa tekrar dene
      if (
        error.code === 'ECONNABORTED' ||
        error.message.includes('timeout') ||
        error.message.includes('Network Error') ||
        !error.response
      ) {
        console.log(
          `İstek başarısız, tekrar deneniyor... (${config.__retryCount}/3)`
        );

        // 2 saniye bekle ve tekrar dene
        await new Promise((resolve) => setTimeout(resolve, 2000));

        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
