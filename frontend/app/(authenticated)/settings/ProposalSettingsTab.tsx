'use client';

import { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PaintBrushIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  PhotoIcon,
  MapPinIcon,
  ListBulletIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  PhoneIcon,
  Squares2X2Icon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface ProposalSettingsData {
  template: 'classico' | 'moderno' | 'minimalista';
  primaryColor: string;
  secondaryColor: string;
  coverImageUrl?: string;
  aboutText?: string;
  aboutImageUrl?: string;
  stats?: { value: string; label: string }[];
  partnerLogos?: string[];
  brandLogos?: string[];
  serviceAreaText?: string;
  includedItems?: string[];
  warrantiesText?: string;
  exclusionsText?: string;
  notesText?: string;
  acceptanceText?: string;
  contact?: {
    address?: string;
    phone?: string;
    whatsapp?: string;
    website?: string;
    instagram?: string;
  };
  sectionsEnabled?: {
    cover?: boolean;
    about?: boolean;
    stats?: boolean;
    technical?: boolean;
    equipment?: boolean;
    financial?: boolean;
    kit?: boolean;
    warranties?: boolean;
    partners?: boolean;
    contact?: boolean;
  };
}

const DEFAULT_SETTINGS: ProposalSettingsData = {
  template: 'moderno',
  primaryColor: '#0f766e',
  secondaryColor: '#f59e0b',
  coverImageUrl: '',
  aboutText: '',
  aboutImageUrl: '',
  stats: [],
  partnerLogos: [],
  brandLogos: [],
  serviceAreaText: '',
  includedItems: [],
  warrantiesText: '',
  exclusionsText: '',
  notesText: '',
  acceptanceText: '',
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

// Image specifications and dimension validation
interface ImageValidationSpec {
  recommendedWidth: number;
  recommendedHeight: number;
  ratio: number;
  ratioLabel: string;
  idealFormat: string;
}

const PROPOSAL_IMAGE_SPECS: Record<'cover' | 'about' | 'partner' | 'brand', ImageValidationSpec> = {
  cover: {
    recommendedWidth: 1240,
    recommendedHeight: 1754,
    ratio: 1240 / 1754,
    ratioLabel: '1:1.41 (A4 vertical) ou banner horizontal',
    idealFormat: 'JPEG ou WebP',
  },
  about: {
    recommendedWidth: 1200,
    recommendedHeight: 800,
    ratio: 3 / 2,
    ratioLabel: '3:2 (horizontal)',
    idealFormat: 'JPEG ou WebP',
  },
  partner: {
    recommendedWidth: 600,
    recommendedHeight: 300,
    ratio: 2 / 1,
    ratioLabel: '2:1 (horizontal)',
    idealFormat: 'PNG transparente ou WebP',
  },
  brand: {
    recommendedWidth: 600,
    recommendedHeight: 300,
    ratio: 2 / 1,
    ratioLabel: '2:1 (horizontal)',
    idealFormat: 'PNG transparente ou WebP',
  },
};

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao ler dimensões da imagem'));
    };
    img.src = url;
  });
}

