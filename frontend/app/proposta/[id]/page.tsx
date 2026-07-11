'use client';

import { useState, useEffect } from 'react';
import { ProposalView } from '../../../components/proposta/ProposalView';
import { ProposalData, DEFAULT_TIMELINE, DEFAULT_COMPANY, DEFAULT_FAQ, DEFAULT_TESTIMONIALS } from '../../../lib/proposal-types';

function ProposalSkeleton() {
  return (
    <div style={{ padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--green)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Carregando proposta...</p>
    </div>
  );
}

function ProposalError({ message }: { message: string }) {
  return (
    <div style={{ padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', gap: 12 }}>
      <div style={{ fontSize: 36, opacity: 0.2 }}>◈</div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Proposta não encontrada</h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>{message}</p>
    </div>
  );
}

function buildMockData(id: string): ProposalData {
  const monthlyBill = 480;
  const monthlyConsumption = 520;
  const monthlySavings = 432;
  const yearlySavings = monthlySavings * 12;
  const finalPrice = 24900;
  const paybackYears = 4.2;
  const roi = 589;
  const systemPowerKwp = 5.2;
  const co2Avoided = 28;
  const treesPreserved = 156;
  const cleanEnergyKwh = 390000;
  const carsEquivalent = 8;

  return {
    id,
    clientName: 'João da Silva',
    clientCity: 'São Paulo',
    clientState: 'SP',
    consultantName: 'Marcos Oliveira',
    consultantPhone: '(11) 99999-8888',
    createdAt: new Date().toISOString(),
    expirationDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    monthlyBill,
    monthlyConsumption,
    utility: 'Enel',
    monthlySavings,
    yearlySavings,
    savings25Years: yearlySavings * 25,
    paybackYears,
    roi,
    systemPowerKwp,
    moduleQty: 12,
    module: { brand: 'Canadian Solar', model: 'HiKu6', powerWatt: 550 },
    inverter: { brand: 'Growatt', model: 'MIN 5000TL-X', powerKw: 5 },
    equipment: [
      { type: 'module', brand: 'Canadian Solar', model: 'HiKu6', quantity: 12, power: '550W', warranty: '25 anos', benefits: ['Alta eficiência (21.5%)', 'Tolerância positiva de 5W', 'Tecnologia Half-Cell', 'Garantia de produto de 15 anos'] },
      { type: 'inverter', brand: 'Growatt', model: 'MIN 5000TL-X', quantity: 1, power: '5kW', warranty: '10 anos', benefits: ['Eficiência máxima de 97.6%', 'Monitoramento via WiFi', 'Proteção IP65', 'Silencioso (<30dB)'] },
      { type: 'structure', brand: 'Solarfix', model: 'Pro-Fix 2000', quantity: 1, power: '', warranty: '12 anos', benefits: ['Alumínio anodizado 6005', 'Compatível com telha cerâmica', 'Sistema de fixação sem perfuração', 'Resistência a ventos de 150km/h'] },
      { type: 'stringBox', brand: 'WEG', model: 'SB-CC-5kW', quantity: 1, power: '', warranty: '5 anos', benefits: ['Proteção contra surtos (DPS)', 'Disjuntor AC/DC integrado', 'Grau de proteção IP65', 'Instalação simplificada'] },
    ],
    finalPrice,
    discountPix: finalPrice * 0.05,
    installmentPrice: finalPrice / 12,
    installmentMonths: 12,
    treesPreserved,
    co2Avoided,
    cleanEnergyKwh,
    carsEquivalent,
    company: DEFAULT_COMPANY,
    paymentMethods: {
      pix: { discountPercent: 5, total: finalPrice * 0.95 },
      creditCard: { installments: 12, monthly: Math.round(finalPrice / 12), total: finalPrice },
      financing: { maxInstallments: 72, monthly: Math.round(finalPrice / 72 * 1.2), entry: 0 },
      consortium: { estimatedMonths: 18, monthly: Math.round(finalPrice / 18 * 1.08) },
    },
    timeline: DEFAULT_TIMELINE,
    testimonials: DEFAULT_TESTIMONIALS,
    faq: DEFAULT_FAQ,
    optionalPlans: {
      essential: { finalPrice: 21000, monthlySavings: 380, paybackYears: 4.8, moduleQty: 10 },
      recommended: { finalPrice: 24900, monthlySavings: 432, paybackYears: 4.2, moduleQty: 12 },
      premium: { finalPrice: 32500, monthlySavings: 520, paybackYears: 5.1, moduleQty: 16 },
    },
  };
}

export default function ProposalPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const api = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${api}/proposals/${params.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(res => {
      if (!res.ok) throw new Error('Proposta não encontrada');
      return res.json();
    }).then((proposal: any) => {
      const m = buildMockData(params.id);
      setData({
        ...m,
        id: proposal.id || params.id,
        clientName: proposal.clientName || m.clientName,
        clientCity: proposal.clientCity || m.clientCity,
        clientState: proposal.clientState || m.clientState,
        createdAt: proposal.createdAt || m.createdAt,
        expirationDate: proposal.expirationDate || m.expirationDate,
        monthlyBill: Number(proposal.monthlyBill) || m.monthlyBill,
        monthlyConsumption: Number(proposal.monthlyConsumption) || m.monthlyConsumption,
        monthlySavings: Number(proposal.monthlySavings) || m.monthlySavings,
        systemPowerKwp: Number(proposal.systemPowerKwp) || m.systemPowerKwp,
        finalPrice: Number(proposal.finalPrice) || m.finalPrice,
        paybackYears: Number(proposal.paybackYears) || m.paybackYears,
      });
    }).catch(() => {
      setData(buildMockData(params.id));
    }).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <ProposalSkeleton />;
  if (error) return <ProposalError message={error} />;
  if (!data) return <ProposalError message="Dados não disponíveis" />;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)' }}>SolarOS</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Plano Solar Personalizado</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => window.print()} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '12px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}>
            Baixar PDF
          </button>
          <a href={`https://wa.me/${data.consultantPhone.replace(/\D/g, '')}?text=Olá, vi minha proposta personalizada SolarOS e gostaria de prosseguir.`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--green)', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>
            Falar no WhatsApp
          </a>
        </div>
      </div>
      <div style={{ paddingTop: 54 }}>
        <ProposalView data={data} />
      </div>
    </div>
  );
}
