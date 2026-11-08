'use client';
import { useState, useEffect, useRef } from 'react';
import { ProposalData } from '../../lib/proposal-types';
import { useProposalTracking } from '../../lib/use-proposal-tracking';
import { CommercialProposalView } from './CommercialProposalView';

export function ProposalView({ data }: { data: ProposalData }) {
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeMessage, setChangeMessage] = useState('');
  const viewedRef = useRef(false);

  const publicToken = data.publicToken;
  const {
    trackView,
    trackDuration,
    trackDownload,
    trackWhatsApp,
    trackChangeRequest,
  } = useProposalTracking(publicToken);

  useEffect(() => {
    if (!publicToken) return;

    if (!viewedRef.current) {
      trackView();
      viewedRef.current = true;
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') trackDuration();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      trackDuration();
    };
  }, [publicToken, trackDuration, trackView]);

  const isExpired = data.expirationDate
    ? new Date(data.expirationDate).getTime() < new Date().getTime()
    : false;

  const rawPhone = data.consultantPhone || data.settings?.contact?.whatsapp || '';
  const whatsappNumber = rawPhone.replace(/\D/g, '');
  const proposalNumber = data.publicToken ? data.publicToken.slice(0, 8).toUpperCase() : '';
  const closeMessage = encodeURIComponent(
    `Olá! Quero fechar a proposta ${proposalNumber}.`.replace(/  +/g, ' '),
  );
  const closeWhatsAppUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${closeMessage}`
    : '#';
  const topWhatsAppUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá, vi minha proposta personalizada SolarOS e gostaria de prosseguir.')}`
    : '#';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div
        className="no-print"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)' }}>
            SolarOS
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Plano Solar Personalizado
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => {
              trackDownload();
              window.print();
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Baixar PDF
          </button>
          {whatsappNumber && (
            <a
              onClick={() => trackWhatsApp()}
              href={topWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--green)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Falar no WhatsApp
            </a>
          )}
        </div>
      </div>

      <div
        className="no-print"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 24px',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border)',
        }}
      >
        {isExpired && (
          <div
            style={{
              textAlign: 'center',
              color: '#B91C1C',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '4px',
            }}
          >
            ⚠️ Esta proposta perdeu a validade em{' '}
            {new Date(data.expirationDate!).toLocaleDateString('pt-BR')}. Os valores e
            disponibilidade de equipamentos podem ter mudado.
          </div>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setShowChangeModal(true)}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {isExpired ? 'Solicitar Proposta Atualizada' : 'Solicitar Alteração'}
          </button>
          {!isExpired && (
            <a
              href={closeWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsApp({ intent: 'close' })}
              style={{
                padding: '12px 32px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--green)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Quero fechar esta proposta
            </a>
          )}
        </div>
      </div>

      {showChangeModal && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              width: '90%',
              maxWidth: '480px',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              Solicitar Alteração
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '16px',
              }}
            >
              Descreva o que gostaria de modificar na proposta.
            </p>
            <textarea
              value={changeMessage}
              onChange={(e) => setChangeMessage(e.target.value)}
              placeholder="Ex: Gostaria de adicionar mais 2 módulos..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                fontFamily: 'inherit',
                fontSize: '13px',
                resize: 'vertical',
              }}
            />
            <div
              style={{
                display: 'flex',
                gap: 8,
                justifyContent: 'end',
                marginTop: '16px',
              }}
            >
              <button
                onClick={() => setShowChangeModal(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  trackChangeRequest(changeMessage);
                  setShowChangeModal(false);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--green)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      <article style={{ fontFamily: 'var(--font-body)', paddingBottom: 100, paddingTop: 64 }}>
        <CommercialProposalView data={data} />
      </article>
    </div>
  );
}
