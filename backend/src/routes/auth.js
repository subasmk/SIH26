const router = require('express').Router();
const { User, Organization, Inspector } = require('../models');
const jwt = require('jsonwebtoken');
const { auth, authorize } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const user = await User.create({ email, password, name, role, phone });
    if (role === 'ORGANIZATION') {
      await Organization.create({ userId: user.id, name: name });
    } else if (role === 'INSPECTOR') {
      await Inspector.create({ userId: user.id, employeeId: `INS-${Date.now()}` });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    let profile = null;
    if (user.role === 'INSPECTOR') {
      profile = await Inspector.findOne({ where: { userId: user.id } });
    } else if (user.role === 'ORGANIZATION') {
      profile = await Organization.findOne({ where: { userId: user.id } });
    }
    res.json({
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        profile 
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    let profile = null;
    if (user.role === 'INSPECTOR') {
      profile = await Inspector.findOne({ where: { userId: user.id } });
    } else if (user.role === 'ORGANIZATION') {
      profile = await Organization.findOne({ where: { userId: user.id } });
    }
    res.json({ user, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
