import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import SurveillanceModal from '../../components/SurveillanceModal';
import api from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const riskColors = {
  LOW: '#10B981',
  MEDIUM: '#F59E0B',
  HIGH: '#EF4444',
  CRITICAL: '#DC2626'
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentInspections, setRecentInspections] = useState([]);
  const [highRiskProjects, setHighRiskProjects] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [surveillanceProject, setSurveillanceProject] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, inspectionsRes, riskRes, alertsRes, projectsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/recent-inspections'),
        api.get('/admin/high-risk-projects'),
        api.get('/admin/alerts'),
        api.get('/projects')
      ]);
      setStats(statsRes.data);
      setRecentInspections(inspectionsRes.data);
      setHighRiskProjects(riskRes.data);
      setAlerts(alertsRes.data);
      setProjects(projectsRes.data.filter(p => p.latitude && p.longitude));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">Total Projects</p>
                <p className="text-3xl font-extrabold text-white mt-1">{stats?.totalProjects || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-600/30 border border-purple-400/30 rounded-2xl flex items-center justify-center text-purple-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="text-xs font-mono font-bold text-emerald-400 mt-3">{stats?.activeProjects || 0} active</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">Pending Inspections</p>
                <p className="text-3xl font-extrabold text-white mt-1">{stats?.pendingInspections || 0}</p>
              </div>
              <div className="w-12 h-12 bg-amber-600/30 border border-amber-400/30 rounded-2xl flex items-center justify-center text-amber-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs font-mono font-bold text-amber-300 mt-3">{stats?.inProgressInspections || 0} in progress</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">High Risk Projects</p>
                <p className="text-3xl font-extrabold text-rose-400 mt-1">{stats?.highRiskProjects || 0}</p>
              </div>
              <div className="w-12 h-12 bg-rose-600/30 border border-rose-400/30 rounded-2xl flex items-center justify-center text-rose-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-xs font-mono font-bold text-rose-400 mt-3">Requires attention</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">Total Inspectors</p>
                <p className="text-3xl font-extrabold text-white mt-1">{stats?.totalInspectors || 0}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-600/30 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs font-mono font-bold text-emerald-400 mt-3">{stats?.availableInspectors || 0} available</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4">Project Geographic Distribution</h3>
            <div className="h-80 rounded-2xl overflow-hidden border border-purple-800/40">
              <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {projects.map(project => (
                  <Marker
                    key={project.id}
                    position={[parseFloat(project.latitude), parseFloat(project.longitude)]}
                  >
                    <Popup>
                      <div className="p-2 text-slate-900">
                        <h4 className="font-bold">{project.name}</h4>
                        <p className="text-xs text-slate-700">{project.location}</p>
                        <p className="text-xs font-bold mt-1">
                          Risk: <span style={{ color: riskColors[project.riskScores?.[0]?.level] || '#6B7280' }}>
                            {project.riskScores?.[0]?.level || 'N/A'}
                          </span>
                        </p>
                        <Link to={`/admin/projects/${project.id}`} className="text-purple-700 font-bold text-xs hover:underline mt-1 block">
                          View Details
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">High Risk Projects</h3>
              <Link to="/admin/projects" className="text-purple-300 text-xs font-mono font-bold hover:underline">View All →</Link>
            </div>
            <div className="space-y-3">
              {highRiskProjects.length === 0 ? (
                <p className="text-purple-300/70 text-center py-4">No high risk projects</p>
              ) : (
                highRiskProjects.map(risk => (
                  <div key={risk.id} className="flex items-center justify-between p-3.5 bg-[#141024] border border-purple-800/40 rounded-xl hover:border-purple-500/50 transition-all">
                    <div>
                      <p className="font-bold text-white">{risk.project?.name}</p>
                      <p className="text-xs font-mono text-purple-300 font-semibold">Risk Score: {risk.score}/100</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-danger">{risk.level}</span>
                      <button
                        onClick={() => setSurveillanceProject(risk.project)}
                        className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                      >
                        📹 CCTV / VC
                      </button>
                      <Link to={`/admin/projects/${risk.projectId}`} className="btn-secondary text-xs px-3 py-1.5">View</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Recent Inspections</h3>
              <Link to="/admin/inspections" className="text-purple-300 text-xs font-mono font-bold hover:underline">View All →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-purple-300 text-xs font-mono uppercase tracking-wider border-b border-purple-800/40">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Project</th>
                    <th className="pb-3">Inspector</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30">
                  {recentInspections.map(insp => (
                    <tr key={insp.id}>
                      <td className="py-3 text-xs font-mono font-bold text-purple-300">{insp.inspectionId}</td>
                      <td className="py-3 text-sm font-semibold text-white">{insp.project?.name}</td>
                      <td className="py-3 text-sm text-purple-200">{insp.inspector?.user?.name || 'Unassigned'}</td>
                      <td className="py-3">
                        <span className={`badge ${
                          insp.status === 'COMPLETED' ? 'badge-success' :
                          insp.status === 'IN_PROGRESS' ? 'badge-warning' :
                          insp.status === 'PENDING' ? 'badge-gray' : 'badge-info'
                        }`}>
                          {insp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Active Alerts</h3>
              <Link to="/admin/alerts" className="text-purple-300 text-xs font-mono font-bold hover:underline">View All →</Link>
            </div>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-purple-300/70 text-center py-4">No active alerts</p>
              ) : (
                alerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className={`p-3.5 rounded-xl border ${
                    alert.severity === 'CRITICAL' ? 'bg-rose-950/40 border-rose-800/50' :
                    alert.severity === 'HIGH' ? 'bg-amber-950/40 border-amber-800/50' :
                    'bg-purple-950/40 border-purple-800/50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white">{alert.title}</p>
                        <p className="text-xs text-purple-200 mt-1">{alert.message}</p>
                      </div>
                      <span className={`badge ${
                        alert.severity === 'CRITICAL' ? 'badge-danger' :
                        alert.severity === 'HIGH' ? 'badge-danger' :
                        'badge-warning'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {surveillanceProject && (
          <SurveillanceModal
            project={surveillanceProject}
            onClose={() => setSurveillanceProject(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
