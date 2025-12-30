import { useState } from 'react';
import { login } from '../services/api';
import './Auth.css';

function Login({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      if (data.error) {
        setError(data.error);
      } else {
        onLogin(data.user);
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">
            <span className="logo-icon">📔</span>
            <span className="logo-text">Meu Diário</span>
          </div>

          <h1>
            Transforme seus <span className="highlight-gradient">pensamentos</span> em memórias eternas
          </h1>

          <p className="auth-subtitle">
            Mais de <strong>1.000 pessoas</strong> já estão registrando suas histórias.
            Comece a escrever a sua hoje.
          </p>

          <div className="auth-stats">
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Privado</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Disponível</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">Grátis</span>
              <span className="stat-label">Para sempre</span>
            </div>
          </div>

          <div className="auth-testimonial">
            <p>"Escrever diariamente mudou minha vida. Agora consigo organizar melhor meus pensamentos e emoções."</p>
            <div className="testimonial-author">
              <div className="author-avatar">M</div>
              <div className="author-info">
                <strong>Maria Silva</strong>
                <span>Usuária há 6 meses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Bem-vindo de volta</h2>
            <p>Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="username">Usuário</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="auth-switch">
            Não tem uma conta?{' '}
            <button onClick={onSwitchToRegister} className="link-button">
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
