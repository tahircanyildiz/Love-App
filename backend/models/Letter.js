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

// Kaydetmeden önce sadece message'ı şifrele (title şifrelenmeyecek)
letterSchema.pre('save', function(next) {
  if (this.isModified('message') && this.message) {
    try {
      // Zaten şifrelenmiş mi kontrol et (: karakteri şifreli veriyi gösterir)
      if (!this.message.includes(':')) {
        this.message = encrypt(this.message);
      }
    } catch (error) {
      console.error('Şifreleme hatası:', error);
    }
  }
  next();
});

// Veritabanından okurken message'ı çöz
letterSchema.post('find', function(docs) {
  docs.forEach(doc => {
    if (doc.message) {
      try {
        doc.message = decrypt(doc.message);
      } catch (error) {
        console.error('Şifre çözme hatası:', error);
      }
    }
  });
});

letterSchema.post('findOne', function(doc) {
  if (doc && doc.message) {
    try {
      doc.message = decrypt(doc.message);
    } catch (error) {
      console.error('Şifre çözme hatası:', error);
    }
  }
});

letterSchema.post('findOneAndUpdate', function(doc) {
  if (doc && doc.message) {
    try {
      doc.message = decrypt(doc.message);
    } catch (error) {
      console.error('Şifre çözme hatası:', error);
    }
  }
});

letterSchema.post('save', function(doc) {
  if (doc.message) {
    try {
      doc.message = decrypt(doc.message);
    } catch (error) {
      console.error('Şifre çözme hatası:', error);
    }
  }
});

module.exports = mongoose.model('Letter', letterSchema);
