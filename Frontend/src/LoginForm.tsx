import React, { useState } from 'react';
import './LoginForm.css';

interface LoginFormProps {
  onLoginSuccess?: (token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
  const response = await fetch('https://localhost:7009/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Username: username, Password: password }),
      });
      if (!response.ok) {
        throw new Error('Credenciales incorrectas');
      }
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (onLoginSuccess) onLoginSuccess(data.token);
      } else {
        throw new Error('Token no recibido');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <form onSubmit={handleSubmit} className="login-form login-form-modern">
        <div className="login-logo">🐾 VetApp</div>
        <h2>Iniciar Sesión</h2>
        <div className="login-form-group">
          <label htmlFor="login-username">Usuario</label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="Usuario"
            title="Usuario"
            className="login-form-input"
            autoComplete="username"
          />
        </div>
        <div className="login-form-group">
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Contraseña"
            title="Contraseña"
            className="login-form-input"
            autoComplete="current-password"
          />
        </div>
        {error && <div className="login-form-error">{error}</div>}
        <button type="submit" disabled={loading} className="login-form-button">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
