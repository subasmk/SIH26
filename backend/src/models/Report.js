const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reportId: {
    type: DataTypes.STRING,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('INSPECTION', 'COMPLIANCE', 'RISK', 'MONTHLY', 'CUSTOM'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'FINAL', 'REVIEWED'),
    defaultValue: 'DRAFT'
  },
  summary: {
    type: DataTypes.TEXT
  },
  findings: {
    type: DataTypes.TEXT
  },
  recommendations: {
    type: DataTypes.TEXT
  },
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'reports'
});

module.exports = Report;
