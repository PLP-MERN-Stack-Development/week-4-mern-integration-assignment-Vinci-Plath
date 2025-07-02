import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css';

function stringToInitials(name) {
  if (!name) return '';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase();
}

const Layout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/posts', label: 'Posts' },
    { to: '/categories', label: 'Categories' },
    { to: '/posts/new', label: 'Create Post', auth: true },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow-glow px-4 py-2 flex items-center justify-between border-b border-muted animate-fade-in">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-extrabold text-primary tracking-tight select-none">Blogify</span>
        </div>
        <ul className="flex gap-2 md:gap-6 items-center">
          {navLinks.map((link) => {
            if (link.auth && !isAuthenticated) return null;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`px-3 py-2 rounded-lg font-medium transition hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 ${location.pathname === link.to ? 'bg-primary text-white shadow' : 'text-gray-700'}`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          {!isAuthenticated ? (
            <>
              <li>
                <Link to="/login" className="px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-primary/10 hover:text-primary transition">Login</Link>
              </li>
              <li>
                <Link to="/register" className="px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-primary/10 hover:text-primary transition">Register</Link>
              </li>
            </>
          ) : (
            <li className="flex items-center gap-2 ml-4">
              <span className="hidden md:inline text-gray-600">{user?.name}</span>
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md">
                {stringToInitials(user?.name) || <span className="text-xl">?</span>}
              </div>
              <button onClick={handleLogout} className="ml-2 px-3 py-2 rounded-lg bg-accent text-white font-semibold hover:bg-pink-500 transition shadow">Logout</button>
            </li>
          )}
        </ul>
      </nav>
      <main className="max-w-5xl mx-auto px-2 md:px-6 py-6 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
