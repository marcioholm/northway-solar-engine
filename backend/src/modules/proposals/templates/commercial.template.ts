export interface CommercialTemplateData {
  clientName: string;
  clientCity?: string;
  clientState?: string;
  consultantName?: string;
  consultantPhone?: string;
  createdAt: string;
  expirationDate: string;
  publicToken: string;
  consumptionKwh?: number;
  systemPowerKwp?: number;
  moduleQty?: number;
  generationMonthlyKwh?: number;
  finalPrice: number;
  paybackYears?: number;
  annualSavings?: number;
  equipment: Array<{
    type: string;
    brand?: string;
    model?: string;
    quantity?: number;
    power?: string;
  }>;
  company: {
    name?: string;
    logoUrl?: string;
    cashDiscount?: number;
    cardTax?: number;
    financeTax?: number;
  };
  settings: {
    template: 'classico' | 'moderno' | 'minimalista';
    primaryColor: string;
    secondaryColor: string;
    coverImageUrl?: string;
    aboutText?: string;
    aboutImageUrl?: string;
    stats?: Array<{ value: string; label: string }>;
    partnerLogos?: string[];
    brandLogos?: string[];
    serviceAreaText?: string;
    includedItems?: string[];
    warrantiesText?: string;
    exclusionsText?: string;
    notesText?: string;
    acceptanceText?: string;
    contact?: {
      address?: string;
      phone?: string;
      whatsapp?: string;
      website?: string;
      instagram?: string;
    };
    sectionsEnabled?: {
      cover?: boolean;
      about?: boolean;
      stats?: boolean;
      technical?: boolean;
      equipment?: boolean;
      financial?: boolean;
      kit?: boolean;
      warranties?: boolean;
      partners?: boolean;
      contact?: boolean;
    };
  };
  payment?: {
    cashDiscount?: number;
    cashPrice?: number;
    cardTax?: number;
    cardInstallments?: number;
    cardInstallment?: number;
    cardTotalPrice?: number;
    financeTax?: number;
    financeInstallments?: number;
    financeInstallment?: number;
    financeTotalPrice?: number;
  };
}

