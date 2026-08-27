import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';

const Inspectors = () => {
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: ''
  });

  useEffect(() => {
    fetchInspectors();
  }, []);

  const fetchInspectors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inspectors');
      setInspectors(res.data);
    } catch (error) {
      console.error('Error fetching inspectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/inspectors', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', phone: '', specialization: '' });
      fetchInspectors();
    } catch (error) {
      console.error('Error creating inspector:', error);
    }
  };

  const filteredInspectors = inspectors.filter(insp =>
    insp.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    insp.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    insp.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

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
          <input
            type="text"
            placeholder="Search inspectors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-64"
          />
          <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Inspector</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInspectors.map(inspector => (
            <div key={inspector.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{inspector.user?.name}</h3>
                  <p className="text-sm text-gray-500">{inspector.employeeId}</p>
                </div>
                <span className={`badge ${
                  inspector.availability === 'AVAILABLE' ? 'badge-success' :
                  inspector.availability === 'BUSY' ? 'badge-warning' : 'badge-gray'
                }`}>
                  {inspector.availability}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span>{inspector.user?.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Inspections</span>
                  <span className="font-medium">{inspector.totalInspections}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rating</span>
                  <span className="font-medium">{inspector.rating} ★</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Specialization</span>
                  <span>{inspector.specialization || 'General'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Inspector</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Specialization</label>
                <input type="text" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} className="input" placeholder="e.g. Infrastructure, Education" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create Inspector</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inspectors;
