import { Proposal } from '../entities/proposal.entity';

type WebEquipment = {
  type: 'module' | 'inverter';
  brand?: string;
  model?: string;
  quantity?: number;
  power?: string;
};

const toNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const powerValue = (power?: string) =>
  power ? toNumber(power.replace(/[^\d.]/g, '')) : undefined;

/**
 * Lista de campos permitidos na proposta sem login. Custos, margem, lucro,
 * orçamento do fornecedor, documento e contatos do cliente ficam de fora.
 * Campo novo só aparece aqui se for adicionado de propósito.
 */
export function toPublicProposalView(
  web: Record<string, any>,
  proposal: Pick<Proposal, 'publicToken' | 'expiresAt'>,
) {
  const equipment: WebEquipment[] = web.equipment ?? [];
  const module = equipment.find((item) => item.type === 'module');
  const inverter = equipment.find((item) => item.type === 'inverter');

  return {
    publicToken: proposal.publicToken,
    clientName: web.clientName,
    clientCity: web.clientCity,
    clientState: web.clientState,
    consultantName: web.consultantName,
    consultantPhone: web.consultantPhone,
    createdAt: web.createdAt,
    expirationDate: proposal.expiresAt ?? undefined,
    profile: web.profile,
    utility: web.utility,
    tariff: toNumber(web.tariff),
    consumption: toNumber(web.consumption),
    monthlyBill: toNumber(web.monthlyBill),
    systemPowerKwp: toNumber(web.systemPowerKwp),
    moduleQty: toNumber(web.moduleQty),
    module: module && {
      brand: module.brand,
      model: module.model,
      powerWatt: powerValue(module.power),
    },
    inverter: inverter && {
      brand: inverter.brand,
      model: inverter.model,
      powerKw: powerValue(inverter.power),
      quantity: inverter.quantity || 1,
    },
    equipment: equipment.map(({ type, brand, model, quantity, power }) => ({
      type,
      brand,
      model,
      quantity,
      power,
    })),
    finalPrice: toNumber(web.finalPrice),
    paybackYears: toNumber(web.paybackYears),
    company: web.company && {
      name: web.company.name,
      logoUrl: web.company.logoUrl,
    },
  };
}

export type PublicProposalView = ReturnType<typeof toPublicProposalView>;
