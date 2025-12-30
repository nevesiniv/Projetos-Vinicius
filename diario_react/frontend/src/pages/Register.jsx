import { useState } from 'react';
import { register } from '../services/api';
import PasswordStrength, { validatePassword } from '../components/PasswordStrength';
import './Auth.css';

function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    setLoading(true);

    try {
      const data = await register(username, password);
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('Conta criada com sucesso! Redirecionando...');
        setTimeout(() => {
          onSwitchToLogin(username);
        }, 1500);
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
            Comece sua <span className="highlight-gradient">jornada</span> de autoconhecimento
          </h1>

          <p className="auth-subtitle">
            Crie sua conta em <strong>menos de 1 minuto</strong> e comece a registrar suas memórias hoje mesmo.
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
            <p>"O hábito de escrever diariamente me ajudou a entender melhor minhas emoções e tomar decisões mais conscientes."</p>
            <div className="testimonial-author">
              <div className="author-avatar">J</div>
              <div className="author-info">
                <strong>João Pedro</strong>
                <span>Usuário há 3 meses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Criar Conta</h2>
            <p>Preencha os dados para começar</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-group">
              <label htmlFor="username">Usuário</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Escolha um nome de usuário"
                minLength={3}
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
                placeholder="Escolha uma senha forte"
                minLength={8}
                required
              />
              <PasswordStrength password={password} />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite a senha novamente"
                minLength={8}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <p className="auth-switch">
            Já tem uma conta?{' '}
            <button onClick={() => onSwitchToLogin()} className="link-button">
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
