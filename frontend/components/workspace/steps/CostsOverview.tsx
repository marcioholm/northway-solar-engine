'use client';

import { BanknotesIcon, TruckIcon, WrenchScrewdriverIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { StepCard, Field, MetricBadge } from './_shared';
import { formatBRL } from '../../../lib/format';

export function CostsOverview({ project }: { project: any; onUpdate: (p: any) => void }) {
  const mainCost = Number(project.pricingEquipmentCost) || 0;
  const laborCost = Number(project.pricingLaborCost) || Number(project.pricingInstallationCost) || 0;
  const freightCost = Number(project.pricingFreightCost) || 0;
  const projectCost = Number(project.pricingProjectCost) || 0;
  const artCost = Number(project.pricingArtCost) || 0;
  const hotelCost = Number(project.pricingHotelCost) || 0;
  const foodCost = Number(project.pricingFoodCost) || 0;
  const travelCost = Number(project.pricingTravelCost) || 0;
  const commission = Number(project.pricingCommission) || 0;
  const craneCost = Number(project.pricingCraneCost) || 0;
  const thirdParties = Number(project.pricingThirdPartiesCost) || 0;
  const adminCost = Number(project.pricingAdminCost) || 0;
  const taxes = Number(project.pricingTaxes) || 0;
  const otherCost = Number(project.pricingOtherCost) || 0;
  const total = mainCost + laborCost + freightCost + projectCost + artCost + hotelCost + foodCost + travelCost + commission + craneCost + thirdParties + adminCost + taxes + otherCost;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <MetricBadge value={formatBRL(total)} label="Custo Total" />

      <StepCard icon={<BanknotesIcon style={{ width: 16, height: 16 }} />} title="Equipamentos">
        <Field label="Equipamentos" value={mainCost ? formatBRL(mainCost) : undefined} />
        <Field label="Mão de Obra" value={laborCost ? formatBRL(laborCost) : undefined} />
        <Field label="Frete" value={freightCost ? formatBRL(freightCost) : undefined} />
      </StepCard>

      <StepCard icon={<DocumentTextIcon style={{ width: 16, height: 16 }} />} title="Projeto & Taxas">
        <Field label="Projeto" value={projectCost ? formatBRL(projectCost) : undefined} />
        <Field label="ART" value={artCost ? formatBRL(artCost) : undefined} />
        <Field label="Taxas" value={taxes ? formatBRL(taxes) : undefined} />
        <Field label="Administrativo" value={adminCost ? formatBRL(adminCost) : undefined} />
      </StepCard>

      <StepCard icon={<WrenchScrewdriverIcon style={{ width: 16, height: 16 }} />} title="Operacionais">
        <Field label="Hotel" value={hotelCost ? formatBRL(hotelCost) : undefined} />
        <Field label="Alimentação" value={foodCost ? formatBRL(foodCost) : undefined} />
        <Field label="Deslocamento" value={travelCost ? formatBRL(travelCost) : undefined} />
        <Field label="Guindaste" value={craneCost ? formatBRL(craneCost) : undefined} />
        <Field label="Comissão" value={commission ? formatBRL(commission) : undefined} />
        <Field label="Terceiros" value={thirdParties ? formatBRL(thirdParties) : undefined} />
        <Field label="Outros" value={otherCost ? formatBRL(otherCost) : undefined} />
      </StepCard>
    </div>
  );
}
