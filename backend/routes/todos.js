// Yapılacaklar route'ları
const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// Tüm görevleri getir
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni görev ekle (tarih ve başlık ile)
router.post('/', async (req, res) => {
  const todo = new Todo({
    title: req.body.title || req.body.task, // Eski task ile uyumluluk
    task: req.body.task, // Eski task ile uyumluluk
    date: req.body.date || null,
  });

  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Görevi güncelle (tamamlandı, başlık, tarih)
router.patch('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: 'Görev bulunamadı' });
    }

    // Güncellenebilir alanlar
    if (req.body.completed !== undefined) {
      todo.completed = req.body.completed;
    }
    if (req.body.title !== undefined) {
      todo.title = req.body.title;
    }
    if (req.body.task !== undefined) {
      todo.task = req.body.task;
    }
    if (req.body.date !== undefined) {
      todo.date = req.body.date;
    }

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Görevi sil
router.delete('/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Görev silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
