// Ana server dosyası
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Routes
const notesRoutes = require('./routes/notes');
const todosRoutes = require('./routes/todos');
const galleryRoutes = require('./routes/gallery');
const lettersRoutes = require('./routes/letters');

const app = express();

// Middleware
app.use(cors()); // Mobil erişim için CORS açık
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB bağlantısı
connectDB();

// API Routes
app.use('/api/notes', notesRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/letters', lettersRoutes);

// Ana route (test için)
app.get('/', (req, res) => {
  res.json({
    message: '💞 Couple App API Çalışıyor!',
    endpoints: {
      notes: '/api/notes',
      todos: '/api/todos',
      gallery: '/api/gallery',
      letters: '/api/letters'
    }
  });
});

// Health check endpoint (Cron job için)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Server is alive! 💚'
  });
});

// Ping endpoint (Cron job için - basit)
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Server başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});
