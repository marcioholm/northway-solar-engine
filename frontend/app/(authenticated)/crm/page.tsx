'use client';

import { useState, useEffect } from 'react';
import { UsersIcon, DocumentTextIcon, CheckCircleIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

const STAGE_LABELS: Record<string, string> = {
    new: 'Novo Lead', contacted: 'Contato', qualified: 'Qualificação',
    bill_received: 'Conta Recebida', sized: 'Dimensionamento',
    proposal_sent: 'Proposta Enviada', negotiation: 'Negociação',
    closed_won: 'Fechado', closed_lost: 'Perdido',
};

export default function CrmDashboard() {
    const [data, setData] = useState<any>(null);
    const [sources, setSources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const api = process.env.NEXT_PUBLIC_API_URL;

        Promise.all([
            fetch(`${api}/crm-dashboard`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch(`${api}/crm-dashboard/sources`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ]).then(([dash, src]) => {
            setData(dash);
            setSources(src);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-gray-400 p-8">Carregando...</div>;
    if (!data) return null;

    const cards = [
        { label: 'Novos Leads', value: data.newLeads, icon: UsersIcon, color: 'text-blue-400 bg-blue-900/30' },
        { label: 'Propostas', value: data.proposals, icon: DocumentTextIcon, color: 'text-purple-400 bg-purple-900/30' },
        { label: 'Vendas', value: data.wonLeads, icon: CheckCircleIcon, color: 'text-green-400 bg-green-900/30' },
        { label: 'Conversão', value: `${data.conversionRate}%`, icon: ArrowTrendingUpIcon, color: 'text-emerald-400 bg-emerald-900/30' },
        { label: 'Ticket Médio', value: `R$ ${Number(data.avgTicket).toLocaleString('pt-BR')}`, icon: ClockIcon, color: 'text-yellow-400 bg-yellow-900/30' },
        { label: 'Tarefas Pendentes', value: data.pendingTasks, icon: ClockIcon, color: 'text-orange-400 bg-orange-900/30' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">CRM Comercial</h1>
                <p className="text-sm text-gray-400 mt-1">Visão geral do pipeline de vendas</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {cards.map(card => (
                    <div key={card.label} className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
                        <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-bold text-white">{card.value}</p>
                        <p className="text-xs text-gray-500 font-medium mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Leads por Etapa</h3>
                    <div className="space-y-3">
                        {data.leadsByStage.map((item: any) => (
                            <div key={item.stage} className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">{STAGE_LABELS[item.stage] || item.stage}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-2 bg-[var(--input-bg)] rounded-full overflow-hidden">
                                        <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${(item.count / data.totalLeads) * 100}%` }} />
                                    </div>
                                    <span className="text-sm font-bold text-white w-8 text-right">{item.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Origem dos Leads</h3>
                    <div className="space-y-3">
                        {sources.map((item: any) => (
                            <div key={item.source} className="flex items-center justify-between">
                                <span className="text-sm text-gray-400 capitalize">{item.source}</span>
                                <span className="text-sm font-bold text-white">{item.count}</span>
                            </div>
                        ))}
                        {sources.length === 0 && (
                            <p className="text-sm text-gray-500">Nenhuma origem registrada.</p>
                        )}
                    </div>
                </div>
            </div>

            {data.topSellers?.length > 0 && (
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Ranking de Vendedores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {data.topSellers.map((seller: any, i: number) => (
                            <div key={seller.userId} className="bg-[var(--input-bg)] rounded-lg p-4 border border-[var(--border-color)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg font-black text-[var(--color-primary)]">#{i + 1}</span>
                                    <span className="text-sm font-medium text-white truncate">{seller.userId}</span>
                                </div>
                                <p className="text-xs text-gray-500">{seller.won} vendas / {seller.total} leads</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
