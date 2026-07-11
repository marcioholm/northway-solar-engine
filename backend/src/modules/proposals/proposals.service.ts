import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from './entities/proposal.entity';
import { SolarEngineService } from '../solar-engine/solar-engine.service';
import { CreateProposalDto } from './dto/create-proposal.dto';

@Injectable()
export class ProposalsService {
    constructor(
        @InjectRepository(Proposal)
        private proposalsRepository: Repository<Proposal>,
        private solarEngineService: SolarEngineService,
    ) { }

    async create(companyId: string, userId: string, dto: CreateProposalDto) {
        const calculation = await this.solarEngineService.calculate(companyId, dto.consumption, dto.city);

        const proposal = this.proposalsRepository.create({
            companyId,
            createdBy: userId,
            clientName: dto.clientName,
            clientCep: dto.clientCep,
            clientCity: dto.city,
            consumptionKwh: dto.consumption,
            utility: dto.utility,
            tariff: dto.tariff,
            profile: dto.profile,
            leadId: dto.leadId,
            stage: 'proposal_sent',

            systemPowerKwp: calculation.system_power_kwp,
            moduleId: calculation.module.id,
            inverterId: calculation.inverter.id,
            moduleQty: calculation.module_qty,

            costModules: calculation.cost_modules,
            costInverter: calculation.cost_inverter,
            costLabor: calculation.cost_labor,
            costStructure: calculation.cost_structure,
            costTravel: calculation.cost_travel,

            subtotal: calculation.subtotal,
            marginPct: calculation.margin_pct,
            marginValue: calculation.margin_value,
            finalPrice: calculation.final_price,
            paybackYears: calculation.payback_years,
        });

        return this.proposalsRepository.save(proposal);
    }

    findByLead(leadId: string) {
        return this.proposalsRepository.find({
            where: { leadId },
            relations: ['module', 'inverter'],
        });
    }

    findAll(companyId: string) {
        return this.proposalsRepository.findBy({ companyId });
    }

    findOne(id: string) {
        return this.proposalsRepository.findOne({
            where: { id },
            relations: ['module', 'inverter', 'company']
        });
    }

