import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

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
      const res = await api.get('/inspectors');
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
      await api.post('/inspectors', formData);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
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
            <div key={inspector.id} className="card space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{inspector.user?.name}</h3>
                  <p className="text-xs font-mono text-purple-300">{inspector.employeeId}</p>
                </div>
                <span className={`badge ${
                  inspector.availability === 'AVAILABLE' ? 'badge-success' :
                  inspector.availability === 'BUSY' ? 'badge-warning' : 'badge-gray'
                }`}>
                  {inspector.availability}
                </span>
              </div>
              <div className="space-y-2 pt-2 border-t border-purple-900/40">
                <div className="flex justify-between text-xs">
                  <span className="text-purple-300/70 font-mono">EMAIL</span>
                  <span className="text-purple-100 font-medium">{inspector.user?.email}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-purple-300/70 font-mono">TOTAL INSPECTIONS</span>
                  <span className="font-mono font-bold text-white">{inspector.totalInspections}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-purple-300/70 font-mono">RATING</span>
                  <span className="font-bold text-amber-400">{inspector.rating} ★</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-purple-300/70 font-mono">SPECIALIZATION</span>
                  <span className="text-purple-200">{inspector.specialization || 'General'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#141024] border border-purple-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Inspector Profile</h3>
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
                <input type="text" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} className="input" placeholder="e.g. Infrastructure, Safety" />
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
