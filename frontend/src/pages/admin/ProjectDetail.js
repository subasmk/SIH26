import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import axios from 'axios';

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
      const res = await axios.get(`http://localhost:5000/api/projects/${id}`);
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
      await axios.post('http://localhost:5000/api/inspections', {
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
      await axios.post(`http://localhost:5000/api/risk/calculate/${id}`);
      fetchProject();
    } catch (error) {
      console.error('Error calculating risk:', error);
    }
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

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Project not found</p>
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
            <button onClick={() => navigate('/admin/projects')} className="text-blue-600 hover:underline mb-2 inline-flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Projects
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-gray-600">{project.location}</p>
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
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Project Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`badge ${
                  project.status === 'ACTIVE' ? 'badge-success' :
                  project.status === 'INACTIVE' ? 'badge-gray' :
                  project.status === 'COMPLETED' ? 'badge-info' : 'badge-danger'
                }`}>{project.status}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Organization</p>
                <p className="font-medium">{project.organization?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Beneficiaries</p>
                <p className="font-medium">{project.beneficiaryCount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="font-medium">₹{project.budget ? Number(project.budget).toLocaleString() : 'N/A'}</p>
              </div>
              {project.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm">{project.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Risk Assessment</h3>
            {latestRisk ? (
              <div className="space-y-3">
                <div className="text-center py-4">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${
                    latestRisk.level === 'CRITICAL' ? 'bg-red-100' :
                    latestRisk.level === 'HIGH' ? 'bg-red-50' :
                    latestRisk.level === 'MEDIUM' ? 'bg-yellow-50' : 'bg-green-50'
                  }`}>
                    <span className={`text-3xl font-bold ${
                      latestRisk.level === 'CRITICAL' ? 'text-red-600' :
                      latestRisk.level === 'HIGH' ? 'text-red-500' :
                      latestRisk.level === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                    }`}>{latestRisk.score}</span>
                  </div>
                  <p className="mt-2 font-semibold">{latestRisk.level} RISK</p>
                </div>
                {latestRisk.anomalies && JSON.parse(latestRisk.anomalies).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Anomalies</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {JSON.parse(latestRisk.anomalies).map((a, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {latestRisk.recommendations && JSON.parse(latestRisk.recommendations).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Recommendations</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {JSON.parse(latestRisk.recommendations).map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">→</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No risk assessment yet</p>
                <button onClick={calculateRisk} className="btn-primary mt-3 text-sm">Calculate Now</button>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Location</h3>
            {project.latitude && project.longitude ? (
              <div className="space-y-2">
                <p className="text-sm"><span className="text-gray-500">Lat:</span> {project.latitude}</p>
                <p className="text-sm"><span className="text-gray-500">Lng:</span> {project.longitude}</p>
                <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center">
                  <a
                    href={`https://www.google.com/maps?q=${project.latitude},${project.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No location data</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Inspection History</h3>
          {project.inspections?.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No inspections yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b">
                  <th className="pb-2">Inspection ID</th>
                  <th className="pb-2">Inspector</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Priority</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Compliance</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {project.inspections?.map(insp => (
                  <tr key={insp.id} className="border-b last:border-0">
                    <td className="py-3 text-sm font-medium">{insp.inspectionId}</td>
                    <td className="py-3 text-sm">{insp.inspector?.user?.name || 'Unassigned'}</td>
                    <td className="py-3 text-sm">{insp.type}</td>
                    <td className="py-3">
                      <span className={`badge ${
                        insp.priority === 'HIGH' || insp.priority === 'URGENT' ? 'badge-danger' :
                        insp.priority === 'MEDIUM' ? 'badge-warning' : 'badge-gray'
                      }`}>{insp.priority}</span>
                    </td>
                    <td className="py-3">
                      <span className={`badge ${
                        insp.status === 'COMPLETED' ? 'badge-success' :
                        insp.status === 'IN_PROGRESS' ? 'badge-warning' :
                        insp.status === 'PENDING' ? 'badge-gray' : 'badge-info'
                      }`}>{insp.status}</span>
                    </td>
                    <td className="py-3 text-sm">{insp.complianceScore ? `${insp.complianceScore}%` : 'N/A'}</td>
                    <td className="py-3 text-sm text-gray-500">
                      {insp.createdAt ? new Date(insp.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Generate Inspection</h3>
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