async function validateProposalImage(
  file: File,
  target: 'cover' | 'about' | 'partner' | 'brand',
): Promise<boolean> {
  const spec = PROPOSAL_IMAGE_SPECS[target];
  try {
    const { width, height } = await getImageDimensions(file);
    const warnings: string[] = [];

    // Checagem de 50% das dimensões recomendadas
    const minWidth = Math.round(spec.recommendedWidth * 0.5);
    const minHeight = Math.round(spec.recommendedHeight * 0.5);
    if (width < minWidth || height < minHeight) {
      warnings.push(
        `Dimensões baixas (${width}×${height} px). O recomendado é ao menos ${minWidth}×${minHeight} px (50% do ideal de ${spec.recommendedWidth}×${spec.recommendedHeight} px) para garantir nitidez na proposta e no PDF.`,
      );
    }

    // Checagem de proporção muito diferente
    const currentRatio = width / height;
    if (target === 'cover') {
      const isVertical = currentRatio >= 0.5 && currentRatio <= 1.0;
      const isHorizontal = currentRatio >= 1.2 && currentRatio <= 3.2;
      if (!isVertical && !isHorizontal) {
        warnings.push(
          `Proporção incomum (${width}×${height} px, proporção ${currentRatio.toFixed(2)}:1). Recomendado A4 vertical (1:1.41) ou banner panorâmico.`,
        );
      }
    } else {
      const diffRatio = Math.abs(currentRatio - spec.ratio) / spec.ratio;
      if (diffRatio > 0.45) {
        warnings.push(
          `Proporção da imagem (${width}×${height} px, proporção ${currentRatio.toFixed(2)}:1) difere da recomendada (${spec.ratioLabel}). A imagem poderá conter cortes ou bordas.`,
        );
      }
    }

    if (warnings.length > 0) {
      return window.confirm(
        `Atenção às dimensões da imagem selecionada:\n\n• ${warnings.join('\n• ')}\n\nDeseja enviar mesmo assim?`,
      );
    }
  } catch {
    // Se não for possível ler dimensões no browser, permite seguir
  }
  return true;
}

