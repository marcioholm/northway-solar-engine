'use client';

import { CheckCircleIcon, ClockIcon, ArrowRightIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { formatBRL, formatPercent, formatDate } from '../../lib/format';

type StepKey = 'client' | 'site' | 'consumption' | 'sizing' | 'quotes' | 'costs' | 'pricing' | 'payment' | 'documents' | 'proposal';

interface WorkspaceRightPanelProps {
  project: any;
  activeStep: StepKey;
}

const NEXT_STEP_MAP: Record<StepKey, { label: string; action: string }> = {
  client: { label: 'Preencher endereço do cliente', action: 'Ir para Local' },
  site: { label: 'Adicionar informações de consumo', action: 'Ir para Consumo' },
  consumption: { label: 'Calcular dimensionamento', action: 'Ir para Dimensionamento' },
  sizing: { label: 'Solicitar cotações com fornecedores', action: 'Ir para Cotações' },
  quotes: { label: 'Revisar custos dos equipamentos', action: 'Ir para Custos' },
  costs: { label: 'Definir margem e precificação', action: 'Ir para Precificação' },
  pricing: { label: 'Configurar condições de pagamento', action: 'Ir para Pagamentos' },
  payment: { label: 'Anexar documentos do projeto', action: 'Ir para Documentos' },
  documents: { label: 'Gerar proposta comercial', action: 'Ir para Proposta' },
  proposal: { label: 'Enviar proposta ao cliente', action: 'Enviar Agora' },
};

export function WorkspaceRightPanel({ project, activeStep }: WorkspaceRightPanelProps) {
  const totalCost = calcTotalCost(project);
  const finalPrice = Number(project.pricingFinalPrice) || 0;
  const marginPct = Number(project.pricingMarginPct) || 0;
  const profit = finalPrice - totalCost;
  const nextStep = NEXT_STEP_MAP[activeStep];
  const createdAt = project.createdAt ? formatDate(project.createdAt, 'short') : '—';

  return (
    <aside style={{
      width: 280, flexShrink: 0, background: 'var(--surface)', borderLeft: '1px solid var(--border)',
      overflow: 'auto', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

        <PanelSection title="Resumo Financeiro">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Row label="Custo Total" value={formatBRL(totalCost)} />
            <Row label="Preço Final" value={formatBRL(finalPrice)} bold />
            <Row label="Margem" value={formatPercent(marginPct)} 
              accent={marginPct >= 25 ? 'green' : marginPct >= 15 ? 'amber' : 'red'} />
            <Row label="Marg. Contribuição" value={formatBRL(profit)}
              accent={profit > 0 ? 'green' : 'red'} />
          </div>
        </PanelSection>

        <PanelSection title="Checklist">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <CheckItem checked={!!project.clientName} label="Cliente cadastrado" />
            <CheckItem checked={!!project.siteAddress} label="Endereço preenchido" />
            <CheckItem checked={!!project.consumptionMonthlyKwh} label="Consumo informado" />
            <CheckItem checked={!!project.sizingPowerKwp} label="Dimensionamento calculado" />
            <CheckItem checked={!!project.pricingFinalPrice} label="Precificação definida" />
          </div>
        </PanelSection>

        <PanelSection title="Próxima Ação">
          <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--green-bg)', border: '1px solid var(--green-light)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <ArrowRightIcon style={{ width: 14, height: 14, color: 'var(--green)', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>{nextStep.label}</p>
                <p style={{ margin: '4px 0 0', fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>{nextStep.action} →</p>
              </div>
            </div>
          </div>
        </PanelSection>

        <PanelSection title="Atividades">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ActivityItem
              icon={<ClockIcon style={{ width: 12, height: 12 }} />}
              text="Projeto criado"
              time={createdAt}
            />
            {project.consultantName && (
              <ActivityItem
                icon={<DocumentTextIcon style={{ width: 12, height: 12 }} />}
                text={`Consultor: ${project.consultantName}`}
                time="—"
              />
            )}
            {project.updatedAt && (
              <ActivityItem
                icon={<ClockIcon style={{ width: 12, height: 12 }} />}
                text="Última atualização"
                time={formatDate(project.updatedAt, 'relative')}
              />
            )}
          </div>
        </PanelSection>

        <PanelSection title="Meta">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
            <Meta label="Criado em" value={createdAt} />
            {project.clientUtility && <Meta label="Distribuidora" value={project.clientUtility} />}
            {project.consumptionModality && <Meta label="Modalidade" value={project.consumptionModality} />}
            {project.consumptionGroup && <Meta label="Grupo" value={project.consumptionGroup} />}
          </div>
        </PanelSection>
      </div>
    </aside>
  );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: 'green' | 'amber' | 'red' }) {
  const color = accent === 'green' ? 'var(--green)' : accent === 'amber' ? 'var(--warning)' : accent === 'red' ? 'var(--danger)' : 'var(--text)';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: bold ? 700 : 600, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

function CheckItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <CheckCircleIcon style={{ width: 14, height: 14, color: checked ? 'var(--green)' : 'var(--text-muted)', opacity: checked ? 1 : 0.3 }} />
      <span style={{ fontSize: 12, color: checked ? 'var(--text)' : 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

function ActivityItem({ icon, text, time }: { icon: React.ReactNode; text: string; time: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
      <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{icon}</span>
      <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{text}</span>
      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{time}</span>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function calcTotalCost(project: any): number {
  const fields = [
    'pricingEquipmentCost', 'pricingLaborCost', 'pricingFreightCost',
    'pricingProjectCost', 'pricingArtCost', 'pricingHotelCost',
    'pricingFoodCost', 'pricingTravelCost', 'pricingCommission',
    'pricingCraneCost', 'pricingThirdPartiesCost', 'pricingAdminCost',
    'pricingTaxes', 'pricingOtherCost',
  ];
  return fields.reduce((sum, f) => sum + (Number(project[f]) || 0), 0);
}
