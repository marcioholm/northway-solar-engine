import { ProposalRenderer, ProposalAssembledData, RenderOutput } from './proposal-renderer.interface';
import { defaultTemplate } from '../templates/default.template';

export class ProposalHtmlRenderer implements ProposalRenderer {
  readonly name = 'html';

  render(data: ProposalAssembledData): RenderOutput {
    const { proposal, project, quote, company, consultantName, consultantPhone } = data;

    const projectData = (project || {}) as any;
    const companyData = (company || {}) as any;

    const cashDiscount = Number(companyData.cashDiscount || 5);
    const cardTax = Number(companyData.cardTax || 15);
    const financeTax = Number(companyData.financeTax || 20);
    const finalPrice = Number(proposal.finalPrice || projectData.pricingFinalPrice || 0);
    const paybackYears = Number(proposal.paybackYears || 0);
    const annualSavings = paybackYears > 0 ? finalPrice / paybackYears : 0;

    const cashPrice = finalPrice * (1 - cashDiscount / 100);
    const cardTotalPrice = finalPrice * (1 + cardTax / 100);
    const cardInstallment = cardTotalPrice / 12;
    const financeTotalPrice = finalPrice * (1 + financeTax / 100);
    const financeInstallment = financeTotalPrice / 60;

    const trees = Math.round(Number(proposal.systemPowerKwp || projectData.sizingPowerKwp || 0) * 40);
    const co2 = (Number(proposal.systemPowerKwp || projectData.sizingPowerKwp || 0) * 2.1).toFixed(1);
    const roi = paybackYears > 0 ? (100 / paybackYears).toFixed(1) : undefined;

    const expirationDate = new Date(proposal.createdAt);
    expirationDate.setDate(expirationDate.getDate() + 10);
    const expirationStr = expirationDate.toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    const createdAtStr = new Date(proposal.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

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

    const html = defaultTemplate({
      clientName: proposal.clientName,
      clientCity: proposal.clientCity,
      clientState: projectData.clientState,
      clientCep: proposal.clientCep,
      consultantName: consultantName || projectData.consultantName || '—',
      consultantPhone,
      createdAt: createdAtStr,
      tariff: proposal.tariff,
      consumption: proposal.consumptionKwh,
      monthlyBill: projectData.consumptionMonthlyBill,
      systemPowerKwp: proposal.systemPowerKwp || projectData.sizingPowerKwp,
      moduleQty: proposal.moduleQty || projectData.sizingModuleQty,
      finalPrice: finalPrice,
      paybackYears: paybackYears,
      company: { logoUrl: companyData.logoUrl, name: companyData.name, cashDiscount, cardTax, financeTax },
      equipment: equipmentList,
      cashPrice,
      cardInstallment,
      cardTotalPrice,
      financeInstallment,
      financeTotalPrice,
      expirationDate: expirationStr,
      trees,
      co2,
      roi,
      annualSavings,
    });

    return {
      content: html,
      filename: `proposal-${proposal.id}.html`,
      mimeType: 'text/html; charset=utf-8',
    };
  }
}
