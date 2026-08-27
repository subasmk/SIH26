const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  location: {
    type: DataTypes.STRING
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8)
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8)
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'COMPLETED', 'SUSPENDED'),
    defaultValue: 'ACTIVE'
  },
  startDate: {
    type: DataTypes.DATE
  },
  endDate: {
    type: DataTypes.DATE
  },
  budget: {
    type: DataTypes.DECIMAL(15, 2)
  },
  beneficiaryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  reportingFrequency: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  }
}, {
  tableName: 'projects'
});

module.exports = Project;
