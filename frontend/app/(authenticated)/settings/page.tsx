'use client';

import { useState, useEffect } from 'react';
import { Cog6ToothIcon, CurrencyDollarIcon, BuildingOfficeIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { decodeToken } from '../../../lib/jwt';
import { Input } from '../../../components/ui/Input';

export default function SettingsPage() {
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [baseCity, setBaseCity] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [defaultMargin, setDefaultMargin] = useState(25);
  const [cardTax, setCardTax] = useState(15);
  const [financeTax, setFinanceTax] = useState(20);
  const [cashDiscount, setCashDiscount] = useState(5);
  
  // Meta Integration
  const [metaPixelId, setMetaPixelId] = useState('');
  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [metaAdAccountId, setMetaAdAccountId] = useState('');
  const [metaDatasetId, setMetaDatasetId] = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const api = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token || !api) return;
    const payload = decodeToken(token);
    if (!payload?.companyId) return;
    setCompanyId(payload.companyId);

    fetch(`${api}/companies/${payload.companyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(c => {
        setCompanyName(c.name || '');
        setBaseCity(c.baseCity || '');
        setLogoUrl(c.logoUrl || '');
        setDefaultMargin(Number(c.defaultMargin) || 25);
        setCardTax(Number(c.cardTax) || 15);
        setFinanceTax(Number(c.financeTax) || 20);
        setCashDiscount(Number(c.cashDiscount) || 5);
        
        setMetaPixelId(c.metaPixelId || '');
        setMetaAccessToken(c.metaAccessToken || '');
        setMetaAdAccountId(c.metaAdAccountId || '');
        setMetaDatasetId(c.metaDatasetId || '');
      })
      .catch(() => {});
  }, [api, token]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;
    setUploading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await fetch(`${api}/companies/${companyId}/logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setLogoUrl(data.logoUrl);
      setMessage('Logo atualizado!');
    } catch {
      setMessage('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${api}/companies/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: companyName,
          baseCity,
          defaultMargin,
          cardTax,
          financeTax,
          cashDiscount,
          metaPixelId,
          metaAccessToken,
          metaAdAccountId,
          metaDatasetId,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setMessage('Configurações salvas!');
    } catch {
      setMessage('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Configurações</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Gerencie os parâmetros da sua empresa</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Empresa */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', marginBottom: 24 }}>
              <BuildingOfficeIcon style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Empresa</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Nome">
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Cidade Base">
                <input value={baseCity} onChange={e => setBaseCity(e.target.value)} style={inputStyle} placeholder="Ex: São Paulo - SP" />
              </Field>
              <Field label="Logo">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg)' }}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : (
                      <PhotoIcon style={{ width: 28, height: 28, color: 'var(--text-muted)', opacity: 0.5 }} />
                    )}
                  </div>
                  <label style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '12px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}>
                    {uploading ? 'Enviando...' : 'Escolher imagem'}
                    <input type="file" accept="image/png,image/jpeg" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </Field>
            </div>
          </div>

          {/* Financeiro */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', marginBottom: 24 }}>
              <CurrencyDollarIcon style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Financeiro</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Margem Padrão (%)">
                <Input variant="number" value={defaultMargin} onChange={v => setDefaultMargin(Number(v))} />
              </Field>
              <Field label="Desconto à Vista (%)">
                <Input variant="number" value={cashDiscount} onChange={v => setCashDiscount(Number(v))} />
              </Field>
              <Field label="Taxa Cartão (%)">
                <Input variant="number" value={cardTax} onChange={v => setCardTax(Number(v))} />
              </Field>
              <Field label="Taxa Financiamento (%)">
                <Input variant="number" value={financeTax} onChange={v => setFinanceTax(Number(v))} />
              </Field>
            </div>
          </div>
          {/* Integrações - WhatsApp */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', marginBottom: 24 }}>
              <Cog6ToothIcon style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Integração: WhatsApp (Evolution API)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Nome da Instância">
                <input style={inputStyle} placeholder="Ex: solar_vendas_1" />
              </Field>
              <Field label="URL da API">
                <input style={inputStyle} placeholder="https://sua-evolution-api.com" />
              </Field>
              <Field label="Global API Key">
                <input style={inputStyle} type="password" placeholder="••••••••••••" />
              </Field>
              <button type="button" style={{
                padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', marginTop: 8
              }}>
                Conectar e Gerar QR Code
              </button>
            </div>
          </div>

          {/* Integrações - Meta Ads */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', marginBottom: 24 }}>
              <Cog6ToothIcon style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Integração: Meta Ads (Conversões)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Pixel ID (Opcional)">
                <input style={inputStyle} placeholder="Ex: 1234567890" value={metaPixelId} onChange={e => setMetaPixelId(e.target.value)} />
              </Field>
              <Field label="Access Token">
                <input style={inputStyle} type="password" placeholder="EAAB..." value={metaAccessToken} onChange={e => setMetaAccessToken(e.target.value)} />
              </Field>
              <Field label="Ad Account ID">
                <input style={inputStyle} placeholder="act_123456" value={metaAdAccountId} onChange={e => setMetaAdAccountId(e.target.value)} />
              </Field>
              <Field label="Dataset ID">
                <input style={inputStyle} placeholder="Dataset/Offline Event Set ID" value={metaDatasetId} onChange={e => setMetaDatasetId(e.target.value)} />
              </Field>
            </div>
          </div>
        </div>

        {/* Preview / ações */}
        <div>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: 28, position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', marginBottom: 24 }}>
              <Cog6ToothIcon style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ações</span>
            </div>

            <button type="submit" disabled={saving} style={{
              width: '100%', padding: '12px 24px', borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--green)', color: '#fff', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'inherit',
            }}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>

            {message && (
              <p style={{ marginTop: 12, fontSize: '12px', fontWeight: 600, color: message.includes('Erro') ? 'var(--danger)' : 'var(--success)', textAlign: 'center' }}>
                {message}
              </p>
            )}

            {logoUrl && (
              <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 12 }}>Preview na Proposta</p>
                <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
                  <img src={logoUrl} alt="Logo preview" style={{ maxHeight: 48, objectFit: 'contain' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '10px 14px', background: 'var(--bg)',
  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text)',
  fontSize: '14px', outline: 'none', fontFamily: 'inherit',
};
