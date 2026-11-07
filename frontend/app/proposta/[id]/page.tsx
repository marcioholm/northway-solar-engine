// SEM 'use client' — este é um Server Component
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProposalView } from '../../../components/proposta/ProposalView';
import { ProposalData } from '../../../lib/proposal-types';

// Cache da página por 5 minutos (ISR)
export const revalidate = 300;

type PageParams = { params: Promise<{ id: string }> };

type ProposalFetchResult =
  | { kind: 'success'; data: ProposalData }
  | { kind: 'expired'; message?: string; companyName?: string; whatsapp?: string }
  | { kind: 'not_found' };

// O parâmetro da rota é o token público, nunca o id interno da proposta.
async function fetchProposal(token: string): Promise<ProposalFetchResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return { kind: 'not_found' };

  try {
    const res = await fetch(`${apiUrl}/proposals/public/${encodeURIComponent(token)}`, {
      next: { revalidate },
    });
    if (res.status === 410) {
      const body = await res.json().catch(() => ({}));
      return {
        kind: 'expired',
        message: body.message,
        companyName: body.companyName,
        whatsapp: body.whatsapp,
      };
    }
    if (!res.ok) return { kind: 'not_found' };
    const data = await res.json();
    return { kind: 'success', data };
  } catch {
    return { kind: 'not_found' };
  }
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchProposal(id);

  if (result.kind === 'expired') {
    return {
      title: 'Proposta Expirada',
      description: result.message || 'Esta proposta comercial expirou.',
    };
  }

  if (result.kind !== 'success') return { title: 'Proposta não encontrada' };

  const { data } = result;
  return {
    title: `Proposta Solar ${data.systemPowerKwp}kWp — ${data.clientName}`,
    description: `Proposta de energia solar de R$ ${data.finalPrice?.toLocaleString('pt-BR')} para ${data.clientName}`,
    openGraph: {
      title: `Proposta Solar — ${data.company?.name || 'SolarCRM'}`,
      description: `Sistema de ${data.systemPowerKwp}kWp · ${data.clientName}`,
      images: [`/api/og/proposta/${id}`],
    },
  };
}

export default async function ProposalPage({ params }: PageParams) {
  const { id } = await params;
  const result = await fetchProposal(id);

  if (result.kind === 'not_found') notFound();

  if (result.kind === 'expired') {
    const whatsappUrl = result.whatsapp
      ? `https://wa.me/${result.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Recebi a proposta comercial que expirou e gostaria de solicitar uma versão atualizada.')}`
      : null;

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#F8FAFC',
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          background: 'rgba(30, 41, 59, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: '24px',
          }}>
            ⏳
          </div>

          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            margin: '0 0 12px',
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
          }}>
            Esta proposta expirou
          </h1>

          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.75)',
            margin: '0 0 28px',
          }}>
            {result.message || 'Os valores e condições desta proposta perderam a validade. Entre em contato para receber uma versão atualizada.'}
          </p>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                background: '#25D366',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                boxShadow: '0 10px 20px -5px rgba(37, 211, 102, 0.4)',
                boxSizing: 'border-box',
              }}
            >
              <span>💬</span> Falar com a empresa no WhatsApp
            </a>
          )}

          {result.companyName && (
            <p style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginTop: '24px',
              marginBottom: 0,
            }}>
              {result.companyName}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <ProposalView data={result.data} />;
}
