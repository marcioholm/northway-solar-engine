'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  SunIcon, BoltIcon, Square3Stack3DIcon, WrenchScrewdriverIcon,
  CpuChipIcon, DevicePhoneMobileIcon, ShieldExclamationIcon,
  PlusIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { decodeToken } from '../../../lib/jwt';

type Category = 'module' | 'inverter' | 'structure' | 'cable' | 'connector' | 'protection' | 'service';
interface Product {
  id: string;
  category: Category;
  brand: string;
  line?: string;
  model: string;
  purchasePrice: number;
  suggestedPrice?: number;
  unit: string;
  active: boolean;
  specs: Record<string, any>;
  tags: string[];
  supplierId?: string;
  datasheetUrl?: string;
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

const categoryColors: Record<string, string> = {
  module: '#059669', inverter: '#2563eb', structure: '#7c3aed',
  cable: '#ea580c', connector: '#0891b2', protection: '#dc2626', service: '#65a30d',
};

function formatPrice(v?: number) {
  if (v == null) return '—';
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterCat, setFilterCat] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const api = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchProducts = useCallback(async () => {
    if (!api || !token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCat) params.set('category', filterCat);
      if (search) params.set('q', search);
      const res = await fetch(`${api}/catalog/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [api, token, filterCat, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const specSummary = (p: Product) => {
    if (p.category === 'module') return p.specs?.powerWatt ? `${p.specs.powerWatt}W` : '';
    if (p.category === 'inverter') return p.specs?.nominalPowerKw ? `${p.specs.nominalPowerKw}kW` : '';
    return '';
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', width: '100%', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Catálogo Técnico</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            {products.length} {products.length === 1 ? 'produto' : 'produtos'} cadastrados
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
          borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--green)',
          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <PlusIcon style={{ width: 16, height: 16 }} /> Novo Produto
        </button>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterCat('')} style={tabStyle(!filterCat)}>
          Todos
        </button>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button key={cat.key} onClick={() => setFilterCat(filterCat === cat.key ? '' : cat.key)} style={{
              ...tabStyle(filterCat === cat.key),
              borderColor: filterCat === cat.key ? categoryColors[cat.key] : 'var(--border)',
              color: filterCat === cat.key ? categoryColors[cat.key] : 'var(--text-secondary)',
            }}>
              <Icon style={{ width: 14, height: 14 }} /> {cat.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
        <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por marca, modelo ou linha..."
          style={{
            width: '100%', padding: '10px 14px 10px 36px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)',
            fontSize: 13, outline: 'none', fontFamily: 'inherit',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <XMarkIcon style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>

      {/* Grid */}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {products.map(p => (
            <div key={p.id} style={{
              background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)', padding: 20, cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px',
                  borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  background: categoryColors[p.category] + '18',
                  color: categoryColors[p.category],
                }}>
                  {CATEGORIES.find(c => c.key === p.category)?.label || p.category}
                </span>
                {!p.active && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--danger)' }}>Inativo</span>}
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 2px' }}>{p.brand}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 4px' }}>{p.model}</p>
              {p.line && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 10px' }}>Linha: {p.line}</p>}

              {specSummary(p) && (
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{specSummary(p)}</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 'auto' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Compra</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{formatPrice(p.purchasePrice)}</div>
                </div>
                {p.suggestedPrice && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>Sugerido</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{formatPrice(p.suggestedPrice)}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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
