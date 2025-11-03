// Aşk mektupları modeli (zaman kapsülü)
const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const letterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  photos: [{
    imageUrl: String,
    cloudinaryId: String,
  }],
  openDate: {
    type: Date,
    required: true, // Mektubun açılacağı tarih
  },
  isOpened: {
    type: Boolean,
    default: false, // Açıldı mı?
  },
  openedAt: {
    type: Date,
    default: null, // Açılma tarihi
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Kaydetmeden önce title ve message'ı şifrele
letterSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.title = encrypt(this.title);
  }
  if (this.isModified('message')) {
    this.message = encrypt(this.message);
  }
  next();
});

// Veritabanından okurken title ve message'ı çöz
letterSchema.post('find', function(docs) {
  docs.forEach(doc => {
    if (doc.title) doc.title = decrypt(doc.title);
    if (doc.message) doc.message = decrypt(doc.message);
  });
});

letterSchema.post('findOne', function(doc) {
  if (doc) {
    if (doc.title) doc.title = decrypt(doc.title);
    if (doc.message) doc.message = decrypt(doc.message);
  }
});

letterSchema.post('save', function(doc) {
  if (doc.title) doc.title = decrypt(doc.title);
  if (doc.message) doc.message = decrypt(doc.message);
});

module.exports = mongoose.model('Letter', letterSchema);
