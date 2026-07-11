'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const PRIORITY_COLORS: Record<string, string> = {
    high: 'text-red-400 bg-red-900/30',
    medium: 'text-yellow-400 bg-yellow-900/30',
    low: 'text-gray-400 bg-gray-800',
};

export default function TasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', type: 'other', priority: 'medium', leadId: '', dueDate: '' });

    const api = process.env.NEXT_PUBLIC_API_URL;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const fetchTasks = async () => {
        try {
            const res = await fetch(`${api}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setTasks(await res.json());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTasks(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch(`${api}/tasks`, {
            method: 'POST',
            headers,
            body: JSON.stringify(newTask),
        });
        if (res.ok) {
            setShowForm(false);
            setNewTask({ title: '', description: '', type: 'other', priority: 'medium', leadId: '', dueDate: '' });
            fetchTasks();
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        await fetch(`${api}/tasks/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status }),
        });
        fetchTasks();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir tarefa?')) return;
        await fetch(`${api}/tasks/${id}`, { method: 'DELETE', headers });
        fetchTasks();
    };

    if (loading) return <div className="text-gray-400 p-8">Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tarefas</h1>
                    <p className="text-sm text-gray-400 mt-1">Gerencie lembretes, visitas e retornos</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition">
                    Nova Tarefa
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-4">
                            <input required value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Título da tarefa" className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" />
                        </div>
                        <div className="md:col-span-2">
                            <input value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="Descrição (opcional)" className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" />
                        </div>
                        <div>
                            <select value={newTask.type} onChange={e => setNewTask({ ...newTask, type: e.target.value })} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1">
                                <option value="callback">Retorno</option>
                                <option value="visit">Visita</option>
                                <option value="reminder">Lembrete</option>
                                <option value="other">Outro</option>
                            </select>
                        </div>
                        <div>
                            <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1">
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                            </select>
                        </div>
                        <div>
                            <input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" />
                        </div>
                        <div>
                            <input value={newTask.leadId} onChange={e => setNewTask({ ...newTask, leadId: e.target.value })} placeholder="ID do Lead (opcional)" className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-green-700">Criar</button>
                        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 text-sm">Cancelar</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 gap-3">
                {tasks.map(task => (
                    <div key={task.id} className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 flex items-center justify-between">
                        <div className="flex items-start gap-4">
                            <button onClick={() => handleStatusChange(task.id, task.status === 'done' ? 'pending' : 'done')}>
                                {task.status === 'done' ? <CheckCircleIcon className="w-6 h-6 text-green-500" /> : <XCircleIcon className="w-6 h-6 text-gray-600 hover:text-gray-400" />}
                            </button>
                            <div>
                                <p className={`text-sm font-bold ${task.status === 'done' ? 'text-gray-500 line-through' : 'text-white'}`}>{task.title}</p>
                                {task.description && <p className="text-xs text-gray-500 mt-1">{task.description}</p>}
                                <div className="flex items-center gap-3 mt-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${PRIORITY_COLORS[task.priority] || 'text-gray-500'}`}>{task.priority}</span>
                                    <span className="text-[10px] text-gray-500 capitalize">{task.type}</span>
                                    {task.dueDate && <span className="text-[10px] text-gray-500">Vence: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>}
                                    {task.leadId && <span className="text-[10px] text-[var(--color-primary)]">Lead: {task.leadId.substring(0, 8)}</span>}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(task.id)} className="text-xs text-gray-600 hover:text-red-500">Excluir</button>
                    </div>
                ))}
                {tasks.length === 0 && <p className="text-gray-500 text-center py-12">Nenhuma tarefa encontrada.</p>}
            </div>
        </div>
    );
}
