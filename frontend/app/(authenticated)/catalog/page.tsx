'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  SunIcon, BoltIcon, Square3Stack3DIcon, WrenchScrewdriverIcon,
  CpuChipIcon, DevicePhoneMobileIcon, ShieldExclamationIcon,
  PlusIcon, MagnifyingGlassIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../../../components/ui/Modal';
import { formatBRL } from '../../../lib/format';

type Category = 'module' | 'inverter' | 'structure' | 'cable' | 'connector' | 'protection' | 'service';
interface Product {
  id: string; category: Category; brand: string; line?: string; model: string;
  purchasePrice: number; suggestedPrice?: number; unit: string;
  active: boolean; specs: Record<string, any>; tags: string[];
  supplierId?: string; datasheetUrl?: string;
}

const CATEGORIES: { key: Category; label: string; icon: any }[] = [
  { key: 'module', label: 'Módulos', icon: SunIcon },
  { key: 'inverter', label: 'Inversores', icon: BoltIcon },
  { key: 'structure', label: 'Estruturas', icon: Square3Stack3DIcon },
  { key: 'cable', label: 'Cabos', icon: CpuChipIcon },
  { key: 'connector', label: 'Conectores', icon: DevicePhoneMobileIcon },
  { key: 'protection', label: 'Proteções', icon: ShieldExclamationIcon },
  { key: 'service', label: 'Serviços', icon: WrenchScrewdriverIcon },
];

const CATEGORY_COLORS: Record<string, string> = {
  module: '#059669', inverter: '#2563eb', structure: '#7c3aed',
  cable: '#ea580c', connector: '#0891b2', protection: '#dc2626', service: '#65a30d',
};

function fmt(v?: number) {
  if (v == null) return '—';
  return formatBRL(v);
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterCat, setFilterCat] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const api = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchProducts = useCallback(async () => {
    if (!api || !token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filterCat) p.set('category', filterCat);
      if (search) p.set('q', search);
      p.set('page', String(page));
      p.set('limit', '50');
      const r = await fetch(`${api}/catalog/products?${p}`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        const res = await r.json();
        setProducts(Array.isArray(res) ? res : res.data);
        if (!Array.isArray(res)) setTotalPages(res.totalPages || 1);
      }
    } catch {} finally { setLoading(false); }
  }, [api, token, filterCat, search, page]);

  useEffect(() => { setPage(1); }, [filterCat, search]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const specSummary = (p: Product) => {
    if (p.category === 'module') return p.specs?.powerWatt ? `${p.specs.powerWatt}W` : '';
    if (p.category === 'inverter') return p.specs?.nominalPowerKw ? `${p.specs.nominalPowerKw}kW` : '';
    return '';
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', width: '100%', padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Catálogo Técnico</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            {products.length} {products.length === 1 ? 'produto' : 'produtos'}
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
          borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--green)',
          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <PlusIcon style={{ width: 16, height: 16 }} /> Novo Produto
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterCat('')} style={tabStyle(!filterCat)}>Todos</button>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const active = filterCat === cat.key;
          return (
            <button key={cat.key} onClick={() => setFilterCat(active ? '' : cat.key)} style={{
              ...tabStyle(active),
              borderColor: active ? CATEGORY_COLORS[cat.key] : 'var(--border)',
              color: active ? CATEGORY_COLORS[cat.key] : 'var(--text-secondary)',
            }}>
              <Icon style={{ width: 14, height: 14 }} /> {cat.label}
            </button>
          );
        })}
      </div>

      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
        <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por marca, modelo ou linha..."
          style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <XMarkIcon style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 160, borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)', opacity: 0.5 }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, opacity: 0.2, marginBottom: 12 }}>◈</div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Nenhum produto encontrado</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Cadastre seu primeiro produto no catálogo técnico.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {products.map(p => (
              <div key={p.id} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 20, cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: CATEGORY_COLORS[p.category] + '18', color: CATEGORY_COLORS[p.category] }}>
                    {CATEGORIES.find(c => c.key === p.category)?.label || p.category}
                  </span>
                  {!p.active && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--danger)' }}>Inativo</span>}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 2px' }}>{p.brand}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 4px' }}>{p.model}</p>
                {p.line && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 10px' }}>Linha: {p.line}</p>}
                {specSummary(p) && <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{specSummary(p)}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Compra</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{fmt(p.purchasePrice)}</div>
                  </div>
                  {p.suggestedPrice && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>Sugerido</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{fmt(p.suggestedPrice)}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px 0' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1, fontFamily: 'inherit' }}
              >
                Anterior
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{page} de {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1, fontFamily: 'inherit' }}
              >
                Próximo
              </button>
            </div>
          )}
        </>
      )}

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); fetchProducts(); }}
        api={api!} token={token!}
      />
    </div>
  );
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
    borderRadius: 999, border: '1px solid',
    borderColor: active ? 'var(--green)' : 'var(--border)',
    background: active ? 'var(--green)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s',
  };
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)',
    fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };
}

