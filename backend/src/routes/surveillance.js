const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const { Project } = require('../models');

// Mock CCTV Cameras Data
const mockCameras = [
  { id: 'CAM-01', name: 'Main Entrance Gate', streamUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', status: 'ONLINE', fps: 30, resolution: '1080p' },
  { id: 'CAM-02', name: 'Sanitation & Health Block', streamUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', status: 'ONLINE', fps: 28, resolution: '1080p' },
  { id: 'CAM-03', name: 'Classroom / Training Area', streamUrl: '', status: 'OFFLINE', fps: 0, resolution: 'N/A' },
  { id: 'CAM-04', name: 'Kitchen & Dining Area', streamUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', status: 'ONLINE', fps: 30, resolution: '720p' },
];

// Get CCTV Cameras for a project
router.get('/cameras/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({
      project: { id: project.id, name: project.name, location: project.location },
      cameras: mockCameras
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initiate Video Conferencing Call (VC)
router.post('/vc/initiate', auth, authorize('ADMIN', 'INSPECTOR'), async (req, res) => {
  try {
    const { projectId, targetRole, participantName } = req.body;
    const roomId = `DoSJE-VC-${Date.now().toString(36).toUpperCase()}`;
    res.json({
      roomId,
      meetingUrl: `https://meet.jit.si/${roomId}`,
      status: 'INITIATED',
      targetRole: targetRole || 'Project Incharge',
      participantName: participantName || 'Field Staff',
      initiatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
