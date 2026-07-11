'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      router.push('/crm');
    } catch {
      setError('Credenciais inválidas');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      padding: '16px',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'var(--green-gradient)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '28px', fontWeight: 800,
            marginBottom: '16px',
          }}>
            ☀
          </div>
          <h1 style={{
            fontSize: '24px', fontWeight: 800, color: 'var(--text)',
            margin: 0, letterSpacing: '-0.02em',
          }}>
            SolarOS
          </h1>
          <p style={{
            fontSize: '14px', color: 'var(--text-secondary)',
            margin: '4px 0 0',
          }}>
            Gestão inteligente para integradoras de energia solar
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 700,
                color: 'var(--text-secondary-v2)', textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: '6px',
              }} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  display: 'block', width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--green)'; e.target.style.boxShadow = '0 0 0 3px rgba(143,214,58,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 700,
                color: 'var(--text-secondary-v2)', textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: '6px',
              }} htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  display: 'block', width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--green)'; e.target.style.boxShadow = '0 0 0 3px rgba(143,214,58,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: 'var(--danger)', textAlign: 'center', margin: 0 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? 'var(--text-muted)' : 'var(--green)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 18px rgba(143,214,58,0.22)',
                transition: 'background 0.15s',
                marginTop: '4px',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--green-dark)'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--green)'; }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)',
          marginTop: '24px',
        }}>
          © 2026 NorthWay — Motor de engenharia solar
        </p>
      </div>
    </div>
  );
}
