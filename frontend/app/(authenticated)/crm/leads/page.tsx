'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';

const STAGES = [
    { key: 'new', label: 'Novo Lead', color: 'bg-sky-500' },
    { key: 'contacted', label: 'Contato', color: 'bg-blue-500' },
    { key: 'qualified', label: 'Qualificação', color: 'bg-indigo-500' },
    { key: 'bill_received', label: 'Conta Recebida', color: 'bg-violet-500' },
    { key: 'sized', label: 'Dimensionamento', color: 'bg-purple-500' },
    { key: 'proposal_sent', label: 'Proposta Enviada', color: 'bg-pink-500' },
    { key: 'negotiation', label: 'Negociação', color: 'bg-amber-500' },
    { key: 'closed_won', label: 'Fechado', color: 'bg-emerald-500' },
    { key: 'closed_lost', label: 'Perdido', color: 'bg-gray-500' },
];

const STAGE_LABELS: Record<string, string> = {
    new: 'Novo Lead', contacted: 'Contato', qualified: 'Qualificação',
    bill_received: 'Conta Recebida', sized: 'Dimensionamento',
    proposal_sent: 'Proposta Enviada', negotiation: 'Negociação',
    closed_won: 'Fechado', closed_lost: 'Perdido',
};

const CLIENT_TYPE_LABELS: Record<string, string> = {
    residential: 'Residencial', commercial: 'Comercial',
    industrial: 'Industrial', rural: 'Rural',
};

export default function LeadsKanban() {
    const router = useRouter();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'kanban' | 'list'>('kanban');

    const fetchLeads = async () => {
        const token = localStorage.getItem('token');
        const api = process.env.NEXT_PUBLIC_API_URL;
        try {
            const res = await fetch(`${api}/leads`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setLeads(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLeads(); }, []);

    const handleStageChange = async (leadId: string, stage: string) => {
        const token = localStorage.getItem('token');
        const api = process.env.NEXT_PUBLIC_API_URL;
        await fetch(`${api}/leads/${leadId}/stage`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ stage }),
        });
        fetchLeads();
    };

    if (loading) return <div className="text-gray-400 p-8">Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Leads</h1>
                    <p className="text-sm text-gray-400 mt-1">Gerencie seu pipeline comercial</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--input-bg)] rounded-lg border border-[var(--border-color)] p-1">
                        <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-xs font-bold rounded ${view === 'kanban' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-400'}`}>Kanban</button>
                        <button onClick={() => setView('list')} className={`px-3 py-1.5 text-xs font-bold rounded ${view === 'list' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-400'}`}>Lista</button>
                    </div>
                    <button onClick={() => router.push('/crm/leads/new')} className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition">
                        <PlusIcon className="w-4 h-4" /> Novo Lead
                    </button>
                </div>
            </div>

            {view === 'kanban' ? (
                <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
                    {STAGES.map(stage => {
                        const stageLeads = leads.filter(l => l.stage === stage.key);
                        return (
                            <div key={stage.key} className="flex-shrink-0 w-72 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)]">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-color)]">
                                    <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                                    <h3 className="text-sm font-bold text-white">{stage.label}</h3>
                                    <span className="text-xs text-gray-500 ml-auto">{stageLeads.length}</span>
                                </div>
                                <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: '65vh' }}>
                                    {stageLeads.map(lead => (
                                        <div key={lead.id} onClick={() => router.push(`/crm/leads/${lead.id}`)} className="bg-[var(--input-bg)] rounded-lg p-4 border border-[var(--border-color)] cursor-pointer hover:border-gray-500 transition-colors">
                                            <p className="text-sm font-bold text-white">{lead.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{lead.city} - {lead.state}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] bg-[var(--card-bg)] text-gray-400 px-2 py-0.5 rounded font-medium">
                                                    {CLIENT_TYPE_LABELS[lead.clientType] || lead.clientType}
                                                </span>
                                                {lead.value && (
                                                    <span className="text-[10px] text-green-400 font-bold">
                                                        R$ {Number(lead.value).toLocaleString('pt-BR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {stageLeads.length === 0 && (
                                        <p className="text-xs text-gray-600 text-center py-4">Nenhum lead</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden">
                    <table className="min-w-full divide-y divide-[var(--border-color)]">
                        <thead className="bg-[var(--input-bg)]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Contato</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Etapa</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Valor</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {leads.map(lead => (
                                <tr key={lead.id} onClick={() => router.push(`/crm/leads/${lead.id}`)} className="hover:bg-[var(--input-bg)] transition-colors cursor-pointer">
                                    <td className="px-6 py-4 text-sm font-bold text-white">{lead.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{lead.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{STAGE_LABELS[lead.stage] || lead.stage}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{lead.value ? `R$ ${Number(lead.value).toLocaleString('pt-BR')}` : '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{CLIENT_TYPE_LABELS[lead.clientType] || lead.clientType}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</td>
                                </tr>
                            ))}
                            {leads.length === 0 && (
                                <tr><td colSpan={6} className="p-12 text-center text-gray-500">Nenhum lead encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
