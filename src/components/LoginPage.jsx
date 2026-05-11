import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { LogIn, UserPlus, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import './Login.css';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('gerry@wit.id');
  const [password, setPassword] = useState('magicmario');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login');

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

  const isLogin = mode === 'login';

  return (
    <div className="login-container fade-in">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">
            <Sparkles size={22} />
          </div>
          <h1>My-GPT</h1>
          <p>Your personal AI workspace</p>
        </div>

        <form className="login-form" onSubmit={(e) => handleAuth(e, mode)}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={18} className="spinner" />
            ) : isLogin ? (
              <LogIn size={18} />
            ) : (
              <UserPlus size={18} />
            )}
            <span>
              {loading
                ? 'Please wait...'
                : isLogin
                  ? 'Sign In'
                  : 'Create Account'}
            </span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="login-divider">
          <span />
          <p>or</p>
          <span />
        </div>

        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setMode(isLogin ? 'register' : 'login');
            setError('');
          }}
        >
          {isLogin ? 'Create an account' : 'Already have an account? Sign in'}
        </button>
      </div>

      <p className="login-footer">
        Secure sign-in powered by Firebase Auth
      </p>
    </div>
  );
};

export default LoginPage;
