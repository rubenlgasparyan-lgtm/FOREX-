import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lang } from '../i18n';

export default function Navbar() {
  const { user, logout, t, lang, setLang } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-xs font-black text-white">A</div>
          <div>
            <div className="font-bold text-white tracking-wider text-sm">{t.brand}</div>
            <div className="text-gray-500 text-xs">{t.tagline}</div>
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            {isAdmin ? (
              <>
                <Link to="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">{t.dashboard}</Link>
                <Link to="/admin/rates" className="text-gray-400 hover:text-white text-sm transition-colors">{t.rates}</Link>
                <Link to="/admin/negotiations" className="text-gray-400 hover:text-white text-sm transition-colors">{t.negotiations}</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">{t.dashboard}</Link>
                <Link to="/exchange" className="text-gray-400 hover:text-white text-sm transition-colors">{t.exchange}</Link>
                <Link to="/history" className="text-gray-400 hover:text-white text-sm transition-colors">{t.history}</Link>
              </>
            )}

            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              {(['en', 'ru', 'hy'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded text-xs font-medium transition-colors ${lang === l ? 'bg-cyan-500 text-gray-900' : 'text-gray-400 hover:text-white'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">{user.firstName}</span>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 text-sm transition-colors">{t.logout}</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
