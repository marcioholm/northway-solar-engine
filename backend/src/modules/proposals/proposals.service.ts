import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as puppeteer from 'puppeteer';
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
        // 1. Calculate using Solar Engine
        const calculation = await this.solarEngineService.calculate(companyId, dto.consumption, dto.city);

        // 2. Map calculation to Proposal entity
        const proposal = this.proposalsRepository.create({
            companyId,
            createdBy: userId,
            clientName: dto.clientName,
            clientCep: dto.clientCep,
            clientCity: dto.city,
            consumptionKwh: dto.consumption,

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

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();

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

        // Payment Calculations
        const cashDiscount = Number(proposal.company?.cashDiscount || 5);
        const cardTax = Number(proposal.company?.cardTax || 15);
        const financeTax = Number(proposal.company?.financeTax || 20);

        const finalPrice = Number(proposal.finalPrice);
        const cashPrice = finalPrice * (1 - cashDiscount / 100);

        // Card installments (12x)
        const cardTotalPrice = finalPrice * (1 + cardTax / 100);
        const cardInstallment = cardTotalPrice / 12;

        // Finance installments (60x typical for solar)
        const financeTotalPrice = finalPrice * (1 + financeTax / 100);
        const financeInstallment = financeTotalPrice / 60;

        // HTML Template for PDF
        const content = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <style type="text/tailwindcss">
        :root {
            --northway-red: #f20d0d;
            --success-green: #15803d;
            --trust-blue: #0369a1;
            --eco-green: #16a34a;
            --tech-black: #0f172a;
            --tech-gray: #475569;
        }
        @media print {
            .no-print { display: none !important; }
            .print-container { width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; }
            body { background: white !important; }
            .page-break { page-break-after: always; }
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .fill-icon {
            font-variation-settings: 'FILL' 1;
        }
    </style>
    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f20d0d",
                        "success": "#15803d",
                        "background-light": "#ffffff",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                },
            },
        }
    </script>