    async generatePdf(id: string) {
        const proposal = await this.findOne(id);
        if (!proposal) throw new NotFoundException('Proposal not found');

        const date = new Date(proposal.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        const annualSavings = Number(proposal.finalPrice) / Number(proposal.paybackYears);
        const trees = Math.round(Number(proposal.systemPowerKwp) * 40);
        const co2 = (Number(proposal.systemPowerKwp) * 2.1).toFixed(1);
        const roi = (100 / Number(proposal.paybackYears)).toFixed(1);

        const expirationDate = new Date(proposal.createdAt);
        expirationDate.setDate(expirationDate.getDate() + 10);
        const expirationStr = expirationDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        const cashDiscount = Number(proposal.company?.cashDiscount || 5);
        const cardTax = Number(proposal.company?.cardTax || 15);
        const financeTax = Number(proposal.company?.financeTax || 20);

        const finalPrice = Number(proposal.finalPrice);
        const cashPrice = finalPrice * (1 - cashDiscount / 100);
        const cardTotalPrice = finalPrice * (1 + cardTax / 100);
        const cardInstallment = cardTotalPrice / 12;
        const financeTotalPrice = finalPrice * (1 + financeTax / 100);
        const financeInstallment = financeTotalPrice / 60;

        const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #0f172a; }
        @media print { body { background: white; } }
        .page { width: 210mm; min-height: 297mm; background: white; margin: 0 auto; position: relative; overflow: hidden; }
        .header { padding: 48px; display: flex; justify-content: space-between; align-items: flex-start; }
        .stats { padding: 16px 48px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .content { padding: 32px 48px; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { background: #f8fafc; padding: 16px 24px; font-size: 9px; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 0.2em; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .table td { padding: 20px 24px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
        .impact { background: #f0f9ff; border-radius: 16px; padding: 24px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e0f2fe; margin: 16px 48px; }
        .footer { position: absolute; bottom: 0; width: 100%; }
        .footer-bar { background: #0f172a; padding: 20px 48px; display: flex; justify-content: space-between; align-items: center; }
        .footer-line { height: 6px; background: #f20d0d; }
        .pill { display: inline-flex; align-items: center; gap: 8px; background: #d1fae5; padding: 4px 12px; border-radius: 999px; border: 1px solid #a7f3d0; font-size: 10px; font-weight: 900; color: #065f46; text-transform: uppercase; }
        .badge { font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 4px; }
        .value-lg { font-size: 30px; font-weight: 900; }
        .value-xl { font-size: 72px; font-weight: 900; letter-spacing: -0.02em; }
        .roi-box { background: #0f172a; border-radius: 24px; padding: 32px; color: white; display: flex; justify-content: space-between; align-items: center; margin: 32px 0; }
        .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 48px; }
        .payment-card { border: 2px solid #f1f5f9; border-radius: 24px; padding: 32px; }
        .hero-price { background: #059669; border-radius: 24px; padding: 40px; color: white; }
        .no-print { display: none; }
    </style>
</head>
<body>
    <div class="no-print" style="background:white;padding:24px;text-align:center;font-weight:700;font-size:12px;color:#64748b;letter-spacing:0.1em;">
        Visualização — Use Ctrl+P ou Cmd+P para salvar como PDF
    </div>

    <div class="page" style="page-break-after:always;">
        <div class="header">
            <div>
                <div style="height:56px;width:224px;border:2px dashed #e2e8f0;border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                    ${proposal.company?.logoUrl
                        ? `<img src="${proposal.company.logoUrl}" style="max-height:48px;max-width:100%;object-fit:contain;" />`
                        : `<span style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Espaço para Logo</span>`
                    }
                </div>
                <div style="margin-top:16px;">
                    <div class="badge">Cliente</div>
                    <div style="font-size:30px;font-weight:900;line-height:1.2;">${proposal.clientName}</div>
                    <div style="display:flex;gap:16px;margin-top:8px;font-size:12px;font-weight:500;color:#64748b;">
                        <span>${proposal.clientCity}</span>
                        <span>${date}</span>
                    </div>
                </div>
            </div>
            <div style="text-align:right;">
                <div style="color:#f20d0d;font-weight:900;font-size:20px;font-style:italic;">NorthWay<br><span style="font-size:9px;color:#94a3b8;font-style:normal;letter-spacing:0.2em;">Solar Engine™</span></div>
                <div style="background:#ecfdf5;border-right:4px solid #15803d;padding:20px;margin-top:16px;min-width:240px;text-align:right;">
                    <div class="badge" style="color:#047857;">Economia Anual Estimada</div>
                    <div style="font-size:36px;font-weight:900;color:#15803d;">R$ ${Math.round(annualSavings).toLocaleString('pt-BR')}</div>
                </div>
            </div>
        </div>

        <div class="stats">
            <div><div class="badge">Potência Sistema</div><div class="value-lg">${Number(proposal.systemPowerKwp).toFixed(1)} <span style="font-size:14px;color:#94a3b8;font-weight:700;">kWp</span></div></div>
            <div><div class="badge">Geração Mensal</div><div class="value-lg">${Math.round(Number(proposal.consumptionKwh))} <span style="font-size:14px;color:#94a3b8;font-weight:700;">kWh</span></div></div>
            <div style="border-left:1px solid #f1f5f9;padding-left:32px;"><div class="badge" style="color:#f20d0d;">Payback</div><div class="value-lg" style="color:#f20d0d;">${Number(proposal.paybackYears).toFixed(1)} <span style="font-size:14px;font-weight:700;">Anos</span></div></div>
        </div>

        <div class="content">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
                <div style="font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;">Configuração Técnica</div>
                <span class="pill">Estoque Reservado por 48h</span>
                <div style="flex:1;height:1px;background:#e2e8f0;"></div>
            </div>
            <table class="table">
                <thead><tr><th>Componente</th><th>Especificação</th><th style="text-align:center;">Qtd</th><th style="text-align:right;">Garantia</th></tr></thead>
                <tbody>
                    <tr><td style="font-weight:700;">Módulos Fotovoltaicos</td><td>${proposal.module?.brand} ${proposal.module?.model}</td><td style="text-align:center;font-weight:700;">${proposal.moduleQty}</td><td style="text-align:right;">25 anos</td></tr>
                    <tr><td style="font-weight:700;">Inversor</td><td>${proposal.inverter?.brand} ${proposal.inverter?.model}</td><td style="text-align:center;font-weight:700;">01</td><td style="text-align:right;">10 anos</td></tr>
                    <tr><td style="font-weight:700;">Estrutura Suporte</td><td>Alumínio Anodizado Reforçado</td><td style="text-align:center;font-weight:700;">01</td><td style="text-align:right;">12 anos</td></tr>
                </tbody>
            </table>
        </div>

        <div class="impact">
            <div><div style="font-size:20px;font-weight:700;color:#0c4a6e;margin-bottom:4px;">Impacto Ambiental</div><div style="font-size:12px;color:#0369a1;">Contribuição positiva nos próximos 25 anos.</div></div>
            <div style="display:flex;gap:64px;">
                <div><div style="font-size:28px;font-weight:900;color:#064e3b;">${trees}</div><div style="font-size:8px;font-weight:700;color:#047857;letter-spacing:0.2em;">ÁRVORES SALVAS</div></div>
                <div><div style="font-size:28px;font-weight:900;color:#0c4a6e;">${co2} t</div><div style="font-size:8px;font-weight:700;color:#0369a1;letter-spacing:0.2em;">CO₂ EVITADO</div></div>
            </div>
        </div>

        <div class="footer">
            <div style="padding:32px 48px;font-size:9px;color:#94a3b8;line-height:1.6;border-top:1px solid #f1f5f9;background:#fafafa;">
                Valores de geração baseados em índices radiométricos históricos. Projeto sujeito a validação técnica in loco e aprovação da concessionária.
            </div>
            <div class="footer-bar">
                <span style="font-size:10px;font-weight:700;letter-spacing:0.2em;color:#94a3b8;">${proposal.company?.name || 'NorthWay Solar'}</span>
                <span style="font-size:10px;font-weight:900;font-style:italic;color:#64748b;">DOC ID: NW-${proposal.id.substring(0, 8).toUpperCase()} | PÁGINA 1</span>
            </div>
            <div class="footer-line"></div>
        </div>
    </div>

    <div class="page">
        <div style="padding:48px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f1f5f9;">
            <div style="font-size:24px;font-weight:900;letter-spacing:-0.02em;">Investimento & Condições</div>
            <div style="color:#f20d0d;font-weight:900;font-size:18px;font-style:italic;">NorthWay <span style="color:#94a3b8;font-size:9px;font-style:normal;letter-spacing:0.2em;">Solar Engine™</span></div>
        </div>

        <div style="padding:48px;">
            <div class="hero-price">
                <div style="font-size:10px;font-weight:700;letter-spacing:0.3em;opacity:0.8;margin-bottom:8px;">INVESTIMENTO À VISTA</div>
                <div style="display:flex;align-items:baseline;gap:12px;">
                    <span style="font-size:30px;font-weight:700;">R$</span>
                    <span class="value-xl">${Math.round(cashPrice).toLocaleString('pt-BR')}</span>
                </div>
                <div style="margin-top:32px;display:inline-flex;align-items:center;gap:12px;background:rgba(255,255,255,0.2);padding:8px 16px;border-radius:999px;border:1px solid rgba(255,255,255,0.3);font-weight:700;font-size:14px;">Desconto exclusivo de ${cashDiscount}% aplicado</div>
            </div>

            <div class="payment-grid">
                <div class="payment-card">
                    <div style="font-size:20px;font-weight:900;margin-bottom:8px;">Cartão de Crédito</div>
                    <div style="font-size:12px;color:#64748b;margin-bottom:32px;">Parcele com taxas reduzidas.</div>
                    <div style="display:flex;justify-content:space-between;align-items:baseline;">
                        <span style="font-weight:700;color:#94a3b8;">12x de</span>
                        <span style="font-size:30px;font-weight:900;color:#0284c7;">R$ ${Math.round(cardInstallment).toLocaleString('pt-BR')}</span>
                    </div>
                    <div style="height:1px;background:#e2e8f0;margin:16px 0;"></div>
                    <div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:0.1em;">Total: R$ ${Math.round(cardTotalPrice).toLocaleString('pt-BR')}</div>
                </div>
                <div class="payment-card">
                    <div style="font-size:20px;font-weight:900;margin-bottom:8px;">Financiamento Solar</div>
                    <div style="font-size:12px;color:#64748b;margin-bottom:32px;">Em até 60 meses com carência de 90 dias.</div>
                    <div style="display:flex;justify-content:space-between;align-items:baseline;">
                        <span style="font-weight:700;color:#94a3b8;">60x de</span>
                        <span style="font-size:30px;font-weight:900;color:#059669;">R$ ${Math.round(financeInstallment).toLocaleString('pt-BR')}</span>
                    </div>
                    <div style="height:1px;background:#e2e8f0;margin:16px 0;"></div>
                    <div style="font-size:10px;color:#047857;font-weight:700;"><span style="font-style:italic;">Mediante aprovação bancária</span></div>
                </div>
            </div>

            <div class="roi-box">
                <div><div style="font-size:14px;font-weight:700;letter-spacing:0.1em;color:#94a3b8;margin-bottom:8px;">RETORNO SOBRE INVESTIMENTO</div><div style="font-size:36px;font-weight:900;">${roi}% <span style="font-size:18px;font-weight:700;color:#34d399;">ao ano</span></div></div>
                <div style="width:1px;height:64px;background:#334155;"></div>
                <div style="text-align:right;"><div style="font-size:14px;font-weight:700;letter-spacing:0.1em;color:#94a3b8;margin-bottom:8px;">VALIDADE</div><div style="font-size:30px;font-weight:900;color:#f20d0d;">${expirationStr}</div></div>
            </div>
        </div>

        <div class="footer">
            <div style="padding:32px 48px;font-size:9px;color:#94a3b8;line-height:1.6;border-top:1px solid #f1f5f9;background:#fafafa;">
                Taxas sujeitas a variação do CDI/Selic. Parcelas podem variar conforme bandeira do cartão. Desconto à vista aplicado sobre o valor final do projeto.
            </div>
            <div class="footer-bar">
                <span style="font-size:10px;font-weight:700;letter-spacing:0.2em;color:#94a3b8;">www.northwaysolar.com.br</span>
                <span style="font-size:10px;font-weight:900;font-style:italic;color:#64748b;">DOC ID: NW-${proposal.id.substring(0, 8).toUpperCase()} | PÁGINA 2</span>
            </div>
            <div class="footer-line"></div>
        </div>
    </div>
</body>
</html>`;

        return { html, filename: `proposal-${id}.html` };
    }
}
