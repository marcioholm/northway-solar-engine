'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatBRL } from '../../../../../lib/format';

const STAGE_OPTIONS = [
    { value: 'new', label: 'Novo Lead', color: 'bg-sky-500' },
    { value: 'contacted', label: 'Contato', color: 'bg-blue-500' },
    { value: 'qualified', label: 'Qualificação', color: 'bg-indigo-500' },
    { value: 'bill_received', label: 'Conta Recebida', color: 'bg-violet-500' },
    { value: 'sized', label: 'Dimensionamento', color: 'bg-purple-500' },
    { value: 'proposal_sent', label: 'Proposta Enviada', color: 'bg-pink-500' },
    { value: 'negotiation', label: 'Negociação', color: 'bg-amber-500' },
    { value: 'closed_won', label: 'Fechado', color: 'bg-emerald-500' },
    { value: 'closed_lost', label: 'Perdido', color: 'bg-gray-500' },
];

const TYPE_LABELS: Record<string, string> = {
    note: 'Nota', call: 'Ligação', message: 'Mensagem',
    status_change: 'Mudança de Status', proposal: 'Proposta',
    task: 'Tarefa', attachment: 'Anexo', system: 'Sistema',
};

type Tab = 'timeline' | 'tasks' | 'proposals';

export default function LeadDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [lead, setLead] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>('timeline');
    const [newNote, setNewNote] = useState('');
    const [savingNote, setSavingNote] = useState(false);

    const api = process.env.NEXT_PUBLIC_API_URL;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
        try {
            const [leadRes, timelineRes, tasksRes, proposalsRes] = await Promise.all([
                fetch(`${api}/leads/${id}`, { headers }),
                fetch(`${api}/timeline/lead/${id}`, { headers }),
                fetch(`${api}/tasks?leadId=${id}`, { headers }),
                fetch(`${api}/proposals/lead/${id}`, { headers }),
            ]);
            if (leadRes.ok) setLead(await leadRes.json());
            if (timelineRes.ok) setTimeline(await timelineRes.json());
            if (tasksRes.ok) setTasks(await tasksRes.json());
            if (proposalsRes.ok) setProposals(await proposalsRes.json());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleStageChange = async (stage: string) => {
        await fetch(`${api}/leads/${id}/stage`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({ stage }),
        });

        await fetch(`${api}/timeline`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({ leadId: id, type: 'status_change', content: `Lead movido para ${STAGE_OPTIONS.find(s => s.value === stage)?.label}` }),
        });

        fetchData();
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        setSavingNote(true);
        await fetch(`${api}/timeline`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({ leadId: id, type: 'note', content: newNote }),
        });
        setNewNote('');
        setSavingNote(false);
        fetchData();
    };

    const handleDeleteLead = async () => {
        if (!confirm('Tem certeza que deseja excluir este lead?')) return;
        await fetch(`${api}/leads/${id}`, { method: 'DELETE', headers });
        router.push('/crm/leads');
    };

    if (loading) return <div className="text-gray-400 p-8">Carregando...</div>;
    if (!lead) return <div className="text-gray-400 p-8">Lead não encontrado.</div>;

    const currentStage = STAGE_OPTIONS.find(s => s.value === lead.stage);

    return (
        <div className="legacy-page max-w-5xl mx-auto space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${currentStage?.color}`} />
                        <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
                    </div>
                    <p className="text-sm text-gray-400">{lead.email} · {lead.phone} · {lead.city} - {lead.state}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleDeleteLead} className="text-xs text-gray-500 hover:text-red-500 px-3 py-2 rounded-lg border border-[var(--border-color)]">Excluir</button>
                    <button onClick={() => router.push('/crm/leads')} className="text-xs text-gray-400 hover:text-white px-3 py-2">Voltar</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Etapa</h3>
                        <select value={lead.stage} onChange={e => handleStageChange(e.target.value)} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-2.5 text-sm">
                            {STAGE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>

                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 space-y-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Informações</h3>
                        <InfoRow label="Tipo" value={TYPE_LABELS[lead.clientType] || lead.clientType} />
                        <InfoRow label="Documento" value={lead.document || '-'} />
                        <InfoRow label="Empresa" value={lead.companyName || '-'} />
                        <InfoRow label="WhatsApp" value={lead.whatsapp || '-'} />
                        <InfoRow label="Endereço" value={lead.address || '-'} />
                        <InfoRow label="CEP" value={lead.zipcode || '-'} />
                        <InfoRow label="Consumo" value={lead.monthlyConsumption ? `${lead.monthlyConsumption} kWh` : '-'} />
                        <InfoRow label="Conta Média" value={lead.avgMonthlyBill ? formatBRL(Number(lead.avgMonthlyBill)) : '-'} />
                        <InfoRow label="Concessionária" value={lead.utility || '-'} />
                        <InfoRow label="Origem" value={lead.source || '-'} />
                        {lead.utmSource && <InfoRow label="UTM Source" value={lead.utmSource} />}
                        {lead.utmMedium && <InfoRow label="UTM Medium" value={lead.utmMedium} />}
                        {lead.utmCampaign && <InfoRow label="UTM Campaign" value={lead.utmCampaign} />}
                        {lead.fbclid && <InfoRow label="FBCLID" value={lead.fbclid} />}
                        <InfoRow label="Criado em" value={new Date(lead.createdAt).toLocaleDateString('pt-BR')} />
                    </div>

                    {lead.notes && (
                        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Observações</h3>
                            <p className="text-sm text-gray-400 whitespace-pre-wrap">{lead.notes}</p>
                        </div>
                    )}

                    <button onClick={() => router.push(`/dashboard?leadId=${lead.id}&name=${encodeURIComponent(lead.name)}&city=${encodeURIComponent(lead.city)}&state=${lead.state}&consumption=${lead.monthlyConsumption || ''}`)} className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold text-sm hover:bg-[var(--color-primary-hover)] transition">
                        Abrir Dimensionamento
                    </button>
                </div>

                <div className="lg:col-span-2">
                    <div className="flex border-b border-[var(--border-color)] mb-4">
                        {(['timeline', 'tasks', 'proposals'] as Tab[]).map(t => (
                            <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${tab === t ? 'border-b-2 border-[var(--color-primary)] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                {t === 'timeline' ? `Histórico (${timeline.length})` : t === 'tasks' ? `Tarefas (${tasks.length})` : `Propostas (${proposals.length})`}
                            </button>
                        ))}
                    </div>

                    {tab === 'timeline' && (
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Adicionar nota..." rows={2} className="flex-1 rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 text-sm focus:border-[var(--color-primary)] focus:ring-1" />
                                <button onClick={handleAddNote} disabled={savingNote} className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg font-bold text-sm self-end hover:bg-[var(--color-primary-hover)] disabled:opacity-50">
                                    {savingNote ? '...' : 'Enviar'}
                                </button>
                            </div>
                            <div className="space-y-3">
                                {timeline.map((event: any) => (
                                    <div key={event.id} className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-bold uppercase text-gray-500">{TYPE_LABELS[event.type] || event.type}</span>
                                            <span className="text-[10px] text-gray-600">·</span>
                                            <span className="text-[10px] text-gray-600">{new Date(event.createdAt).toLocaleString('pt-BR')}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{event.content}</p>
                                    </div>
                                ))}
                                {timeline.length === 0 && <p className="text-sm text-gray-500">Nenhum registro no histórico.</p>}
                            </div>
                        </div>
                    )}

                    {tab === 'tasks' && (
                        <div className="space-y-3">
                            {tasks.map((task: any) => (
                                <div key={task.id} className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-white">{task.title}</p>
                                        {task.description && <p className="text-xs text-gray-500 mt-1">{task.description}</p>}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${task.priority === 'high' ? 'bg-red-900/30 text-red-400' : task.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-800 text-gray-400'}`}>{task.priority}</span>
                                            {task.dueDate && <span className="text-[10px] text-gray-500">Vence: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>}
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase ${task.status === 'done' ? 'text-green-400' : task.status === 'in_progress' ? 'text-blue-400' : 'text-gray-500'}`}>{task.status}</span>
                                </div>
                            ))}
                            {tasks.length === 0 && <p className="text-sm text-gray-500">Nenhuma tarefa.</p>}
                        </div>
                    )}

                    {tab === 'proposals' && (
                        <div className="space-y-3">
                            {proposals.map((p: any) => (
                                <div key={p.id} className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-white">{p.clientName}</p>
                                        <p className="text-xs text-gray-500 mt-1">{Number(p.systemPowerKwp).toFixed(2)} kWp · {formatBRL(Number(p.finalPrice))}</p>
                                    </div>
                                    <a href={`${api}/proposals/${p.id}/pdf`} target="_blank" className="text-xs text-[var(--color-primary)] font-bold hover:underline">PDF</a>
                                </div>
                            ))}
                            {proposals.length === 0 && <p className="text-sm text-gray-500">Nenhuma proposta associada.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-xs text-gray-300 font-medium">{value}</span>
        </div>
    );
}
