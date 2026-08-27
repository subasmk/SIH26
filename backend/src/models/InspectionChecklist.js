const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InspectionChecklist = sequelize.define('InspectionChecklist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  item: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PASS', 'FAIL', 'NA', 'PENDING'),
    defaultValue: 'PENDING'
  },
  remarks: {
    type: DataTypes.TEXT
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'inspection_checklists'
});

module.exports = InspectionChecklist;
