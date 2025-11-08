// Sevgi notları route'ları
const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { notifyOtherDevices } = require('../utils/oneSignal');

// Tüm notları getir
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rastgele bir not getir
router.get('/random', async (req, res) => {
  try {
    const count = await Note.countDocuments();
    if (count === 0) {
      return res.status(404).json({ message: 'Henüz not eklenmemiş' });
    }
    const random = Math.floor(Math.random() * count);
    const note = await Note.findOne().skip(random);
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni not ekle
router.post('/', async (req, res) => {
  const note = new Note({
    text: req.body.text,
  });

  try {
    const newNote = await note.save();

    // OneSignal bildirimi gönder (senderPlayerId varsa)
    const { senderPlayerId } = req.body;
    if (senderPlayerId) {
      await notifyOtherDevices(senderPlayerId, {
        title: '💕 Yeni sana bir sevgi notu gönderdi',
        body: req.body.text,
        data: { type: 'love_note', noteId: newNote._id.toString() },
      });
    }

    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Sadece bildirim gönder (database'e kaydetme)
router.post('/notify', async (req, res) => {
  try {
    const { text, senderPlayerId } = req.body;

    if (!text || !senderPlayerId) {
      return res.status(400).json({
        success: false,
        message: 'text ve senderPlayerId gerekli',
      });
    }

    // Sadece bildirim gönder, database'e kaydetme
    await notifyOtherDevices(senderPlayerId, {
      title: '💕 Sana bir sevgi notu gönderdi',
      body: text,
      data: { type: 'notification_only' },
    });

    res.json({
      success: true,
      message: 'Bildirim gönderildi',
    });
  } catch (error) {
    console.error('Bildirim gönderme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim gönderilemedi',
      error: error.message,
    });
  }
});

// Not sil
router.delete('/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Not silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
