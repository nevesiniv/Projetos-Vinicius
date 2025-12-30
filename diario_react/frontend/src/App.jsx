import { useState, useEffect } from 'react';
import { getCurrentUser } from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Diary from './pages/Diary';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await getCurrentUser();
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Erro ao verificar autenticação:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setPage('login');
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (user) {
    return <Diary user={user} onLogout={handleLogout} />;
  }

  if (page === 'register') {
    return <Register onSwitchToLogin={() => setPage('login')} />;
  }

  return (
    <Login
      onLogin={handleLogin}
      onSwitchToRegister={() => setPage('register')}
    />
  );
}

export default App;
