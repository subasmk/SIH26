const router = require('express').Router();
const { Project, Organization, Inspection, RiskScore, Inspector, User } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const { status, search } = req.query;
    const whereClause = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } }
      ];
    }
    const projects = await Project.findAll({
      where: whereClause,
      include: [
        { model: Organization, as: 'organization', attributes: ['id', 'name'] },
        { model: RiskScore, as: 'riskScores', limit: 1, order: [['calculatedAt', 'DESC']] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, authorize('ADMIN', 'INSPECTOR', 'ORGANIZATION'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Organization, as: 'organization' },
        { model: RiskScore, as: 'riskScores', limit: 5, order: [['calculatedAt', 'DESC']] },
        { model: Inspection, as: 'inspections', limit: 10, order: [['createdAt', 'DESC']] }
      ]
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, description, location, latitude, longitude, organizationId, startDate, endDate, budget, beneficiaryCount, reportingFrequency } = req.body;
    const project = await Project.create({
      name, description, location, latitude, longitude, organizationId, startDate, endDate, budget, beneficiaryCount, reportingFrequency
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    await project.update(req.body);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    await project.destroy();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/inspections', auth, async (req, res) => {
  try {
    const inspections = await Inspection.findAll({
      where: { projectId: req.params.id },
      include: [
        { model: Inspector, as: 'inspector', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(inspections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
