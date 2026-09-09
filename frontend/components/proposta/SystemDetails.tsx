'use client';
import { ProposalData, hasSystemData } from '../../lib/proposal-types';
import { SectionWrapper } from './SectionWrapper';

export function SystemDetails({ data }: { data: ProposalData }) {
  if (!hasSystemData(data)) return null;

  return (
    <SectionWrapper level="content" background="var(--bg)">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{ fontSize: 'clamp(24px, 2.5vw + 14px, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--text)' }}>
          Seu Sistema
        </h2>
        <div style={{ fontSize: 'clamp(14px, 1.2vw + 8px, 18px)', color: 'var(--text-secondary)' }}>
          {data.systemPowerKwp?.toFixed(2)} kWp · {data.moduleQty} módulos
        </div>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '20px 24px', borderLeft: '3px solid var(--green)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Módulo Solar</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>{data.module?.brand} {data.module?.model} · {data.module?.powerWatt} W</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 2 }}>Qtd: {data.moduleQty} unidades</div>
        </div>
        
        <div style={{ padding: '20px 24px', borderLeft: '3px solid var(--green)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Inversor</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>{data.inverter?.brand} {data.inverter?.model} · {data.inverter?.powerKw} kW</div>
        </div>

        <div style={{ padding: '20px 24px', borderLeft: '3px solid var(--green)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Estrutura e Instalação</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Fixação, cabeamento, proteções elétricas (String Box), homologação e mão de obra especializada.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
        <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green-dark)' }}>25a</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>Garantia Perf.</div>
        </div>
        <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>IP67</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>Equip. Selado</div>
        </div>
        <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>WiFi</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>Mon. App</div>
        </div>
        <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>1a</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>Garantia Inst.</div>
        </div>
      </div>
    </SectionWrapper>
  );
}
