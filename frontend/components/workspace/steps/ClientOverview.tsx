'use client';

import { UserIcon, MapPinIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

export function ClientOverview({ project }: { project: any; onUpdate: (p: any) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StepCard icon={<UserIcon style={{ width: 16, height: 16 }} />} title="Contato">
        <Field label="Nome" value={project.clientName} />
        <Field label="Documento" value={project.clientDocument} />
        <Field label="Telefone" value={project.clientPhone} />
        <Field label="Email" value={project.clientEmail} />
        <Field label="Consultor" value={project.consultantName} />
      </StepCard>

      <StepCard icon={<MapPinIcon style={{ width: 16, height: 16 }} />} title="Localização">
        <Field label="Cidade" value={project.clientCity} />
        <Field label="Estado" value={project.clientState} />
        <Field label="CEP" value={project.clientZipcode} />
      </StepCard>

      <StepCard icon={<BuildingOffice2Icon style={{ width: 16, height: 16 }} />} title="Distribuidora & Perfil">
        <Field label="Distribuidora" value={project.clientUtility} />
        <Field label="Classe" value={project.clientClass} />
        <Field label="Grupo Tarifário" value={project.clientTariffGroup} />
        <Field label="Modalidade" value={project.clientModality} />
      </StepCard>
    </div>
  );
}

function StepCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--ws-surface-raised)', borderRadius: 'var(--ws-radius-lg)', border: '1px solid var(--ws-border)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', borderBottom: '1px solid var(--ws-border)' }}>
        <span style={{ color: 'var(--ws-accent)', display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ws-text)' }}>{title}</span>
      </div>
      <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ws-text)' }}>{value}</span>
    </div>
  );
}
