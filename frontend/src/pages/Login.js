import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      const dashboardRoutes = {
        ADMIN: '/admin/dashboard',
        INSPECTOR: '/inspector/dashboard',
        ORGANIZATION: '/organization/dashboard'
      };
      navigate(dashboardRoutes[user.role] || '/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5E6] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#FAD4C0] shadow-md w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FAD4C0] text-[#111827] rounded-md font-bold text-2xl mb-4 shadow-sm">
            S
          </div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">SmartInspect</h1>
          <p className="text-sm font-mono text-[#80A1C1] mt-1 uppercase tracking-wider">Intelligent Inspection System</p>
        </div>

        {error && (
          <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] px-4 py-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="admin@smartinspect.demo"
              required
            />
          </div>
          <div className="mb-6">
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
