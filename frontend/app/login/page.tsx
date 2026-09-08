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
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'url(/images/solar_login_bg.jpg) center/cover no-repeat',
      position: 'relative',
      padding: '24px',
    }}>
      {/* Dark gradient overlay for better contrast */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg, rgba(10, 15, 20, 0.8) 0%, rgba(10, 15, 20, 0.4) 100%)',
        zIndex: 1,
      }} />

      <div style={{
        width: '100%', maxWidth: '420px',
        position: 'relative', zIndex: 2,
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #FFB703 0%, #FB8500 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '32px', fontWeight: 800,
            marginBottom: '20px',
            boxShadow: '0 12px 24px rgba(251, 133, 0, 0.3)',
          }}>
            ☀
          </div>
          <h1 style={{
            fontSize: '32px', fontWeight: 800, color: '#FFFFFF',
            margin: 0, letterSpacing: '-0.03em',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            SolarOS
          </h1>
          <p style={{
            fontSize: '15px', color: 'rgba(255, 255, 255, 0.8)',
            margin: '8px 0 0', fontWeight: 500,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
            Motor de engenharia e gestão solar
          </p>
        </div>

        {/* Glassmorphism Login Card */}
        <div style={{
          background: 'rgba(20, 25, 30, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: '8px',
              }} htmlFor="email">
                E-mail Profissional
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
                  padding: '14px 16px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={e => { 
                  e.target.style.borderColor = '#FFB703'; 
                  e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(255, 183, 3, 0.15)'; 
                }}
                onBlur={e => { 
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; 
                  e.target.style.background = 'rgba(0, 0, 0, 0.2)';
                  e.target.style.boxShadow = 'none'; 
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '12px', fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: '8px',
              }} htmlFor="password">
                <span>Senha</span>
                <span style={{ textTransform: 'none', color: '#FFB703', cursor: 'pointer', letterSpacing: 'normal' }}>Esqueceu?</span>
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
                  padding: '14px 16px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={e => { 
                  e.target.style.borderColor = '#FFB703'; 
                  e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(255, 183, 3, 0.15)'; 
                }}
                onBlur={e => { 
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; 
                  e.target.style.background = 'rgba(0, 0, 0, 0.2)';
                  e.target.style.boxShadow = 'none'; 
                }}
              />
            </div>

            {error && (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #EF4444',
                padding: '12px', borderRadius: '4px', marginTop: '-8px'
              }}>
                <p style={{ fontSize: '13px', color: '#FCA5A5', margin: 0, fontWeight: 500 }}>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: loading ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #FFB703 0%, #FB8500 100%)',
                color: loading ? 'rgba(255, 255, 255, 0.4)' : '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 20px rgba(251, 133, 0, 0.3)',
                transition: 'all 0.2s ease',
                marginTop: '8px',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
              }}
              onMouseEnter={e => { 
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(251, 133, 0, 0.4)';
                }
              }}
              onMouseLeave={e => { 
                if (!loading) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(251, 133, 0, 0.3)';
                }
              }}
            >
              {loading ? (
                <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : 'Acessar Plataforma'}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center', fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)',
          marginTop: '32px', fontWeight: 500,
        }}>
          © 2026 NorthWay Integradoras
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
