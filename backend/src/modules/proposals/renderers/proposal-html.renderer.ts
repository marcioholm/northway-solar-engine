import {
  ProposalRenderer,
  ProposalAssembledData,
  RenderOutput,
} from './proposal-renderer.interface';
import { commercialTemplate } from '../templates/commercial.template';

export class ProposalHtmlRenderer implements ProposalRenderer {
  readonly name = 'html';

  render(data: ProposalAssembledData): RenderOutput {
    const {
      proposal,
      project,
      company,
      proposalSettings,
      consultantName,
      consultantPhone,
    } = data;

    const projectData = (project || {}) as any;
    const companyData = (company || {}) as any;

    const finalPrice = Number(
      proposal.finalPrice || projectData.pricingFinalPrice || 0,
    );
    const paybackYears = Number(proposal.paybackYears || 0);
    const annualSavings = paybackYears > 0 ? finalPrice / paybackYears : 0;

    const cashDiscount =
      projectData.paymentCashDiscount != null
        ? Number(projectData.paymentCashDiscount)
        : undefined;
    const cashPrice =
      cashDiscount != null && finalPrice > 0
        ? finalPrice * (1 - cashDiscount / 100)
        : undefined;

    const cardTax =
      projectData.paymentCardTax != null
        ? Number(projectData.paymentCardTax)
        : undefined;
    const cardInstallments =
      projectData.paymentCardInstallments != null &&
      Number(projectData.paymentCardInstallments) > 0
        ? Number(projectData.paymentCardInstallments)
        : undefined;
    const cardTotalPrice =
      cardTax != null && cardInstallments != null && finalPrice > 0
        ? finalPrice * (1 + cardTax / 100)
        : undefined;
    const cardInstallment =
      cardTotalPrice != null && cardInstallments != null
        ? cardTotalPrice / cardInstallments
        : undefined;

    const financeTax =
      projectData.paymentFinanceTax != null
        ? Number(projectData.paymentFinanceTax)
        : undefined;
    const financeInstallments =
      projectData.paymentFinanceInstallments != null &&
      Number(projectData.paymentFinanceInstallments) > 0
        ? Number(projectData.paymentFinanceInstallments)
        : undefined;
    const financeTotalPrice =
      financeTax != null && financeInstallments != null && finalPrice > 0
        ? finalPrice * (1 + financeTax / 100)
        : undefined;
    const financeInstallment =
      financeTotalPrice != null && financeInstallments != null
        ? financeTotalPrice / financeInstallments
        : undefined;

    const generationMonthlyKwh =
      projectData.sizingGenerationKwh != null &&
      Number(projectData.sizingGenerationKwh) > 0
        ? Number(projectData.sizingGenerationKwh)
        : undefined;

    const expirationDate = new Date(proposal.createdAt);
    expirationDate.setDate(expirationDate.getDate() + 10);
    const expirationStr = expirationDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const createdAtStr = new Date(proposal.createdAt).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );

    const equipmentList: any[] = [];
    if (projectData.equipmentModules?.length) {
      projectData.equipmentModules.forEach((m: any) => {
        equipmentList.push({
          type: 'module',
          brand: m.brand,
          model: m.model,
          quantity: m.qty || projectData.sizingModuleQty,
          power: m.power ? `${m.power}W` : undefined,
        });
      });
    }
    if (projectData.equipmentInverters?.length) {
      projectData.equipmentInverters.forEach((i: any) => {
        equipmentList.push({
          type: 'inverter',
          brand: i.brand,
          model: i.model,
          quantity: i.qty || 1,
          power: i.powerKw ? `${i.powerKw}kW` : undefined,
        });
      });
    }

    const effectiveSettings = proposalSettings || {
      template: 'moderno',
      primaryColor: '#0f766e',
      secondaryColor: '#f59e0b',
      coverImageUrl: undefined,
      aboutText:
        'Somos especialistas em soluções completas de energia solar fotovoltaica.',
      aboutImageUrl: undefined,
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
      warrantiesText:
        '25 anos de eficiência nos módulos e 10 anos no inversor.',
      exclusionsText:
        'Não inclusos: obras civis pesadas e adequação de padrão de entrada.',
      notesText: 'Proposta válida por 10 dias corridos.',
      acceptanceText:
        'Declaro concordar com o dimensionamento técnico, valores e condições comerciais apresentadas.',
      contact: {
        address: '',
        phone: '',
        whatsapp: '',
        website: '',
        instagram: '',
      },
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

    const html = commercialTemplate({
      clientName: proposal.clientName,
      clientCity: proposal.clientCity,
      clientState: projectData.clientState,
      consultantName: consultantName || projectData.consultantName || '—',
      consultantPhone,
      createdAt: createdAtStr,
      expirationDate: expirationStr,
      publicToken: proposal.publicToken,
      consumptionKwh: Number(
        proposal.consumptionKwh || projectData.consumptionMonthlyKwh || 0,
      ),
      systemPowerKwp: Number(
        proposal.systemPowerKwp || projectData.sizingPowerKwp || 0,
      ),
      moduleQty: Number(proposal.moduleQty || projectData.sizingModuleQty || 0),
      generationMonthlyKwh,
      finalPrice: finalPrice,
      paybackYears: paybackYears,
      annualSavings: annualSavings,
      equipment: equipmentList,
      company: {
        name: companyData.name,
        logoUrl: companyData.logoUrl,
      },
      settings: effectiveSettings as any,
      payment: {
        cashDiscount,
        cashPrice,
        cardTax,
        cardInstallments,
        cardInstallment,
        cardTotalPrice,
        financeTax,
        financeInstallments,
        financeInstallment,
        financeTotalPrice,
      },
    });

    return {
      content: html,
      filename: `proposal-${proposal.id}.html`,
      mimeType: 'text/html; charset=utf-8',
    };
  }
}
