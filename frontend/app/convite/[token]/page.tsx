'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface InviteData {
  email: string;
  role: string;
  companyName: string;
  expiresAt: string;
}

export default function ConvitePage() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [fetchError, setFetchError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const api = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!token || !api) return;

    fetch(`${api}/auth/invite/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Convite inválido ou expirado');
        }
        setInvite(data);
      })
      .catch((err) => {
        setFetchError(err.message || 'Este convite não é mais válido.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, api]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (password.length < 8) {
      setSubmitError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${api}/auth/accept-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: name.trim(),
          phone: phone.trim() || undefined,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Falha ao aceitar convite');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao processar convite');
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel = (r?: string) => {
    if (r === 'seller') return 'Vendedor';
    if (r === 'manager') return 'Gerente';
    if (r === 'admin') return 'Administrador';
    return r || '';
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
      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 2 }}>
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
            Bem-vindo à equipe!
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', margin: '6px 0 0' }}>
            Ative seu acesso ao SolarOS
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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.7)' }}>
              Validando convite...
            </div>
          ) : fetchError ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '36px', marginBottom: 12 }}>⚠️</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: '#F87171' }}>
                Convite Inválido
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0 0 24px 0' }}>
                {fetchError}
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
                Ir para o Login
              </Link>
            </div>
          ) : success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: 12 }}>🎉</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: '#34D399' }}>
                Acesso Ativado com Sucesso!
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                Redirecionando para a tela de login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Invite Summary info */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '13px',
                }}
              >
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Empresa: </span>
                  <strong style={{ color: '#fff' }}>{invite?.companyName}</strong>
                </div>
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>E-mail: </span>
                  <strong style={{ color: '#fff' }}>{invite?.email}</strong>
                </div>
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Função: </span>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34D399',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '11px',
                    }}
                  >
                    {roleLabel(invite?.role)}
                  </span>
                </div>
              </div>

              {submitError && (
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
                  {submitError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: João da Silva"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  WhatsApp com DDD (opcional)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ex: 11999998888"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Criar Senha * (mínimo 8 caracteres)
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
                  Confirmar Senha *
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
                {submitting ? 'Ativando Acesso...' : 'Ativar Minha Conta'}
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
