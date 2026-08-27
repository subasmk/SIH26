import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const Inspections = () => {
  const [inspections, setInspections] = useState([]);
  const [projects, setProjects] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [formData, setFormData] = useState({
    projectId: '',
    inspectorId: '',
    priority: 'MEDIUM',
    type: 'SCHEDULED',
    scheduledDate: ''
  });

  useEffect(() => {
    fetchInspections();
    fetchProjects();
    fetchInspectors();
  }, []);

  const fetchInspections = async () => {
    try {
      const res = await api.get('/inspections');
      setInspections(res.data);
    } catch (error) {
      console.error('Error fetching inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchInspectors = async () => {
    try {
      const res = await api.get('/inspectors');
      setInspectors(res.data);
    } catch (error) {
      console.error('Error fetching inspectors:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/inspections', formData);
      setShowModal(false);
      setFormData({ projectId: '', inspectorId: '', priority: 'MEDIUM', type: 'SCHEDULED', scheduledDate: '' });
      fetchInspections();
    } catch (error) {
      console.error('Error creating inspection:', error);
    }
  };

  const fetchDetails = async (id) => {
    try {
      const res = await api.get(`/inspections/${id}`);
      setSelectedInspection(res.data);
    } catch (error) {
      console.error('Error fetching inspection details:', error);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="card text-center cursor-pointer hover:border-purple-500/80 transition-all"
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}>
              <p className="text-3xl font-extrabold text-white">{count}</p>
              <p className="text-xs font-mono text-purple-300/80 uppercase tracking-wider mt-1">{status.replace('_', ' ')}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-44">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REQUIRES_REVIEW">Requires Review</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="input w-44">
              <option value="">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">+ New Inspection</button>
        </div>

        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-[#141024] border-b border-purple-800/40 text-purple-300">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-mono uppercase tracking-wider">Inspection ID</th>
                <th className="px-5 py-3.5 text-left text-xs font-mono uppercase tracking-wider">Project</th>
                <th className="px-5 py-3.5 text-left text-xs font-mono uppercase tracking-wider">Inspector</th>
                <th className="px-5 py-3.5 text-left text-xs font-mono uppercase tracking-wider">Type</th>
                <th className="px-5 py-3.5 text-left text-xs font-mono uppercase tracking-wider">Priority</th>
                <th className="px-5 py-3.5 text-left text-xs font-mono uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-mono uppercase tracking-wider">Compliance</th>
                <th className="px-5 py-3.5 text-left text-xs font-mono uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/30">
              {filtered.map(insp => (
                <tr key={insp.id} className="hover:bg-purple-900/20 transition-colors">
                  <td className="px-5 py-4 text-sm font-mono font-bold text-purple-300">{insp.inspectionId}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-white">{insp.project?.name}</td>
                  <td className="px-5 py-4 text-sm text-purple-200">
                    {insp.inspector?.user?.name ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        {insp.inspector.user.name}
                      </span>
                    ) : (
                      <span className="text-amber-400 font-mono text-xs">⚠️ Random Assign</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-purple-200">{insp.type}</td>
                  <td className="px-5 py-4">
                    <span className={`badge ${
                      insp.priority === 'HIGH' || insp.priority === 'URGENT' ? 'badge-danger' :
                      insp.priority === 'MEDIUM' ? 'badge-warning' : 'badge-gray'
                    }`}>{insp.priority}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${
                      insp.status === 'COMPLETED' ? 'badge-success' :
                      insp.status === 'IN_PROGRESS' ? 'badge-warning' :
                      insp.status === 'PENDING' ? 'badge-gray' : 'badge-info'
                    }`}>{insp.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-mono font-bold text-white">
                    {insp.complianceScore ? `${insp.complianceScore}%` : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => fetchDetails(insp.id)}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Inspection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#141024] border border-purple-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create & Assign Inspection</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Project</label>
                <select value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })} className="input" required>
                  <option value="">Select Target Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Inspector Assignment</label>
                <select value={formData.inspectorId} onChange={(e) => setFormData({ ...formData, inspectorId: e.target.value })} className="input">
                  <option value="">✨ AI Random Assignment (Recommended)</option>
                  {inspectors.map(ins => (
                    <option key={ins.id} value={ins.id}>{ins.user?.name} ({ins.employeeId})</option>
                  ))}
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
                <button onClick={handleCreate} className="btn-primary flex-1">Create Inspection</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Inspection Details Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#141024] border border-purple-500/50 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start border-b border-purple-900/40 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-purple-300">{selectedInspection.inspectionId}</span>
                <h3 className="text-xl font-bold text-white">{selectedInspection.project?.name}</h3>
                <p className="text-xs text-purple-300/80">{selectedInspection.project?.location}</p>
              </div>
              <button onClick={() => setSelectedInspection(null)} className="text-purple-300 hover:text-white p-1 text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#1a152e] p-4 rounded-xl border border-purple-800/40">
              <div>
                <p className="text-xs font-mono text-purple-400">STATUS</p>
                <p className="font-semibold text-white text-sm">{selectedInspection.status}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-purple-400">INSPECTOR</p>
                <p className="font-semibold text-white text-sm">{selectedInspection.inspector?.user?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-purple-400">TYPE</p>
                <p className="font-semibold text-white text-sm">{selectedInspection.type}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-purple-400">COMPLIANCE</p>
                <p className="font-semibold text-emerald-400 text-sm">{selectedInspection.complianceScore ? `${selectedInspection.complianceScore}%` : 'N/A'}</p>
              </div>
            </div>

            {selectedInspection.checklists?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-purple-200">Inspection Checklist Items</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {selectedInspection.checklists.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 rounded-lg bg-[#1a152e]/60 border border-purple-900/30">
                      <span className="text-xs font-medium text-white">{c.category}: {c.item}</span>
                      <span className={`badge ${c.status === 'PASS' ? 'badge-success' : c.status === 'FAIL' ? 'badge-danger' : 'badge-gray'}`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedInspection.overallRemarks && (
              <div className="bg-[#1a152e] p-4 rounded-xl border border-purple-800/40">
                <p className="text-xs font-mono text-purple-400 mb-1">INSPECTOR REMARKS</p>
                <p className="text-sm text-purple-100 italic">{selectedInspection.overallRemarks}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedInspection(null)} className="btn-primary text-sm px-6">Close</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inspections;
