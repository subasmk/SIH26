const router = require('express').Router();
const { Inspector, User, Inspection } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const { availability, search } = req.query;
    const whereClause = {};
    if (availability) whereClause.availability = availability;
    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    const inspectors = await Inspector.findAll({
      where: whereClause,
      include: [{ model: User, as: 'user', where: userWhere, attributes: { exclude: ['password'] } }]
    });
    res.json(inspectors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const inspector = await Inspector.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Inspection, as: 'inspections', limit: 10, order: [['createdAt', 'DESC']] }
      ]
    });
    if (!inspector) {
      return res.status(404).json({ error: 'Inspector not found' });
    }
    res.json(inspector);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const { email, password, name, phone, specialization, zones } = req.body;
    const user = await User.create({ email, password, name, phone, role: 'INSPECTOR' });
    const inspector = await Inspector.create({
      userId: user.id,
      employeeId: `INS-${Date.now()}`,
      specialization,
      zones: zones ? JSON.stringify(zones) : null
    });
    res.status(201).json({ user, inspector });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const inspector = await Inspector.findByPk(req.params.id);
    if (!inspector) {
      return res.status(404).json({ error: 'Inspector not found' });
    }
    await inspector.update(req.body);
    res.json(inspector);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/workload', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const total = await Inspection.count({ where: { inspectorId: req.params.id } });
    const pending = await Inspection.count({ where: { inspectorId: req.params.id, status: ['PENDING', 'ASSIGNED'] } });
    const inProgress = await Inspection.count({ where: { inspectorId: req.params.id, status: 'IN_PROGRESS' } });
    const completed = await Inspection.count({ where: { inspectorId: req.params.id, status: 'COMPLETED' } });
    res.json({ total, pending, inProgress, completed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
