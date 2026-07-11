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
            const res = await fetch(`http://localhost:3000/inventory/${endpoint}`, {
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
            const res = await fetch(`http://localhost:3000/inventory/${endpoint}`, {
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Inventário de Equipamentos</h1>
                    <p className="text-sm text-gray-400 mt-1">Gerencie módulos e inversores disponíveis para seus projetos.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition"
                >
                    <PlusIcon className="w-5 h-5" />
                    Adicionar Novo Item
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--border-color)]">
                <button
                    className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'modules' ? 'border-b-2 border-[var(--color-primary)] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    onClick={() => setActiveTab('modules')}
                >
                    Módulos Fotovoltaicos
                </button>
                <button
                    className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'inverters' ? 'border-b-2 border-[var(--color-primary)] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    onClick={() => setActiveTab('inverters')}
                >
                    Inversores
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-lg font-bold mb-4 text-white">Novo {activeTab === 'modules' ? 'Módulo' : 'Inversor'}</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Marca</label>
                            <input
                                placeholder="Ex: Canadian"
                                className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-2.5 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                                value={newItem.brand || ''}
                                onChange={e => setNewItem({ ...newItem, brand: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Modelo</label>
                            <input
                                placeholder="Ex: Hiku6"
                                className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-2.5 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                                value={newItem.model || ''}
                                onChange={e => setNewItem({ ...newItem, model: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Potência</label>
                            <input
                                type="number"
                                placeholder={activeTab === 'modules' ? "Watts (W)" : "Kilowatts (kW)"}
                                className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-2.5 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                                value={activeTab === 'modules' ? (newItem.powerWatt || '') : (newItem.nominalPowerKw || '')}
                                onChange={e => setNewItem({ ...newItem, [activeTab === 'modules' ? 'powerWatt' : 'nominalPowerKw']: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Custo (R$)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-2.5 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                                value={newItem.cost || ''}
                                onChange={e => setNewItem({ ...newItem, cost: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <button type="submit" className="bg-green-600 text-white p-2.5 rounded-lg hover:bg-green-700 font-bold transition-colors shadow-lg">
                            Salvar Item
                        </button>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
                <table className="min-w-full divide-y divide-[var(--border-color)]">
                    <thead className="bg-[var(--input-bg)]">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Marca</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Modelo</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Potência</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Custo (R$)</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Carregando...</td></tr>
                        ) : data.map((item: any) => (
                            <tr key={item.id} className="hover:bg-[var(--card-bg)]/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-white font-medium flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-[var(--input-bg)] flex items-center justify-center text-gray-500">
                                        <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
                                    </div>
                                    {item.brand}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-400">{item.model}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-300 bg-gray-800/50 rounded-lg mx-2 w-min border border-gray-700 text-center text-xs font-bold">
                                    {activeTab === 'modules' ? `${item.powerWatt}W` : `${item.nominalPowerKw}kW`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-white font-mono">R$ {Number(item.cost).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                    <button className="text-gray-500 hover:text-white p-1"><PencilIcon className="w-4 h-4" /></button>
                                    <button className="text-gray-500 hover:text-red-500 p-1"><TrashIcon className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                        {!loading && data.length === 0 && (
                            <tr><td colSpan={5} className="p-12 text-center text-gray-500">Nenhum equipamento encontrado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
