import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [showAll, setShowAll] = useState(false);

  const fetchAlerts = async () => {
    try {
      const params = {};
      if (!showAll) params.resolved = 'false';
      if (severityFilter) params.severity = severityFilter;
      const res = await api.get('/alerts', { params });
      setAlerts(res.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [showAll, severityFilter]);

  const resolveAlert = async (id) => {
    try {
      await api.put(`/alerts/${id}/resolve`);
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'border-l-rose-500 bg-rose-950/40';
      case 'HIGH': return 'border-l-amber-500 bg-amber-950/40';
      case 'WARNING': return 'border-l-yellow-500 bg-yellow-950/40';
      default: return 'border-l-purple-500 bg-purple-950/40';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'badge-danger';
      case 'HIGH': return 'badge-danger';
      case 'WARNING': return 'badge-warning';
      default: return 'badge-info';
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
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="input w-44">
              <option value="">All Severity</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
            <button
              onClick={() => setShowAll(!showAll)}
              className={showAll ? 'btn-secondary' : 'btn-primary'}
            >
              {showAll ? 'Hide Resolved' : 'Show All'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-3xl font-extrabold text-rose-400">{alerts.filter(a => a.severity === 'CRITICAL').length}</p>
            <p className="text-xs font-mono font-bold text-purple-200 mt-1 uppercase">Critical</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-extrabold text-amber-400">{alerts.filter(a => a.severity === 'HIGH').length}</p>
            <p className="text-xs font-mono font-bold text-purple-200 mt-1 uppercase">High</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-extrabold text-yellow-300">{alerts.filter(a => a.severity === 'WARNING').length}</p>
            <p className="text-xs font-mono font-bold text-purple-200 mt-1 uppercase">Warning</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-extrabold text-purple-300">{alerts.filter(a => a.severity === 'INFO').length}</p>
            <p className="text-xs font-mono font-bold text-purple-200 mt-1 uppercase">Info</p>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-purple-200">No alerts found</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className={`card border-l-4 ${getSeverityStyle(alert.severity)} ${alert.isResolved ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`badge ${getSeverityBadge(alert.severity)}`}>{alert.severity}</span>
                      <span className="badge badge-gray">{alert.type}</span>
                      {alert.isResolved && <span className="badge badge-success">Resolved</span>}
                    </div>
                    <h4 className="font-bold text-white text-base">{alert.title}</h4>
                    <p className="text-xs text-purple-200 mt-1">{alert.message}</p>
                    <p className="text-xs font-mono text-purple-300/80 mt-2">
                      {alert.project?.name && <span>Project: {alert.project.name} • </span>}
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!alert.isResolved && (
                    <button onClick={() => resolveAlert(alert.id)} className="btn-success text-xs ml-4 whitespace-nowrap">
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Alerts;
