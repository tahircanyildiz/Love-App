// API bağlantı ayarları
import axios from 'axios';
import { API_BASE_URL as ENV_API_URL } from '@env';

// .env dosyasından API URL'i al
// Eğer .env'de yoksa fallback olarak production URL kullan
export const API_BASE_URL = ENV_API_URL;

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
