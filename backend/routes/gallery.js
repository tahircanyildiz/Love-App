// Galeri route'ları
const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { upload } = require('../config/cloudinary');

// Tüm fotoğrafları getir
router.get('/', async (req, res) => {
  try {
    const photos = await Gallery.find().sort({ createdAt: -1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni fotoğraf yükle
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Fotoğraf yüklenmedi' });
    }

    const photo = new Gallery({
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename,
      caption: req.body.caption || '',
    });

    const newPhoto = await photo.save();
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
