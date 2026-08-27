import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';

const Inspections = () => {
  const [inspections, setInspections] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [formData, setFormData] = useState({
    projectId: '',
    priority: 'MEDIUM',
    type: 'SCHEDULED',
    scheduledDate: ''
  });

  useEffect(() => {
    fetchInspections();
    fetchProjects();
  }, []);

  const fetchInspections = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inspections');
      setInspections(res.data);
    } catch (error) {
      console.error('Error fetching inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post('http://localhost:5000/api/inspections', formData);
      setShowModal(false);
      setFormData({ projectId: '', priority: 'MEDIUM', type: 'SCHEDULED', scheduledDate: '' });
      fetchInspections();
    } catch (error) {
      console.error('Error creating inspection:', error);
    }
  };

  const filtered = inspections.filter(i => {
    if (statusFilter && i.status !== statusFilter) return false;
    if (priorityFilter && i.priority !== priorityFilter) return false;
    return true;
  });

  const statusCounts = {
    PENDING: inspections.filter(i => i.status === 'PENDING').length,
    ASSIGNED: inspections.filter(i => i.status === 'ASSIGNED').length,
    IN_PROGRESS: inspections.filter(i => i.status === 'IN_PROGRESS').length,
    COMPLETED: inspections.filter(i => i.status === 'COMPLETED').length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="card text-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm text-gray-500">{status.replace('_', ' ')}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-40">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REQUIRES_REVIEW">Requires Review</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="input w-40">
              <option value="">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">+ New Inspection</button>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Inspection ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Project</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Inspector</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Compliance</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">GPS</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(insp => (
                <tr key={insp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{insp.inspectionId}</td>
                  <td className="px-4 py-3 text-sm">{insp.project?.name}</td>
                  <td className="px-4 py-3 text-sm">{insp.inspector?.user?.name || 'Unassigned'}</td>
                  <td className="px-4 py-3 text-sm">{insp.type}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      insp.priority === 'HIGH' || insp.priority === 'URGENT' ? 'badge-danger' :
                      insp.priority === 'MEDIUM' ? 'badge-warning' : 'badge-gray'
                    }`}>{insp.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      insp.status === 'COMPLETED' ? 'badge-success' :
                      insp.status === 'IN_PROGRESS' ? 'badge-warning' :
                      insp.status === 'PENDING' ? 'badge-gray' :
                      insp.status === 'REQUIRES_REVIEW' ? 'badge-danger' : 'badge-info'
                    }`}>{insp.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{insp.complianceScore ? `${insp.complianceScore}%` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${insp.gpsVerified ? 'badge-success' : 'badge-gray'}`}>
                      {insp.gpsVerified ? '✓' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {insp.createdAt ? new Date(insp.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">New Inspection</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Project</label>
                <select value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })} className="input" required>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="input">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="label">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input">
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="SURPRISE">Surprise</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Scheduled Date</label>
                <input type="datetime-local" value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} className="input" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleCreate} className="btn-primary flex-1">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inspections;