function labelStyle(): React.CSSProperties {
  return { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 };
}

const SPEC_FIELDS: Record<string, { key: string; label: string; type: string; hint?: string }[]> = {
  module: [
    { key: 'powerWatt', label: 'Potência (W)', type: 'number' },
    { key: 'technology', label: 'Tecnologia', type: 'text', hint: 'Ex: Monocristalino PERC' },
    { key: 'efficiency', label: 'Eficiência (%)', type: 'number' },
    { key: 'voc', label: 'Voc (V)', type: 'number' },
    { key: 'vmp', label: 'Vmp (V)', type: 'number' },
    { key: 'isc', label: 'Isc (A)', type: 'number' },
    { key: 'imp', label: 'Imp (A)', type: 'number' },
    { key: 'warranty', label: 'Garantia produto (anos)', type: 'number' },
    { key: 'performanceWarranty', label: 'Garantia performance (anos)', type: 'number' },
  ],
  inverter: [
    { key: 'nominalPowerKw', label: 'Potência (kW)', type: 'number' },
    { key: 'phase', label: 'Fase', type: 'text', hint: 'Monofásico / Bifásico / Trifásico' },
    { key: 'mpptCount', label: 'Nº MPPT', type: 'number' },
    { key: 'maxStrings', label: 'Máx Strings', type: 'number' },
    { key: 'efficiency', label: 'Eficiência (%)', type: 'number' },
    { key: 'warranty', label: 'Garantia (anos)', type: 'number' },
  ],
  structure: [
    { key: 'type', label: 'Tipo', type: 'text', hint: 'Cerâmico / Fibrocimento / Metálico / Laje / Solo / Carport' },
    { key: 'compatibleRoof', label: 'Telhados compatíveis', type: 'text' },
    { key: 'warranty', label: 'Garantia (anos)', type: 'number' },
    { key: 'weight', label: 'Peso (kg)', type: 'number' },
  ],
  cable: [
    { key: 'section', label: 'Seção (mm²)', type: 'number' },
    { key: 'maxCurrent', label: 'Corrente máx (A)', type: 'number' },
    { key: 'length', label: 'Comprimento (m)', type: 'number' },
    { key: 'color', label: 'Cor', type: 'text' },
  ],
  connector: [
    { key: 'type', label: 'Tipo', type: 'text', hint: 'MC4 / MC4-Evo2 / Amphenol' },
    { key: 'maxCurrent', label: 'Corrente máx (A)', type: 'number' },
    { key: 'standard', label: 'Padrão', type: 'text' },
  ],
  protection: [
    { key: 'type', label: 'Tipo', type: 'text', hint: 'DPS / Disjuntor / String Box' },
    { key: 'maxCurrent', label: 'Corrente máx (A)', type: 'number' },
    { key: 'poles', label: 'Polos', type: 'number' },
  ],
  service: [
    { key: 'serviceType', label: 'Tipo de serviço', type: 'text', hint: 'Projeto / ART / Homologação / Instalação / Frete / Guindaste / Hotel / Deslocamento / Comissão' },
    { key: 'defaultValue', label: 'Valor padrão (R$)', type: 'number' },
  ],
};

