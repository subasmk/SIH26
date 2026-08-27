import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/organization/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
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
      <div className="card overflow-hidden p-0">
        <div className="p-5 border-b border-purple-800/40">
          <h3 className="text-lg font-bold text-white">Assigned Organization Projects</h3>
        </div>
        {projects.length === 0 ? (
          <p className="text-purple-300 text-center py-12">No projects assigned to your organization</p>
        ) : (
          <table className="w-full">
            <thead className="bg-[#141024] border-b border-purple-800/40 text-purple-300">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-mono uppercase tracking-wider">Project Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-mono uppercase tracking-wider">Location</th>
                <th className="px-5 py-3.5 text-left text-xs font-mono uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-mono uppercase tracking-wider">Budget</th>
                <th className="px-5 py-3.5 text-left text-xs font-mono uppercase tracking-wider">Beneficiaries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/30">
              {projects.map(project => (
                <tr key={project.id} className="hover:bg-purple-900/20 transition-colors">
                  <td className="px-5 py-4 font-bold text-white text-sm">{project.name}</td>
                  <td className="px-5 py-4 text-xs font-mono text-purple-200">{project.location}</td>
                  <td className="px-5 py-4">
                    <span className={`badge ${
                      project.status === 'ACTIVE' ? 'badge-success' :
                      project.status === 'COMPLETED' ? 'badge-info' : 'badge-gray'
                    }`}>{project.status}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-emerald-400 font-bold">
                    {project.budget ? `₹${Number(project.budget).toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-white">{project.beneficiaryCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
