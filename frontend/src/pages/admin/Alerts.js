import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const params = {};
        if (!showAll) params.resolved = 'false';
        if (severityFilter) params.severity = severityFilter;
        const res = await axios.get('http://localhost:5000/api/alerts', { params });
        setAlerts(res.data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [showAll, severityFilter]);

  const fetchAlerts = async () => {
    try {
      const params = {};
      if (!showAll) params.resolved = 'false';
      if (severityFilter) params.severity = severityFilter;
      const res = await axios.get('http://localhost:5000/api/alerts', { params });
      setAlerts(res.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/alerts/${id}/resolve`);
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'border-l-red-600 bg-red-50';
      case 'HIGH': return 'border-l-orange-500 bg-orange-50';
      case 'WARNING': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-blue-500 bg-blue-50';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="input w-40">
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

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-2xl font-bold text-red-600">{alerts.filter(a => a.severity === 'CRITICAL').length}</p>
            <p className="text-sm text-gray-500">Critical</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-orange-500">{alerts.filter(a => a.severity === 'HIGH').length}</p>
            <p className="text-sm text-gray-500">High</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-yellow-500">{alerts.filter(a => a.severity === 'WARNING').length}</p>
            <p className="text-sm text-gray-500">Warning</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-blue-500">{alerts.filter(a => a.severity === 'INFO').length}</p>
            <p className="text-sm text-gray-500">Info</p>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500">No alerts found</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className={`card border-l-4 ${getSeverityStyle(alert.severity)} ${alert.isResolved ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`badge ${getSeverityBadge(alert.severity)}`}>{alert.severity}</span>
                      <span className="badge badge-gray">{alert.type}</span>
                      {alert.isResolved && <span className="badge badge-success">Resolved</span>}
                    </div>
                    <h4 className="font-semibold text-gray-800">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {alert.project?.name && <span>Project: {alert.project.name} • </span>}
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!alert.isResolved && (
                    <button onClick={() => resolveAlert(alert.id)} className="btn-success text-sm ml-4 whitespace-nowrap">
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
