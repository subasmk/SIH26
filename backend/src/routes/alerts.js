const router = require('express').Router();
const { Alert, Project, User } = require('../models');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const { resolved, severity } = req.query;
    const whereClause = {};
    if (resolved === 'false') whereClause.isResolved = false;
    if (resolved === 'true') whereClause.isResolved = true;
    if (severity) whereClause.severity = severity;
    const alerts = await Alert.findAll({
      where: whereClause,
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/resolve', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    await alert.update({
      isResolved: true,
      resolvedAt: new Date(),
      resolvedBy: req.user.id
    });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, authorize('ADMIN', 'SYSTEM'), async (req, res) => {
  try {
    const { projectId, type, severity, title, message } = req.body;
    const alert = await Alert.create({
      projectId,
      type,
      severity,
      title,
      message
    });
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
