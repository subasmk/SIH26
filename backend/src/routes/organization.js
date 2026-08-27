const router = require('express').Router();
const { Project, Organization, User } = require('../models');
const { auth, authorize } = require('../middleware/auth');

router.get('/projects', auth, authorize('ORGANIZATION'), async (req, res) => {
  try {
    const org = await Organization.findOne({ where: { userId: req.user.id } });
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    const projects = await Project.findAll({
      where: { organizationId: org.id },
      include: [
        { model: Organization, as: 'organization' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/reports', auth, authorize('ORGANIZATION'), async (req, res) => {
  try {
    const org = await Organization.findOne({ where: { userId: req.user.id } });
    const projects = await Project.findAll({ where: { organizationId: org.id }, attributes: ['id'] });
    const projectIds = projects.map(p => p.id);
    const { Report, Inspection } = require('../models');
    const reports = await Report.findAll({
      include: [{
        model: Inspection,
        as: 'inspection',
        where: { projectId: projectIds },
        include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }]
      }],
      order: [['generatedAt', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/compliance', auth, authorize('ORGANIZATION'), async (req, res) => {
  try {
    const org = await Organization.findOne({ where: { userId: req.user.id } });
    const projects = await Project.findAll({ where: { organizationId: org.id } });
    const projectIds = projects.map(p => p.id);
    const { Inspection, RiskScore } = require('../models');
    const inspections = await Inspection.findAll({
      where: { projectId: projectIds, status: 'COMPLETED' },
      attributes: ['complianceScore', 'projectId']
    });
    const avgCompliance = inspections.length > 0
      ? inspections.reduce((sum, i) => sum + (i.complianceScore || 0), 0) / inspections.length
      : 0;
    const riskScores = await RiskScore.findAll({
      where: { projectId: projectIds },
      order: [['calculatedAt', 'DESC']],
      limit: projects.length
    });
    res.json({
      totalProjects: projects.length,
      averageCompliance: Math.round(avgCompliance),
      recentRiskScores: riskScores
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
