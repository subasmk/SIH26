import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const Dashboard = () => {
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompliance();
  }, []);

  const fetchCompliance = async () => {
    try {
      const res = await api.get('/organization/compliance');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-extrabold text-white">{compliance?.totalProjects || 0}</p>
            <p className="text-xs font-mono font-bold text-purple-200 mt-1 uppercase">Total Projects</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-extrabold text-emerald-400">{compliance?.averageCompliance || 0}%</p>
            <p className="text-xs font-mono font-bold text-purple-200 mt-1 uppercase">Avg Compliance</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-extrabold text-purple-300">
              {compliance?.recentRiskScores?.length || 0}
            </p>
            <p className="text-xs font-mono font-bold text-purple-200 mt-1 uppercase">Risk Assessments</p>
          </div>
        </div>

        {compliance?.recentRiskScores?.length > 0 && (
          <div className="card space-y-4">
            <h3 className="text-lg font-bold text-white">Recent Risk Assessments</h3>
            <div className="space-y-3">
              {compliance.recentRiskScores.map(risk => (
                <div key={risk.id} className={`p-4 rounded-xl border ${
                  risk.level === 'HIGH' || risk.level === 'CRITICAL' ? 'bg-rose-950/40 border-rose-800/50' :
                  risk.level === 'MEDIUM' ? 'bg-amber-950/40 border-amber-800/50' :
                  'bg-emerald-950/40 border-emerald-800/50'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white text-base">Risk Score: {risk.score}/100</p>
                      <p className="text-xs font-mono text-purple-300 mt-1">
                        Calculated: {new Date(risk.calculatedAt).toLocaleDateString()}
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
