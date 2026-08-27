const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('RISK', 'INSPECTION_OVERDUE', 'COMPLIANCE_ISSUE', 'ANOMALY', 'SYSTEM'),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('INFO', 'WARNING', 'HIGH', 'CRITICAL'),
    defaultValue: 'INFO'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resolvedAt: {
    type: DataTypes.DATE
  },
  resolvedBy: {
    type: DataTypes.UUID
  }
}, {
  tableName: 'alerts'
});

module.exports = Alert;
