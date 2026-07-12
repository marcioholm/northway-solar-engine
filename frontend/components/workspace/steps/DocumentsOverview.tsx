'use client';

import { DocumentTextIcon, PhotoIcon } from '@heroicons/react/24/outline';

export function DocumentsOverview({ project }: { project: any; onUpdate: (p: any) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
        <DocumentTextIcon style={{ width: 40, height: 40, color: 'var(--text-muted)', opacity: 0.25, margin: '0 auto 16px' }} />
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Nenhum documento anexado</p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Adicione ART, contratos, manuais e fotos do projeto.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <DocumentTextIcon style={{ width: 14, height: 14 }} /> Adicionar Documento
          </button>
          <button style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <PhotoIcon style={{ width: 14, height: 14 }} /> Anexar Fotos
          </button>
        </div>
      </div>
    </div>
  );
}
