'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState<'modules' | 'inverters'>('modules');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newItem, setNewItem] = useState<any>({});
    const [showForm, setShowForm] = useState(false);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'modules' ? 'modules' : 'inverters';
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setData(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [activeTab]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'modules' ? 'modules' : 'inverters';
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...newItem, active: true })
            });
            if (res.ok) {
                setNewItem({});
                setShowForm(false);
                fetchInventory();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const powerLabel = (item: any) =>
        activeTab === 'modules' ? `${item.powerWatt}W` : `${item.nominalPowerKw}kW`;

    return (
        <div className="inventory-page">
            {/* Header */}
            <div className="inventory-header">
                <div>
                    <h1 className="inventory-title">Inventário de Equipamentos</h1>
                    <p className="inventory-subtitle">Gerencie módulos e inversores disponíveis para seus projetos.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inventory-add-btn"
                    aria-label="Adicionar novo item"
                >
                    <PlusIcon className="w-5 h-5" />
                    Adicionar Novo Item
                </button>
            </div>

            {/* Tabs */}
            <div className="inventory-tabs">
                <button
                    className={`inventory-tab ${activeTab === 'modules' ? 'active' : ''}`}
                    onClick={() => setActiveTab('modules')}
                    aria-label="Módulos Fotovoltaicos"
                >
                    Módulos Fotovoltaicos
                </button>
                <button
                    className={`inventory-tab ${activeTab === 'inverters' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inverters')}
                    aria-label="Inversores"
                >
                    Inversores
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="inventory-form-card">
                    <h3 className="inventory-form-title">Novo {activeTab === 'modules' ? 'Módulo' : 'Inversor'}</h3>
                    <form onSubmit={handleCreate} className="inventory-form">
                        <div>
                            <label className="inventory-form-label" htmlFor="inv-brand">Marca</label>
                            <input
                                id="inv-brand"
                                placeholder="Ex: Canadian"
                                className="inventory-form-input"
                                value={newItem.brand || ''}
                                onChange={e => setNewItem({ ...newItem, brand: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="inventory-form-label" htmlFor="inv-model">Modelo</label>
                            <input
                                id="inv-model"
                                placeholder="Ex: Hiku6"
                                className="inventory-form-input"
                                value={newItem.model || ''}
                                onChange={e => setNewItem({ ...newItem, model: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="inventory-form-label" htmlFor="inv-power">Potência</label>
                            <input
                                id="inv-power"
                                type="number"
                                placeholder={activeTab === 'modules' ? 'Watts (W)' : 'Kilowatts (kW)'}
                                className="inventory-form-input"
                                value={activeTab === 'modules' ? (newItem.powerWatt ?? '') : (newItem.nominalPowerKw ?? '')}
                                onChange={e => setNewItem({
                                    ...newItem,
                                    [activeTab === 'modules' ? 'powerWatt' : 'nominalPowerKw']: Number(e.target.value)
                                })}
                                required
                            />
                        </div>
                        <div>
                            <label className="inventory-form-label" htmlFor="inv-cost">Custo (R$)</label>
                            <input
                                id="inv-cost"
                                type="number"
                                placeholder="0,00"
                                step="0.01"
                                className="inventory-form-input"
                                value={newItem.cost ?? ''}
                                onChange={e => setNewItem({ ...newItem, cost: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <button type="submit" className="inventory-form-submit" aria-label="Salvar item">
                            Salvar Item
                        </button>
                    </form>
                </div>
            )}

            {/* Table Card */}
            <div className="inventory-card">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Marca</th>
                            <th>Modelo</th>
                            <th>Potência</th>
                            <th>Custo (R$)</th>
                            <th className="inventory-th-actions">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="inventory-empty">Carregando...</td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="inventory-empty">Nenhum equipamento encontrado.</td>
                            </tr>
                        ) : data.map((item: any) => (
                            <tr key={item.id} className="inventory-row">
                                <td className="inventory-cell-brand" data-label="Marca">
                                    <div className="inventory-brand-dot" />
                                    <span className="inventory-brand-name">{item.brand}</span>
                                </td>
                                <td className="inventory-cell-model" data-label="Modelo">
                                    {item.model}
                                </td>
                                <td className="inventory-cell-power" data-label="Potência">
                                    <span className="inventory-power-chip">{powerLabel(item)}</span>
                                </td>
                                <td className="inventory-cell-cost" data-label="Custo">
                                    R$ {Number(item.cost).toFixed(2)}
                                </td>
                                <td className="inventory-cell-actions">
                                    <button className="inventory-action-btn inventory-action-edit" aria-label="Editar">
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button className="inventory-action-btn inventory-action-delete" aria-label="Excluir">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
