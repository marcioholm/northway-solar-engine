export function defaultTemplate(data: any): string {
  const {
    clientName,
    clientCity,
    clientState,
    clientCep,
    consultantName,
    consultantPhone,
    createdAt,
    tariff,
    consumption,
    monthlyBill,
    systemPowerKwp,
    moduleQty,
    finalPrice: fp,
    paybackYears,
    company,
    equipment,
    cashPrice,
    cardInstallment,
    cardTotalPrice,
    financeInstallment,
    financeTotalPrice,
    expirationDate,
    trees,
    co2,
    roi,
    annualSavings,
  } = data;

  const f = (v: any) => {
    if (v == null || v === '') return '';
    const n = Number(v);
    if (isNaN(n)) return String(v);
    return n.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fmtBRL = (v: any) => (v && Number(v) ? `R$ ${f(v)}` : '—');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Proposta Comercial - ${clientName || ''}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; background: #f8fafc; line-height: 1.5; -webkit-font-smoothing: antialiased; }
  .page { max-width: 210mm; margin: 0 auto; padding: 40px 32px; background: #fff; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
  .text-muted { color: #64748b; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .card { background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; }
  .stat-value { font-size: 22px; font-weight: 800; }
  .stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
  @media print { body { background: #fff; } .page { max-width: none; padding: 20px; } .no-print { display: none; } }
</style>
${data.publicToken ? `
<script>
  (function() {
    const token = '${data.publicToken}';
    const track = (eventType, durationSeconds = 0) => {
      fetch('/proposals/public/' + token + '/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, durationSeconds })
      }).catch(() => {});
    };

    // 1. Send OPEN event immediately
    track('OPEN');

    // 2. Track when pricing section is viewed
    document.addEventListener('DOMContentLoaded', () => {
      const pricingEl = document.getElementById('investment-section');
      if (pricingEl && window.IntersectionObserver) {
        let startTime = 0;
        let isViewed = false;
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              if (!startTime) startTime = Date.now();
            } else {
              if (startTime && !isViewed) {
                const duration = Math.round((Date.now() - startTime) / 1000);
                if (duration > 2) { // Only track if they stayed for more than 2 seconds
                  track('VIEW_PRICING', duration);
                  isViewed = true; // send once per session
                  observer.disconnect();
                }
              }
            }
          });
        }, { threshold: 0.5 });
        observer.observe(pricingEl);
      }
    });
  })();
</script>
` : ''}
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #059669;">
    <div>
      <h1 style="font-size:28px;font-weight:900;color:#059669;letter-spacing:-0.02em;">PROPOSTA COMERCIAL</h1>
      <p style="color:#64748b;font-size:13px;margin-top:4px;">Sistema de Energia Solar Fotovoltaica</p>
    </div>
    <div style="text-align:right;">
      ${company?.logoUrl ? `<img src="${company.logoUrl}" style="max-height:60px;margin-bottom:8px;" />` : `<div style="font-size:22px;font-weight:900;color:#059669;">${company?.name || 'SolarOS'}</div>`}
      <div style="font-size:11px;color:#64748b;">Gerado em ${createdAt || ''}</div>
    </div>
  </div>

  <!-- CLIENT INFO -->
  <div style="display:flex;gap:24px;margin-bottom:24px;padding:16px 20px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;">
    <div style="flex:1;">
      <div class="stat-label">Cliente</div>
      <div style="font-size:16px;font-weight:700;">${clientName || ''}</div>
      ${clientCity ? `<div style="font-size:12px;color:#64748b;margin-top:2px;">${clientCity}${clientState ? ` - ${clientState}` : ''}${clientCep ? `, CEP ${clientCep}` : ''}</div>` : ''}
    </div>
    <div style="flex:1;">
      <div class="stat-label">Consultor</div>
      <div style="font-size:16px;font-weight:700;">${consultantName || '—'}</div>
      ${consultantPhone ? `<div style="font-size:12px;color:#64748b;">${consultantPhone}</div>` : ''}
    </div>
  </div>

  <!-- SYSTEM OVERVIEW -->
  <div class="grid-4">
    <div class="card"><div class="stat-label">Sistema</div><div class="stat-value">${systemPowerKwp ? `${Number(systemPowerKwp).toFixed(2)} kWp` : '—'}</div></div>
    <div class="card"><div class="stat-label">Módulos</div><div class="stat-value">${moduleQty || '—'}</div></div>
    <div class="card"><div class="stat-label">Consumo</div><div class="stat-value">${consumption ? `${Number(consumption).toFixed(0)} kWh` : '—'}</div></div>
    <div class="card"><div class="stat-label">Conta Atual</div><div class="stat-value">${monthlyBill ? fmtBRL(monthlyBill) : '—'}</div></div>
  </div>

  <!-- EQUIPMENT -->
  ${
    equipment?.length
      ? `
  <h2 style="font-size:16px;font-weight:800;margin-top:32px;margin-bottom:12px;">Equipamentos</h2>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <tr style="background:#f1f5f9;text-align:left;">
      <th style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">Tipo</th>
      <th style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">Marca</th>
      <th style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">Modelo</th>
      <th style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">Qtd</th>
      <th style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">Potência</th>
    </tr>
    ${equipment
      .map(
        (e: any) => `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-transform:capitalize;">${e.type}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${e.brand || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${e.model || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${e.quantity || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${e.power || '—'}</td>
    </tr>`,
      )
      .join('')}
  </table>`
      : ''
  }

  <!-- INVESTMENT -->
  <h2 id="investment-section" style="font-size:16px;font-weight:800;margin-top:32px;margin-bottom:12px;">Investimento</h2>
  <div style="display:flex;gap:16px;">
    <div style="flex:2;padding:20px;background:#f0fdf4;border-radius:12px;border:2px solid #059669;">
      <div class="stat-label">Valor Total</div>
      <div style="font-size:36px;font-weight:900;color:#059669;">${fmtBRL(fp)}</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">
        Payback estimado: ${paybackYears ? `${Number(paybackYears).toFixed(1)} anos` : '—'}
        ${roi ? ` | ROI: ${roi}% a.a.` : ''}
      </div>
    </div>
    <div style="flex:3;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div class="card">
        <div class="stat-label">À Vista (${company?.cashDiscount || 5}% desc.)</div>
        <div style="font-size:20px;font-weight:800;">${fmtBRL(cashPrice)}</div>
      </div>
      <div class="card">
        <div class="stat-label">Cartão (12x)</div>
        <div style="font-size:20px;font-weight:800;">${fmtBRL(cardInstallment)}</div>
        <div style="font-size:11px;color:#64748b;">Total: ${fmtBRL(cardTotalPrice)}</div>
      </div>
      <div class="card">
        <div class="stat-label">Financiamento (60x)</div>
        <div style="font-size:20px;font-weight:800;">${fmtBRL(financeInstallment)}</div>
        <div style="font-size:11px;color:#64748b;">Total: ${fmtBRL(financeTotalPrice)}</div>
      </div>
      <div class="card">
        <div class="stat-label">Economia Anual</div>
        <div style="font-size:20px;font-weight:800;color:#059669;">${fmtBRL(annualSavings)}</div>
        <div style="font-size:11px;color:#64748b;">${trees ? `${trees} árvores` : ''}${co2 ? ` | ${co2} tCO₂` : ''}</div>
      </div>
    </div>
  </div>

  <!-- ENVIRONMENTAL -->
  ${
    trees || co2
      ? `
  <hr>
  <div style="display:flex;gap:24px;justify-content:center;padding:16px;">
    ${trees ? `<div style="text-align:center;"><div style="font-size:32px;font-weight:900;color:#059669;">${trees}</div><div style="font-size:11px;color:#64748b;">Árvores Preservadas</div></div>` : ''}
    ${co2 ? `<div style="text-align:center;"><div style="font-size:32px;font-weight:900;color:#059669;">${co2}</div><div style="font-size:11px;color:#64748b;">Ton CO₂ Evitados</div></div>` : ''}
    <div style="text-align:center;"><div style="font-size:32px;font-weight:900;color:#059669;">${annualSavings ? fmtBRL(annualSavings) : '—'}</div><div style="font-size:11px;color:#64748b;">Economia Anual</div></div>
  </div>`
      : ''
  }

  <!-- VALIDITY -->
  <hr>
  <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b;">
    <span>Proposta válida até: <strong>${expirationDate || ''}</strong></span>
    <span>Elaborado por: <strong>${consultantName || 'SolarOS'}</strong></span>
  </div>

</div>
</body>
</html>`;
}
