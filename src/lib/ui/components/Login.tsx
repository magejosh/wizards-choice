'use client';

import React, { useState } from 'react';
import authService from '../../auth/authService';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!username.trim() || !password.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      if (isLogin) {
        // Handle login
        const user = await authService.login(username, password);
        if (user) {
          onLoginSuccess();
        } else {
          setError('Invalid username or password');
        }
      } else {
        // Handle registration
        if (!email.trim()) {
          setError('Email is required');
          return;
        }
        
        const user = await authService.register(username, password, email);
        if (user) {
          onLoginSuccess();
        } else {
          setError('Username already exists');
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login__background">
        {/* Background gradient similar to main menu */}
      </div>
      
      <div className="login__content">
        <h1 className="login__title">Wizard's Choice</h1>
        <h2 className="login__subtitle">A Tactical Spell-Casting Adventure</h2>
        
        <div className="login__form-container">
          <h3 className="login__form-title">{isLogin ? 'Login' : 'Create Account'}</h3>
          
          {error && <div className="login__error">{error}</div>}
          
          <form className="login__form" onSubmit={handleSubmit}>
            <div className="login__form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoFocus
                disabled={isLoading}
              />
            </div>
            
            <div className="login__form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={isLoading}
              />
            </div>
            
            {!isLogin && (
              <div className="login__form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  disabled={isLoading}
                />
              </div>
            )}
            
            <div className="login__form-actions">
              <button 
                type="submit" 
                className="login__button login__button--primary"
                disabled={isLoading}
              >
                {isLoading 
                  ? (isLogin ? 'Logging in...' : 'Registering...') 
                  : (isLogin ? 'Login' : 'Register')}
              </button>
            </div>
          </form>
          
          <div className="login__toggle">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <button 
                  className="login__toggle-button" 
                  onClick={() => setIsLogin(false)}
                  disabled={isLoading}
                >
                  Register
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button 
                  className="login__toggle-button" 
                  onClick={() => setIsLogin(true)}
                  disabled={isLoading}
                >
                  Login
                </button>
              </p>
            )}
          </div>
          
          <div className="login__demo-accounts">
            <h4>Demo Accounts</h4>
            <p><strong>Admin:</strong> username: admin, password: admin123</p>
            <p><strong>Player 1:</strong> username: player1, password: player123</p>
            <p><strong>Player 2:</strong> username: player2, password: player123</p>
          </div>
        </div>
      </div>
      
      <footer className="login__footer">
        <p>© 2025 Wizard's Choice</p>
      </footer>
    </div>
  );
};

export default Login; 