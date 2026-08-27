const router = require('express').Router();
const { Inspection, Project, Inspector, User, InspectionChecklist, Evidence, Report } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

const generateInspectionId = () => {
  return `INS-${Date.now().toString(36).toUpperCase()}`;
};

const getRandomInspector = async () => {
  const inspectors = await Inspector.findAll({
    where: { availability: 'AVAILABLE' }
  });
  if (inspectors.length === 0) return null;
  return inspectors[Math.floor(Math.random() * inspectors.length)];
};

router.get('/', auth, authorize('ADMIN', 'INSPECTOR'), async (req, res) => {
  try {
    const whereClause = {};
    if (req.user.role === 'INSPECTOR') {
      const inspector = await Inspector.findOne({ where: { userId: req.user.id } });
      whereClause.inspectorId = inspector.id;
    }
    const { status, priority, projectId } = req.query;
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (projectId) whereClause.projectId = projectId;
    const inspections = await Inspection.findAll({
      where: whereClause,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'location', 'latitude', 'longitude'] },
        { model: Inspector, as: 'inspector', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(inspections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project' },
        { model: Inspector, as: 'inspector', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
        { model: InspectionChecklist, as: 'checklists', order: [['order', 'ASC']] },
        { model: Evidence, as: 'evidence' }
      ]
    });
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    res.json(inspection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const { projectId, priority, type, scheduledDate, inspectorId } = req.body;
    let assignedInspectorId = inspectorId;
    if (!assignedInspectorId) {
      const randomInspector = await getRandomInspector();
      if (randomInspector) {
        assignedInspectorId = randomInspector.id;
      }
    }
    const inspection = await Inspection.create({
      inspectionId: generateInspectionId(),
      projectId,
      inspectorId: assignedInspectorId,
      priority: priority || 'MEDIUM',
      type: type || 'SCHEDULED',
      scheduledDate,
      status: assignedInspectorId ? 'ASSIGNED' : 'PENDING'
    });
    const defaultChecklists = [
      { category: 'Infrastructure', item: 'Infrastructure available', order: 1 },
      { category: 'Infrastructure', item: 'Infrastructure functional', order: 2 },
      { category: 'Staff', item: 'Staff present', order: 3 },
      { category: 'Staff', item: 'Staff records verified', order: 4 },
      { category: 'Beneficiaries', item: 'Attendance verified', order: 5 },
      { category: 'Beneficiaries', item: 'Records verified', order: 6 },
      { category: 'Facilities', item: 'Required facilities available', order: 7 },
      { category: 'Documents', item: 'Documents verified', order: 8 }
    ];
    for (const item of defaultChecklists) {
      await InspectionChecklist.create({
        inspectionId: inspection.id,
        ...item
      });
    }
    const createdInspection = await Inspection.findByPk(inspection.id, {
      include: [
        { model: Project, as: 'project' },
        { model: Inspector, as: 'inspector', include: [{ model: User, as: 'user' }] }
      ]
    });
    res.status(201).json(createdInspection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', auth, authorize('INSPECTOR', 'ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    const inspection = await Inspection.findByPk(req.params.id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    const updateData = { status };
    if (status === 'IN_PROGRESS') {
      updateData.startedAt = new Date();
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }
    await inspection.update(updateData);
    res.json(inspection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/verify-gps', auth, authorize('INSPECTOR'), async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const inspection = await Inspection.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project' }]
    });
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    const projectLat = parseFloat(inspection.project.latitude);
    const projectLng = parseFloat(inspection.project.longitude);
    const inspectorLat = parseFloat(latitude);
    const inspectorLng = parseFloat(longitude);
    const R = 6371000;
    const phi1 = projectLat * Math.PI / 180;
    const phi2 = inspectorLat * Math.PI / 180;
    const deltaPhi = (inspectorLat - projectLat) * Math.PI / 180;
    const deltaLambda = (inspectorLng - projectLng) * Math.PI / 180;
    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    const allowedRadius = 500;
    const isVerified = distance <= allowedRadius;
    await inspection.update({
      gpsVerified: isVerified,
      gpsDistance: distance,
      inspectorLatitude: latitude,
      inspectorLongitude: longitude
    });
    res.json({
      verified: isVerified,
      distance: Math.round(distance),
      allowedRadius,
      message: isVerified ? 'Location verified' : `You are ${Math.round(distance)}m away from the project location`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/checklist', auth, authorize('INSPECTOR'), async (req, res) => {
  try {
    const { checklists } = req.body;
    for (const item of checklists) {
      await InspectionChecklist.update(
        { status: item.status, remarks: item.remarks },
        { where: { id: item.id } }
      );
    }
    const allChecklists = await InspectionChecklist.findAll({ where: { inspectionId: req.params.id } });
    const passed = allChecklists.filter(c => c.status === 'PASS').length;
    const total = allChecklists.filter(c => c.status !== 'NA' && c.status !== 'PENDING').length;
    const complianceScore = total > 0 ? Math.round((passed / total) * 100) : 0;
    await Inspection.update({ complianceScore }, { where: { id: req.params.id } });
    res.json({ checklists: allChecklists, complianceScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/complete', auth, authorize('INSPECTOR'), async (req, res) => {
  try {
    const { overallRemarks } = req.body;
    const inspection = await Inspection.findByPk(req.params.id, {
      include: [{ model: InspectionChecklist, as: 'checklists' }]
    });
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    const passed = inspection.checklists.filter(c => c.status === 'PASS').length;
    const total = inspection.checklists.filter(c => c.status !== 'NA' && c.status !== 'PENDING').length;
    const complianceScore = total > 0 ? Math.round((passed / total) * 100) : 0;
    await inspection.update({
      status: 'COMPLETED',
      completedAt: new Date(),
      complianceScore,
      overallRemarks
    });
    const report = await Report.create({
      inspectionId: inspection.id,
      reportId: `RPT-${Date.now().toString(36).toUpperCase()}`,
      type: 'INSPECTION',
      status: 'FINAL'
    });
    res.json({ inspection, report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
