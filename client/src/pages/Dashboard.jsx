import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <h1>Welcome to Your Dashboard, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <button onClick={logout} className="logout-btn">
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
