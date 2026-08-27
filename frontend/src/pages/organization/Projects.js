import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/organization/projects');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">My Projects</h3>
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No projects assigned to your organization</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Project Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Location</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Budget</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Beneficiaries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map(project => (
                <tr key={project.id}>
                  <td className="px-4 py-3 font-medium">{project.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{project.location}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      project.status === 'ACTIVE' ? 'badge-success' :
                      project.status === 'COMPLETED' ? 'badge-info' : 'badge-gray'
                    }`}>{project.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {project.budget ? `₹${Number(project.budget).toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{project.beneficiaryCount || 0}</td>
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
