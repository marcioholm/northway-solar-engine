'use client';

import { useState } from 'react';
import { Cog6ToothIcon, CurrencyDollarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
    // Mock State for now
    const [companyName, setCompanyName] = useState('SolarNorte');
    const [margin, setMargin] = useState(25);
    const [kwhPrice, setKwhPrice] = useState(0.92);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Configurações salvas localmente (Demo). Em produção, isso atualizaria o banco de dados.');
    };

    return (
        <div className="legacy-page space-y-8 text-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Configurações</h1>
                    <p className="text-sm text-gray-400 mt-1">Gerencie os parâmetros globais da sua conta.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* General Settings */}
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-8 shadow-lg">
                    <div className="flex items-center gap-2 mb-6 text-[var(--color-primary)]">
                        <BuildingOfficeIcon className="w-5 h-5" />
                        <h2 className="text-xs font-bold uppercase tracking-widest">Dados da Empresa</h2>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome da Empresa</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">CNPJ</label>
                            <input
                                type="text"
                                value="12.345.678/0001-90"
                                disabled
                                className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-gray-500 p-3 cursor-not-allowed opacity-50"
                            />
                            <p className="text-[10px] text-gray-600 mt-1">Entre em contato com o suporte para alterar o CNPJ.</p>
                        </div>
                    </form>
                </div>

                {/* Financial Settings */}
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-8 shadow-lg">
                    <div className="flex items-center gap-2 mb-6 text-[var(--color-primary)]">
                        <CurrencyDollarIcon className="w-5 h-5" />
                        <h2 className="text-xs font-bold uppercase tracking-widest">Financeiro & Margens</h2>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Margem de Lucro Padrão (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={margin}
                                    onChange={e => setMargin(Number(e.target.value))}
                                    className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                                />
                                <span className="absolute right-3 top-3.5 text-gray-500 text-sm font-medium">%</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Custo Base do kWh (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3.5 text-gray-500 text-sm font-medium">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={kwhPrice}
                                    onChange={e => setKwhPrice(Number(e.target.value))}
                                    className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 pl-10 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-[var(--color-primary)] px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-[var(--color-primary-hover)] transition-all uppercase tracking-wide"
                        >
                            Salvar Alterações
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
