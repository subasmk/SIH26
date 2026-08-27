const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inspection = sequelize.define('Inspection', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  inspectionId: {
    type: DataTypes.STRING,
    unique: true
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    defaultValue: 'MEDIUM'
  },
  type: {
    type: DataTypes.ENUM('SCHEDULED', 'SURPRISE'),
    defaultValue: 'SCHEDULED'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REQUIRES_REVIEW'),
    defaultValue: 'PENDING'
  },
  scheduledDate: {
    type: DataTypes.DATE
  },
  startedAt: {
    type: DataTypes.DATE
  },
  completedAt: {
    type: DataTypes.DATE
  },
  gpsVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  gpsDistance: {
    type: DataTypes.DECIMAL(10, 2)
  },
  inspectorLatitude: {
    type: DataTypes.DECIMAL(10, 8)
  },
  inspectorLongitude: {
    type: DataTypes.DECIMAL(11, 8)
  },
  complianceScore: {
    type: DataTypes.DECIMAL(5, 2)
  },
  overallRemarks: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'inspections'
});

module.exports = Inspection;
