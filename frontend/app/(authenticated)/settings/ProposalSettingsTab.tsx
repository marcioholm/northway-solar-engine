'use client';

import { useState, useEffect, useRef } from 'react';
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
  SparklesIcon,
  QrCodeIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const BRAZIL_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

interface ServiceAreaCity {
  ibge: string;
  name: string;
  uf: string;
  lat: number;
  lon: number;
}

interface ProposalHighlight {
  icon: 'team' | 'support' | 'gauge' | 'helmet';
  title: string;
  text: string;
}

interface ProposalQrConfig {
  enabled: boolean;
  type: 'proposal' | 'consultant' | 'whatsapp' | 'site' | 'instagram' | 'custom';
  value?: string;
  message?: string;
  label?: string;
}

interface ProposalSettingsData {
  template: 'classico' | 'moderno' | 'minimalista';
  primaryColor: string;
  secondaryColor: string;
  coverImageUrl?: string;
  coverFocus?: 'top' | 'center' | 'bottom';
  aboutText?: string;
  aboutImageUrl?: string;
  stats?: { value: string; label: string }[];
  highlights?: ProposalHighlight[];
  partnerLogos?: string[];
  brandLogos?: string[];
  serviceArea?: {
    style?: 'brasil' | 'zoom' | 'estados';
    states: string[];
    cities: ServiceAreaCity[];
  };
  serviceAreaText?: string;
  includedItems?: string[];
  kitImageUrl?: string;
  servicesText?: string;
  warrantiesText?: string;
  exclusionsText?: string;
  notesText?: string;
  acceptanceText?: string;
  qr?: ProposalQrConfig;
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
  primaryColor: '#1F2937',
  secondaryColor: '#F59E0B',
  coverImageUrl: '',
  coverFocus: 'center',
  aboutText: '',
  aboutImageUrl: '',
  stats: [],
  highlights: [],
  partnerLogos: [],
  brandLogos: [],
  serviceArea: {
    style: 'zoom',
    states: [],
    cities: [],
  },
  serviceAreaText: '',
  includedItems: [],
  kitImageUrl: '',
  servicesText: '',
  warrantiesText: '',
  exclusionsText: '',
  notesText: '',
  acceptanceText: '',
  qr: {
    enabled: true,
    type: 'proposal',
    value: '',
    message: 'Olá! Recebi a proposta para {cliente} e quero tirar uma dúvida.',
    label: 'Veja esta proposta online',
  },
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

const DEFAULT_QR_LABELS: Record<string, string> = {
  proposal: 'Veja esta proposta online',
  consultant: 'Fale com seu consultor',
  whatsapp: 'Fale conosco no WhatsApp',
  site: 'Conheça nosso site',
  instagram: 'Siga a gente no Instagram',
  custom: 'Saiba mais',
};

// Image specifications and dimension validation (A4 a 150 dpi)
interface ImageValidationSpec {
  recommendedWidth: number;
  recommendedHeight: number;
  minWidth: number;
  minHeight: number;
  ratio: number;
  ratioLabel: string;
  idealFormat: string;
}

const PROPOSAL_IMAGE_SPECS: Record<'cover' | 'logo' | 'kit' | 'about' | 'partner' | 'brand', ImageValidationSpec> = {
  cover: {
    recommendedWidth: 2480,
    recommendedHeight: 2100,
    minWidth: 1650,
    minHeight: 1400,
    ratio: 2480 / 2100,
    ratioLabel: '6:5 (210 × 178 mm)',
    idealFormat: 'JPEG ou WebP',
  },
  logo: {
    recommendedWidth: 1000,
    recommendedHeight: 300,
    minWidth: 600,
    minHeight: 180,
    ratio: 10 / 3,
    ratioLabel: '10:3 (até 20 mm de altura)',
    idealFormat: 'PNG transparente ou WebP',
  },
  kit: {
    recommendedWidth: 1200,
    recommendedHeight: 800,
    minWidth: 650,
    minHeight: 430,
    ratio: 3 / 2,
    ratioLabel: '3:2 (55 × 30 mm)',
    idealFormat: 'PNG transparente ou WebP',
  },
  about: {
    recommendedWidth: 1200,
    recommendedHeight: 800,
    minWidth: 600,
    minHeight: 400,
    ratio: 3 / 2,
    ratioLabel: '3:2',
    idealFormat: 'JPEG ou WebP',
  },
  partner: {
    recommendedWidth: 600,
    recommendedHeight: 300,
    minWidth: 400,
    minHeight: 200,
    ratio: 2 / 1,
    ratioLabel: '2:1 (35 × 10 mm)',
    idealFormat: 'PNG transparente ou WebP',
  },
  brand: {
    recommendedWidth: 600,
    recommendedHeight: 300,
    minWidth: 400,
    minHeight: 200,
    ratio: 2 / 1,
    ratioLabel: '2:1 (35 × 10 mm)',
    idealFormat: 'PNG transparente ou WebP',
  },
};

function getContrastRatioWithWhite(hex: string): number {
  const clean = (hex || '').replace('#', '');
  if (clean.length !== 6 && clean.length !== 3) return 21;
  const full =
    clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return (1.0 + 0.05) / (L + 0.05);
}

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

/**
 * Reduz a imagem no cliente antes do upload usando HTML Canvas para evitar estourar o limite de payload.
 */
async function resizeImageBeforeUpload(
  file: File,
  target: 'cover' | 'logo' | 'kit' | 'about' | 'partner' | 'brand',
): Promise<File> {
  const spec = PROPOSAL_IMAGE_SPECS[target];
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= spec.recommendedWidth && height <= spec.recommendedHeight) {
        resolve(file);
        return;
      }
      const scale = Math.min(
        spec.recommendedWidth / width,
        spec.recommendedHeight / height,
      );
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const isPng = file.type === 'image/png';
      const outputType = isPng ? 'image/png' : 'image/jpeg';
      const quality = target === 'cover' ? 0.85 : 0.82;
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const resized = new File([blob], file.name, { type: outputType });
          resolve(resized);
        },
        outputType,
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

