// Anı galerisi modeli (not ve tarih ile)
const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  cloudinaryId: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  note: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: null, // Fotoğraf tarihi opsiyonel
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Gallery', gallerySchema);
