const express = require('express');
const multer = require('multer');
const path = require('path');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const router = express.Router();

// File upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Add notice
router.post('/notices', upload.single('pdf'), async (req, res) => {
  try {
    const db = await getDB();
    const { title, description } = req.body;
    const pdfUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    await db.collection('notices').insertOne({ title, description, pdfUrl , createdAt: new Date() });
    res.status(201).json({ message: 'Notice added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding notice' });
  }
});

// Get all notices
router.get('/notices', async (req, res) => {
  try {
    const db = await getDB();

    const page = Math.max(0, parseInt(req.query.page)) || 0;
    const limit = Math.max(1, parseInt(req.query.limit)) || 1;

    const noticesCollection = db.collection('notices');

    // Count total number of notices
    const totalNotices = await noticesCollection.countDocuments();

    const notices = await noticesCollection
      .find()
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .toArray();

    res.json({
      page,
      limit,
      totalNotices,
      totalPages: Math.ceil(totalNotices / limit),
      notices,
    });

  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});


// Delete notice
router.delete('/notices/:id', async (req, res) => {
  try {
    const db = await getDB();
    const id = req.params.id;

    const notice = await db.collection('notices').findOne({ _id: new ObjectId(id) });
    if (notice && notice.pdfUrl) {
      const fileName = notice.pdfUrl.split('/uploads/')[1];
      const fs = require('fs');
      const filePath = path.join(__dirname, '../uploads', fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.collection('notices').deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'Notice deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notice' });
  }
});

// Update notice
router.put('/notices/:id', upload.single('pdf'), async (req, res) => {
  try {
    const db = await getDB();
    const id = req.params.id;
    const { title, description } = req.body;

    const updateData = { title, description };

    if (req.file) {
      const pdfUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      updateData.pdfUrl = pdfUrl;

      // Delete old PDF
      const oldNotice = await db.collection('notices').findOne({ _id: new ObjectId(id) });
      if (oldNotice && oldNotice.pdfUrl) {
        const fs = require('fs');
        const oldFile = oldNotice.pdfUrl.split('/uploads/')[1];
        const filePath = path.join(__dirname, '../uploads', oldFile);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    await db.collection('notices').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    res.json({ message: 'Notice updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notice' });
  }
});

module.exports = router;
