// API bağlantı ayarları
import axios from 'axios';

// Backend API adresi
// Gerçek cihazda test ederken bilgisayarınızın yerel IP adresini kullanın
// Örnek: http://192.168.1.100:5000
// r (Windows) veya ifconfig (Mac/Linux) ile IP adresinizi öğrenebilirsiniz
export const API_BASE_URL = 'http://192.168.1.5:5000/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
