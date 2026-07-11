'use client';

import { useState, useEffect } from 'react';
import {
    BoltIcon,
    MapPinIcon,
    CalculatorIcon
} from '@heroicons/react/24/outline'; // Using generic icons if heroicons not fully available, but structure remains

interface IBGEState {
    id: number;
    sigla: string;
    nome: string;
}

interface IBGECity {
    id: number;
    nome: string;
}

export default function Dashboard() {
    // Client State
    const [clientName, setClientName] = useState('');

    // Calculator State
    const [consumption, setConsumption] = useState(0);
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    // Data State
    const [states, setStates] = useState<IBGEState[]>([]);
    const [cities, setCities] = useState<IBGECity[]>([]);

    // Result State
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch States on Mount
    useEffect(() => {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(res => res.json())
            .then(data => setStates(data));
    }, []);

    // Fetch Cities when State changes
    useEffect(() => {
        if (selectedState) {
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`)
                .then(res => res.json())
                .then(data => setCities(data));
        } else {
            setCities([]);
            setSelectedCity('');
        }
    }, [selectedState]);

    const handleGeneratePdf = async () => {
        if (!result) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // 1. Create Proposal to get ID
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    consumption,
                    city: `${selectedCity} - ${selectedState}`,
                    clientName: clientName || 'Cliente Visitante',
                    clientCep: '00000-000'
                }),
            });

            if (!res.ok) throw new Error('Failed to create proposal');
            const proposal = await res.json();

            // 2. Fetch PDF blob with Auth header
            const pdfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals/${proposal.id}/pdf`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!pdfRes.ok) throw new Error('Failed to fetch PDF');
            
            const blob = await pdfRes.blob();
            const url = window.URL.createObjectURL(blob);
            
            // 3. Open in new tab
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            // link.download = `proposta_${proposal.id}.pdf`; // Optional: Force download
            link.click();
            
            // Clean up
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (err) {
            console.error(err);
            setError('Erro ao gerar PDF. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        // Format City string for backend: "City - UF"
        const cityString = `${selectedCity} - ${selectedState}`;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/solar-engine/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ consumption, city: cityString }),
            });

            if (!res.ok) throw new Error('Calculation failed');
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError('Falha ao calcular. Verifique os dados ou tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 text-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Novo Dimensionamento</h1>
                    <p className="text-sm text-gray-400 mt-1">Configure os parâmetros técnicos para gerar uma proposta.</p>
                </div>
                {result && (
                    <button className="bg-[var(--card-bg)] hover:bg-gray-700 text-white px-4 py-2 rounded-md border border-[var(--border-color)] text-sm font-medium transition-colors">
                        Histórico
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Input Section (Left or Top) */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-6">
                    {/* Parâmetros da Usina Card */}
                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-8 shadow-lg">
                        <div className="flex items-center gap-2 mb-6 text-[var(--color-primary)]">
                            <CalculatorIcon className="w-5 h-5" />
                            <h2 className="text-xs font-bold uppercase tracking-widest">Parâmetros da Usina</h2>
                        </div>

                        <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome do Cliente</label>
                                <input
                                    type="text"
                                    required
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                    className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] sm:text-lg p-3"
                                    placeholder="Ex: João da Silva"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Consumo Médio (kWh)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        value={consumption || ''}
                                        onChange={e => setConsumption(Number(e.target.value))}
                                        className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] sm:text-lg p-3"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-3 top-3.5 text-gray-500 text-sm font-medium">kWh</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Estado (UF)</label>
                                <select
                                    className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] sm:text-base p-3 appearance-none"
                                    value={selectedState}
                                    onChange={e => setSelectedState(e.target.value)}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {states.map(uf => (
                                        <option key={uf.id} value={uf.sigla}>{uf.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cidade</label>
                                <select
                                    className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] sm:text-base p-3 appearance-none"
                                    value={selectedCity}
                                    onChange={e => setSelectedCity(e.target.value)}
                                    disabled={!selectedState}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {cities.map(city => (
                                        <option key={city.id} value={city.nome}>{city.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-3 mt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full md:w-auto rounded-lg bg-[var(--color-primary)] px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-all uppercase tracking-wide"
                                >
                                    {loading ? 'Calculando...' : 'Calcular Proposta'}
                                </button>
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            </div>
                        </form>
                    </div>

                    {result && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Result Cards */}
                            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
                                <p className="text-xs font-bold text-gray-500 uppercase">Potência Sugerida</p>
                                <p className="text-3xl font-bold text-white mt-2">{result.system_power_kwp.toFixed(2)} <span className="text-base text-gray-500 font-normal">kWp</span></p>
                            </div>
                            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
                                <p className="text-xs font-bold text-gray-500 uppercase">Geração Mensal</p>
                                <p className="text-3xl font-bold text-white mt-2">{Math.round(result.monthly_generation)} <span className="text-base text-gray-500 font-normal">kWh</span></p>
                            </div>
                            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
                                <p className="text-xs font-bold text-gray-500 uppercase">Inversor</p>
                                <p className="text-xl font-bold text-white mt-2 leading-tight">{result.inverter.model}</p>
                                <p className="text-xs text-[var(--color-primary)] mt-1 font-medium">OTIMIZADO PARA {result.module.brand.toUpperCase()}</p>
                            </div>

                            {/* Hardware Match */}
                            <div className="md:col-span-3 bg-[var(--input-bg)] p-4 rounded-xl border border-[var(--border-color)] border-dashed flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-white">Hardware Engine Match</p>
                                    <p className="text-xs text-gray-400">Dimensiomaneto automático com {result.module_qty}x módulos {result.module.model} ({result.module.powerWatt}W)</p>
                                </div>
                                <span className="px-3 py-1 bg-green-900/30 text-green-400 text-xs font-bold rounded border border-green-900">DISPONÍVEL</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column / Price Card */}
                <div className="lg:col-span-12 xl:col-span-4">
                    {result ? (
                        <div className="sticky top-6 rounded-xl bg-[var(--color-primary)] p-8 shadow-2xl text-white">
                            <p className="text-xs font-bold text-red-200 uppercase tracking-widest mb-1">Preço Final Sugerido</p>
                            <div className="flex items-start">
                                <span className="text-xl font-medium mt-2 mr-1">R$</span>
                                <span className="text-5xl font-black tracking-tight">{result.final_price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>

                            <div className="my-8 border-t border-red-500/30"></div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-xs font-bold text-red-200 uppercase mb-1">Margem ({result.margin_pct}%)</p>
                                    <p className="text-xl font-bold">R$ {result.margin_value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-red-200 uppercase mb-1">Payback</p>
                                    <p className="text-xl font-bold">{result.payback_years.toFixed(1)} <span className="text-sm font-normal">Anos</span></p>
                                </div>
                            </div>

                            <button
                                onClick={handleGeneratePdf}
                                disabled={loading}
                                className="mt-8 w-full bg-white text-[var(--color-primary)] font-bold py-4 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <BoltIcon className="w-5 h-5" />
                                {loading ? 'GERANDO...' : 'GERAR PDF DA PROPOSTA'}
                            </button>

                            <p className="text-[10px] text-red-200 text-center mt-4">Validado pelo motor de engenharia NorthWay™</p>
                        </div>
                    ) : (
                        <div className="hidden xl:block rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-8 h-full flex flex-col items-center justify-center text-center opacity-50">
                            <CalculatorIcon className="w-16 h-16 text-gray-700 mb-4" />
                            <p className="text-gray-500 font-medium">Aguardando parâmetros...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
