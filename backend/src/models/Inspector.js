const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inspector = sequelize.define('Inspector', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employeeId: {
    type: DataTypes.STRING,
    unique: true
  },
  specialization: {
    type: DataTypes.STRING
  },
  zones: {
    type: DataTypes.TEXT
  },
  availability: {
    type: DataTypes.ENUM('AVAILABLE', 'BUSY', 'ON_LEAVE'),
    defaultValue: 'AVAILABLE'
  },
  totalInspections: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.0
  }
}, {
  tableName: 'inspectors'
});

module.exports = Inspector;
