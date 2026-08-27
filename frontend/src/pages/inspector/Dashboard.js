import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import axios from 'axios';

const Dashboard = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInspections();
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

  const statusCounts = {
    ASSIGNED: inspections.filter(i => i.status === 'ASSIGNED').length,
    IN_PROGRESS: inspections.filter(i => i.status === 'IN_PROGRESS').length,
    COMPLETED: inspections.filter(i => i.status === 'COMPLETED').length,
    PENDING: inspections.filter(i => i.status === 'PENDING').length,
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-600">{statusCounts.ASSIGNED}</p>
            <p className="text-sm text-gray-500 mt-1">Assigned</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-yellow-600">{statusCounts.IN_PROGRESS}</p>
            <p className="text-sm text-gray-500 mt-1">In Progress</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">{statusCounts.COMPLETED}</p>
            <p className="text-sm text-gray-500 mt-1">Completed</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-gray-600">{inspections.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">My Inspections</h3>
          {inspections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No inspections assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inspections.map(insp => (
                <Link
                  key={insp.id}
                  to={`/inspector/inspection/${insp.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-blue-600">{insp.inspectionId}</span>
                        <span className={`badge ${
                          insp.priority === 'HIGH' || insp.priority === 'URGENT' ? 'badge-danger' :
                          insp.priority === 'MEDIUM' ? 'badge-warning' : 'badge-gray'
                        }`}>{insp.priority}</span>
                        {insp.type === 'SURPRISE' && <span className="badge badge-danger">Surprise</span>}
                      </div>
                      <p className="text-gray-800 font-medium mt-1">{insp.project?.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{insp.project?.location}</p>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${
                        insp.status === 'COMPLETED' ? 'badge-success' :
                        insp.status === 'IN_PROGRESS' ? 'badge-warning' :
                        insp.status === 'ASSIGNED' ? 'badge-info' : 'badge-gray'
                      }`}>{insp.status.replace('_', ' ')}</span>
                      <p className="text-xs text-gray-400 mt-1">
                        {insp.createdAt ? new Date(insp.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                  {insp.status === 'ASSIGNED' && (
                    <div className="mt-3">
                      <span className="text-blue-600 text-sm font-medium hover:underline">Start Inspection →</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
