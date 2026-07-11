'use client';

import { useState, FormEvent } from 'react';

interface LeadModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: any) => Promise<void>;
}

export default function LeadModal({ open, onClose, onSave }: LeadModalProps) {
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = e.target as HTMLFormElement;
      const data = Object.fromEntries(new FormData(form));
      if (onSave) {
        await onSave(data);
      } else {
        const token = localStorage.getItem('token');
        const api = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${api}/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          onClose();
          window.location.reload();
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius)',
        maxWidth: '600px',
        width: '100%',
        padding: '36px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '20px',
            background: 'none', border: 'none',
            fontSize: '24px', cursor: 'pointer',
            color: 'var(--text-muted)', lineHeight: 1,
          }}
        >
          ×
        </button>

        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green-dark)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>
          Novo lead
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 24px' }}>
          Cadastrar oportunidade
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            <label style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
              Nome completo
              <input
                name="name"
                required
                placeholder="Ex.: João da Silva"
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
              WhatsApp
              <input
                name="phone"
                placeholder="(00) 00000-0000"
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
              Cidade
              <input
                name="city"
                placeholder="Ex.: Curitiba"
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
              Consumo médio
              <input
                name="consumptionKwh"
                type="number"
                placeholder="kWh/mês"
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
              Tipo de cliente
              <select
                name="clientType"
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'white',
                }}
              >
                <option value="residential">Residencial</option>
                <option value="commercial">Comercial</option>
                <option value="rural">Rural</option>
                <option value="industrial">Industrial</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
              Origem
              <select
                name="source"
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'white',
                }}
              >
                <option value="instagram">Instagram</option>
                <option value="google_ads">Google Ads</option>
                <option value="indication">Indicação</option>
                <option value="prospection">Prospecção</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 24px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
                background: 'white',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 28px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'var(--green-gradient)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Salvando...' : 'Salvar lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
