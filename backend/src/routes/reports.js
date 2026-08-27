const router = require('express').Router();
const { Report, Inspection, Project, Inspector, User, InspectionChecklist, Evidence, RiskScore } = require('../models');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const whereClause = {};
    if (req.user.role === 'ORGANIZATION') {
      const org = await require('../models/Organization').findOne({ where: { userId: req.user.id } });
      const projects = await Project.findAll({ where: { organizationId: org.id }, attributes: ['id'] });
      const projectIds = projects.map(p => p.id);
      const inspections = await Inspection.findAll({ where: { projectId: projectIds }, attributes: ['id'] });
      const inspectionIds = inspections.map(i => i.id);
      whereClause.inspectionId = inspectionIds;
    }
    const reports = await Report.findAll({
      where: whereClause,
      include: [
        { 
          model: Inspection, 
          as: 'inspection',
          include: [
            { model: Project, as: 'project', attributes: ['id', 'name'] },
            { model: Inspector, as: 'inspector', include: [{ model: User, as: 'user', attributes: ['name'] }] }
          ]
        }
      ],
      order: [['generatedAt', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [
        { 
          model: Inspection, 
          as: 'inspection',
          include: [
            { model: Project, as: 'project' },
            { model: Inspector, as: 'inspector', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
            { model: InspectionChecklist, as: 'checklists' },
            { model: Evidence, as: 'evidence' }
          ]
        }
      ]
    });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate/:inspectionId', auth, authorize('ADMIN', 'INSPECTOR'), async (req, res) => {
  try {
    const inspection = await Inspection.findByPk(req.params.inspectionId, {
      include: [
        { model: Project, as: 'project' },
        { model: Inspector, as: 'inspector', include: [{ model: User, as: 'user' }] },
        { model: InspectionChecklist, as: 'checklists' },
        { model: Evidence, as: 'evidence' }
      ]
    });
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    const passed = inspection.checklists.filter(c => c.status === 'PASS').length;
    const failed = inspection.checklists.filter(c => c.status === 'FAIL').length;
    const summary = `Inspection completed with ${inspection.complianceScore}% compliance. ${passed} checks passed, ${failed} checks failed.`;
    const findings = inspection.checklists
      .filter(c => c.status === 'FAIL')
      .map(c => `${c.category}: ${c.item}`)
      .join('; ');
    const report = await Report.create({
      inspectionId: inspection.id,
      reportId: `RPT-${Date.now().toString(36).toUpperCase()}`,
      type: 'INSPECTION',
      status: 'FINAL',
      summary,
      findings: findings || 'No major issues found',
      recommendations: inspection.overallRemarks || 'Continue monitoring'
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
