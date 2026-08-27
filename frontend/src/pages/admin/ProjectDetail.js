import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [inspectionForm, setInspectionForm] = useState({
    priority: 'MEDIUM',
    type: 'SCHEDULED',
    scheduledDate: ''
  });

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const generateInspection = async () => {
    try {
      await api.post('/inspections', {
        projectId: id,
        ...inspectionForm
      });
      setShowGenerateModal(false);
      fetchProject();
    } catch (error) {
      console.error('Error generating inspection:', error);
    }
  };

  const calculateRisk = async () => {
    try {
      await api.post(`/risk/calculate/${id}`);
      fetchProject();
    } catch (error) {
      console.error('Error calculating risk:', error);
    }
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

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-purple-200">Project not found</p>
          <button onClick={() => navigate('/admin/projects')} className="btn-primary mt-4">Back to Projects</button>
        </div>
      </Layout>
    );
  }

  const latestRisk = project.riskScores?.[0];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <button onClick={() => navigate('/admin/projects')} className="text-purple-300 hover:text-white font-mono text-xs font-bold mb-2 inline-flex items-center">
              ← Back to Projects
            </button>
            <h1 className="text-2xl font-extrabold text-white">{project.name}</h1>
            <p className="text-sm font-mono text-purple-300 mt-1">{project.location}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={calculateRisk} className="btn-secondary">
              Calculate Risk
            </button>
            <button onClick={() => setShowGenerateModal(true)} className="btn-primary">
              Generate Inspection
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card space-y-3">
            <h3 className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">Project Info</h3>
            <div className="space-y-3 border-t border-purple-800/40 pt-3">
              <div>
                <p className="text-xs font-mono text-purple-300">STATUS</p>
                <span className={`badge ${
                  project.status === 'ACTIVE' ? 'badge-success' :
                  project.status === 'INACTIVE' ? 'badge-gray' :
                  project.status === 'COMPLETED' ? 'badge-info' : 'badge-danger'
                }`}>{project.status}</span>
              </div>
              <div>
                <p className="text-xs font-mono text-purple-300">ORGANIZATION</p>
                <p className="font-semibold text-white text-sm">{project.organization?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-purple-300">BENEFICIARIES</p>
                <p className="font-mono font-bold text-white text-sm">{project.beneficiaryCount || 0}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-purple-300">BUDGET</p>
                <p className="font-mono font-bold text-emerald-400 text-sm">₹{project.budget ? Number(project.budget).toLocaleString() : 'N/A'}</p>
              </div>
              {project.description && (
                <div>
                  <p className="text-xs font-mono text-purple-300">DESCRIPTION</p>
                  <p className="text-xs text-purple-100 mt-1">{project.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card space-y-3">
            <h3 className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">AI Risk Assessment</h3>
            {latestRisk ? (
              <div className="space-y-3 border-t border-purple-800/40 pt-3">
                <div className="text-center py-2">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${
                    latestRisk.level === 'CRITICAL' ? 'bg-rose-950/60 border border-rose-500/50' :
                    latestRisk.level === 'HIGH' ? 'bg-rose-950/40 border border-rose-500/40' :
                    latestRisk.level === 'MEDIUM' ? 'bg-amber-950/40 border border-amber-500/40' : 'bg-emerald-950/40 border border-emerald-500/40'
                  }`}>
                    <span className={`text-3xl font-extrabold font-mono ${
                      latestRisk.level === 'CRITICAL' ? 'text-rose-400' :
                      latestRisk.level === 'HIGH' ? 'text-rose-400' :
                      latestRisk.level === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>{latestRisk.score}</span>
                  </div>
                  <p className="mt-2 font-mono font-bold text-white text-xs">{latestRisk.level} RISK SCORE</p>
                </div>
                {latestRisk.anomalies && JSON.parse(latestRisk.anomalies).length > 0 && (
                  <div>
                    <p className="text-xs font-mono font-bold text-rose-300 mb-1">ANOMALIES DETECTED</p>
                    <ul className="text-xs text-purple-100 space-y-1">
                      {JSON.parse(latestRisk.anomalies).map((a, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">•</span>{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-purple-300 text-xs">No risk assessment yet</p>
                <button onClick={calculateRisk} className="btn-primary mt-3 text-xs">Calculate Now</button>
              </div>
            )}
          </div>

          <div className="card space-y-3">
            <h3 className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">Geographic Metadata</h3>
            {project.latitude && project.longitude ? (
              <div className="space-y-3 border-t border-purple-800/40 pt-3">
                <p className="text-xs font-mono text-purple-100"><span className="text-purple-300">Latitude:</span> {project.latitude}</p>
                <p className="text-xs font-mono text-purple-100"><span className="text-purple-300">Longitude:</span> {project.longitude}</p>
                <a
                  href={`https://www.google.com/maps?q=${project.latitude},${project.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs text-center block"
                >
                  Open in Google Maps ↗
                </a>
              </div>
            ) : (
              <p className="text-purple-300 text-xs">No location data</p>
            )}
          </div>
        </div>
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#141024] border border-purple-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Generate Inspection</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Priority</label>
                <select
                  value={inspectionForm.priority}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, priority: e.target.value })}
                  className="input"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="label">Type</label>
                <select
                  value={inspectionForm.type}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, type: e.target.value })}
                  className="input"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="SURPRISE">Surprise</option>
                </select>
              </div>
              <div>
                <label className="label">Scheduled Date</label>
                <input
                  type="datetime-local"
                  value={inspectionForm.scheduledDate}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, scheduledDate: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowGenerateModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={generateInspection} className="btn-primary flex-1">Generate</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProjectDetail;
