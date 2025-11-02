// Yapılacaklar listesi modeli (tarih ve başlık ile)
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  // Eski task alanı ile uyumluluk için
  task: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: null, // Tarih opsiyonel
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Todo', todoSchema);
