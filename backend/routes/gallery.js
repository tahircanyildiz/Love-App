// Galeri route'ları
const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { upload } = require('../config/cloudinary');
const { notifyOtherDevices } = require('../utils/oneSignal');

// Tüm fotoğrafları getir (tarihe göre yeniden eskiye)
router.get('/', async (req, res) => {
  try {
    const photos = await Gallery.find().sort({ date: -1, createdAt: -1 });
    // date: -1 = tarihe göre yeniden eskiye
    // createdAt: -1 = tarihsiz fotoğraflar en sonda (yeniden eskiye)
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni fotoğraf yükle (not ve tarih ile)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Fotoğraf yüklenmedi' });
    }

    const photo = new Gallery({
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename,
      caption: req.body.caption || '',
      note: req.body.note || '',
      date: req.body.date || null,
    });

    const newPhoto = await photo.save();

    // OneSignal bildirimi gönder (senderPlayerId varsa)
    const { senderPlayerId } = req.body;
    if (senderPlayerId) {
      const caption = req.body.caption || req.body.note || 'Yeni bir fotoğraf';
      await notifyOtherDevices(senderPlayerId, {
        title: '📸 Yeni bir fotoğraf yükledi',
        body: caption,
        data: { type: 'gallery', photoId: newPhoto._id.toString() },
      });
    }

    res.status(201).json(newPhoto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fotoğraf sil
router.delete('/:id', async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Fotoğraf bulunamadı' });
    }

    // Cloudinary'den de sil
    const { cloudinary } = require('../config/cloudinary');
    await cloudinary.uploader.destroy(photo.cloudinaryId);

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fotoğraf silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