async function validateProposalImage(
  file: File,
  target: 'cover' | 'logo' | 'kit' | 'about' | 'partner' | 'brand',
): Promise<boolean> {
  const spec = PROPOSAL_IMAGE_SPECS[target];
  try {
    const { width, height } = await getImageDimensions(file);
    const warnings: string[] = [];

    if (width < spec.minWidth || height < spec.minHeight) {
      warnings.push(
        `Dimensões baixas (${width}×${height} px). O mínimo recomendado é ${spec.minWidth}×${spec.minHeight} px (ideal de ${spec.recommendedWidth}×${spec.recommendedHeight} px) para garantir nitidez na proposta impressa e no PDF.`,
      );
    }

    const currentRatio = width / height;
    const diffRatio = Math.abs(currentRatio - spec.ratio) / spec.ratio;
    if (diffRatio > 0.45) {
      warnings.push(
        `Proporção da imagem (${width}×${height} px, proporção ${currentRatio.toFixed(2)}:1) difere da recomendada (${spec.ratioLabel}). A imagem poderá sofrer cortes.`,
      );
    }

    if (warnings.length > 0) {
      return window.confirm(
        `Atenção às dimensões da imagem selecionada:\n\n• ${warnings.join('\n• ')}\n\nDeseja enviar mesmo assim?`,
      );
    }
  } catch {
    // Permite prosseguir se não conseguir ler no navegador
  }
  return true;
}

