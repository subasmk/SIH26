const router = require('express').Router();
const { RiskScore, Project, Inspection, Alert } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

const calculateRiskScore = async (projectId) => {
  const project = await Project.findByPk(projectId, {
    include: [
      { model: Inspection, as: 'inspections' },
      { model: RiskScore, as: 'riskScores', limit: 5, order: [['calculatedAt', 'DESC']] }
    ]
  });
  if (!project) return null;
  let score = 0;
  const factors = [];
  const anomalies = [];
  const recommendations = [];
  const inspections = project.inspections || [];
  const lastInspection = inspections.find(i => i.status === 'COMPLETED');
  const daysSinceLastInspection = lastInspection 
    ? Math.floor((new Date() - new Date(lastInspection.completedAt)) / (1000 * 60 * 60 * 24))
    : 999;
  if (daysSinceLastInspection > 60) {
    score += 25;
    factors.push('Inspection overdue');
    anomalies.push(`Last inspection was ${daysSinceLastInspection} days ago`);
    recommendations.push('Schedule immediate inspection');
  } else if (daysSinceLastInspection > 30) {
    score += 15;
    factors.push('Inspection due');
  }
  const avgCompliance = inspections.length > 0
    ? inspections.reduce((sum, i) => sum + (i.complianceScore || 0), 0) / inspections.filter(i => i.complianceScore).length
    : 100;
  if (avgCompliance < 60) {
    score += 30;
    factors.push('Low compliance score');
    anomalies.push(`Average compliance: ${Math.round(avgCompliance)}%`);
    recommendations.push('Review project processes');
  } else if (avgCompliance < 75) {
    score += 15;
    factors.push('Below average compliance');
  }
  if (project.beneficiaryCount < 10) {
    score += 10;
    factors.push('Low beneficiary count');
  }
  const inspectionGap = daysSinceLastInspection - project.reportingFrequency;
  if (inspectionGap > 15) {
    score += 15;
    anomalies.push('Reporting gap detected');
  }
  if (inspections.filter(i => i.status === 'REQUIRES_REVIEW').length > 0) {
    score += 20;
    factors.push('Pending reviews');
    recommendations.push('Review flagged inspections');
  }
  score = Math.min(100, score);
  let level = 'LOW';
  if (score >= 70) level = 'HIGH';
  else if (score >= 40) level = 'MEDIUM';
  if (score >= 85) level = 'CRITICAL';
  return { score, level, factors, anomalies, recommendations };
};

router.post('/calculate/:projectId', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const result = await calculateRiskScore(req.params.projectId);
    if (!result) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const riskScore = await RiskScore.create({
      projectId: req.params.projectId,
      score: result.score,
      level: result.level,
      factors: JSON.stringify(result.factors),
      anomalies: JSON.stringify(result.anomalies),
      recommendations: JSON.stringify(result.recommendations)
    });
    if (result.level === 'HIGH' || result.level === 'CRITICAL') {
      await Alert.create({
        projectId: req.params.projectId,
        type: 'RISK',
        severity: result.level === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        title: `High Risk Project Detected`,
        message: `Project has a risk score of ${result.score}/100. Factors: ${result.factors.join(', ')}`
      });
    }
    res.json(riskScore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const riskScores = await RiskScore.findAll({
      where: { projectId: req.params.projectId },
      order: [['calculatedAt', 'DESC']]
    });
    res.json(riskScores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/batch-calculate', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const projects = await Project.findAll({ where: { status: 'ACTIVE' } });
    const results = [];
    for (const project of projects) {
      const result = await calculateRiskScore(project.id);
      if (result) {
        const riskScore = await RiskScore.create({
          projectId: project.id,
          score: result.score,
          level: result.level,
          factors: JSON.stringify(result.factors),
          anomalies: JSON.stringify(result.anomalies),
          recommendations: JSON.stringify(result.recommendations)
        });
        results.push({ projectId: project.id, score: riskScore });
      }
    }
    res.json({ processed: results.length, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
