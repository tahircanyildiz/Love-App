// Aşk mektupları route'ları
const express = require('express');
const router = express.Router();
const Letter = require('../models/Letter');
const { upload } = require('../config/cloudinary');
const { notifyOtherDevices } = require('../utils/oneSignal');

// Tüm mektupları getir (openDate açılış tarihine göre yakından uzağa)
router.get('/', async (req, res) => {
  try {
    const letters = await Letter.find().sort({ openDate: 1 });
    res.json(letters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni mektup oluştur (fotoğraflarla birlikte)
router.post('/', upload.array('photos', 5), async (req, res) => {
  try {
    const photos = req.files ? req.files.map(file => ({
      imageUrl: file.path,
      cloudinaryId: file.filename,
    })) : [];

    const letter = new Letter({
      title: req.body.title,
      message: req.body.message,
      openDate: req.body.openDate,
      photos: photos,
    });

    const newLetter = await letter.save();

    // OneSignal bildirimi gönder (senderPlayerId varsa)
    const { senderPlayerId } = req.body;
    if (senderPlayerId) {
      const openDate = new Date(req.body.openDate).toLocaleDateString('tr-TR');
      await notifyOtherDevices(senderPlayerId, {
        title: '💌 Yeni sana bir aşk mektubu yazdı',
        body: `${req.body.title} - ${openDate} tarihinde açılabilir`,
        data: { type: 'letter', letterId: newLetter._id.toString() },
      });
    }

    res.status(201).json(newLetter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mektubu aç (isOpened = true)
router.patch('/:id/open', async (req, res) => {
  try {
    const letter = await Letter.findById(req.params.id);

    if (!letter) {
      return res.status(404).json({ message: 'Mektup bulunamadı' });
    }

    // Tarihi kontrol et - henüz açılma tarihi gelmemişse izin verme
    const now = new Date();
    if (new Date(letter.openDate) > now) {
      return res.status(403).json({
        message: 'Bu mektup henüz açılamaz',
        openDate: letter.openDate
      });
    }

    // Mektubu aç
    letter.isOpened = true;
    letter.openedAt = now;

    const updatedLetter = await letter.save();
    res.json(updatedLetter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mektubu sil
router.delete('/:id', async (req, res) => {
  try {
    await Letter.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mektup silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