export function ProposalSettingsTab() {
  const [data, setData] = useState<ProposalSettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [newKitItem, setNewKitItem] = useState('');

  // Autocomplete de cidades para "Onde atuamos"
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [citySearchResults, setCitySearchResults] = useState<ServiceAreaCity[]>([]);
  const [citySearching, setCitySearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposal-settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const settings = await res.json();
          setData({
            template: 'moderno',
            primaryColor: settings.primaryColor || '#1F2937',
            secondaryColor: settings.secondaryColor || '#F59E0B',
            coverImageUrl: settings.coverImageUrl || '',
            coverFocus: settings.coverFocus || 'center',
            aboutText: settings.aboutText || '',
            aboutImageUrl: settings.aboutImageUrl || '',
            stats: settings.stats || [],
            highlights: settings.highlights || [],
            partnerLogos: settings.partnerLogos || [],
            brandLogos: settings.brandLogos || [],
            serviceArea: settings.serviceArea || {
              style: 'zoom',
              states: [],
              cities: [],
            },
            serviceAreaText: settings.serviceAreaText || '',
            includedItems: settings.includedItems || [],
            kitImageUrl: settings.kitImageUrl || '',
            servicesText: settings.servicesText || '',
            warrantiesText: settings.warrantiesText || '',
            exclusionsText: settings.exclusionsText || '',
            notesText: settings.notesText || '',
            acceptanceText: settings.acceptanceText || '',
            qr: settings.qr || {
              enabled: true,
              type: 'proposal',
              value: '',
              message: 'Olá! Recebi a proposta para {cliente} e quero tirar uma dúvida.',
              label: 'Veja esta proposta online',
            },
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
        }
      } catch (err) {
        console.error('Erro ao carregar configurações de proposta:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Busca de cidades via API debounced
  useEffect(() => {
    if (citySearchQuery.trim().length < 2) {
      setCitySearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setCitySearching(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/geo/cities?q=${encodeURIComponent(
            citySearchQuery.trim(),
          )}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const results = await res.json();
          setCitySearchResults(results);
        }
      } catch {
        setCitySearchResults([]);
      } finally {
        setCitySearching(false);
      }
    }, 280);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [citySearchQuery]);

  const handleUploadImage = async (
    file: File,
    target: 'cover' | 'logo' | 'kit' | 'about' | 'partner' | 'brand',
  ) => {
    const ok = await validateProposalImage(file, target);
    if (!ok) return;

    setUploadingTarget(target);
    setMessage(null);

    try {
      // Reduz no canvas antes de enviar para caber seguro em < 4 MB
      const processedFile = await resizeImageBeforeUpload(file, target);

      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('type', target);

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposal-settings/upload?type=${target}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Falha ao fazer upload da imagem');
      }

      const { url } = await res.json();

      if (target === 'cover') {
        setData(prev => ({ ...prev, coverImageUrl: url }));
      } else if (target === 'kit') {
        setData(prev => ({ ...prev, kitImageUrl: url }));
      } else if (target === 'about') {
        setData(prev => ({ ...prev, aboutImageUrl: url }));
      } else if (target === 'partner') {
        setData(prev => ({
          ...prev,
          partnerLogos: [...(prev.partnerLogos || []), url].slice(0, 12),
        }));
      } else if (target === 'brand') {
        setData(prev => ({
          ...prev,
          brandLogos: [...(prev.brandLogos || []), url].slice(0, 12),
        }));
      }

      setMessage({ type: 'success', text: 'Imagem enviada com sucesso!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao enviar imagem' });
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    if (!hexRegex.test(data.primaryColor) || !hexRegex.test(data.secondaryColor)) {
      setMessage({ type: 'error', text: 'As cores devem ser códigos hexadecimais válidos (ex: #1F2937)' });
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        template: 'moderno',
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        coverImageUrl: data.coverImageUrl || null,
        coverFocus: data.coverFocus || 'center',
        aboutText: data.aboutText,
        aboutImageUrl: data.aboutImageUrl || null,
        stats: data.stats || [],
        highlights: data.highlights || [],
        partnerLogos: data.partnerLogos || [],
        brandLogos: data.brandLogos || [],
        serviceArea: data.serviceArea,
        serviceAreaText: data.serviceAreaText,
        includedItems: data.includedItems || [],
        kitImageUrl: data.kitImageUrl || null,
        servicesText: data.servicesText,
        warrantiesText: data.warrantiesText,
        exclusionsText: data.exclusionsText,
        notesText: data.notesText,
        acceptanceText: data.acceptanceText,
        qr: data.qr,
        contact: data.contact,
        sectionsEnabled: data.sectionsEnabled,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposal-settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Falha ao salvar configurações');
      }

      setMessage({ type: 'success', text: 'Configurações da proposta comercial salvas com sucesso!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar' });
    } finally {
      setSaving(false);
    }
  };

  // Funções de manipulação de estados e cidades
  const handleToggleState = (uf: string) => {
    const currentStates = data.serviceArea?.states || [];
    const exists = currentStates.includes(uf);
    const newStates = exists
      ? currentStates.filter((s) => s !== uf)
      : [...currentStates, uf];
    // Se remover o estado, remove também as cidades dele
    const newCities = exists
      ? (data.serviceArea?.cities || []).filter((c) => c.uf !== uf)
      : data.serviceArea?.cities || [];

    setData((prev) => ({
      ...prev,
      serviceArea: {
        ...prev.serviceArea,
        states: newStates,
        cities: newCities,
      },
    }));
  };

  const handleAddCity = (city: ServiceAreaCity) => {
    const currentCities = data.serviceArea?.cities || [];
    if (currentCities.some((c) => c.ibge === city.ibge)) return;

    // Se o estado da cidade ainda não estiver selecionado, seleciona-o
    const currentStates = data.serviceArea?.states || [];
    const newStates = currentStates.includes(city.uf)
      ? currentStates
      : [...currentStates, city.uf];

    setData((prev) => ({
      ...prev,
      serviceArea: {
        ...prev.serviceArea,
        states: newStates,
        cities: [...currentCities, city],
      },
    }));
    setCitySearchQuery('');
    setCitySearchResults([]);
  };

  const handleRemoveCity = (ibge: string) => {
    setData((prev) => ({
      ...prev,
      serviceArea: {
        ...prev.serviceArea,
        states: prev.serviceArea?.states || [],
        cities: (prev.serviceArea?.cities || []).filter((c) => c.ibge !== ibge),
      },
    }));
  };

  // Funções de diferenciais (highlights)
  const handleAddHighlight = () => {
    if ((data.highlights?.length || 0) >= 4) return;
    setData((prev) => ({
      ...prev,
      highlights: [
        ...(prev.highlights || []),
        { icon: 'team', title: 'Equipe Própria', text: 'Instalação sem terceirização com padrão de excelência.' },
      ],
    }));
  };

  const handleUpdateHighlight = (idx: number, field: keyof ProposalHighlight, val: any) => {
    const updated = [...(data.highlights || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setData((prev) => ({ ...prev, highlights: updated }));
  };

  const handleRemoveHighlight = (idx: number) => {
    setData((prev) => ({
      ...prev,
      highlights: (prev.highlights || []).filter((_, i) => i !== idx),
    }));
  };

  const handleAddStat = () => {
    if ((data.stats?.length || 0) >= 4) return;
    setData(prev => ({
      ...prev,
      stats: [...(prev.stats || []), { value: '', label: '' }],
    }));
  };

  const handleUpdateStat = (idx: number, field: 'value' | 'label', val: string) => {
    const updated = [...(data.stats || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setData(prev => ({ ...prev, stats: updated }));
  };

  const handleRemoveStat = (idx: number) => {
    setData(prev => ({
      ...prev,
      stats: (prev.stats || []).filter((_, i) => i !== idx),
    }));
  };

  const handleAddKitItem = () => {
    if (!newKitItem.trim()) return;
    setData(prev => ({
      ...prev,
      includedItems: [...(prev.includedItems || []), newKitItem.trim()],
    }));
    setNewKitItem('');
  };

  const handleRemoveKitItem = (idx: number) => {
    setData(prev => ({
      ...prev,
      includedItems: (prev.includedItems || []).filter((_, i) => i !== idx),
    }));
  };

  const handleRemoveLogo = (type: 'partner' | 'brand', idx: number) => {
    if (type === 'partner') {
      setData(prev => ({
        ...prev,
        partnerLogos: (prev.partnerLogos || []).filter((_, i) => i !== idx),
      }));
    } else {
      setData(prev => ({
        ...prev,
        brandLogos: (prev.brandLogos || []).filter((_, i) => i !== idx),
      }));
    }
  };

  if (loading) {
    return <div style={{ padding: '32px 0', color: 'var(--text-secondary)' }}>Carregando configurações...</div>;
  }

  const primaryContrastRatio = getContrastRatioWithWhite(data.primaryColor);
  const showContrastWarning = primaryContrastRatio < 4.5;

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
          Modelo & Personalização da Proposta Comercial
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Configure o modelo Moderno, cores institucionais, mapa de atuação e rastreamento por QR code para propostas em PDF e link público.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 32, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* 1. Modelo de Proposta Aprovado */}
          <SectionContainer icon={<DocumentTextIcon style={{ width: 20, height: 20 }} />} title="Modelo da Proposta Comercial">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  border: '2px solid var(--green)',
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 18,
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 96,
                    borderRadius: 4,
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ height: 38, background: data.coverImageUrl ? '#0f172a' : data.primaryColor || '#1F2937', position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: data.secondaryColor || '#F59E0B' }} />
                  </div>
                  <div style={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ width: '70%', height: 4, background: data.primaryColor || '#1F2937', borderRadius: 1 }} />
                    <div style={{ width: '45%', height: 3, background: '#94a3b8', borderRadius: 1 }} />
                    <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 2, marginTop: 4 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>Modelo Moderno (Aprovado)</span>
                    <span style={{ background: 'var(--green-light, #dcfce7)', color: 'var(--green-dark, #15803d)', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
                      PADRÃO DO SISTEMA
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                    Design editorial técnico em 5 páginas A4: capa fotográfica com enquadramento flexível, mapa de atuação integrado via SVG, tipografia Barlow embutida e comparativo de investimento.
                  </p>
                </div>
              </div>
            </div>
          </SectionContainer>

          {/* 2. Identidade Visual & Cores */}
          <SectionContainer icon={<PaintBrushIcon style={{ width: 20, height: 20 }} />} title="Identidade Visual & Cores da Empresa">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={labelStyle}>Cor Principal</label>
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
                    placeholder="#1F2937"
                  />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Fundo da capa, títulos, mapa de atuação e estrutura</span>
              </div>

              <div>
                <label style={labelStyle}>Cor de Destaque</label>
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
                    placeholder="#F59E0B"
                  />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Faixa de destaque, métricas, números e pins</span>
              </div>
            </div>

            {/* Aviso de contraste quando menor que 4.5:1 com texto branco */}
            {showContrastWarning && (
              <div
                style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: '#b45309',
                  fontSize: '12px',
                }}
              >
                <ExclamationTriangleIcon style={{ width: 20, height: 20, flexShrink: 0 }} />
                <span>
                  <b>Atenção ao contraste ({primaryContrastRatio.toFixed(1)}:1):</b> A Cor Principal é muito clara para texto branco (&lt; 4.5:1 WCAG). Recomenda-se um tom mais escuro para manter a legibilidade dos títulos e da capa.
                </span>
              </div>
            )}

            {/* Pré-visualização ao vivo das cores (estilo demo-cores) */}
            <div style={{ marginTop: 20, padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                  Pré-visualização ao Vivo das Cores
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Atualiza em tempo real</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                {/* Cartão da capa */}
                <div style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #cbd5e1', background: '#fff' }}>
                  <div style={{ height: 48, background: data.coverImageUrl ? '#0f172a' : data.primaryColor || '#1F2937', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '6px 10px' }}>
                    <div style={{ position: 'absolute', top: 0, left: 10, width: 32, height: 3, background: data.secondaryColor || '#F59E0B' }} />
                    <span style={{ color: '#fff', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Proposta Comercial</span>
                  </div>
                  <div style={{ padding: '8px 10px', background: data.primaryColor || '#1F2937', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', opacity: 0.8 }}>Sistema Solar</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: data.secondaryColor || '#F59E0B' }}>8,50 kWp</span>
                  </div>
                </div>
                {/* Cartão de métrica/destaque */}
                <div style={{ border: `2px solid ${data.primaryColor || '#1F2937'}`, borderRadius: 6, padding: '8px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Kit Recomendado</span>
                    <span style={{ background: data.secondaryColor || '#F59E0B', color: '#111', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: 2 }}>95% COB</span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: data.primaryColor || '#1F2937', margin: '4px 0' }}>
                    R$ 28.500
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Economia estimada ~R$ 750/mês</span>
                </div>
              </div>
            </div>

            {/* Imagem de Capa e Enquadramento */}
            <div style={{ marginTop: 24 }}>
              <label style={labelStyle}>Imagem de Capa (210 × 178 mm • Proporção 6:5)</label>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 12 }}>
                Recomendado: 2480×2100 px (mínimo 1650×1400 px) • Formato: JPEG ou WebP • O navegador redimensiona fotos pesadas antes do envio.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
                {/* Preview com proporção exata 6:5 (210 × 178 mm) */}
                <div
                  style={{
                    width: 260,
                    height: 220,
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    position: 'relative',
                    overflow: 'hidden',
                    background: data.coverImageUrl ? '#0f172a' : data.primaryColor || '#1F2937',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Pré-visualização no formato exato da capa A4 (210 × 178 mm)"
                >
                  {data.coverImageUrl ? (
                    <>
                      <img
                        src={data.coverImageUrl}
                        alt="Capa"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: data.coverFocus || 'center',
                        }}
                      />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: data.secondaryColor || '#F59E0B' }} />
                      <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '9px', padding: '2px 8px', borderRadius: 4, backdropFilter: 'blur(4px)' }}>
                        6:5 (210×178 mm)
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)' }}>
                      <PhotoIcon style={{ width: 36, height: 36, opacity: 0.6 }} />
                      <span style={{ fontSize: '11px' }}>Textura diagonal padrão</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Enquadramento da Foto (coverFocus)</label>
                    <select
                      value={data.coverFocus || 'center'}
                      onChange={e => setData(prev => ({ ...prev, coverFocus: e.target.value as any }))}
                      style={{ ...inputStyle, width: '220px' }}
                    >
                      <option value="top">Superior (Top)</option>
                      <option value="center">Centralizado (Center - Padrão)</option>
                      <option value="bottom">Inferior (Bottom)</option>
                    </select>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: 4 }}>
                      Controla o ponto de foco da foto na folha A4 vertical.
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <label style={uploadButtonStyle}>
                      {uploadingTarget === 'cover' ? 'Otimizando e enviando...' : 'Escolher foto de capa'}
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
                        Remover capa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Imagem do Kit e Equipamentos */}
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <label style={labelStyle}>Imagem Padrão do Kit (Opcional • Proporção 3:2)</label>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 12 }}>
                Recomendado: 1200×800 px (mínimo 650×430 px) • Formato: PNG transparente • Se não for enviada, o sistema gera automaticamente a ilustração técnica em SVG com as cores da sua empresa.
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div
                  style={{
                    width: 150,
                    height: 100,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    background: 'var(--bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {data.kitImageUrl ? (
                    <img src={data.kitImageUrl} alt="Kit" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: 6 }}>
                      Ilustração SVG automática
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={uploadButtonStyle}>
                    {uploadingTarget === 'kit' ? 'Enviando...' : 'Escolher imagem do kit'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImage(file, 'kit');
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {data.kitImageUrl && (
                    <button
                      type="button"
                      onClick={() => setData(prev => ({ ...prev, kitImageUrl: '' }))}
                      style={{ color: 'var(--danger)', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Restaurar ilustração SVG
                    </button>
                  )}
                </div>
              </div>
            </div>
          </SectionContainer>

          {/* 3. Área de Atuação e Mapa Dinâmico */}
          <SectionContainer icon={<MapPinIcon style={{ width: 20, height: 20 }} />} title="Área de Atuação & Mapa Interativo">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              Defina os estados e cidades atendidos. O mapa em SVG é desenhado no servidor com projeção calibrada e suas cores institucionais.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Estilo do Mapa */}
              <div>
                <label style={labelStyle}>Estilo de Exibição do Mapa</label>
                <select
                  value={data.serviceArea?.style || 'zoom'}
                  onChange={e =>
                    setData(prev => ({
                      ...prev,
                      serviceArea: {
                        states: prev.serviceArea?.states || [],
                        cities: prev.serviceArea?.cities || [],
                        style: e.target.value as any,
                      },
                    }))
                  }
                  style={{ ...inputStyle, width: '240px' }}
                >
                  <option value="zoom">Recorte nos estados com pins numerados (Zoom)</option>
                  <option value="brasil">Mapa completo do Brasil (Brasil)</option>
                  <option value="estados">Grade de silhuetas dos estados (Estados)</option>
                </select>
              </div>

              {/* Seleção de Estados (27 UFs) */}
              <div>
                <label style={labelStyle}>Estados Atendidos (Multiseleção das 27 UFs)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {BRAZIL_UFS.map(uf => {
                    const isSelected = (data.serviceArea?.states || []).includes(uf);
                    return (
                      <button
                        key={uf}
                        type="button"
                        onClick={() => handleToggleState(uf)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 4,
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: isSelected ? '1px solid var(--green)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--green)' : 'var(--surface)',
                          color: isSelected ? '#fff' : 'var(--text)',
                        }}
                      >
                        {uf}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Autocomplete de Cidades IBGE */}
              <div>
                <label style={labelStyle}>Adicionar Cidades com Pins no Mapa</label>
                <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
                  <input
                    type="text"
                    value={citySearchQuery}
                    onChange={e => setCitySearchQuery(e.target.value)}
                    placeholder="Digite o nome da cidade (ex: Sorocaba, Londrina...)"
                    style={inputStyle}
                  />
                  {citySearching && (
                    <div style={{ position: 'absolute', right: 12, top: 11, fontSize: '11px', color: 'var(--text-muted)' }}>
                      Buscando...
                    </div>
                  )}

                  {citySearchResults.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        maxHeight: 220,
                        overflowY: 'auto',
                        zIndex: 20,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        marginTop: 4,
                      }}
                    >
                      {citySearchResults.map(c => (
                        <div
                          key={c.ibge}
                          onClick={() => handleAddCity(c)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            borderBottom: '1px solid var(--border-light, #f1f5f9)',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <span>{c.name}</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{c.uf}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lista de Cidades Adicionadas */}
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(data.serviceArea?.cities || []).map(city => (
                    <div
                      key={city.ibge}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 14,
                        padding: '4px 10px',
                        fontSize: '12px',
                        color: 'var(--text)',
                      }}
                    >
                      <span>{city.name}/{city.uf}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCity(city.ibge)}
                        style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(data.serviceArea?.cities || []).length === 0 && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Nenhuma cidade marcada com pin.
                    </span>
                  )}
                </div>
              </div>

              {/* Texto descritivo opcional */}
              <div>
                <label style={labelStyle}>Descrição Textual da Área Atendida</label>
                <input
                  type="text"
                  value={data.serviceAreaText || ''}
                  onChange={e => setData(prev => ({ ...prev, serviceAreaText: e.target.value }))}
                  style={inputStyle}
                  placeholder="Ex: Atendimento especializado em todo o estado com equipe técnica própria."
                />
              </div>

              {/* Atribuição de Licença do Mapa exigida por CC BY 4.0 */}
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingTop: 6, borderTop: '1px dashed var(--border)' }}>
                Base geográfica: @svg-maps/brazil por Victor Cazanave (licença CC BY 4.0) • Coordenadas municipais: kelvins/municipios-brasileiros (MIT).
              </div>
            </div>
          </SectionContainer>

          {/* 4. QR Code Rastreado */}
          <SectionContainer icon={<QrCodeIcon style={{ width: 20, height: 20 }} />} title="QR Code da Capa (Rastreamento em Tempo Real)">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              O QR code impresso na capa direciona para o link rastreado da proposta. O sistema registra cada leitura antes de redirecionar para o destino seguro.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="checkbox"
                  id="qr-enabled"
                  checked={data.qr?.enabled ?? true}
                  onChange={e =>
                    setData(prev => ({
                      ...prev,
                      qr: {
                        ...(prev.qr || DEFAULT_SETTINGS.qr!),
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="qr-enabled" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}>
                  Exibir QR code rastreado no rodapé da capa da proposta
                </label>
              </div>

              {data.qr?.enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4 }}>
                  <div>
                    <label style={labelStyle}>Tipo de Destino do QR Code</label>
                    <select
                      value={data.qr?.type || 'proposal'}
                      onChange={e => {
                        const newType = e.target.value as any;
                        setData(prev => ({
                          ...prev,
                          qr: {
                            ...(prev.qr || DEFAULT_SETTINGS.qr!),
                            type: newType,
                            label: DEFAULT_QR_LABELS[newType] || prev.qr?.label || '',
                          },
                        }));
                      }}
                      style={inputStyle}
                    >
                      <option value="proposal">Página online da proposta (Recomendado)</option>
                      <option value="consultant">WhatsApp do consultor da proposta</option>
                      <option value="whatsapp">WhatsApp institucional fixo da empresa</option>
                      <option value="site">Website da empresa (HTTPS)</option>
                      <option value="instagram">Perfil no Instagram (@perfil)</option>
                      <option value="custom">URL personalizada (HTTPS)</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Rótulo ao lado do QR Code (Até 40 caracteres)</label>
                    <input
                      type="text"
                      maxLength={40}
                      value={data.qr?.label || ''}
                      onChange={e =>
                        setData(prev => ({
                          ...prev,
                          qr: { ...(prev.qr || DEFAULT_SETTINGS.qr!), label: e.target.value },
                        }))
                      }
                      style={inputStyle}
                      placeholder="Veja esta proposta online"
                    />
                  </div>

                  {(data.qr?.type === 'whatsapp' ||
                    data.qr?.type === 'site' ||
                    data.qr?.type === 'instagram' ||
                    data.qr?.type === 'custom') && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={labelStyle}>
                        {data.qr.type === 'whatsapp'
                          ? 'Número de WhatsApp (com DDD)'
                          : data.qr.type === 'instagram'
                          ? 'Nome de Usuário no Instagram (@exemplo)'
                          : 'URL de Destino (deve usar https://)'}
                      </label>
                      <input
                        type="text"
                        value={data.qr?.value || ''}
                        onChange={e =>
                          setData(prev => ({
                            ...prev,
                            qr: { ...(prev.qr || DEFAULT_SETTINGS.qr!), value: e.target.value },
                          }))
                        }
                        style={inputStyle}
                        placeholder={
                          data.qr.type === 'whatsapp'
                            ? '11988881234'
                            : data.qr.type === 'instagram'
                            ? '@horizonte.solar'
                            : 'https://suaempresa.com.br'
                        }
                      />
                    </div>
                  )}

                  {(data.qr?.type === 'consultant' || data.qr?.type === 'whatsapp') && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={labelStyle}>Mensagem Inicial de WhatsApp (opcional • use {'{cliente}'})</label>
                      <input
                        type="text"
                        maxLength={200}
                        value={data.qr?.message || ''}
                        onChange={e =>
                          setData(prev => ({
                            ...prev,
                            qr: { ...(prev.qr || DEFAULT_SETTINGS.qr!), message: e.target.value },
                          }))
                        }
                        style={inputStyle}
                        placeholder="Olá! Recebi a proposta para {cliente} e quero tirar uma dúvida."
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </SectionContainer>

          {/* 5. Diferenciais e Destaques */}
          <SectionContainer icon={<SparklesIcon style={{ width: 20, height: 20 }} />} title="Diferenciais da Empresa (Até 4 itens)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(data.highlights || []).map((hl, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 180px 1fr 36px',
                    gap: 10,
                    alignItems: 'center',
                    background: 'var(--bg)',
                    padding: 10,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <select
                    value={hl.icon}
                    onChange={e => handleUpdateHighlight(idx, 'icon', e.target.value as any)}
                    style={inputStyle}
                  >
                    <option value="team">Equipe</option>
                    <option value="support">Atendimento</option>
                    <option value="gauge">Monitoramento</option>
                    <option value="helmet">Engenharia</option>
                  </select>
                  <input
                    type="text"
                    value={hl.title}
                    onChange={e => handleUpdateHighlight(idx, 'title', e.target.value)}
                    placeholder="Título (ex: Equipe própria)"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={hl.text}
                    onChange={e => handleUpdateHighlight(idx, 'text', e.target.value)}
                    placeholder="Descrição breve do diferencial..."
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(idx)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}
                    title="Remover diferencial"
                  >
                    <TrashIcon style={{ width: 18, height: 18 }} />
                  </button>
                </div>
              ))}

              {(data.highlights?.length || 0) < 4 && (
                <button
                  type="button"
                  onClick={handleAddHighlight}
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
                  }}
                >
                  <PlusIcon style={{ width: 16, height: 16 }} />
                  Adicionar Diferencial ({4 - (data.highlights?.length || 0)} restantes)
                </button>
              )}
            </div>
          </SectionContainer>

          {/* 6. Sobre a Empresa */}
          <SectionContainer icon={<BuildingOffice2Icon style={{ width: 20, height: 20 }} />} title="Sobre a Empresa">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Texto Institucional / Quem Somos</label>
                <textarea
                  value={data.aboutText || ''}
                  onChange={e => setData(prev => ({ ...prev, aboutText: e.target.value }))}
                  style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                  placeholder="Somos especialistas em soluções completas de energia solar fotovoltaica..."
                />
              </div>
            </div>
          </SectionContainer>

          {/* 7. Estatísticas de Destaque */}
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
                    placeholder="Ex: +500 ou 5 MWp"
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

          {/* 8. Parceiros e Fabricantes */}
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
                Recomendado: 600×300 px • Proporção: 2:1 • Formato ideal: PNG transparente ou WebP
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
                Recomendado: 600×300 px • Proporção: 2:1 • Formato ideal: PNG transparente ou WebP
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

          {/* 9. Itens Inclusos no Kit */}
          <SectionContainer icon={<ListBulletIcon style={{ width: 20, height: 20 }} />} title="Itens Inclusos no Kit">
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

          {/* 10. Serviços Inclusos e Condições */}
          <SectionContainer icon={<WrenchScrewdriverIcon style={{ width: 20, height: 20 }} />} title="Serviços Inclusos">
            <div>
              <label style={labelStyle}>Serviços Inclusos na Proposta (um por linha)</label>
              <textarea
                value={data.servicesText || ''}
                onChange={e => setData(prev => ({ ...prev, servicesText: e.target.value }))}
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                placeholder="Projeto elétrico e homologação na concessionária&#10;Instalação com equipe credenciada&#10;Monitoramento remoto no primeiro ano"
              />
            </div>
          </SectionContainer>

          {/* 11. Garantias, Exclusões e Observações */}
          <SectionContainer icon={<ShieldCheckIcon style={{ width: 20, height: 20 }} />} title="Garantias, Exclusões e Observações">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Texto de Garantias e Prazos</label>
                <textarea
                  value={data.warrantiesText || ''}
                  onChange={e => setData(prev => ({ ...prev, warrantiesText: e.target.value }))}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  placeholder="Até 12 anos contra defeito dos módulos..."
                />
              </div>

              <div>
                <label style={labelStyle}>Exclusões do Escopo (Não faz parte desta proposta)</label>
                <textarea
                  value={data.exclusionsText || ''}
                  onChange={e => setData(prev => ({ ...prev, exclusionsText: e.target.value }))}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  placeholder="Adequações no padrão de entrada, reforço de telhado..."
                />
              </div>

              <div>
                <label style={labelStyle}>Observações Importantes</label>
                <textarea
                  value={data.notesText || ''}
                  onChange={e => setData(prev => ({ ...prev, notesText: e.target.value }))}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  placeholder="Valores de geração e economia são estimativas sujeitas a variações climáticas..."
                />
              </div>
            </div>
          </SectionContainer>

          {/* 12. Termo de Aceite */}
          <SectionContainer icon={<CheckCircleIcon style={{ width: 20, height: 20 }} />} title="Termo de Aceite Comercial">
            <label style={labelStyle}>Texto para Assinatura / Aceite do Cliente</label>
            <textarea
              value={data.acceptanceText || ''}
              onChange={e => setData(prev => ({ ...prev, acceptanceText: e.target.value }))}
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              placeholder="Declaro que estou de acordo com os termos, prazos e condições comerciais apresentadas..."
            />
          </SectionContainer>

          {/* 13. Canais de Contato */}
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

        {/* Coluna Lateral: Seções Habilitadas e Salvar */}
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
                label="Sobre a Empresa & Mapa"
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

function SectionToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}>
      <span style={{ fontSize: '13px', color: 'var(--text)' }}>{label}</span>
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
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text)',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text)',
  fontSize: '13px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const uploadButtonStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

const logoCardStyle: React.CSSProperties = {
  width: 78,
  height: 42,
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 4,
  position: 'relative',
};

const removeLogoBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: -6,
  right: -6,
  width: 16,
  height: 16,
  borderRadius: '50%',
  background: 'var(--danger)',
  color: '#fff',
  border: 'none',
  fontSize: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};
