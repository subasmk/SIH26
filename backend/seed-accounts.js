require('dotenv').config();
const { User, Organization, Inspector, syncDatabase } = require('./src/models');
const bcrypt = require('bcryptjs');

const resetUsers = async () => {
  await syncDatabase();

  await User.destroy({ where: {} });
  await Organization.destroy({ where: {} });
  await Inspector.destroy({ where: {} });

  const users = [
    {
      email: 'admin@smartinspect.demo',
      password: 'password123',
      name: 'System Admin',
      role: 'ADMIN',
      phone: '9876543210'
    },
    {
      email: 'inspector@smartinspect.demo',
      password: 'password123',
      name: 'John Inspector',
      role: 'INSPECTOR',
      phone: '9876543211'
    },
    {
      email: 'ngo@smartinspect.demo',
      password: 'password123',
      name: 'Global Welfare Org',
      role: 'ORGANIZATION',
      phone: '9876543212'
    }
  ];

  for (const u of users) {
    const user = await User.create(u);
    if (u.role === 'ORGANIZATION') {
      await Organization.create({ userId: user.id, name: u.name });
    } else if (u.role === 'INSPECTOR') {
      await Inspector.create({ userId: user.id, employeeId: `INS-1001` });
    }
    console.log(`Created ${u.role}: ${u.email}`);
  }

  process.exit(0);
};

resetUsers();
