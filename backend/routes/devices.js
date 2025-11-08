const express = require('express');
const router = express.Router();
const Device = require('../models/Device');

/**
 * POST /api/devices/register
 * Cihazı kaydet veya güncelle
 */
router.post('/register', async (req, res) => {
  try {
    const { playerId, userName, deviceName, platform } = req.body;

    if (!playerId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'playerId ve userName gerekli',
      });
    }

    // Eğer cihaz varsa güncelle, yoksa yeni oluştur
    const device = await Device.findOneAndUpdate(
      { playerId },
      {
        userName,
        deviceName: deviceName || 'Bilinmeyen Cihaz',
        platform: platform || 'android',
        isActive: true,
        lastSeen: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      device,
      message: 'Cihaz başarıyla kaydedildi',
    });
  } catch (error) {
    console.error('Cihaz kayıt hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Cihaz kaydedilirken hata oluştu',
      error: error.message,
    });
  }
});

/**
 * GET /api/devices
 * Tüm cihazları listele
 */
router.get('/', async (req, res) => {
  try {
    const devices = await Device.find().sort({ lastSeen: -1 });
    res.json({ success: true, devices });
  } catch (error) {
    console.error('Cihazlar listelenemedi:', error);
    res.status(500).json({
      success: false,
      message: 'Cihazlar listelenemedi',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/devices/:playerId
 * Cihazı sil (deaktive et)
 */
router.delete('/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    const device = await Device.findOneAndUpdate(
      { playerId },
      { isActive: false },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Cihaz bulunamadı',
      });
    }

    res.json({
      success: true,
      message: 'Cihaz deaktive edildi',
      device,
    });
  } catch (error) {
    console.error('Cihaz silinemedi:', error);
    res.status(500).json({
      success: false,
      message: 'Cihaz silinemedi',
      error: error.message,
    });
  }
});

module.exports = router;
