const router = require('express').Router();
const { Project, Organization, Inspection, RiskScore, Alert, User, Inspector } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/stats', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({ where: { status: 'ACTIVE' } });
    const totalInspectors = await Inspector.count();
    const availableInspectors = await Inspector.count({ where: { availability: 'AVAILABLE' } });
    const pendingInspections = await Inspection.count({ where: { status: ['PENDING', 'ASSIGNED'] } });
    const inProgressInspections = await Inspection.count({ where: { status: 'IN_PROGRESS' } });
    const completedInspections = await Inspection.count({ where: { status: 'COMPLETED' } });
    const highRiskProjects = await RiskScore.count({ where: { level: ['HIGH', 'CRITICAL'] } });
    const unresolvedAlerts = await Alert.count({ where: { isResolved: false } });
    const totalOrganizations = await Organization.count();
    res.json({
      totalProjects,
      activeProjects,
      totalInspectors,
      availableInspectors,
      pendingInspections,
      inProgressInspections,
      completedInspections,
      highRiskProjects,
      unresolvedAlerts,
      totalOrganizations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/recent-inspections', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const inspections = await Inspection.findAll({
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'location'] },
        { model: Inspector, as: 'inspector', include: [{ model: User, as: 'user', attributes: ['name'] }] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.json(inspections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/high-risk-projects', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const riskScores = await RiskScore.findAll({
      where: { level: ['HIGH', 'CRITICAL'] },
      include: [{ model: Project, as: 'project' }],
      order: [['score', 'DESC']],
      limit: 10
    });
    res.json(riskScores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/alerts', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const alerts = await Alert.findAll({
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }],
      where: { isResolved: false },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
