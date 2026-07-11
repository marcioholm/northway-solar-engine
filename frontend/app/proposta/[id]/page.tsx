'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { ProposalView } from '../../../components/proposta/ProposalView';
import { ProposalData } from '../../../lib/proposal-types';
import { useProposalTracking } from '../../../lib/use-proposal-tracking';

function ProposalSkeleton() {
  return (
    <div style={{ padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--green)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Carregando proposta...</p>
    </div>
  );
}

function ProposalError({ title, message }: { title: string; message: string }) {
  return (
    <div style={{ padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', gap: 12 }}>
      <div style={{ fontSize: 36, opacity: 0.2 }}>◈</div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{title}</h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, textAlign: 'center', maxWidth: 400 }}>{message}</p>
    </div>
  );
}

export default function ProposalPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeMessage, setChangeMessage] = useState('');
  const viewedRef = useRef(false);

  const {
    trackView, trackDuration, trackDownload,
    trackWhatsApp, trackAccept, trackChangeRequest,
  } = useProposalTracking(id);

  useEffect(() => {
    if (!id) return;
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
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    const api = process.env.NEXT_PUBLIC_API_URL;

    if (!api) {
      setError('API não configurada');
      setLoading(false);
      return;
    }

    fetch(`${api}/proposals/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Erro ${res.status}: ${text || 'proposta não encontrada'}`);
        }
        return res.json();
      })
      .then((proposal: any) => {
        if (!proposal || Object.keys(proposal).length === 0) {
          throw new Error('Proposta sem dados');
        }
        setData(proposal);
      })
      .catch(err => {
        setError(err.message || 'Erro ao carregar proposta');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ProposalSkeleton />;
  if (error) return <ProposalError title="Proposta não encontrada" message={error} />;
  if (!data) return <ProposalError title="Sem dados" message="Não foi possível carregar os dados da proposta." />;

  const hasContent = data.clientName || data.consumption || data.finalPrice || data.monthlyBill;
  if (!hasContent) {
    return <ProposalError title="Proposta vazia" message="Esta proposta não possui dados preenchidos. Solicite ao consultor que complete as informações." />;
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)' }}>SolarOS</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Plano Solar Personalizado</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => { trackDownload(); window.print(); }} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '12px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Baixar PDF
          </button>
          {data.consultantPhone && (
            <a onClick={trackWhatsApp} href={`https://wa.me/${data.consultantPhone.replace(/\D/g, '')}?text=Olá, vi minha proposta personalizada SolarOS e gostaria de prosseguir.`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--green)', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>
              Falar no WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {!accepted && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, display: 'flex', gap: 12, justifyContent: 'center', padding: '16px 24px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setShowChangeModal(true)} style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '14px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Solicitar Alteração
          </button>
          <button onClick={() => { trackAccept(); setAccepted(true); }} style={{ padding: '12px 32px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--green)', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Aceitar Proposta
          </button>
        </div>
      )}

      {accepted && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, textAlign: 'center', padding: '16px 24px', background: '#ECFDF5', borderTop: '2px solid #059669', fontSize: '14px', fontWeight: 700, color: '#065F46' }}>
          Proposta aceita! Entraremos em contato em breve.
        </div>
      )}

      {/* Change request modal */}
      {showChangeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '32px', width: '90%', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Solicitar Alteração</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Descreva o que gostaria de modificar na proposta.</p>
            <textarea
              value={changeMessage}
              onChange={e => setChangeMessage(e.target.value)}
              placeholder="Ex: Gostaria de adicionar mais 2 módulos..."
              style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: '13px', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'end', marginTop: '16px' }}>
              <button onClick={() => setShowChangeModal(false)} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button onClick={() => { trackChangeRequest(changeMessage); setShowChangeModal(false); }} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--green)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ paddingTop: 54, paddingBottom: 80 }}>
        <ProposalView data={data} />
      </div>
    </div>
  );
}
