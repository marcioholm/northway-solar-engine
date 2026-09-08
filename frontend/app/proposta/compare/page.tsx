'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon, CurrencyDollarIcon, SunIcon, BoltIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const token1 = searchParams?.get('token1');
  const token2 = searchParams?.get('token2');

  const [p1, setP1] = useState<any>(null);
  const [p2, setP2] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token1 || !token2) {
      setError('Links de propostas inválidos.');
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${API_URL}/proposals/public/${token1}?format=web`).then(r => r.json()),
      fetch(`${API_URL}/proposals/public/${token2}?format=web`).then(r => r.json()),
    ])
      .then(([data1, data2]) => {
        if (data1.statusCode || data2.statusCode) throw new Error('Uma das propostas não foi encontrada');
        setP1(data1);
        setP2(data2);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token1, token2]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <p style={{ color: '#64748b', fontSize: 14 }}>Carregando comparativo...</p>
      </div>
    );
  }

  if (error || !p1 || !p2) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <p style={{ color: '#EF4444', fontSize: 15 }}>{error || 'Erro inesperado'}</p>
      </div>
    );
  }

  const formatBRL = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 8 }}>Comparativo de Cenários</h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>
            Cliente: <strong>{p1.clientName}</strong> • Escolha a melhor opção para o seu investimento
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          <ScenarioCard title="Opção A" data={p1} isWinner={p1.finalPrice < p2.finalPrice} />
          <ScenarioCard title="Opção B" data={p2} isWinner={p2.finalPrice < p1.finalPrice} />
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({ title, data, isWinner }: { title: string, data: any, isWinner: boolean }) {
  const formatBRL = (val: number) => `R$ ${(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const systemPowerKwp = data.systemPowerKwp || data.project?.sizingPowerKwp || 0;
  const moduleQty = data.moduleQty || data.project?.sizingModuleQty || 0;
  const finalPrice = data.finalPrice || data.project?.pricingFinalPrice || 0;
  const payback = data.paybackYears || 0;
  
  const annualSavings = payback > 0 ? finalPrice / payback : 0;
  const cashPrice = finalPrice * 0.95; // default 5% discount

  return (
    <div style={{ 
      background: '#fff', borderRadius: 16, border: isWinner ? '2px solid #059669' : '1px solid #E2E8F0', 
      overflow: 'hidden', boxShadow: isWinner ? '0 10px 25px -5px rgba(5, 150, 105, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      position: 'relative'
    }}>
      {isWinner && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#059669', color: '#fff', textAlign: 'center', fontSize: 11, fontWeight: 700, padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Melhor Custo-Benefício
        </div>
      )}
      <div style={{ padding: '32px 24px 24px', borderBottom: '1px solid #E2E8F0' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>{title}</h2>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#059669', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {formatBRL(finalPrice)}
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
          ou <strong>{formatBRL(cashPrice)}</strong> à vista
        </div>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Feature icon={<SunIcon />} label="Potência do Sistema" value={`${systemPowerKwp.toFixed(2)} kWp`} />
        <Feature icon={<BuildingOfficeIcon />} label="Painéis Solares" value={`${moduleQty} módulos`} />
        <Feature icon={<BoltIcon />} label="Economia Anual Est." value={formatBRL(annualSavings)} highlight />
        <Feature icon={<CheckCircleIcon />} label="Payback (Retorno)" value={`${payback.toFixed(1)} anos`} highlight />
      </div>
      
      <div style={{ padding: 24, background: '#F8FAFC', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
        <a 
          href={`/proposals/public/${data.publicToken}?format=html`}
          target="_blank"
          style={{ 
            display: 'inline-block', width: '100%', padding: '12px 0', 
            background: isWinner ? '#059669' : '#fff', 
            color: isWinner ? '#fff' : '#0F172A', 
            border: isWinner ? 'none' : '1px solid #CBD5E1', 
            borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none',
            transition: 'all 0.15s'
          }}
        >
          Ver Proposta Completa
        </a>
      </div>
    </div>
  );
}

function Feature({ icon, label, value, highlight }: { icon: any, label: string, value: string, highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 20, height: 20, color: highlight ? '#059669' : '#94A3B8' }}>
        {icon}
      </div>
      <div style={{ flex: 1, fontSize: 14, color: '#475569' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: highlight ? 700 : 600, color: highlight ? '#059669' : '#0F172A' }}>{value}</div>
    </div>
  );
}