export function getContrastColor(hexColor: string): '#ffffff' | '#0f172a' {
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

function escapeHtml(str?: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
): string {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthlyValues = months.map(() => Math.round(avgGenerationKwh));
  const maxVal = Math.max(...monthlyValues, consumptionKwh || 0, 100) * 1.25;

  const width = 640;
  const height = 150;
  const chartHeight = 110;
  const barWidth = 32;
  const gap = (width - barWidth * 12) / 13;

  const consumptionY = Math.round(chartHeight - (consumptionKwh / maxVal) * chartHeight);

  let barsSvg = '';
  monthlyValues.forEach((val, i) => {
    const x = Math.round(gap + i * (barWidth + gap));
    const h = Math.max(4, Math.round((val / maxVal) * chartHeight));
    const y = chartHeight - h;

    barsSvg += `
      <g>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="3" fill="${primaryColor}" opacity="0.88" />
        <text x="${x + barWidth / 2}" y="${y - 4}" text-anchor="middle" font-size="9" font-weight="600" fill="#475569">${val}</text>
        <text x="${x + barWidth / 2}" y="${chartHeight + 14}" text-anchor="middle" font-size="9.5" fill="#64748b">${months[i]}</text>
      </g>
    `;
  });

  const consumptionLineSvg =
    consumptionKwh > 0 && consumptionY >= 0 && consumptionY <= chartHeight
      ? `
      <line x1="0" y1="${consumptionY}" x2="${width}" y2="${consumptionY}" stroke="${secondaryColor}" stroke-dasharray="4,3" stroke-width="1.5" />
      <text x="${width - 4}" y="${consumptionY - 5}" text-anchor="end" font-size="9" font-weight="700" fill="${secondaryColor}">
        Consumo médio: ${Math.round(consumptionKwh)} kWh
      </text>
    `
      : '';

  return `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;font-family:inherit;">
      <line x1="0" y1="${chartHeight}" x2="${width}" y2="${chartHeight}" stroke="#cbd5e1" stroke-width="1" />
      ${barsSvg}
      ${consumptionLineSvg}
    </svg>
  `;
}

export function commercialTemplate(data: CommercialTemplateData): string {
  const {
    clientName,
    clientCity,
    clientState,
    consultantName,
    consultantPhone,
    createdAt,
    expirationDate,
    publicToken,
    consumptionKwh = 0,
    systemPowerKwp = 0,
    moduleQty = 0,
    generationMonthlyKwh,
    finalPrice,
    paybackYears = 0,
    annualSavings = paybackYears > 0 ? finalPrice / paybackYears : 0,
    equipment = [],
    company,
    settings,
    payment,
  } = data;

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

  const hasCash = payment?.cashPrice != null && payment?.cashDiscount != null;
  const hasCard =
    payment?.cardInstallment != null &&
    payment?.cardInstallments != null &&
    payment.cardInstallments > 0;
  const hasFinance =
    payment?.financeInstallment != null &&
    payment?.financeInstallments != null &&
    payment.financeInstallments > 0;

  // Separate modules and inverters
  const modules = equipment.filter(e => e.type === 'module');
  const inverters = equipment.filter(e => e.type === 'inverter');

  // Contact items for footer
  const contact = settings.contact || {};
  const contactParts: string[] = [];
  if (contact.phone) contactParts.push(`📞 ${escapeHtml(contact.phone)}`);
  if (contact.whatsapp) contactParts.push(`💬 WhatsApp: ${escapeHtml(contact.whatsapp)}`);
  if (contact.website) contactParts.push(`🌐 ${escapeHtml(contact.website)}`);
  if (contact.instagram) contactParts.push(`📷 ${escapeHtml(contact.instagram)}`);
  if (contact.address) contactParts.push(`📍 ${escapeHtml(contact.address)}`);
  const contactFooterText = contactParts.length
    ? contactParts.join('  ·  ')
    : escapeHtml(company.name || 'SolarOS');

  const renderFooter = (pageNumber: number, totalPages: number) => `
    <footer class="doc-footer">
      <div class="footer-contacts">${contactFooterText}</div>
      <div class="footer-meta">
        <span>Código: <strong>${escapeHtml(publicToken || 'PROPOSTA')}</strong></span>
        <span>Página ${pageNumber} de ${totalPages}</span>
      </div>
    </footer>
  `;

  // Determine which pages exist
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

  let curPage = 1;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Proposta Comercial - ${escapeHtml(clientName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      background: #f1f5f9;
      color: #1e293b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* A4 page layout */
    .page-a4 {
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      page-break-after: always;
      break-after: page;
      position: relative;
      box-sizing: border-box;
      overflow: hidden;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 16mm 18mm 12mm 18mm;
    }

    .page-a4:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }

    .page-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .doc-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: #64748b;
    }
    .footer-contacts {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 72%;
    }
    .footer-meta {
      display: flex;
      gap: 10px;
      white-space: nowrap;
    }

    /* Section titles */
    .section-header {
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title {
      font-size: 13pt;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: #0f172a;
      text-transform: uppercase;
    }
    .section-badge {
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    /* Template Styles */
    ${
      template === 'classico'
        ? `
      .theme-band { background: ${primaryColor}; color: ${primaryContrast}; }
      .theme-border { border-left: 4px solid ${primaryColor}; padding-left: 10px; }
      .theme-card { border: 1px solid #cbd5e1; border-top: 3px solid ${primaryColor}; background: #ffffff; padding: 12px; border-radius: 2px; }
      .section-title { border-bottom: 2px solid ${primaryColor}; padding-bottom: 4px; width: 100%; }
      .theme-highlight { background: #f8fafc; border: 1px solid #e2e8f0; }
    `
        : template === 'minimalista'
        ? `
      .theme-band { background: #0f172a; color: #ffffff; }
      .theme-border { border-left: 2px solid #0f172a; padding-left: 12px; }
      .theme-card { border: 1px solid #e2e8f0; background: #fafafa; padding: 14px; border-radius: 0px; }
      .section-title { letter-spacing: 0.06em; font-weight: 900; }
      .theme-highlight { background: #ffffff; border: 1px solid #0f172a; }
    `
        : `
      /* Moderno (Padrão) */
      .theme-band { background: ${primaryColor}; color: ${primaryContrast}; border-radius: 12px; }
      .theme-border { border-left: 4px solid ${secondaryColor}; padding-left: 10px; }
      .theme-card { border: 1px solid #e2e8f0; background: #ffffff; padding: 14px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
      .section-badge { background: ${secondaryColor}; color: ${secondaryContrast}; }
      .theme-highlight { background: #f0fdfa; border: 1.5px solid ${primaryColor}; border-radius: 12px; }
    `
    }

    @media screen {
      body {
        padding: 30px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
      }
      .page-a4 {
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
    }

    @media print {
      body {
        background: transparent;
        padding: 0;
      }
      .page-a4 {
        box-shadow: none;
        margin: 0;
        width: 210mm;
        height: 297mm;
      }
    }
  </style>
</head>
<body>

  <!-- ================= PÁGINA 1: CAPA ================= -->
  ${
    hasCover
      ? `
  <div class="page-a4" style="${
    template === 'classico'
      ? 'padding: 0; justify-content: space-between;'
      : template === 'minimalista'
      ? 'padding: 24mm 20mm 14mm 20mm;'
      : 'padding: 16mm 18mm 12mm 18mm;'
  }">
    ${
      template === 'classico'
        ? `
      <!-- Capa Clássica: Faixa superior e imagem em destaque -->
      <div style="width: 100%; height: 38%; position: relative; background: ${primaryColor}; overflow: hidden;">
        ${
          settings.coverImageUrl
            ? `<img src="${settings.coverImageUrl}" alt="Capa" onerror="this.style.display='none'" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;" />`
            : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: ${primaryColor}; color: ${primaryContrast}; font-size: 24pt; font-weight: 900;">PROPOSTA COMERCIAL</div>`
        }
        <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 10px; background: ${secondaryColor};"></div>
      </div>

      <div style="padding: 16mm 18mm; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            ${
              company.logoUrl
                ? `<img src="${company.logoUrl}" alt="${escapeHtml(company.name)}" onerror="this.style.display='none'" style="max-height: 55px; max-width: 200px; object-fit: contain;" />`
                : `<h2 style="font-size: 20pt; font-weight: 900; color: ${primaryColor};">${escapeHtml(company.name || 'SolarOS')}</h2>`
            }
          </div>
          <div style="text-align: right; font-size: 9pt; color: #64748b;">
            <div>Emissão: <strong>${escapeHtml(createdAt)}</strong></div>
            <div>Validade: <strong>${escapeHtml(expirationDate)}</strong></div>
          </div>
        </div>

        <div style="margin: 24px 0;">
          <div style="font-size: 11pt; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Proposta Comercial</div>
          <h1 style="font-size: 26pt; font-weight: 900; line-height: 1.15; color: #0f172a; margin-bottom: 12px;">Sistema Solar Fotovoltaico</h1>
          <p style="font-size: 13pt; color: #475569;">Geração de energia limpa, redução de custos e sustentabilidade.</p>
        </div>

        <div style="background: #f8fafc; border-top: 3px solid ${primaryColor}; border-bottom: 1px solid #cbd5e1; padding: 18px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Apresentado para</div>
            <div style="font-size: 14pt; font-weight: 800; color: #0f172a; margin-top: 2px;">${escapeHtml(clientName)}</div>
            ${clientCity ? `<div style="font-size: 10pt; color: #64748b; margin-top: 2px;">${escapeHtml(clientCity)}${clientState ? ` - ${escapeHtml(clientState)}` : ''}</div>` : ''}
          </div>
          <div>
            <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Consultor Responsável</div>
            <div style="font-size: 12pt; font-weight: 700; color: #0f172a; margin-top: 2px;">${escapeHtml(consultantName || 'Equipe Comercial')}</div>
            ${consultantPhone ? `<div style="font-size: 10pt; color: #64748b; margin-top: 2px;">${escapeHtml(consultantPhone)}</div>` : ''}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 8.5pt; color: #64748b;">
          <div>${contactFooterText}</div>
          <div>Cód: <strong>${escapeHtml(publicToken || 'PROPOSTA')}</strong></div>
        </div>
      </div>
      `
        : template === 'minimalista'
        ? `
      <!-- Capa Minimalista: Tipografia marcante e respiro amplo -->
      <div class="page-content" style="justify-content: space-between;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            ${
              company.logoUrl
                ? `<img src="${company.logoUrl}" alt="${escapeHtml(company.name)}" onerror="this.style.display='none'" style="max-height: 48px; max-width: 180px; object-fit: contain;" />`
                : `<span style="font-size: 16pt; font-weight: 900; letter-spacing: -0.02em;">${escapeHtml(company.name || 'SolarOS')}</span>`
            }
          </div>
          <div style="font-size: 8.5pt; color: #94a3b8; text-align: right; line-height: 1.5;">
            <div>${escapeHtml(createdAt)}</div>
            <div>Ref: ${escapeHtml(publicToken?.slice(0, 8) || 'PROP')}</div>
          </div>
        </div>

        <div style="margin: 40px 0;">
          <div style="width: 40px; height: 2px; background: #0f172a; margin-bottom: 24px;"></div>
          <h1 style="font-size: 32pt; font-weight: 900; line-height: 1.1; letter-spacing: -0.03em; color: #0f172a; margin-bottom: 16px;">
            PROPOSTA<br />COMERCIAL
          </h1>
          <div style="font-size: 12pt; font-weight: 500; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">
            Energia Solar Fotovoltaica
          </div>
        </div>

        <div style="border-top: 1px solid #0f172a; padding-top: 24px; display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px;">
          <div>
            <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.08em; margin-bottom: 4px;">Cliente</div>
            <div style="font-size: 15pt; font-weight: 800; color: #0f172a;">${escapeHtml(clientName)}</div>
            ${clientCity ? `<div style="font-size: 9.5pt; color: #64748b; margin-top: 2px;">${escapeHtml(clientCity)}${clientState ? ` / ${escapeHtml(clientState)}` : ''}</div>` : ''}
          </div>
          <div>
            <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.08em; margin-bottom: 4px;">Atendimento</div>
            <div style="font-size: 11pt; font-weight: 700; color: #0f172a;">${escapeHtml(consultantName || 'Equipe Especializada')}</div>
            <div style="font-size: 8.5pt; color: #64748b; margin-top: 4px;">Válido até ${escapeHtml(expirationDate)}</div>
          </div>
        </div>
      </div>
      ${renderFooter(curPage++, totalPages)}
      `
        : `
      <!-- Capa Moderna (Padrão): Cartões arredondados e banner visual -->
      <div class="page-content" style="justify-content: space-between;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            ${
              company.logoUrl
                ? `<img src="${company.logoUrl}" alt="${escapeHtml(company.name)}" onerror="this.style.display='none'" style="max-height: 50px; max-width: 190px; object-fit: contain;" />`
                : `<span style="font-size: 20pt; font-weight: 900; color: ${primaryColor};">${escapeHtml(company.name || 'SolarOS')}</span>`
            }
          </div>
          <div style="background: rgba(15, 118, 110, 0.08); padding: 6px 14px; border-radius: 20px; font-size: 8.5pt; font-weight: 700; color: ${primaryColor};">
            PROPOSTA COMERCIAL
          </div>
        </div>

        <!-- Banner com imagem ou gradiente -->
        <div style="height: 190px; border-radius: 16px; overflow: hidden; position: relative; background: linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%); margin-bottom: 20px;">
          ${
            settings.coverImageUrl
              ? `<img src="${settings.coverImageUrl}" alt="Capa" onerror="this.style.display='none'" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.65;" />`
              : ''
          }
          <div style="position: absolute; inset: 0; padding: 24px; display: flex; flex-direction: column; justify-content: flex-end; color: #ffffff;">
            <div style="font-size: 10pt; font-weight: 700; color: ${secondaryColor}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
              Transição Energética
            </div>
            <h1 style="font-size: 22pt; font-weight: 900; line-height: 1.2;">Engenharia Solar de Alta Performance</h1>
          </div>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.03); display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Cliente</div>
            <div style="font-size: 15pt; font-weight: 800; color: #0f172a; margin-top: 2px;">${escapeHtml(clientName)}</div>
            ${clientCity ? `<div style="font-size: 10pt; color: #64748b; margin-top: 2px;">📍 ${escapeHtml(clientCity)}${clientState ? ` - ${escapeHtml(clientState)}` : ''}</div>` : ''}
          </div>
          <div style="border-left: 1px solid #f1f5f9; padding-left: 16px;">
            <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Consultoria Técnica</div>
            <div style="font-size: 11pt; font-weight: 700; color: #0f172a; margin-top: 2px;">${escapeHtml(consultantName || 'Especialista Solar')}</div>
            <div style="font-size: 8.5pt; color: #64748b; margin-top: 4px;">Validade: <strong>${escapeHtml(expirationDate)}</strong></div>
          </div>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 8.5pt; color: #64748b;">
          <span>Código de Acompanhamento: <strong>${escapeHtml(publicToken || 'PROPOSTA')}</strong></span>
          <span>Data de Emissão: <strong>${escapeHtml(createdAt)}</strong></span>
        </div>
      </div>
      ${renderFooter(curPage++, totalPages)}
      `
    }
  </div>
  `
      : ''
  }

  <!-- ================= PÁGINA 2: QUEM SOMOS & PARCEIROS ================= -->
  ${
    hasAboutSection
      ? `
  <div class="page-a4">
    <div class="page-content">
      <div class="section-header">
        <h2 class="section-title">Sobre a Nossa Empresa</h2>
      </div>

      <!-- Sobre nós: Texto + Imagem -->
      <div style="display: grid; grid-template-columns: ${settings.aboutImageUrl ? '1.4fr 1fr' : '1fr'}; gap: 16px; margin-bottom: 16px; align-items: start;">
        <div style="font-size: 9.5pt; color: #334155; line-height: 1.55;">
          ${escapeHtml(settings.aboutText || '')}

          ${
            settings.serviceAreaText
              ? `
            <div style="margin-top: 12px; padding: 10px 14px; background: #f8fafc; border-left: 3px solid ${primaryColor}; font-size: 8.5pt; color: #475569;">
              <strong>Área de Atendimento:</strong> ${escapeHtml(settings.serviceAreaText)}
            </div>`
              : ''
          }
        </div>
        ${
          settings.aboutImageUrl
            ? `
        <div style="height: 150px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
          <img src="${settings.aboutImageUrl}" alt="Sobre nós" onerror="this.style.display='none'" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>`
            : ''
        }
      </div>

      <!-- Estatísticas / Credenciais -->
      ${
        sec.stats !== false && settings.stats && settings.stats.length > 0
          ? `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 8px;">Nossos Números</div>
        <div style="display: grid; grid-template-columns: repeat(${Math.min(settings.stats.length, 4)}, 1fr); gap: 10px;">
          ${settings.stats
            .slice(0, 4)
            .map(
              s => `
            <div class="theme-card" style="text-align: center; padding: 12px 8px;">
              <div style="font-size: 18pt; font-weight: 900; color: ${primaryColor}; line-height: 1.1;">${escapeHtml(s.value)}</div>
              <div style="font-size: 7.5pt; font-weight: 600; text-transform: uppercase; color: #64748b; margin-top: 4px;">${escapeHtml(s.label)}</div>
            </div>`,
            )
            .join('')}
        </div>
      </div>`
          : ''
      }

      <!-- Marcas e Fabricantes de Equipamentos -->
      ${
        sec.partners !== false && settings.brandLogos && settings.brandLogos.length > 0
          ? `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 8px;">Tecnologia & Fabricantes Homologados</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${settings.brandLogos
            .slice(0, 12)
            .map(
              logo => `
            <div style="width: 78px; height: 42px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center; background: #ffffff;">
              <img src="${logo}" alt="Marca" onerror="this.style.display='none'" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
            </div>`,
            )
            .join('')}
        </div>
      </div>`
          : ''
      }

      <!-- Parceiros Financeiros e Institucionais -->
      ${
        sec.partners !== false && settings.partnerLogos && settings.partnerLogos.length > 0
          ? `
      <div style="margin-bottom: 12px;">
        <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 8px;">Parceiros e Linhas de Financiamento</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${settings.partnerLogos
            .slice(0, 12)
            .map(
              logo => `
            <div style="width: 78px; height: 42px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center; background: #ffffff;">
              <img src="${logo}" alt="Parceiro" onerror="this.style.display='none'" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
            </div>`,
            )
            .join('')}
        </div>
      </div>`
          : ''
      }
    </div>
    ${renderFooter(curPage++, totalPages)}
  </div>
  `
      : ''
  }

  <!-- ================= PÁGINA 3: SISTEMA, GERAÇÃO & KIT ================= -->
  ${
    hasSystemSection
      ? `
  <div class="page-a4">
    <div class="page-content">
      <div class="section-header">
        <h2 class="section-title">Engenharia do Sistema & Geração</h2>
      </div>

      <!-- Destaques Técnicos -->
      <div style="display: grid; grid-template-columns: repeat(${1 + (moduleQty > 0 ? 1 : 0) + (generationMonthlyKwh && generationMonthlyKwh > 0 ? 1 : 0) + (consumptionKwh > 0 ? 1 : 0)}, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px;">
        <div class="theme-card">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Potência do Sistema</div>
          <div style="font-size: 16pt; font-weight: 900; color: ${primaryColor}; margin-top: 2px;">${fmtNumber(systemPowerKwp, 2)} kWp</div>
        </div>
        ${
          moduleQty > 0
            ? `
        <div class="theme-card">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Módulos Solares</div>
          <div style="font-size: 16pt; font-weight: 900; color: #0f172a; margin-top: 2px;">${moduleQty} un</div>
        </div>`
            : ''
        }
        ${
          generationMonthlyKwh && generationMonthlyKwh > 0
            ? `
        <div class="theme-card">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Geração Média</div>
          <div style="font-size: 16pt; font-weight: 900; color: #0f172a; margin-top: 2px;">${fmtNumber(generationMonthlyKwh)} kWh/mês</div>
        </div>`
            : ''
        }
        ${
          consumptionKwh > 0
            ? `
        <div class="theme-card">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Consumo Atual</div>
          <div style="font-size: 16pt; font-weight: 900; color: #0f172a; margin-top: 2px;">${fmtNumber(consumptionKwh)} kWh</div>
        </div>`
            : ''
        }
      </div>

      <!-- Gráfico de Geração Mensal -->
      ${
        generationMonthlyKwh && generationMonthlyKwh > 0
          ? `
      <div class="theme-card" style="margin-bottom: 16px; padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-size: 8.5pt; font-weight: 800; text-transform: uppercase; color: #0f172a;">Geração Mensal Estimada (kWh)</div>
          <div style="font-size: 7.5pt; color: #64748b;">Média mensal estimada com base no projeto</div>
        </div>
        ${renderMonthlyChartSvg(generationMonthlyKwh, consumptionKwh, primaryColor, secondaryColor)}
      </div>`
          : ''
      }

      <!-- Equipamentos do Sistema (Módulos e Inversores) -->
      ${
        sec.equipment !== false && equipment.length > 0
          ? `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 6px;">Equipamentos Principais</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 6px 10px;">Item</th>
              <th style="padding: 6px 10px;">Marca</th>
              <th style="padding: 6px 10px;">Modelo</th>
              <th style="padding: 6px 10px; text-align: center;">Qtd</th>
              <th style="padding: 6px 10px; text-align: right;">Potência</th>
            </tr>
          </thead>
          <tbody>
            ${equipment
              .map(
                (eq, idx) => `
              <tr style="border-bottom: 1px solid #f1f5f9; ${idx % 2 === 1 ? 'background: #fafafa;' : ''}">
                <td style="padding: 6px 10px; font-weight: 700; text-transform: capitalize;">${eq.type === 'module' ? 'Módulo Fotovoltaico' : eq.type === 'inverter' ? 'Inversor / Microinversor' : escapeHtml(eq.type)}</td>
                <td style="padding: 6px 10px;">${escapeHtml(eq.brand || '—')}</td>
                <td style="padding: 6px 10px;">${escapeHtml(eq.model || '—')}</td>
                <td style="padding: 6px 10px; text-align: center;">${eq.quantity || '—'}</td>
                <td style="padding: 6px 10px; text-align: right;">${escapeHtml(eq.power || '—')}</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>`
          : ''
      }

      <!-- Itens Inclusos no Kit e Escopo de Serviço -->
      ${
        sec.kit !== false && settings.includedItems && settings.includedItems.length > 0
          ? `
      <div>
        <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 6px;">Escopo de Fornecimento & Serviços Inclusos</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          ${settings.includedItems
            .map(
              item => `
            <div style="display: flex; align-items: center; gap: 6px; font-size: 8pt; color: #334155; padding: 4px 8px; background: #f8fafc; border-radius: 4px; border: 1px solid #e2e8f0;">
              <span style="color: ${primaryColor}; font-weight: 900;">✓</span>
              <span>${escapeHtml(item)}</span>
            </div>`,
            )
            .join('')}
        </div>
      </div>`
          : ''
      }
    </div>
    ${renderFooter(curPage++, totalPages)}
  </div>
  `
      : ''
  }

  <!-- ================= PÁGINA 4: INVESTIMENTO, GARANTIAS & ACEITE ================= -->
  ${
    hasFinancialSection
      ? `
  <div class="page-a4">
    <div class="page-content">
      <div class="section-header">
        <h2 class="section-title">Investimento & Condições Comerciais</h2>
      </div>

      <!-- Card Principal de Investimento -->
      <div style="display: grid; grid-template-columns: repeat(${1 + (hasCash ? 1 : 0) + (hasCard ? 1 : 0) + (hasFinance ? 1 : 0)}, minmax(0, 1fr)); gap: 8px; margin-bottom: 14px;">
        <div class="theme-card" style="border-top: 3px solid ${primaryColor};">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Valor Total do Sistema</div>
          <div style="font-size: 16pt; font-weight: 900; color: ${primaryColor}; margin-top: 2px;">${fmtCurrency(finalPrice)}</div>
          <div style="font-size: 7pt; color: #64748b; margin-top: 2px;">Equipamentos + Instalação Completa</div>
        </div>

        ${
          hasCash
            ? `
        <div class="theme-card">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">À Vista (${payment!.cashDiscount}% desc.)</div>
          <div style="font-size: 12.5pt; font-weight: 800; color: #0f172a; margin-top: 2px;">${fmtCurrency(payment!.cashPrice)}</div>
          <div style="font-size: 7pt; color: #16a34a; font-weight: 600; margin-top: 2px;">Economia imediata</div>
        </div>`
            : ''
        }

        ${
          hasCard
            ? `
        <div class="theme-card">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Cartão de Crédito</div>
          <div style="font-size: 12.5pt; font-weight: 800; color: #0f172a; margin-top: 2px;">${payment!.cardInstallments}x ${fmtCurrency(payment!.cardInstallment)}</div>
          <div style="font-size: 7pt; color: #64748b; margin-top: 2px;">Total: ${fmtCurrency(payment!.cardTotalPrice)}</div>
        </div>`
            : ''
        }

        ${
          hasFinance
            ? `
        <div class="theme-card">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Financiamento Solar</div>
          <div style="font-size: 12.5pt; font-weight: 800; color: #0f172a; margin-top: 2px;">${payment!.financeInstallments}x ${fmtCurrency(payment!.financeInstallment)}</div>
          <div style="font-size: 7pt; color: #64748b; margin-top: 2px;">Total: ${fmtCurrency(payment!.financeTotalPrice)}</div>
        </div>`
            : ''
        }
      </div>

      <!-- Estimativa de Retorno & Premissas -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: center;">
        <div>
          <div style="display: flex; gap: 16px;">
            <div>
              <span style="font-size: 7.5pt; text-transform: uppercase; color: #64748b; font-weight: 700;">Payback Estimado:</span>
              <span style="font-size: 10.5pt; font-weight: 800; color: #0f172a; margin-left: 4px;">${paybackYears ? `${fmtNumber(paybackYears, 1)} anos` : '—'}</span>
            </div>
            <div>
              <span style="font-size: 7.5pt; text-transform: uppercase; color: #64748b; font-weight: 700;">Economia Anual Estimada:</span>
              <span style="font-size: 10.5pt; font-weight: 800; color: #16a34a; margin-left: 4px;">${fmtCurrency(annualSavings)}</span>
            </div>
          </div>
        </div>
        <div style="font-size: 7pt; color: #64748b; line-height: 1.35; border-left: 1px solid #cbd5e1; padding-left: 10px;">
          * <strong>Premissas da Estimativa:</strong> Economia estimada calculada como 90% da conta média informada, sem considerar reajuste tarifário, degradação dos módulos, custo mínimo de disponibilidade ou regras de compensação (Fio B).
        </div>
      </div>

      <!-- Garantias, Exclusões e Observações -->
      ${
        sec.warranties !== false &&
        (settings.warrantiesText || settings.exclusionsText || settings.notesText)
          ? `
      <div style="margin-bottom: 12px;">
        <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 6px;">Garantias & Condições Gerais</div>
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 7.5pt; color: #334155; line-height: 1.4;">
          ${
            settings.warrantiesText
              ? `<div style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 3px solid #16a34a; padding: 6px 10px; border-radius: 4px;"><strong>Garantias:</strong> ${escapeHtml(settings.warrantiesText)}</div>`
              : ''
          }
          ${
            settings.exclusionsText
              ? `<div style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 3px solid #f59e0b; padding: 6px 10px; border-radius: 4px;"><strong>Exclusões:</strong> ${escapeHtml(settings.exclusionsText)}</div>`
              : ''
          }
          ${
            settings.notesText
              ? `<div style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 3px solid #64748b; padding: 6px 10px; border-radius: 4px;"><strong>Observações:</strong> ${escapeHtml(settings.notesText)}</div>`
              : ''
          }
        </div>
      </div>`
          : ''
      }

      <!-- Termo de Aceite Comercial & Assinaturas -->
      <div style="border: 1px dashed #cbd5e1; background: #fafafa; border-radius: 6px; padding: 10px 14px; margin-top: auto;">
        <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; margin-bottom: 4px;">Termo de Aceite Comercial</div>
        <p style="font-size: 7pt; color: #64748b; line-height: 1.35; margin-bottom: 16px;">
          ${escapeHtml(settings.acceptanceText || 'Declaro que li e estou de acordo com o dimensionamento técnico, valores e condições comerciais apresentadas nesta proposta, autorizando a empresa a dar início aos trâmites de engenharia e homologação.')}
          Proposta válida até <strong>${escapeHtml(expirationDate)}</strong>.
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 14px;">
          <div style="text-align: center;">
            <div style="border-top: 1px solid #94a3b8; padding-top: 4px;">
              <div style="font-size: 8pt; font-weight: 700; color: #0f172a;">${escapeHtml(clientName)}</div>
              <div style="font-size: 7pt; color: #64748b;">Assinatura do Cliente</div>
            </div>
          </div>
          <div style="text-align: center;">
            <div style="border-top: 1px solid #94a3b8; padding-top: 4px;">
              <div style="font-size: 8pt; font-weight: 700; color: #0f172a;">${escapeHtml(consultantName || company.name || 'Responsável Comercial')}</div>
              <div style="font-size: 7pt; color: #64748b;">${escapeHtml(company.name || 'SolarOS')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${renderFooter(curPage++, totalPages)}
  </div>
  `
      : ''
  }

</body>
</html>`;
}