export function ProposalSettingsTab() {
  const [data, setData] = useState<ProposalSettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const api = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token || !api) return;
    setLoading(true);
    fetch(`${api}/proposal-settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) throw new Error('Falha ao carregar configurações');
        return res.json();
      })
      .then(settings => {
        setData({
          template: settings.template || 'moderno',
          primaryColor: settings.primaryColor || '#0f766e',
          secondaryColor: settings.secondaryColor || '#f59e0b',
          coverImageUrl: settings.coverImageUrl || '',
          aboutText: settings.aboutText || '',
          aboutImageUrl: settings.aboutImageUrl || '',
          stats: Array.isArray(settings.stats) ? settings.stats : [],
          partnerLogos: Array.isArray(settings.partnerLogos) ? settings.partnerLogos : [],
          brandLogos: Array.isArray(settings.brandLogos) ? settings.brandLogos : [],
          serviceAreaText: settings.serviceAreaText || '',
          includedItems: Array.isArray(settings.includedItems) ? settings.includedItems : [],
          warrantiesText: settings.warrantiesText || '',
          exclusionsText: settings.exclusionsText || '',
          notesText: settings.notesText || '',
          acceptanceText: settings.acceptanceText || '',
          contact: {
            address: settings.contact?.address || '',
            phone: settings.contact?.phone || '',
            whatsapp: settings.contact?.whatsapp || '',
            website: settings.contact?.website || '',
            instagram: settings.contact?.instagram || '',
          },
          sectionsEnabled: {
            cover: settings.sectionsEnabled?.cover ?? true,
            about: settings.sectionsEnabled?.about ?? true,
            stats: settings.sectionsEnabled?.stats ?? true,
            technical: settings.sectionsEnabled?.technical ?? true,
            equipment: settings.sectionsEnabled?.equipment ?? true,
            financial: settings.sectionsEnabled?.financial ?? true,
            kit: settings.sectionsEnabled?.kit ?? true,
            warranties: settings.sectionsEnabled?.warranties ?? true,
            partners: settings.sectionsEnabled?.partners ?? true,
            contact: settings.sectionsEnabled?.contact ?? true,
          },
        });
      })
      .catch(err => {
        setMessage({ type: 'error', text: err.message || 'Erro ao carregar dados' });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [api, token]);

  const handleUploadImage = async (
    file: File,
    target: 'cover' | 'about' | 'partner' | 'brand',
  ) => {
    if (!token || !api) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'O arquivo deve ter no máximo 2 MB.' });
      return;
    }
    const validMimes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Formato inválido. Use PNG, JPEG ou WebP.' });
      return;
    }

    const shouldProceed = await validateProposalImage(file, target);
    if (!shouldProceed) return;

    setUploadingTarget(target);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', target);

      const res = await fetch(`${api}/proposal-settings/upload?type=${target}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha no upload da imagem');
      }

      const { url } = await res.json();

      if (target === 'cover') {
        setData(prev => ({ ...prev, coverImageUrl: url }));
      } else if (target === 'about') {
        setData(prev => ({ ...prev, aboutImageUrl: url }));
      } else if (target === 'partner') {
        setData(prev => {
          const list = prev.partnerLogos || [];
          if (list.length >= 12) return prev;
          return { ...prev, partnerLogos: [...list, url] };
        });
      } else if (target === 'brand') {
        setData(prev => {
          const list = prev.brandLogos || [];
          if (list.length >= 12) return prev;
          return { ...prev, brandLogos: [...list, url] };
        });
      }
      setMessage({ type: 'success', text: 'Imagem enviada com sucesso!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao fazer upload da imagem' });
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !api) return;

    // Validate hex colors
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(data.primaryColor) || !hexRegex.test(data.secondaryColor)) {
      setMessage({ type: 'error', text: 'Cores primária e secundária devem estar em formato hexadecimal (ex: #0f766e).' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${api}/proposal-settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = Array.isArray(errJson.message) ? errJson.message.join(', ') : errJson.message;
        throw new Error(msg || 'Falha ao salvar configurações da proposta');
      }

      setMessage({ type: 'success', text: 'Configurações da proposta salvas com sucesso!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar' });
    } finally {
      setSaving(false);
    }
  };

  // Stat item handlers
  const handleAddStat = () => {
    if ((data.stats?.length || 0) >= 4) return;
    setData(prev => ({
      ...prev,
      stats: [...(prev.stats || []), { value: '', label: '' }],
    }));
  };

  const handleUpdateStat = (index: number, field: 'value' | 'label', val: string) => {
    setData(prev => {
      const copy = [...(prev.stats || [])];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, stats: copy };
    });
  };

  const handleRemoveStat = (index: number) => {
    setData(prev => {
      const copy = [...(prev.stats || [])];
      copy.splice(index, 1);
      return { ...prev, stats: copy };
    });
  };

  // Kit item handlers
  const [newKitItem, setNewKitItem] = useState('');
  const handleAddKitItem = () => {
    if (!newKitItem.trim()) return;
    setData(prev => ({
      ...prev,
      includedItems: [...(prev.includedItems || []), newKitItem.trim()],
    }));
    setNewKitItem('');
  };

  const handleRemoveKitItem = (index: number) => {
    setData(prev => {
      const copy = [...(prev.includedItems || [])];
      copy.splice(index, 1);
      return { ...prev, includedItems: copy };
    });
  };

  // Logo remover
  const handleRemoveLogo = (type: 'partner' | 'brand', index: number) => {
    setData(prev => {
      const list = type === 'partner' ? [...(prev.partnerLogos || [])] : [...(prev.brandLogos || [])];
      list.splice(index, 1);
      return type === 'partner' ? { ...prev, partnerLogos: list } : { ...prev, brandLogos: list };
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
        Carregando configurações da proposta...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Banner de Aviso de Responsabilidade */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          background: 'rgba(234, 179, 8, 0.12)',
          border: '1px solid rgba(234, 179, 8, 0.35)',
          borderRadius: 'var(--radius-lg)',
          color: '#ca8a04',
        }}
      >
        <ExclamationTriangleIcon style={{ width: 22, height: 22, flexShrink: 0 }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
          Aviso: Os números e logos informados aqui são de responsabilidade da empresa.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* 1. Escolha do Modelo */}
          <SectionContainer icon={<DocumentTextIcon style={{ width: 20, height: 20 }} />} title="Modelo da Proposta">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              Selecione o layout visual que melhor representa sua marca e estilo de comunicação:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {/* Clássico */}
              <TemplateCard
                name="Clássico"
                description="Corporativo e tradicional, com linhas sóbrias e apresentação formal."
                isSelected={data.template === 'classico'}
                onClick={() => setData(prev => ({ ...prev, template: 'classico' }))}
              >
                {/* Miniatura Clássico */}
                <div style={thumbnailContainerStyle}>
                  <div style={{ height: 16, borderBottom: '2px solid #334155', display: 'flex', alignItems: 'center', padding: '0 4px', gap: 4 }}>
                    <div style={{ width: 12, height: 4, background: '#334155', borderRadius: 1 }} />
                    <div style={{ flex: 1 }} />
                    <div style={{ width: 24, height: 2, background: '#94a3b8' }} />
                  </div>
                  <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ width: '60%', height: 5, background: '#475569', borderRadius: 1 }} />
                    <div style={{ width: '90%', height: 3, background: '#cbd5e1', borderRadius: 1 }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 4 }}>
                      <div style={{ height: 20, border: '1px solid #cbd5e1', borderRadius: 2 }} />
                      <div style={{ height: 20, border: '1px solid #cbd5e1', borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
              </TemplateCard>

              {/* Moderno */}
              <TemplateCard
                name="Moderno (Padrão)"
                description="Visual limpo de alto impacto, com banner de capa e cartões em destaque."
                isSelected={data.template === 'moderno'}
                onClick={() => setData(prev => ({ ...prev, template: 'moderno' }))}
              >
                {/* Miniatura Moderno */}
                <div style={thumbnailContainerStyle}>
                  <div style={{ height: 24, background: data.primaryColor || '#0f766e', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', padding: '0 6px', gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#ffffff' }} />
                    <div style={{ width: 30, height: 4, background: '#ffffff', borderRadius: 1 }} />
                  </div>
                  <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                      <div style={{ height: 14, background: '#f1f5f9', borderRadius: 2, borderTop: `2px solid ${data.secondaryColor || '#f59e0b'}` }} />
                      <div style={{ height: 14, background: '#f1f5f9', borderRadius: 2, borderTop: `2px solid ${data.secondaryColor || '#f59e0b'}` }} />
                      <div style={{ height: 14, background: '#f1f5f9', borderRadius: 2, borderTop: `2px solid ${data.secondaryColor || '#f59e0b'}` }} />
                    </div>
                    <div style={{ width: '80%', height: 3, background: '#cbd5e1', borderRadius: 1, marginTop: 2 }} />
                  </div>
                </div>
              </TemplateCard>

              {/* Minimalista */}
              <TemplateCard
                name="Minimalista"
                description="Design arejado com foco em tipografia elegante e leitura objetiva."
                isSelected={data.template === 'minimalista'}
                onClick={() => setData(prev => ({ ...prev, template: 'minimalista' }))}
              >
                {/* Miniatura Minimalista */}
                <div style={thumbnailContainerStyle}>
                  <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ width: 14, height: 2, background: '#0f172a' }} />
                    <div style={{ width: '50%', height: 6, background: '#0f172a', borderRadius: 1 }} />
                    <div style={{ width: '75%', height: 3, background: '#e2e8f0', borderRadius: 1 }} />
                    <div style={{ height: 1, background: '#f1f5f9', margin: '3px 0' }} />
                    <div style={{ width: '100%', height: 18, background: '#fafafa', border: '1px dashed #e2e8f0', borderRadius: 2 }} />
                  </div>
                </div>
              </TemplateCard>
            </div>
          </SectionContainer>

          {/* 2. Identidade Visual */}
          <SectionContainer icon={<PaintBrushIcon style={{ width: 20, height: 20 }} />} title="Identidade Visual & Cores">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Cor Primária</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="color"
                    value={data.primaryColor}
                    onChange={e => setData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    style={{ width: 44, height: 42, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 6 }}
                  />
                  <input
                    type="text"
                    value={data.primaryColor}
                    onChange={e => setData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    style={inputStyle}
                    placeholder="#0f766e"
                  />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Usada em títulos, cabeçalhos e botões</span>
              </div>

              <div>
                <label style={labelStyle}>Cor Secundária / Destaque</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="color"
                    value={data.secondaryColor}
                    onChange={e => setData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    style={{ width: 44, height: 42, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 6 }}
                  />
                  <input
                    type="text"
                    value={data.secondaryColor}
                    onChange={e => setData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    style={inputStyle}
                    placeholder="#f59e0b"
                  />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Usada em badges, economia e métricas chave</span>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <label style={labelStyle}>Imagem de Capa (Opcional - até 2 MB)</label>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 10 }}>
                Recomendado: 1240×1754 px (A4) • Proporção: 1:1.41 (vertical) ou banner horizontal • Formato ideal: JPEG ou WebP
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 380,
                    height: 180,
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    position: 'relative',
                    overflow: 'hidden',
                    background: data.coverImageUrl ? '#0f172a' : 'var(--bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Pré-visualização no formato real da capa da proposta comercial"
                >
                  {data.coverImageUrl ? (
                    <>
                      <img src={data.coverImageUrl} alt="Capa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: data.secondaryColor || '#f59e0b' }} />
                      <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: 4, backdropFilter: 'blur(4px)' }}>
                        Formato real da proposta
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                      <PhotoIcon style={{ width: 32, height: 32, opacity: 0.5 }} />
                      <span style={{ fontSize: '12px' }}>Nenhuma capa configurada</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={uploadButtonStyle}>
                    {uploadingTarget === 'cover' ? 'Enviando capa...' : 'Escolher imagem de capa'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImage(file, 'cover');
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {data.coverImageUrl && (
                    <button
                      type="button"
                      onClick={() => setData(prev => ({ ...prev, coverImageUrl: '' }))}
                      style={{ color: 'var(--danger)', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Remover imagem
                    </button>
                  )}
                </div>
              </div>
            </div>
          </SectionContainer>

          {/* 3. Sobre a Empresa */}
          <SectionContainer icon={<BuildingOffice2Icon style={{ width: 20, height: 20 }} />} title="Sobre a Empresa">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Texto Institucional / Trajetória</label>
                <textarea
                  value={data.aboutText || ''}
                  onChange={e => setData(prev => ({ ...prev, aboutText: e.target.value }))}
                  style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                  placeholder="Conte um pouco sobre a história, solidez e diferenciais da sua empresa de energia solar..."
                />
              </div>

              <div>
                <label style={labelStyle}>Foto Institucional / Equipe (Opcional - até 2 MB)</label>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 10 }}>
                  Recomendado: 1200×800 px • Proporção: 3:2 • Formato ideal: JPEG ou WebP
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div
                    style={{
                      width: 240,
                      height: 160,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'var(--bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Pré-visualização no formato real da seção Sobre Nós (3:2)"
                  >
                    {data.aboutImageUrl ? (
                      <>
                        <img src={data.aboutImageUrl} alt="Sobre nós" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: 4, backdropFilter: 'blur(4px)' }}>
                          Proporção 3:2
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                        <PhotoIcon style={{ width: 28, height: 28, opacity: 0.5 }} />
                        <span style={{ fontSize: '11px' }}>Foto institucional (3:2)</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label style={uploadButtonStyle}>
                      {uploadingTarget === 'about' ? 'Enviando...' : 'Escolher foto institucional'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadImage(file, 'about');
                          e.target.value = '';
                        }}
                      />
                    </label>
                    {data.aboutImageUrl && (
                      <button
                        type="button"
                        onClick={() => setData(prev => ({ ...prev, aboutImageUrl: '' }))}
                        style={{ color: 'var(--danger)', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        Remover imagem
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SectionContainer>

          {/* 4. Estatísticas de Destaque */}
          <SectionContainer icon={<ChartBarIcon style={{ width: 20, height: 20 }} />} title="Estatísticas de Destaque (Até 4)">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
              Destaque números que geram autoridade e confiança imediata no cliente:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(data.stats || []).map((stat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={e => handleUpdateStat(idx, 'value', e.target.value)}
                    placeholder="Ex: +766 ou 5 MWp"
                    style={{ ...inputStyle, width: '150px' }}
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={e => handleUpdateStat(idx, 'label', e.target.value)}
                    placeholder="Ex: projetos homologados ou clientes satisfeitos"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStat(idx)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 6 }}
                    title="Remover estatística"
                  >
                    <TrashIcon style={{ width: 18, height: 18 }} />
                  </button>
                </div>
              ))}

              {(data.stats?.length || 0) < 4 && (
                <button
                  type="button"
                  onClick={handleAddStat}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: 'fit-content',
                    marginTop: 4,
                  }}
                >
                  <PlusIcon style={{ width: 16, height: 16 }} />
                  Adicionar Estatística ({4 - (data.stats?.length || 0)} restantes)
                </button>
              )}
            </div>
          </SectionContainer>

          {/* 5. Parceiros e Fabricantes */}
          <SectionContainer icon={<PhotoIcon style={{ width: 20, height: 20 }} />} title="Logos de Parceiros e Fabricantes">
            {/* Parceiros */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={labelStyle}>Parceiros / Financiadores (Até 12 logos)</label>
                {(data.partnerLogos?.length || 0) < 12 && (
                  <label style={uploadButtonStyle}>
                    {uploadingTarget === 'partner' ? 'Enviando...' : '+ Adicionar Parceiro'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadImage(f, 'partner');
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 8 }}>
                Recomendado: 600×300 px • Proporção: 2:1 • Formato ideal: PNG transparente ou WebP (pré-visualização no formato real: 78×42 px)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {(data.partnerLogos || []).map((logo, idx) => (
                  <div key={idx} style={logoCardStyle}>
                    <img src={logo} alt="Parceiro" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo('partner', idx)}
                      style={removeLogoBtnStyle}
                      title="Remover logo"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {(data.partnerLogos?.length || 0) === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Nenhum logo de parceiro adicionado.</p>
                )}
              </div>
            </div>

            {/* Fabricantes / Marcas */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={labelStyle}>Marcas / Fabricantes de Equipamentos (Até 12 logos)</label>
                {(data.brandLogos?.length || 0) < 12 && (
                  <label style={uploadButtonStyle}>
                    {uploadingTarget === 'brand' ? 'Enviando...' : '+ Adicionar Marca'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadImage(f, 'brand');
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 8 }}>
                Recomendado: 600×300 px • Proporção: 2:1 • Formato ideal: PNG transparente ou WebP (pré-visualização no formato real: 78×42 px)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {(data.brandLogos || []).map((logo, idx) => (
                  <div key={idx} style={logoCardStyle}>
                    <img src={logo} alt="Marca" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo('brand', idx)}
                      style={removeLogoBtnStyle}
                      title="Remover logo"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {(data.brandLogos?.length || 0) === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Nenhum logo de fabricante adicionado.</p>
                )}
              </div>
            </div>
          </SectionContainer>

          {/* 6. Área de Atendimento */}
          <SectionContainer icon={<MapPinIcon style={{ width: 20, height: 20 }} />} title="Área de Atendimento">
            <label style={labelStyle}>Descrição da Região Atendida</label>
            <input
              type="text"
              value={data.serviceAreaText || ''}
              onChange={e => setData(prev => ({ ...prev, serviceAreaText: e.target.value }))}
              style={inputStyle}
              placeholder="Ex: Atendimento especializado em todo o Vale do Paraíba, Litoral Norte e Grande SP"
            />
          </SectionContainer>

          {/* 7. Itens Inclusos no Kit */}
          <SectionContainer icon={<ListBulletIcon style={{ width: 20, height: 20 }} />} title="Itens Inclusos no Kit e no Serviço">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
              Deixe claro para o cliente tudo o que está contemplado na proposta comercial:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(data.includedItems || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text)' }}>• {item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKitItem(idx)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}
                  >
                    <TrashIcon style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <input
                  type="text"
                  value={newKitItem}
                  onChange={e => setNewKitItem(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKitItem();
                    }
                  }}
                  placeholder="Novo item (ex: Homologação na concessionária)"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddKitItem}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </SectionContainer>

          {/* 8. Garantias, Exclusões e Observações */}
          <SectionContainer icon={<ShieldCheckIcon style={{ width: 20, height: 20 }} />} title="Garantias, Exclusões e Observações">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Texto de Garantias</label>
                <textarea
                  value={data.warrantiesText || ''}
                  onChange={e => setData(prev => ({ ...prev, warrantiesText: e.target.value }))}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  placeholder="Ex: 25 anos de eficiência nos módulos fotovoltaicos, 10 anos no inversor, 1 ano na instalação..."
                />
              </div>

              <div>
                <label style={labelStyle}>Exclusões do Escopo</label>
                <textarea
                  value={data.exclusionsText || ''}
                  onChange={e => setData(prev => ({ ...prev, exclusionsText: e.target.value }))}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  placeholder="Ex: Adequações no padrão de entrada, reforço de telhado e obras civis pesadas não inclusas..."
                />
              </div>

              <div>
                <label style={labelStyle}>Observações Gerais</label>
                <textarea
                  value={data.notesText || ''}
                  onChange={e => setData(prev => ({ ...prev, notesText: e.target.value }))}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  placeholder="Ex: Proposta válida por 10 dias corridos sujeita à disponibilidade em estoque..."
                />
              </div>
            </div>
          </SectionContainer>

          {/* 9. Termo de Aceite */}
          <SectionContainer icon={<CheckCircleIcon style={{ width: 20, height: 20 }} />} title="Termo de Aceite Comercial">
            <label style={labelStyle}>Texto para Assinatura / Aceite do Cliente</label>
            <textarea
              value={data.acceptanceText || ''}
              onChange={e => setData(prev => ({ ...prev, acceptanceText: e.target.value }))}
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              placeholder="Declaro que estou de acordo com os termos, prazos e condições financeiras descritas nesta proposta..."
            />
          </SectionContainer>

          {/* 10. Canais de Contato */}
          <SectionContainer icon={<PhoneIcon style={{ width: 20, height: 20 }} />} title="Canais de Contato na Proposta">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Endereço Comercial</label>
                <input
                  type="text"
                  value={data.contact?.address || ''}
                  onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, address: e.target.value } }))}
                  style={inputStyle}
                  placeholder="Av. Paulista, 1000 - São Paulo, SP"
                />
              </div>
              <div>
                <label style={labelStyle}>Telefone Comercial</label>
                <input
                  type="text"
                  value={data.contact?.phone || ''}
                  onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, phone: e.target.value } }))}
                  style={inputStyle}
                  placeholder="(11) 3000-0000"
                />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp</label>
                <input
                  type="text"
                  value={data.contact?.whatsapp || ''}
                  onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, whatsapp: e.target.value } }))}
                  style={inputStyle}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input
                  type="text"
                  value={data.contact?.website || ''}
                  onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, website: e.target.value } }))}
                  style={inputStyle}
                  placeholder="www.minhaempresa.com.br"
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Instagram</label>
                <input
                  type="text"
                  value={data.contact?.instagram || ''}
                  onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, instagram: e.target.value } }))}
                  style={inputStyle}
                  placeholder="@minhaempresa"
                />
              </div>
            </div>
          </SectionContainer>
        </div>

        {/* Coluna Lateral: Seções Habilitadas e Ações */}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Seções Habilitadas */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', marginBottom: 16 }}>
              <Squares2X2Icon style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Seções na Proposta</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 14px' }}>
              Ative ou desative seções conforme sua necessidade:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SectionToggle
                label="Capa da Proposta"
                checked={data.sectionsEnabled?.cover ?? true}
                onChange={v => setData(prev => ({ ...prev, sectionsEnabled: { ...prev.sectionsEnabled, cover: v } }))}
              />
              <SectionToggle
                label="Sobre a Empresa"
                checked={data.sectionsEnabled?.about ?? true}
                onChange={v => setData(prev => ({ ...prev, sectionsEnabled: { ...prev.sectionsEnabled, about: v } }))}
              />
              <SectionToggle
                label="Estatísticas de Destaque"
                checked={data.sectionsEnabled?.stats ?? true}
                onChange={v => setData(prev => ({ ...prev, sectionsEnabled: { ...prev.sectionsEnabled, stats: v } }))}
              />
              <SectionToggle
                label="Dados Técnicos do Projeto"
                checked={data.sectionsEnabled?.technical ?? true}
                onChange={v => setData(prev => ({ ...prev, sectionsEnabled: { ...prev.sectionsEnabled, technical: v } }))}
              />
              <SectionToggle
                label="Equipamentos do Sistema"
                checked={data.sectionsEnabled?.equipment ?? true}
                onChange={v => setData(prev => ({ ...prev, sectionsEnabled: { ...prev.sectionsEnabled, equipment: v } }))}
              />
              <SectionToggle
                label="Análise Financeira & Economia"
                checked={data.sectionsEnabled?.financial ?? true}
                onChange={v => setData(prev => ({ ...prev, sectionsEnabled: { ...prev.sectionsEnabled, financial: v } }))}
              />
              <SectionToggle
                label="Itens Inclusos no Kit"
                checked={data.sectionsEnabled?.kit ?? true}
                onChange={v => setData(prev => ({ ...prev, sectionsEnabled: { ...prev.sectionsEnabled, kit: v } }))}
              />
              <SectionToggle
                label="Garantias & Observações"
                checked={data.sectionsEnabled?.warranties ?? true}
                onChange={v => setData(prev => ({ ...prev, sectionsEnabled: { ...prev.sectionsEnabled, warranties: v } }))}
              />
              <SectionToggle
                label="Marcas e Parceiros"
                checked={data.sectionsEnabled?.partners ?? true}
                onChange={v => setData(prev => ({ ...prev, sectionsEnabled: { ...prev.sectionsEnabled, partners: v } }))}
              />
              <SectionToggle
                label="Contato & Assinatura"
                checked={data.sectionsEnabled?.contact ?? true}
                onChange={v => setData(prev => ({ ...prev, sectionsEnabled: { ...prev.sectionsEnabled, contact: v } }))}
              />
            </div>
          </div>

          {/* Botão de Salvar e Feedback */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: 24 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--green)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                opacity: saving ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              {saving ? 'Salvando...' : 'Salvar Configurações da Proposta'}
            </button>

            {message && (
              <p
                style={{
                  marginTop: 12,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: message.type === 'error' ? 'var(--danger)' : 'var(--success)',
                  textAlign: 'center',
                }}
              >
                {message.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

function SectionContainer({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', marginBottom: 20 }}>
        {icon}
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function TemplateCard({
  name,
  description,
  isSelected,
  onClick,
  children,
}: {
  name: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        border: `2px solid ${isSelected ? 'var(--green)' : 'var(--border)'}`,
        background: isSelected ? 'rgba(15, 118, 110, 0.04)' : 'var(--bg)',
        borderRadius: 'var(--radius-lg)',
        padding: 14,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>{name}</span>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: `2px solid ${isSelected ? 'var(--green)' : 'var(--border)'}`,
            background: isSelected ? 'var(--green)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
        </div>
      </div>
      {children}
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{description}</span>
    </div>
  );
}

function SectionToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13px', color: 'var(--text)' }}>
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ width: 16, height: 16, accentColor: 'var(--green)', cursor: 'pointer' }}
      />
    </label>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 14px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text)',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
};

const uploadButtonStyle: React.CSSProperties = {
  padding: '7px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const logoCardStyle: React.CSSProperties = {
  position: 'relative',
  width: 78,
  height: 42,
  padding: 4,
  borderRadius: 6,
  border: '1px solid #e2e8f0',
  background: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const removeLogoBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: -6,
  right: -6,
  width: 18,
  height: 18,
  borderRadius: '50%',
  background: 'var(--danger)',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: 'bold',
  lineHeight: 1,
};

const thumbnailContainerStyle: React.CSSProperties = {
  height: 90,
  background: '#ffffff',
  borderRadius: 4,
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};
