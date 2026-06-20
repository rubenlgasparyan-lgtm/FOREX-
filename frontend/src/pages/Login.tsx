import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, t } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-2xl font-black text-white mx-auto mb-4">A</div>
          <h1 className="text-2xl font-bold text-white">{t.brand}</h1>
          <p className="text-gray-500 text-sm mt-1">{t.tagline}</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">{t.login}</h2>
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">{t.email}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">{t.password}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-50">
              {loading ? '...' : t.login}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-4">
            Don't have an account? <Link to="/register" className="text-cyan-400 hover:text-cyan-300">{t.register}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
