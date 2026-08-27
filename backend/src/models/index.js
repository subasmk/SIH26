const sequelize = require('../config/database');
const User = require('./User');
const Organization = require('./Organization');
const Inspector = require('./Inspector');
const Project = require('./Project');
const Inspection = require('./Inspection');
const InspectionChecklist = require('./InspectionChecklist');
const Evidence = require('./Evidence');
const RiskScore = require('./RiskScore');
const Alert = require('./Alert');
const Report = require('./Report');
const AuditLog = require('./AuditLog');

User.hasOne(Organization, { foreignKey: 'userId', as: 'organization' });
Organization.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Inspector, { foreignKey: 'userId', as: 'inspectorProfile' });
Inspector.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Organization.hasMany(Project, { foreignKey: 'organizationId', as: 'projects' });
Project.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Project.hasMany(Inspection, { foreignKey: 'projectId', as: 'inspections' });
Inspection.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Inspection.hasMany(InspectionChecklist, { foreignKey: 'inspectionId', as: 'checklists' });
InspectionChecklist.belongsTo(Inspection, { foreignKey: 'inspectionId', as: 'inspection' });

Inspection.hasMany(Evidence, { foreignKey: 'inspectionId', as: 'evidence' });
Evidence.belongsTo(Inspection, { foreignKey: 'inspectionId', as: 'inspection' });

Inspection.hasOne(Report, { foreignKey: 'inspectionId', as: 'report' });
Report.belongsTo(Inspection, { foreignKey: 'inspectionId', as: 'inspection' });

Project.hasMany(RiskScore, { foreignKey: 'projectId', as: 'riskScores' });
RiskScore.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Project.hasMany(Alert, { foreignKey: 'projectId', as: 'alerts' });
Alert.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Inspector.hasMany(Inspection, { foreignKey: 'inspectorId', as: 'inspections' });
Inspection.belongsTo(Inspector, { foreignKey: 'inspectorId', as: 'inspector' });

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Alert, { foreignKey: 'resolvedBy', as: 'resolvedAlerts' });
Alert.belongsTo(User, { foreignKey: 'resolvedBy', as: 'resolvedByUser' });

const syncDatabase = async () => {
  await sequelize.sync();
  console.log('Database synchronized');
};

module.exports = {
  sequelize,
  User,
  Organization,
  Inspector,
  Project,
  Inspection,
  InspectionChecklist,
  Evidence,
  RiskScore,
  Alert,
  Report,
  AuditLog,
  syncDatabase
};
