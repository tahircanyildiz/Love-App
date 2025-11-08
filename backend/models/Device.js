const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    playerId: {
      type: String,
      required: true,
      unique: true, // Her player_id benzersiz olmalı
    },
    userName: {
      type: String,
      required: true, // Kullanıcı adı (Tahir, Özge vs.)
    },
    deviceName: {
      type: String, // Cihaz modeli (opsiyonel)
    },
    platform: {
      type: String,
      enum: ['ios', 'android'],
      default: 'android',
    },
    isActive: {
      type: Boolean,
      default: true, // Cihaz aktif mi?
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Device', deviceSchema);
