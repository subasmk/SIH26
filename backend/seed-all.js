require('dotenv').config();
const { User, Organization, Inspector, Project, Inspection, InspectionChecklist, Evidence, RiskScore, Alert, Report, syncDatabase, sequelize } = require('./src/models');

const seedAllDemoData = async () => {
  await syncDatabase();

  await sequelize.query('PRAGMA foreign_keys = OFF;');

  await Report.destroy({ where: {} });
  await Evidence.destroy({ where: {} });
  await InspectionChecklist.destroy({ where: {} });
  await Inspection.destroy({ where: {} });
  await Alert.destroy({ where: {} });
  await RiskScore.destroy({ where: {} });
  await Project.destroy({ where: {} });
  await Inspector.destroy({ where: {} });
  await Organization.destroy({ where: {} });
  await User.destroy({ where: {} });

  await sequelize.query('PRAGMA foreign_keys = ON;');

  const adminUser = await User.create({
    email: 'admin@smartinspect.demo',
    password: 'password123',
    name: 'System Admin',
    role: 'ADMIN',
    phone: '9876543210'
  });

  const inspectorUser1 = await User.create({
    email: 'inspector@smartinspect.demo',
    password: 'password123',
    name: 'John Inspector',
    role: 'INSPECTOR',
    phone: '9876543211'
  });
  const inspector1 = await Inspector.create({
    userId: inspectorUser1.id,
    employeeId: 'INS-1001',
    specialization: 'Infrastructure & Safety',
    availability: 'AVAILABLE',
    rating: 4.8
  });

  const inspectorUser2 = await User.create({
    email: 'inspector2@smartinspect.demo',
    password: 'password123',
    name: 'Sarah Connor',
    role: 'INSPECTOR',
    phone: '9876543214'
  });
  const inspector2 = await Inspector.create({
    userId: inspectorUser2.id,
    employeeId: 'INS-1002',
    specialization: 'Environmental & Welfare',
    availability: 'AVAILABLE',
    rating: 4.9
  });

  const orgUser = await User.create({
    email: 'ngo@smartinspect.demo',
    password: 'password123',
    name: 'Global Welfare Foundation',
    role: 'ORGANIZATION',
    phone: '9876543212'
  });
  const org = await Organization.create({
    userId: orgUser.id,
    name: 'Global Welfare Foundation',
    email: 'contact@globalwelfare.org',
    phone: '044-24567890',
    address: '123 Health Ave, Chennai, Tamil Nadu',
    registrationNumber: 'REG-2024-GWF-99'
  });

  const projectABC = await Project.create({
    name: 'Project ABC - School Infrastructure Upgrade',
    description: 'Upgrading primary school classrooms, digital labs, and sanitation facilities.',
    location: 'Chennai, Tamil Nadu',
    latitude: 13.0827,
    longitude: 80.2707,
    status: 'ACTIVE',
    organizationId: org.id,
    startDate: new Date('2026-01-10'),
    endDate: new Date('2026-12-31'),
    budget: 5000000.00,
    beneficiaryCount: 1250,
    reportingFrequency: 15
  });

  const projectXYZ = await Project.create({
    name: 'Project XYZ - Rural Healthcare Clinic',
    description: 'Construction of primary healthcare clinic with telemedicine equipment.',
    location: 'Coimbatore, Tamil Nadu',
    latitude: 11.0168,
    longitude: 76.9558,
    status: 'ACTIVE',
    organizationId: org.id,
    startDate: new Date('2026-02-01'),
    budget: 3500000.00,
    beneficiaryCount: 3400,
    reportingFrequency: 30
  });

  const projectDEF = await Project.create({
    name: 'Project DEF - Clean Drinking Water Borewells',
    description: 'Installation of 50 solar-powered water filtration units.',
    location: 'Madurai, Tamil Nadu',
    latitude: 9.9252,
    longitude: 78.1198,
    status: 'ACTIVE',
    organizationId: org.id,
    startDate: new Date('2026-03-15'),
    budget: 2000000.00,
    beneficiaryCount: 8000,
    reportingFrequency: 30
  });

  await RiskScore.create({
    projectId: projectABC.id,
    score: 87,
    level: 'HIGH',
    factors: JSON.stringify(['Inspection overdue', 'Low compliance score', 'Reporting gap detected']),
    anomalies: JSON.stringify(['Unusual attendance pattern', 'Previous compliance issues (74%)', 'Inspection overdue by 42 days']),
    recommendations: JSON.stringify(['Prioritize for surprise inspection', 'Verify staff records on-site', 'Audit financial disbursements'])
  });

  await RiskScore.create({
    projectId: projectXYZ.id,
    score: 25,
    level: 'LOW',
    factors: JSON.stringify(['Regular reporting']),
    anomalies: JSON.stringify([]),
    recommendations: JSON.stringify(['Routine scheduled inspection'])
  });

  await Alert.create({
    projectId: projectABC.id,
    type: 'RISK',
    severity: 'HIGH',
    title: '⚠️ HIGH RISK: Project ABC',
    message: 'Risk Score: 87/100. Anomalies detected: Attendance anomaly, reporting gap, inspection overdue.'
  });

  const inspection1 = await Inspection.create({
    inspectionId: 'INS-1024',
    projectId: projectABC.id,
    inspectorId: inspector1.id,
    priority: 'HIGH',
    type: 'SURPRISE',
    status: 'ASSIGNED',
    scheduledDate: new Date()
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
      inspectionId: inspection1.id,
      ...item
    });
  }

  const inspection2 = await Inspection.create({
    inspectionId: 'INS-0980',
    projectId: projectABC.id,
    inspectorId: inspector1.id,
    priority: 'MEDIUM',
    type: 'SCHEDULED',
    status: 'COMPLETED',
    gpsVerified: true,
    gpsDistance: 42.50,
    inspectorLatitude: 13.0825,
    inspectorLongitude: 80.2705,
    complianceScore: 74,
    overallRemarks: 'Minor delays in sanitation unit construction. Attendance records partially matched.',
    startedAt: new Date('2026-07-10T09:00:00Z'),
    completedAt: new Date('2026-07-10T11:30:00Z')
  });

  for (const item of defaultChecklists) {
    await InspectionChecklist.create({
      inspectionId: inspection2.id,
      ...item,
      status: item.order <= 6 ? 'PASS' : 'FAIL',
      remarks: item.order > 6 ? 'Documentation incomplete' : 'Verified'
    });
  }

  await Report.create({
    inspectionId: inspection2.id,
    reportId: 'RPT-INS0980',
    type: 'INSPECTION',
    status: 'FINAL',
    summary: 'Inspection completed with 74% compliance score. 6 checks passed, 2 checks failed.',
    findings: 'Documents failed verification. Facility completion delayed by 2 weeks.',
    recommendations: 'Follow up surprise inspection recommended in 30 days.'
  });

  console.log('Demo accounts & full SIH demo dataset created successfully!');
  process.exit(0);
};

seedAllDemoData();
