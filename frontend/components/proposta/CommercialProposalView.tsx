'use client';

import React from 'react';
import { ProposalData } from '../../lib/proposal-types';

export function getContrastColor(hexColor?: string): '#ffffff' | '#0f172a' {
  if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 148 ? '#0f172a' : '#ffffff';
}

function fmtCurrency(val?: number): string {
  if (val == null || isNaN(val)) return 'R$ 0,00';
  return (
    'R$ ' +
    Number(val).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function fmtNumber(val?: number, decimals = 0): string {
  if (val == null || isNaN(val)) return '0';
  return Number(val).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function renderMonthlyChartSvg(
  avgGenerationKwh: number,
  consumptionKwh: number,
  primaryColor: string,
  secondaryColor: string,
) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const factors = [1.08, 1.04, 1.00, 0.94, 0.88, 0.84, 0.88, 0.98, 1.04, 1.08, 1.10, 1.12];
  const monthlyValues = factors.map(f => Math.round(avgGenerationKwh * f));
  const maxVal = Math.max(...monthlyValues, consumptionKwh || 0, 100) * 1.25;

  const width = 640;
  const height = 150;
  const chartHeight = 110;
  const barWidth = 32;
  const gap = (width - barWidth * 12) / 13;

  const consumptionY = Math.round(chartHeight - (consumptionKwh / maxVal) * chartHeight);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible', fontFamily: 'inherit' }}>
      <line x1="0" y1={chartHeight} x2={width} y2={chartHeight} stroke="#cbd5e1" strokeWidth="1" />
      {monthlyValues.map((val, i) => {
        const x = Math.round(gap + i * (barWidth + gap));
        const h = Math.max(4, Math.round((val / maxVal) * chartHeight));
        const y = chartHeight - h;
        return (
          <g key={months[i]}>
            <rect x={x} y={y} width={barWidth} height={h} rx="3" fill={primaryColor} opacity="0.88" />
            <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize="9" fontWeight="600" fill="#475569">
              {val}
            </text>
            <text x={x + barWidth / 2} y={chartHeight + 14} textAnchor="middle" fontSize="9.5" fill="#64748b">
              {months[i]}
            </text>
          </g>
        );
      })}
      {consumptionKwh > 0 && consumptionY >= 0 && consumptionY <= chartHeight && (
        <g>
          <line x1="0" y1={consumptionY} x2={width} y2={consumptionY} stroke={secondaryColor} strokeDasharray="4,3" strokeWidth="1.5" />
          <text x={width - 4} y={consumptionY - 5} textAnchor="end" fontSize="9" fontWeight="700" fill={secondaryColor}>
            Consumo médio: {Math.round(consumptionKwh)} kWh
          </text>
        </g>
      )}
    </svg>
  );
}

export function CommercialProposalView({ data }: { data: ProposalData }) {
  const settings = data.settings || {
    template: 'moderno',
    primaryColor: '#0f766e',
    secondaryColor: '#f59e0b',
    aboutText: 'Somos especialistas em soluções completas de energia solar fotovoltaica.',
    stats: [],
    partnerLogos: [],
    brandLogos: [],
    serviceAreaText: 'Atendimento especializado com equipe própria.',
    includedItems: [
      'Módulos Fotovoltaicos de Alta Eficiência',
      'Inversor com Monitoramento Wi-Fi',
      'Estrutura de Fixação em Alumínio',
      'Projeto Elétrico e Homologação na Concessionária',
      'Instalação e Comissionamento Completo',
    ],
    warrantiesText: '25 anos de eficiência nos módulos e 10 anos no inversor.',
    exclusionsText: 'Não inclusos: reformas prévias ou adequação no padrão de entrada.',
    notesText: 'Proposta válida por 10 dias corridos.',
    acceptanceText: 'Declaro concordar com os termos e valores desta proposta.',
    contact: {},
    sectionsEnabled: {
      cover: true,
      about: true,
      stats: true,
      technical: true,
      equipment: true,
      financial: true,
      kit: true,
      warranties: true,
      partners: true,
      contact: true,
    },
  };

  const template = settings.template || 'moderno';
  const primaryColor = settings.primaryColor || '#0f766e';
  const secondaryColor = settings.secondaryColor || '#f59e0b';
  const primaryContrast = getContrastColor(primaryColor);
  const secondaryContrast = getContrastColor(secondaryColor);

  const sec = settings.sectionsEnabled || {
    cover: true,
    about: true,
    stats: true,
    technical: true,
    equipment: true,
    financial: true,
    kit: true,
    warranties: true,
    partners: true,
    contact: true,
  };

  const finalPrice = Number(data.finalPrice || 0);
  const paybackYears = Number(data.paybackYears || 0);
  const annualSavings = paybackYears > 0 ? finalPrice / paybackYears : 0;
  const cashDiscount = Number(data.payment?.cashDiscount ?? 5);
  const cashPrice = finalPrice * (1 - cashDiscount / 100);
  const cardInstallment = (finalPrice * 1.15) / 12;
  const cardTotalPrice = cardInstallment * 12;
  const financeInstallment = (finalPrice * 1.2) / 60;
  const financeTotalPrice = financeInstallment * 60;

  const systemPowerKwp = Number(data.systemPowerKwp || 0);
  const consumptionKwh = Number(data.consumption || 0);
  const moduleQty = Number(data.moduleQty || 0);
  const generationMonthlyKwh = Math.round(systemPowerKwp * 125);

  const contact = settings.contact || {};
  const contactParts: string[] = [];
  if (contact.phone) contactParts.push(`📞 ${contact.phone}`);
  if (contact.whatsapp) contactParts.push(`💬 WhatsApp: ${contact.whatsapp}`);
  if (contact.website) contactParts.push(`🌐 ${contact.website}`);
  if (contact.instagram) contactParts.push(`📷 ${contact.instagram}`);
  if (contact.address) contactParts.push(`📍 ${contact.address}`);
  const contactFooterText = contactParts.length
    ? contactParts.join('  ·  ')
    : data.company?.name || 'SolarOS';

  const equipment = data.equipment || [];

  const hasCover = sec.cover !== false;
  const hasAboutSection =
    (sec.about !== false && Boolean(settings.aboutText)) ||
    (sec.stats !== false && Boolean(settings.stats && settings.stats.length > 0)) ||
    (sec.partners !== false &&
      Boolean(
        (settings.partnerLogos && settings.partnerLogos.length > 0) ||
        (settings.brandLogos && settings.brandLogos.length > 0),
      ));
  const hasSystemSection =
    sec.technical !== false ||
    sec.equipment !== false ||
    (sec.kit !== false && Boolean(settings.includedItems && settings.includedItems.length > 0));
  const hasFinancialSection =
    sec.financial !== false ||
    sec.warranties !== false ||
    sec.contact !== false;

  const totalPages =
    (hasCover ? 1 : 0) +
    (hasAboutSection ? 1 : 0) +
    (hasSystemSection ? 1 : 0) +
    (hasFinancialSection ? 1 : 0);

  let pageCounter = 1;

  const renderFooter = (page: number) => (
    <footer style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8pt', color: '#64748b' }}>
      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '72%' }}>
        {contactFooterText}
      </div>
      <div style={{ display: 'flex', gap: '10px', whiteSpace: 'nowrap' }}>
        <span>Código: <strong>{data.publicToken || 'PROPOSTA'}</strong></span>
        <span>Página {page} de {totalPages}</span>
      </div>
    </footer>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', margin: '0 auto', maxWidth: '210mm' }}>
      {/* ================= PÁGINA 1: CAPA ================= */}
      {hasCover && (
        <div
          className="a4-page-card"
          style={{
            width: '100%',
            minHeight: '297mm',
            background: '#ffffff',
            borderRadius: template === 'moderno' ? '16px' : template === 'classico' ? '4px' : '0px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            padding: template === 'classico' ? '0' : template === 'minimalista' ? '24mm 20mm 14mm 20mm' : '16mm 18mm 12mm 18mm',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {template === 'classico' ? (
            <>
              <div style={{ width: '100%', height: '220px', position: 'relative', background: primaryColor, overflow: 'hidden' }}>
                {settings.coverImageUrl ? (
                  <img src={settings.coverImageUrl} alt="Capa" onError={e => (e.currentTarget.style.display = 'none')} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryContrast, fontSize: '24pt', fontWeight: 900 }}>
                    PROPOSTA COMERCIAL
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '10px', background: secondaryColor }} />
              </div>

              <div style={{ padding: '16mm 18mm', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    {data.company?.logoUrl ? (
                      <img src={data.company.logoUrl} alt={data.company.name} onError={e => (e.currentTarget.style.display = 'none')} style={{ maxHeight: '55px', maxWidth: '200px', objectFit: 'contain' }} />
                    ) : (
                      <h2 style={{ fontSize: '20pt', fontWeight: 900, color: primaryColor }}>{data.company?.name || 'SolarOS'}</h2>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '9pt', color: '#64748b' }}>
                    <div>Emissão: <strong>{data.createdAt || 'Hoje'}</strong></div>
                    <div>Validade: <strong>{data.expirationDate || '10 dias'}</strong></div>
                  </div>
                </div>

                <div style={{ margin: '24px 0' }}>
                  <div style={{ fontSize: '11pt', fontWeight: 700, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Proposta Comercial
                  </div>
                  <h1 style={{ fontSize: '26pt', fontWeight: 900, lineHeight: 1.15, color: '#0f172a', marginBottom: '12px' }}>
                    Sistema Solar Fotovoltaico
                  </h1>
                  <p style={{ fontSize: '13pt', color: '#475569' }}>
                    Geração de energia limpa, redução de custos e sustentabilidade.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', borderTop: `3px solid ${primaryColor}`, borderBottom: '1px solid #cbd5e1', padding: '18px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Apresentado para</div>
                    <div style={{ fontSize: '14pt', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{data.clientName}</div>
                    {data.clientCity && <div style={{ fontSize: '10pt', color: '#64748b', marginTop: '2px' }}>{data.clientCity}{data.clientState ? ` - ${data.clientState}` : ''}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Consultor Responsável</div>
                    <div style={{ fontSize: '12pt', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{data.consultantName || 'Equipe Comercial'}</div>
                    {data.consultantPhone && <div style={{ fontSize: '10pt', color: '#64748b', marginTop: '2px' }}>{data.consultantPhone}</div>}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '8.5pt', color: '#64748b' }}>
                  <div>{contactFooterText}</div>
                  <div>Cód: <strong>{data.publicToken || 'PROPOSTA'}</strong></div>
                </div>
              </div>
            </>
          ) : template === 'minimalista' ? (
            <>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    {data.company?.logoUrl ? (
                      <img src={data.company.logoUrl} alt={data.company.name} onError={e => (e.currentTarget.style.display = 'none')} style={{ maxHeight: '48px', maxWidth: '180px', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '16pt', fontWeight: 900, letterSpacing: '-0.02em' }}>{data.company?.name || 'SolarOS'}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '8.5pt', color: '#94a3b8', textAlign: 'right', lineHeight: 1.5 }}>
                    <div>{data.createdAt || 'Hoje'}</div>
                    <div>Ref: {data.publicToken?.slice(0, 8) || 'PROP'}</div>
                  </div>
                </div>

                <div style={{ margin: '40px 0' }}>
                  <div style={{ width: '40px', height: '2px', background: '#0f172a', marginBottom: '24px' }} />
                  <h1 style={{ fontSize: '32pt', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#0f172a', marginBottom: '16px' }}>
                    PROPOSTA<br />COMERCIAL
                  </h1>
                  <div style={{ fontSize: '12pt', fontWeight: 500, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Energia Solar Fotovoltaica
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #0f172a', paddingTop: '24px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '4px' }}>Cliente</div>
                    <div style={{ fontSize: '15pt', fontWeight: 800, color: '#0f172a' }}>{data.clientName}</div>
                    {data.clientCity && <div style={{ fontSize: '9.5pt', color: '#64748b', marginTop: '2px' }}>{data.clientCity}{data.clientState ? ` / ${data.clientState}` : ''}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '4px' }}>Atendimento</div>
                    <div style={{ fontSize: '11pt', fontWeight: 700, color: '#0f172a' }}>{data.consultantName || 'Equipe Especializada'}</div>
                    <div style={{ fontSize: '8.5pt', color: '#64748b', marginTop: '4px' }}>Válido até {data.expirationDate || '10 dias'}</div>
                  </div>
                </div>
              </div>
              {renderFooter(pageCounter++)}
            </>
          ) : (
            <>
              {/* Moderno */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    {data.company?.logoUrl ? (
                      <img src={data.company.logoUrl} alt={data.company.name} onError={e => (e.currentTarget.style.display = 'none')} style={{ maxHeight: '50px', maxWidth: '190px', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '20pt', fontWeight: 900, color: primaryColor }}>{data.company?.name || 'SolarOS'}</span>
                    )}
                  </div>
                  <div style={{ background: 'rgba(15, 118, 110, 0.08)', padding: '6px 14px', borderRadius: '20px', fontSize: '8.5pt', fontWeight: 700, color: primaryColor }}>
                    PROPOSTA COMERCIAL
                  </div>
                </div>

                <div style={{ height: '190px', borderRadius: '16px', overflow: 'hidden', position: 'relative', background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`, marginBottom: '20px' }}>
                  {settings.coverImageUrl && (
                    <img src={settings.coverImageUrl} alt="Capa" onError={e => (e.currentTarget.style.display = 'none')} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }} />
                  )}
                  <div style={{ position: 'absolute', inset: 0, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: '#ffffff' }}>
                    <div style={{ fontSize: '10pt', fontWeight: 700, color: secondaryColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      Transição Energética
                    </div>
                    <h1 style={{ fontSize: '22pt', fontWeight: 900, lineHeight: 1.2 }}>Engenharia Solar de Alta Performance</h1>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Cliente</div>
                    <div style={{ fontSize: '15pt', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{data.clientName}</div>
                    {data.clientCity && <div style={{ fontSize: '10pt', color: '#64748b', marginTop: '2px' }}>📍 {data.clientCity}{data.clientState ? ` - ${data.clientState}` : ''}</div>}
                  </div>
                  <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '16px' }}>
                    <div style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Consultoria Técnica</div>
                    <div style={{ fontSize: '11pt', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{data.consultantName || 'Especialista Solar'}</div>
                    <div style={{ fontSize: '8.5pt', color: '#64748b', marginTop: '4px' }}>Validade: <strong>{data.expirationDate || '10 dias'}</strong></div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5pt', color: '#64748b' }}>
                  <span>Código de Acompanhamento: <strong>{data.publicToken || 'PROPOSTA'}</strong></span>
                  <span>Data de Emissão: <strong>{data.createdAt || 'Hoje'}</strong></span>
                </div>
              </div>
              {renderFooter(pageCounter++)}
            </>
          )}
        </div>
      )}

      {/* ================= PÁGINA 2: QUEM SOMOS & PARCEIROS ================= */}
      {hasAboutSection && (
        <div
          className="a4-page-card"
          style={{
            width: '100%',
            minHeight: '297mm',
            background: '#ffffff',
            borderRadius: template === 'moderno' ? '16px' : template === 'classico' ? '4px' : '0px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            padding: '16mm 18mm 12mm 18mm',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '14px', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '4px' }}>
              <h2 style={{ fontSize: '13pt', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a' }}>
                Sobre a Nossa Empresa
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: settings.aboutImageUrl ? '1.4fr 1fr' : '1fr', gap: '16px', marginBottom: '16px', alignItems: 'start' }}>
              <div style={{ fontSize: '9.5pt', color: '#334155', lineHeight: 1.55 }}>
                {settings.aboutText}
                {settings.serviceAreaText && (
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f8fafc', borderLeft: `3px solid ${primaryColor}`, fontSize: '8.5pt', color: '#475569' }}>
                    <strong>Área de Atendimento:</strong> {settings.serviceAreaText}
                  </div>
                )}
              </div>
              {settings.aboutImageUrl && (
                <div style={{ height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img src={settings.aboutImageUrl} alt="Sobre nós" onError={e => (e.currentTarget.style.display = 'none')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            {/* Stats */}
            {sec.stats !== false && settings.stats && settings.stats.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Nossos Números
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(settings.stats.length, 4)}, 1fr)`, gap: '10px' }}>
                  {settings.stats.slice(0, 4).map((s, idx) => (
                    <div key={idx} style={{ textAlign: 'center', padding: '12px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderTop: `3px solid ${primaryColor}`, borderRadius: template === 'moderno' ? '8px' : '2px' }}>
                      <div style={{ fontSize: '18pt', fontWeight: 900, color: primaryColor, lineHeight: 1.1 }}>{s.value}</div>
                      <div style={{ fontSize: '7.5pt', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Marcas de Fabricantes */}
            {sec.partners !== false && settings.brandLogos && settings.brandLogos.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Tecnologia & Fabricantes Homologados
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {settings.brandLogos.slice(0, 12).map((logo, idx) => (
                    <div key={idx} style={{ width: '78px', height: '42px', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
                      <img src={logo} alt="Marca" onError={e => (e.currentTarget.style.display = 'none')} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parceiros / Financiadores */}
            {sec.partners !== false && settings.partnerLogos && settings.partnerLogos.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Parceiros e Linhas de Financiamento
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {settings.partnerLogos.slice(0, 12).map((logo, idx) => (
                    <div key={idx} style={{ width: '78px', height: '42px', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
                      <img src={logo} alt="Parceiro" onError={e => (e.currentTarget.style.display = 'none')} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {renderFooter(pageCounter++)}
        </div>
      )}

      {/* ================= PÁGINA 3: SISTEMA & KIT ================= */}
      {hasSystemSection && (
        <div
          className="a4-page-card"
          style={{
            width: '100%',
            minHeight: '297mm',
            background: '#ffffff',
            borderRadius: template === 'moderno' ? '16px' : template === 'classico' ? '4px' : '0px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            padding: '16mm 18mm 12mm 18mm',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '14px', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '4px' }}>
              <h2 style={{ fontSize: '13pt', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a' }}>
                Engenharia do Sistema & Geração
              </h2>
            </div>

            {/* Destaques Técnicos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Potência do Sistema</div>
                <div style={{ fontSize: '16pt', fontWeight: 900, color: primaryColor, marginTop: '2px' }}>{fmtNumber(systemPowerKwp, 2)} kWp</div>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Módulos Solares</div>
                <div style={{ fontSize: '16pt', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{moduleQty} un</div>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Geração Média</div>
                <div style={{ fontSize: '16pt', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{fmtNumber(generationMonthlyKwh)} kWh/mês</div>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Consumo Atual</div>
                <div style={{ fontSize: '16pt', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{consumptionKwh ? `${fmtNumber(consumptionKwh)} kWh` : '—'}</div>
              </div>
            </div>

            {/* Gráfico Mensal */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: '#ffffff', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '8.5pt', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a' }}>Geração Mensal Estimada (kWh)</div>
                <div style={{ fontSize: '7.5pt', color: '#64748b' }}>Estimativa histórica baseada em irradiação solar local</div>
              </div>
              {renderMonthlyChartSvg(generationMonthlyKwh, consumptionKwh, primaryColor, secondaryColor)}
            </div>

            {/* Equipamentos */}
            {sec.equipment !== false && equipment.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '6px' }}>Equipamentos Principais</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '6px 10px' }}>Item</th>
                      <th style={{ padding: '6px 10px' }}>Marca</th>
                      <th style={{ padding: '6px 10px' }}>Modelo</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center' }}>Qtd</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right' }}>Potência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.map((eq, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 700, textTransform: 'capitalize' }}>
                          {eq.type === 'module' ? 'Módulo Fotovoltaico' : eq.type === 'inverter' ? 'Inversor Solar' : eq.type}
                        </td>
                        <td style={{ padding: '6px 10px' }}>{eq.brand || '—'}</td>
                        <td style={{ padding: '6px 10px' }}>{eq.model || '—'}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'center' }}>{eq.quantity || '—'}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'right' }}>{eq.power || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Itens Inclusos */}
            {sec.kit !== false && settings.includedItems && settings.includedItems.length > 0 && (
              <div>
                <div style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Escopo de Fornecimento & Serviços Inclusos
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {settings.includedItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8pt', color: '#334155', padding: '4px 8px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: primaryColor, fontWeight: 900 }}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {renderFooter(pageCounter++)}
        </div>
      )}

      {/* ================= PÁGINA 4: INVESTIMENTO & FECHAMENTO ================= */}
      {hasFinancialSection && (
        <div
          className="a4-page-card"
          style={{
            width: '100%',
            minHeight: '297mm',
            background: '#ffffff',
            borderRadius: template === 'moderno' ? '16px' : template === 'classico' ? '4px' : '0px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            padding: '16mm 18mm 12mm 18mm',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '14px', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '4px' }}>
              <h2 style={{ fontSize: '13pt', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a' }}>
                Investimento & Condições Comerciais
              </h2>
            </div>

            {/* Cards de Preço */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderTop: `3px solid ${primaryColor}`, borderRadius: '8px' }}>
                <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Valor Total do Sistema</div>
                <div style={{ fontSize: '16pt', fontWeight: 900, color: primaryColor, marginTop: '2px' }}>{fmtCurrency(finalPrice)}</div>
                <div style={{ fontSize: '7pt', color: '#64748b', marginTop: '2px' }}>Equipamentos + Instalação Completa</div>
              </div>
              <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>À Vista ({cashDiscount}% desc.)</div>
                <div style={{ fontSize: '12.5pt', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{fmtCurrency(cashPrice)}</div>
                <div style={{ fontSize: '7pt', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>Economia imediata</div>
              </div>
              <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Cartão de Crédito</div>
                <div style={{ fontSize: '12.5pt', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>12x {fmtCurrency(cardInstallment)}</div>
                <div style={{ fontSize: '7pt', color: '#64748b', marginTop: '2px' }}>Total: {fmtCurrency(cardTotalPrice)}</div>
              </div>
              <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Financiamento Solar</div>
                <div style={{ fontSize: '12.5pt', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>60x {fmtCurrency(financeInstallment)}</div>
                <div style={{ fontSize: '7pt', color: '#64748b', marginTop: '2px' }}>Total: {fmtCurrency(financeTotalPrice)}</div>
              </div>
            </div>

            {/* Estimativa de Payback e Economia com Premissas */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px', marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '7.5pt', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Payback Estimado:</span>
                  <span style={{ fontSize: '10.5pt', fontWeight: 800, color: '#0f172a', marginLeft: '4px' }}>{paybackYears ? `${fmtNumber(paybackYears, 1)} anos` : '—'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '7.5pt', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Economia Estimada:</span>
                  <span style={{ fontSize: '10.5pt', fontWeight: 800, color: '#16a34a', marginLeft: '4px' }}>{fmtCurrency(annualSavings)}/ano</span>
                </div>
              </div>
              <div style={{ fontSize: '7pt', color: '#64748b', lineHeight: 1.35, borderLeft: '1px solid #cbd5e1', paddingLeft: '10px' }}>
                * <strong>Premissas da Estimativa:</strong> Calculada com base no consumo informado e irradiação solar média local. Não considera reajustes futuros da concessionária, custo de disponibilidade ou taxas de distribuição (Fio B).
              </div>
            </div>

            {/* Garantias & Observações */}
            {sec.warranties !== false && (settings.warrantiesText || settings.exclusionsText || settings.notesText) && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '6px' }}>Garantias & Condições Gerais</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '7.5pt', color: '#334155', lineHeight: 1.4 }}>
                  {settings.warrantiesText && (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '3px solid #16a34a', padding: '6px 10px', borderRadius: '4px' }}>
                      <strong>Garantias:</strong> {settings.warrantiesText}
                    </div>
                  )}
                  {settings.exclusionsText && (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '3px solid #f59e0b', padding: '6px 10px', borderRadius: '4px' }}>
                      <strong>Exclusões:</strong> {settings.exclusionsText}
                    </div>
                  )}
                  {settings.notesText && (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '3px solid #64748b', padding: '6px 10px', borderRadius: '4px' }}>
                      <strong>Observações:</strong> {settings.notesText}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Termo de Aceite & Assinaturas */}
            <div style={{ border: '1px dashed #cbd5e1', background: '#fafafa', borderRadius: '6px', padding: '10px 14px', marginTop: 'auto' }}>
              <div style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em', marginBottom: '4px' }}>Termo de Aceite Comercial</div>
              <p style={{ fontSize: '7pt', color: '#64748b', lineHeight: 1.35, marginBottom: '16px' }}>
                {settings.acceptanceText || 'Declaro que li e estou de acordo com o dimensionamento técnico, valores e condições comerciais apresentadas nesta proposta, autorizando a empresa a dar início aos trâmites de engenharia e homologação.'}
                {' '}Proposta válida até <strong>{data.expirationDate || '10 dias'}</strong>.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '14px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px' }}>
                    <div style={{ fontSize: '8pt', fontWeight: 700, color: '#0f172a' }}>{data.clientName}</div>
                    <div style={{ fontSize: '7pt', color: '#64748b' }}>Assinatura do Cliente</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px' }}>
                    <div style={{ fontSize: '8pt', fontWeight: 700, color: '#0f172a' }}>{data.consultantName || data.company?.name || 'Responsável Comercial'}</div>
                    <div style={{ fontSize: '7pt', color: '#64748b' }}>{data.company?.name || 'SolarOS'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {renderFooter(pageCounter++)}
        </div>
      )}
    </div>
  );
}