function ProductFormModal({ open, onClose, onSaved, api, token }: { open: boolean; onClose: () => void; onSaved: () => void; api: string; token: string }) {
  const [cat, setCat] = useState<Category>('module');
  const [brand, setBrand] = useState('');
  const [line, setLine] = useState('');
  const [model, setModel] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) { setBrand(''); setLine(''); setModel(''); setPurchasePrice('');
      setSuggestedPrice(''); setSpecs({}); setCat('module'); }
  }, [open]);

  const handleSave = async () => {
    if (!brand || !model || !purchasePrice) return;
    setSaving(true);
    try {
      const body: any = {
        category: cat, brand, model, purchasePrice: Number(purchasePrice), unit: 'un',
        specs: {},
      };
      if (line) body.line = line;
      if (suggestedPrice) body.suggestedPrice = Number(suggestedPrice);
      const s: Record<string, any> = {};
      for (const [k, v] of Object.entries(specs)) {
        if (v !== '') s[k] = isNaN(Number(v)) ? v : Number(v);
      }
      body.specs = s;

      const r = await fetch(`${api}/catalog/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (r.ok) onSaved();
    } catch {} finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Novo Produto" size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle()}>Categoria</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => { setCat(c.key); setSpecs({}); }} style={{
                ...tabStyle(cat === c.key),
                borderColor: cat === c.key ? CATEGORY_COLORS[c.key] : 'var(--border)',
                color: cat === c.key ? CATEGORY_COLORS[c.key] : 'var(--text-secondary)',
                padding: '6px 12px', fontSize: 11,
              }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle()}>Marca *</label>
            <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Ex: Canadian Solar" style={inputStyle()} />
          </div>
          <div>
            <label style={labelStyle()}>Linha</label>
            <input value={line} onChange={e => setLine(e.target.value)} placeholder="Ex: HiKu6" style={inputStyle()} />
          </div>
          <div>
            <label style={labelStyle()}>Modelo *</label>
            <input value={model} onChange={e => setModel(e.target.value)} placeholder="Ex: CS6W-550" style={inputStyle()} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle()}>Preço de Compra *</label>
            <input type="text" inputMode="decimal" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.'))} placeholder="0,00" style={inputStyle()} />
          </div>
          <div>
            <label style={labelStyle()}>Preço Sugerido</label>
            <input type="text" inputMode="decimal" value={suggestedPrice} onChange={e => setSuggestedPrice(e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.'))} placeholder="0,00" style={inputStyle()} />
          </div>
        </div>

        {SPEC_FIELDS[cat] && (
          <div>
            <label style={{ ...labelStyle(), marginBottom: 8, color: 'var(--text)' }}>Especificações Técnicas</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {SPEC_FIELDS[cat].map(f => (
                    <div key={f.key}>
                      <label style={labelStyle()}>{f.label}</label>
                      <input
                        type={f.type === 'number' ? 'text' : f.type}
                        inputMode={f.type === 'number' ? 'decimal' : undefined}
                        value={specs[f.key] || ''}
                        onChange={e => {
                          const v = f.type === 'number'
                            ? e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
                            : e.target.value;
                          setSpecs(s => ({ ...s, [f.key]: v }));
                        }}
                        placeholder={f.hint || ''} style={inputStyle()} />
                    </div>
                  ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving || !brand || !model || !purchasePrice} style={{
            padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none',
            background: !brand || !model || !purchasePrice ? 'var(--text-muted)' : 'var(--green)',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: !brand || !model || !purchasePrice ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
