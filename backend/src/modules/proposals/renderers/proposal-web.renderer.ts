import {
  ProposalRenderer,
  ProposalAssembledData,
  RenderOutput,
} from './proposal-renderer.interface';

export class ProposalWebRenderer implements ProposalRenderer {
  readonly name = 'web';

  render(data: ProposalAssembledData): RenderOutput {
    const {
      proposal,
      project,
      quote,
      company,
      consultantName,
      consultantPhone,
    } = data;

    const projectData = project
      ? {
          id: project.id,
          status: project.status,
          clientDocument: project.clientDocument,
          clientPhone: project.clientPhone,
          clientEmail: project.clientEmail,
          clientState: project.clientState,
          clientZipcode: project.clientZipcode,
          clientClass: project.clientClass,
          clientTariffGroup: project.clientTariffGroup,
          clientModality: project.clientModality,
          consultantName: project.consultantName,
          siteAddress: project.siteAddress,
          siteRoofType: project.siteRoofType,
          siteLatitude: project.siteLatitude,
          siteLongitude: project.siteLongitude,
          siteInclination: project.siteInclination,
          siteAzimuth: project.siteAzimuth,
          consumptionMonthlyKwh: project.consumptionMonthlyKwh,
          consumptionMonthlyBill: project.consumptionMonthlyBill,
          consumptionModality: project.consumptionModality,
          consumptionDemand: project.consumptionDemand,
          sizingPowerKwp: project.sizingPowerKwp,
          sizingGenerationKwh: project.sizingGenerationKwh,
          sizingIrradiation: project.sizingIrradiation,
          sizingLossFactor: project.sizingLossFactor,
          sizingModuleQty: project.sizingModuleQty,
          sizingInverterQty: project.sizingInverterQty,
          equipmentModules: project.equipmentModules,
          equipmentInverters: project.equipmentInverters,
          pricingEquipmentCost: project.pricingEquipmentCost,
          pricingMarginPct: project.pricingMarginPct,
          pricingFinalPrice: project.pricingFinalPrice,
          pricingTotalCost: project.pricingTotalCost,
          pricingProfit: project.pricingProfit,
          pricingRecommendedPrice: project.pricingRecommendedPrice,
          pricingEffectiveMarginPct: project.pricingEffectiveMarginPct,
          paymentCashDiscount: project.paymentCashDiscount,
          paymentCardTax: project.paymentCardTax,
          paymentCardInstallments: project.paymentCardInstallments,
          paymentFinanceTax: project.paymentFinanceTax,
          paymentFinanceInstallments: project.paymentFinanceInstallments,
          paymentValidityDays: project.paymentValidityDays,
          quotes: project.quotes,
        }
      : {};

    // Add fields that might come from legacy mapping
    const pd = {
      ...projectData,
      clientUtility:
        (projectData as any).clientUtility || (project as any)?.client?.utility,
      consumptionTariff:
        (projectData as any).consumptionTariff ??
        (project as any)?.consumption?.tariff,
    } as any;

    const quoteData = quote
      ? {
          id: quote.id,
          supplierName: quote.supplierName,
          supplierContact: quote.supplierContact,
          quoteNumber: quote.quoteNumber,
          quoteDate: quote.quoteDate,
          validUntil: quote.validUntil,
          paymentCondition: quote.paymentCondition,
          shippingCost: quote.shippingCost,
          totalAmount: quote.totalAmount,
          items: (quote.items || []).map((i) => ({
            productType: i.productType,
            productName: i.productName,
            productBrand: i.productBrand,
            productModel: i.productModel,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
          })),
        }
      : {};

    const content = {
      id: proposal.id,
      clientName: proposal.clientName,
      clientCity: proposal.clientCity,
      clientDocument: pd.clientDocument,
      clientPhone: pd.clientPhone,
      clientEmail: pd.clientEmail,
      clientCep: proposal.clientCep,
      clientState: pd.clientState,
      clientZipcode: pd.clientZipcode,
      consultantName: consultantName || pd.consultantName,
      consultantPhone,
      createdAt: proposal.createdAt,
      profile: proposal.profile,
      utility: pd.clientUtility || proposal.utility,
      tariff: pd.consumptionTariff ?? proposal.tariff,
      consumption: pd.consumptionMonthlyKwh ?? proposal.consumptionKwh,
      monthlyBill: pd.consumptionMonthlyBill,
      systemPowerKwp: pd.sizingPowerKwp ?? proposal.systemPowerKwp,
      moduleQty: pd.sizingModuleQty ?? proposal.moduleQty,
      equipment: [
        ...((pd.equipmentModules || []) as any[]).map((m: any) => ({
          type: 'module',
          brand: m.brand,
          model: m.model,
          quantity: m.qty || pd.sizingModuleQty,
          power: m.power ? `${m.power}W` : undefined,
        })),
        ...((pd.equipmentInverters || []) as any[]).map((i: any) => ({
          type: 'inverter',
          brand: i.brand,
          model: i.model,
          quantity: i.qty || 1,
          power: i.powerKw ? `${i.powerKw}kW` : undefined,
        })),
      ],
      finalPrice: proposal.finalPrice || pd.pricingFinalPrice,
      marginPct: proposal.marginPct || pd.pricingMarginPct,
      profit: pd.pricingProfit,
      paybackYears: proposal.paybackYears,
      totalCost: pd.pricingTotalCost,
      recommendedPrice: pd.pricingRecommendedPrice,
      effectiveMarginPct: pd.pricingEffectiveMarginPct,
      siteAddress: pd.siteAddress,
      company: company
        ? {
            name: company.name,
            logoUrl: company.logoUrl,
            cardTax: company.cardTax,
            financeTax: company.financeTax,
            cashDiscount: company.cashDiscount,
          }
        : undefined,
      quote: Object.keys(quoteData).length ? quoteData : undefined,
      project: Object.keys(pd).length ? pd : undefined,
    };

    return {
      content: JSON.stringify(content),
      filename: `proposal-${proposal.id}.json`,
      mimeType: 'application/json',
    };
  }
}
