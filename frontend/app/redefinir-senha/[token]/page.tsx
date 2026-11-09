'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RedefinirSenhaPage() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const api = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${api}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Falha ao redefinir senha');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar nova senha');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A0F14 0%, #1E293B 100%)',
        position: 'relative',
        padding: '24px',
        fontFamily: 'var(--font-body), sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 2 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #FFB703 0%, #FB8500 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '28px',
              fontWeight: 800,
              marginBottom: '16px',
              boxShadow: '0 12px 24px rgba(251, 133, 0, 0.3)',
            }}
          >
            ☀
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Redefinir Senha
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', margin: '6px 0 0' }}>
            Cadastre uma nova senha para sua conta
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
            color: '#fff',
          }}
        >
          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: 12 }}>🔒</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: '#34D399' }}>
                Senha Redefinida!
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0 0 20px 0' }}>
                Sua senha foi atualizada com sucesso. Redirecionando para o login...
              </p>
              <Link
                href="/login"
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  background: 'var(--green)',
                  color: '#fff',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                Acessar Agora
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {error && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#FCA5A5',
                    fontSize: '13px',
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Nova Senha * (mínimo 8 caracteres)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Confirmar Nova Senha *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
                  marginTop: '8px',
                }}
              >
                {submitting ? 'Salvando...' : 'Salvar Nova Senha'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  background: 'rgba(15, 23, 42, 0.6)',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};
