import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostsList from './pages/PostsList';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import PostDetail from './pages/PostDetail';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Categories from './pages/Categories';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <ToastProvider>
      <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        {/* Public routes */}
        <Route path="login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        <Route path="register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        } />
        
        {/* Protected routes */}
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        
        {/* Post management routes */}
        <Route
          path="posts"
          element={
            <PrivateRoute>
              <PostsList />
            </PrivateRoute>
          }
        />
        <Route
          path="posts/new"
          element={
            <PrivateRoute>
              <CreatePost />
            </PrivateRoute>
          }
        />
        <Route
          path="posts/edit/:id"
          element={
            <PrivateRoute>
              <EditPost />
            </PrivateRoute>
          }
        />
        <Route
          path="posts/:id"
          element={
            <PrivateRoute>
              <PostDetail />
            </PrivateRoute>
          }
        />
        
        {/* Categories route (public) */}
        <Route
          path="categories"
          element={<Categories />}
        />
        
        {/* Catch all other routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;
