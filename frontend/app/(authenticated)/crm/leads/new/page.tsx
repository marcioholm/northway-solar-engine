'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const CLIENT_TYPES = [
    { value: 'residential', label: 'Residencial' },
    { value: 'commercial', label: 'Comercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'rural', label: 'Rural' },
];

export default function NewLeadPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '', companyName: '', document: '', phone: '', whatsapp: '',
        email: '', city: '', state: '', address: '', zipcode: '',
        clientType: 'residential', source: '', monthlyConsumption: 0,
        avgMonthlyBill: 0, utility: '', notes: '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const token = localStorage.getItem('token');
        const api = process.env.NEXT_PUBLIC_API_URL;
        try {
            const res = await fetch(`${api}/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    ...form,
                    monthlyConsumption: form.monthlyConsumption || undefined,
                    avgMonthlyBill: form.avgMonthlyBill || undefined,
                }),
            });
            if (res.ok) {
                router.push('/crm/leads');
            }
        } finally {
            setSaving(false);
        }
    };

    const update = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Novo Lead</h1>
                <p className="text-sm text-gray-400 mt-1">Cadastre um novo cliente potencial</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 space-y-4">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dados Principais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome *</label>
                            <input required value={form.name} onChange={e => update('name', e.target.value)} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]" placeholder="Nome completo" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Empresa</label>
                            <input value={form.companyName} onChange={e => update('companyName', e.target.value)} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" placeholder="Nome da empresa" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">CPF/CNPJ</label>
                            <input value={form.document} onChange={e => update('document', e.target.value)} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" placeholder="000.000.000-00" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email *</label>
                            <input type="email" required value={form.email} onChange={e => update('email', e.target.value)} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" placeholder="email@exemplo.com" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Telefone *</label>
                            <input required value={form.phone} onChange={e => update('phone', e.target.value)} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" placeholder="(11) 99999-9999" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">WhatsApp</label>
                            <input value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" placeholder="(11) 99999-9999" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Cliente</label>
                            <select value={form.clientType} onChange={e => update('clientType', e.target.value)} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1">
                                {CLIENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Origem</label>
                            <input value={form.source} onChange={e => update('source', e.target.value)} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" placeholder="Indicação, Google, Instagram..." />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 space-y-4">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Endereço</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">CEP</label>
                            <input value={form.zipcode} onChange={e => update('zipcode', e.target.value)} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" placeholder="00000-000" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Endereço</label>
                            <input value={form.address} onChange={e => update('address', e.target.value)} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" placeholder="Rua, número, bairro" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cidade *</label>
                            <input required value={form.city} onChange={e => update('city', e.target.value)} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" placeholder="São Paulo" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Estado *</label>
                            <select required value={form.state} onChange={e => update('state', e.target.value)} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1">
                                <option value="">Selecione...</option>
                                {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 space-y-4">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Consumo & Concessionária</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Consumo Médio (kWh)</label>
                            <input type="number" value={form.monthlyConsumption || ''} onChange={e => update('monthlyConsumption', Number(e.target.value))} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" placeholder="300" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Valor Médio da Conta (R$)</label>
                            <input type="number" value={form.avgMonthlyBill || ''} onChange={e => update('avgMonthlyBill', Number(e.target.value))} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" placeholder="250" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Concessionária</label>
                            <input value={form.utility} onChange={e => update('utility', e.target.value)} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" placeholder="Enel, EDP, CPFL..." />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 space-y-4">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Observações</h2>
                    <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={4} className="block w-full rounded-lg bg-[var(--input-bg)] border-[var(--border-color)] text-white p-3 focus:border-[var(--color-primary)] focus:ring-1" placeholder="Informações adicionais sobre o lead..." />
                </div>

                <div className="flex items-center gap-3">
                    <button type="submit" disabled={saving} className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-red-700 transition disabled:opacity-50">
                        {saving ? 'Salvando...' : 'Salvar Lead'}
                    </button>
                    <button type="button" onClick={() => router.back()} className="text-gray-400 px-6 py-3 rounded-lg font-bold text-sm hover:text-white transition">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}
