import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import './Login.css';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('gerry@wit.id');
  const [password, setPassword] = useState('magicmario');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e, type) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (type === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container fade-in">
      <div className="login-card glass">
        <div className="login-header">
          <div className="logo-icon large">GPT</div>
          <h1>Welcome to My-GPT</h1>
          <p>Secure access to your personal AI workspace</p>
        </div>

        <form className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-actions">
            <button 
              className="btn-login" 
              onClick={(e) => handleAuth(e, 'login')}
              disabled={loading}
            >
              <LogIn size={18} />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
            <button 
              className="btn-register" 
              onClick={(e) => handleAuth(e, 'register')}
              disabled={loading}
            >
              <UserPlus size={18} />
              <span>Register</span>
            </button>
          </div>
        </form>

        <div className="login-footer">
          <ShieldCheck size={14} />
          <span>Protected by Firebase Auth</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
