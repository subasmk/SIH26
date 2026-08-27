const router = require('express').Router();
const { Evidence, Inspection } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const path = require('path');

router.post('/:inspectionId', auth, authorize('INSPECTOR'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { type, description, latitude, longitude } = req.body;
    const fileType = req.file.mimetype.startsWith('image') ? 'IMAGE' : 
                     req.file.mimetype.startsWith('video') ? 'VIDEO' : 'DOCUMENT';
    const fileUrl = req.file.location || `/uploads/${req.file.filename}`;
    const evidence = await Evidence.create({
      inspectionId: req.params.inspectionId,
      type: type || fileType,
      fileName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      latitude: latitude || null,
      longitude: longitude || null,
      description
    });
    res.status(201).json(evidence);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:inspectionId', auth, async (req, res) => {
  try {
    const evidence = await Evidence.findAll({
      where: { inspectionId: req.params.inspectionId },
      order: [['timestamp', 'DESC']]
    });
    res.json(evidence);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, authorize('INSPECTOR', 'ADMIN'), async (req, res) => {
  try {
    const evidence = await Evidence.findByPk(req.params.id);
    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }
    await evidence.destroy();
    res.json({ message: 'Evidence deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