</head>
<body class="bg-slate-50 font-display text-slate-900 antialiased">
    <main class="flex flex-col items-center gap-10 p-10 no-print">
        <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
            Visualização de Impressão (2 Páginas)
        </div>
    </main>

    <!-- PAGE 1: TECHNICAL SUMMARY -->
    <div class="print-container mx-auto w-[210mm] h-[297mm] bg-white flex flex-col relative overflow-hidden page-break">
        <div class="p-12 flex justify-between items-start">
            <div class="flex flex-col gap-4">
                <div class="h-14 w-56 bg-white flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl overflow-hidden">
                    ${proposal.company?.logoUrl
                ? `<img src="${proposal.company.logoUrl}" class="max-h-12 max-w-full object-contain" />`
                : `<span class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Espaço para Logo</span>`
            }
                </div>
                <div class="mt-4">
                    <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Cliente</h4>
                    <h1 class="text-3xl font-extrabold text-slate-900 leading-tight">${proposal.clientName}</h1>
                    <div class="flex items-center gap-4 mt-2 text-slate-500 text-xs font-medium">
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-base">location_on</span> ${proposal.clientCity}
                        </span>
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-base">calendar_today</span> ${date}
                        </span>
                    </div>
                </div>
            </div>
            <div class="flex flex-col items-end gap-6">
                <div class="flex items-center gap-2 text-primary">
                    <span class="material-symbols-outlined text-3xl font-bold fill-icon">verified</span>
                    <div class="text-right">
                        <span class="font-black text-xl italic tracking-tighter block leading-none">NorthWay</span>
                        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Solar Engine™</span>
                    </div>
                </div>
                <div class="bg-emerald-50 border-r-4 border-success p-5 text-right min-w-[240px]">
                    <p class="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Economia Anual Estimada</p>
                    <div class="text-4xl font-black text-success">R$ ${Math.round(annualSavings).toLocaleString('pt-BR')}</div>
                    <p class="text-[10px] text-emerald-600/70 font-medium">Retorno financeiro direto garantido</p>
                </div>
            </div>
        </div>

        <div class="px-12 py-4 grid grid-cols-3 gap-8">
            <div class="space-y-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Potência Sistema</p>
                <div class="text-3xl font-black text-slate-900">${Number(proposal.systemPowerKwp).toFixed(1)} <span class="text-sm text-slate-400 font-bold uppercase">kWp</span></div>
            </div>
            <div class="space-y-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Geração Mensal</p>
                <div class="text-3xl font-black text-slate-900">${Math.round(Number(proposal.consumptionKwh))} <span class="text-sm text-slate-400 font-bold uppercase">kWh</span></div>
            </div>
            <div class="space-y-1 border-l border-slate-100 pl-8">
                <p class="text-[10px] font-bold text-primary uppercase tracking-widest">Payback (Retorno)</p>
                <div class="text-3xl font-black text-primary">${Number(proposal.paybackYears).toFixed(1)} <span class="text-sm font-bold uppercase">Anos</span></div>
            </div>
        </div>

        <div class="px-12 py-8">
            <div class="flex items-center gap-4 mb-6">
                <h2 class="text-sm font-black text-[var(--tech-black)] uppercase tracking-[0.2em]">Configuração Técnica Profissional</h2>
                <div class="flex items-center gap-2 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                    <span class="material-symbols-outlined text-emerald-600 text-sm fill-icon">check_circle</span>
                    <span class="text-[10px] font-black text-emerald-700 uppercase">Estoque Reservado por 48h</span>
                </div>
                <div class="h-px flex-1 bg-slate-200"></div>
            </div>
            <div class="overflow-hidden border border-slate-200 rounded-lg">
                <table class="w-full text-left">
                    <thead class="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th class="px-6 py-4 text-[9px] font-black text-[var(--tech-gray)] uppercase tracking-widest">Componente</th>
                            <th class="px-6 py-4 text-[9px] font-black text-[var(--tech-gray)] uppercase tracking-widest">Especificação Técnica</th>
                            <th class="px-6 py-4 text-[9px] font-black text-[var(--tech-gray)] uppercase tracking-widest text-center">Qtd</th>
                            <th class="px-6 py-4 text-[9px] font-black text-[var(--tech-gray)] uppercase tracking-widest text-right">Garantia</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr class="hover:bg-slate-50/50 transition-colors">
                            <td class="px-6 py-5 text-sm font-bold text-[var(--tech-black)]">Módulos Fotovoltaicos</td>
                            <td class="px-6 py-5 text-sm text-[var(--tech-gray)]">${proposal.module?.brand} - ${proposal.module?.model}</td>
                            <td class="px-6 py-5 text-sm font-bold text-[var(--tech-black)] text-center">${proposal.moduleQty}</td>
                            <td class="px-6 py-5 text-sm font-medium text-slate-500 text-right">25 anos</td>
                        </tr>
                        <tr class="hover:bg-slate-50/50 transition-colors">
                            <td class="px-6 py-5 text-sm font-bold text-[var(--tech-black)]">Inversor de String</td>
                            <td class="px-6 py-5 text-sm text-[var(--tech-gray)]">${proposal.inverter?.brand} - ${proposal.inverter?.model}</td>
                            <td class="px-6 py-5 text-sm font-bold text-[var(--tech-black)] text-center">01</td>
                            <td class="px-6 py-5 text-sm font-medium text-slate-500 text-right">10 anos</td>
                        </tr>
                        <tr class="hover:bg-slate-50/50 transition-colors">
                            <td class="px-6 py-5 text-sm font-bold text-[var(--tech-black)]">Estrutura Suporte</td>
                            <td class="px-6 py-5 text-sm text-[var(--tech-gray)]">Alumínio Anodizado Reforçado</td>
                            <td class="px-6 py-5 text-sm font-bold text-[var(--tech-black)] text-center">01</td>
                            <td class="px-6 py-5 text-sm font-medium text-slate-500 text-right">12 anos</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="px-12 py-4">
            <div class="bg-sky-50/50 rounded-2xl p-6 flex items-center justify-between border border-sky-100">
                <div class="max-w-xs">
                    <h3 class="text-lg font-bold text-sky-900 mb-1">Impacto Ambiental</h3>
                    <p class="text-xs text-sky-700/70 font-medium">Sua contribuição positiva para o planeta nos próximos 25 anos.</p>
                </div>
                <div class="flex gap-16">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <span class="material-symbols-outlined text-2xl fill-icon">park</span>
                        </div>
                        <div>
                            <p class="text-xl font-black text-emerald-900">${trees}</p>
                            <p class="text-[8px] uppercase font-bold text-emerald-600 tracking-widest">Árvores Salvas</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                            <span class="material-symbols-outlined text-2xl fill-icon">water_drop</span>
                        </div>
                        <div>
                            <p class="text-xl font-black text-sky-900">${co2}<span class="text-sm font-normal"> t</span></p>
                            <p class="text-[8px] uppercase font-bold text-sky-600 tracking-widest">CO2 Evitado</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-auto">
            <div class="px-12 py-8 text-[9px] text-slate-400 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                <div class="flex gap-12 text-slate-500 font-medium">
                    <div class="flex-1">
                        <p class="mb-2 uppercase font-black text-slate-400 tracking-widest">Notas Técnicas</p>
                        <p>Valores de geração baseados em índices radiométricos históricos. O projeto final está sujeito a validação técnica in loco e aprovação da concessionária de energia local.</p>
                    </div>
                </div>
            </div>
            <div class="bg-[var(--tech-black)] px-12 py-5 flex justify-between items-center text-white">
                <div class="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>${proposal.company?.name || 'NorthWay Solar'}</span>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-[10px] font-black italic text-slate-500">
                        DOC ID: NW-${proposal.id.substring(0, 8).toUpperCase()} | PÁGINA 1
                    </div>
                </div>
            </div>
            <div class="h-1.5 w-full bg-primary"></div>
        </div>
    </div>

    <!-- PAGE 2: PAYMENT & INVESTMENT -->
    <div class="print-container mx-auto w-[210mm] h-[297mm] bg-white flex flex-col relative overflow-hidden">
        <div class="p-12 flex justify-between items-center border-b border-slate-100">
            <h2 class="text-2xl font-black text-slate-900 uppercase tracking-tighter">Investimento & Condições</h2>
            <div class="flex items-center gap-2 text-primary font-black italic text-lg">
                NorthWay <span class="text-slate-400 text-[9px] not-italic uppercase tracking-widest ml-1">Solar Engine™</span>
            </div>
        </div>

        <div class="p-12">
            <div class="bg-emerald-600 rounded-3xl p-10 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                <div class="relative z-10">
                    <p class="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-2 text-emerald-100">Investimento à Vista</p>
                    <div class="flex items-baseline gap-3">
                        <span class="text-3xl font-bold">R$</span>
                        <span class="text-7xl font-black tracking-tighter">${Math.round(cashPrice).toLocaleString('pt-BR')}</span>
                    </div>
                    <div class="mt-8 flex items-center gap-3 bg-white/20 w-fit px-4 py-2 rounded-full border border-white/30">
                        <span class="material-symbols-outlined fill-icon text-xl">payments</span>
                        <span class="text-sm font-bold italic tracking-tight">Desconto exclusivo de ${cashDiscount}% aplicado</span>
                    </div>
                </div>
                <div class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div class="absolute -left-20 -bottom-20 w-60 h-60 bg-emerald-400/20 rounded-full blur-2xl"></div>
            </div>

            <div class="mt-12 grid grid-cols-2 gap-8">
                <!-- Card Option -->
                <div class="border-2 border-slate-100 rounded-3xl p-8 hover:border-sky-500/30 transition-all bg-slate-50/50">
                    <div class="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 mb-6">
                        <span class="material-symbols-outlined text-3xl">credit_card</span>
                    </div>
                    <h3 class="text-xl font-black text-slate-900 mb-2">Cartão de Crédito</h3>
                    <p class="text-xs text-slate-500 font-medium mb-8">Parcele seu investimento com taxas reduzidas de maquininha.</p>
                    
                    <div class="space-y-4">
                        <div class="flex justify-between items-baseline">
                            <span class="text-sm font-bold text-slate-400">Em até 12x de</span>
                            <span class="text-3xl font-black text-sky-600 tracking-tighter">R$ ${Math.round(cardInstallment).toLocaleString('pt-BR')}</span>
                        </div>
                        <div class="h-px bg-slate-200"></div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total parcelado: R$ ${Math.round(cardTotalPrice).toLocaleString('pt-BR')}</p>
                    </div>
                </div>

                <!-- Financing Option -->
                <div class="border-2 border-slate-100 rounded-3xl p-8 hover:border-emerald-500/30 transition-all bg-slate-50/50">
                    <div class="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                        <span class="material-symbols-outlined text-3xl">account_balance</span>
                    </div>
                    <h3 class="text-xl font-black text-slate-900 mb-2">Financiamento Solar</h3>
                    <p class="text-xs text-slate-500 font-medium mb-8">Pague em até 60 meses com carência de até 90 dias para começar.</p>
                    
                    <div class="space-y-4">
                        <div class="flex justify-between items-baseline">
                            <span class="text-sm font-bold text-slate-400">Em 60x de</span>
                            <span class="text-3xl font-black text-emerald-600 tracking-tighter">R$ ${Math.round(financeInstallment).toLocaleString('pt-BR')}</span>
                        </div>
                        <div class="h-px bg-slate-200"></div>
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-xs text-emerald-600 fill-icon">info</span>
                            <p class="text-[9px] font-bold text-emerald-700 uppercase tracking-tight italic">Mediante aprovação bancária</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-12 bg-slate-900 rounded-3xl p-8 text-white flex items-center justify-between">
                <div>
                    <h4 class="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Retorno sobre Investimento (ROI)</h4>
                    <div class="text-4xl font-black">${roi}% <span class="text-lg font-bold text-emerald-400 tracking-normal ml-2">ao ano</span></div>
                </div>
                <div class="h-16 w-px bg-slate-700"></div>
                <div class="text-right">
                    <h4 class="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Validade da Proposta</h4>
                    <div class="text-3xl font-bold tracking-tighter text-primary uppercase">${expirationStr}</div>
                </div>
            </div>
        </div>

        <div class="mt-auto">
            <div class="px-12 py-8 text-[9px] text-slate-400 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                <div class="col-span-12">
                    <p class="mb-2 uppercase font-black text-slate-500 tracking-widest">Informações Importantes</p>
                    <p>O valor do CDI/Taxa Selic pode influenciar nas taxas de financiamento. As parcelas do cartão de crédito podem variar conforme a bandeira. O desconto à vista é aplicado sobre o valor final do projeto.</p>
                </div>
            </div>
            <div class="bg-[var(--tech-black)] px-12 py-5 flex justify-between items-center text-white">
                <div class="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>www.northwaysolar.com.br</span>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-[10px] font-black italic text-slate-500">
                        DOC ID: NW-${proposal.id.substring(0, 8).toUpperCase()} | PÁGINA 2
                    </div>
                </div>
            </div>
            <div class="h-1.5 w-full bg-primary"></div>
        </div>
    </div>
</body>
</html>
    `;


        await page.setContent(content, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });

        await browser.close();

        return {
            buffer: pdfBuffer,
            filename: `proposal-${id}.pdf`
        };
    }
}
