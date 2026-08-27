import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';

const Dashboard = () => {
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompliance();
  }, []);

  const fetchCompliance = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/organization/compliance');
      setCompliance(res.data);
    } catch (error) {
      console.error('Error fetching compliance:', error);
    } finally {
      setLoading(false);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-600">{compliance?.totalProjects || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Total Projects</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">{compliance?.averageCompliance || 0}%</p>
            <p className="text-sm text-gray-500 mt-1">Avg Compliance</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-gray-600">
              {compliance?.recentRiskScores?.length || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Risk Assessments</p>
          </div>
        </div>

        {compliance?.recentRiskScores?.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Risk Scores</h3>
            <div className="space-y-3">
              {compliance.recentRiskScores.map(risk => (
                <div key={risk.id} className={`p-4 rounded-lg border ${
                  risk.level === 'HIGH' || risk.level === 'CRITICAL' ? 'bg-red-50 border-red-200' :
                  risk.level === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Risk Score: {risk.score}/100</p>
                      <p className="text-sm text-gray-500">
                        {new Date(risk.calculatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`badge ${
                      risk.level === 'HIGH' || risk.level === 'CRITICAL' ? 'badge-danger' :
                      risk.level === 'MEDIUM' ? 'badge-warning' : 'badge-success'
                    }`}>{risk.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
