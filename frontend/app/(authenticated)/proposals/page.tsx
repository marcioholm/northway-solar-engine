'use client';

import { useState, useEffect } from 'react';

export default function ProposalsPage() {
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProposals = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/proposals', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setProposals(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProposals();
    }, []);

    const handleDownload = (id: string) => {
        // In a real scenario, this would trigger a download. 
        // For now, we'll try to follow the link if backend is serving it properly.
        window.open(`http://localhost:3000/proposals/${id}/pdf`, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Histórico de Propostas</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Final</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payback</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={6} className="p-4 text-center text-gray-500">Carregando...</td></tr>
                        ) : proposals.map((p: any) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{p.clientName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{p.clientCity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{Number(p.systemPowerKwp).toFixed(2)} kWp</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">R$ {Number(p.finalPrice).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{Number(p.paybackYears).toFixed(1)} anos</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDownload(p.id)}
                                        className="text-[var(--color-primary)] hover:text-red-800 font-medium"
                                    >
                                        Baixar PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && proposals.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhuma proposta encontrada.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
