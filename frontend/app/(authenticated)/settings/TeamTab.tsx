'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  UserGroupIcon,
  EnvelopeIcon,
  UserPlusIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  TrashIcon,
  PencilSquareIcon,
  KeyIcon,
  ArrowRightCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'seller' | 'superadmin';
  phone?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

interface TeamInvite {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'seller';
  expiresAt: string;
  createdAt: string;
  inviteUrl?: string;
}

interface PlanInfo {
  plan: string;
  maxUsers: number | null;
  activeUsers: number;
  pendingInvites: number;
  totalSeatsUsed: number;
  isLimitReached: boolean;
}

export function TeamTab() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'seller' | 'manager' | 'admin'>('seller');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviting, setInviting] = useState(false);
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);

  // Edit member modal
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState<'seller' | 'manager' | 'admin'>('seller');
  const [editPhone, setEditPhone] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Reassign modal
  const [reassigningMember, setReassigningMember] = useState<TeamMember | null>(null);
  const [targetUserId, setTargetUserId] = useState('');
  const [savingReassign, setSavingReassign] = useState(false);

  // Reset link modal
  const [resetUrlInfo, setResetUrlInfo] = useState<{ memberName: string; resetUrl: string } | null>(null);

  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  const api = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const loadTeam = useCallback(async () => {
    if (!token || !api) return;
    try {
      setLoading(true);
      const res = await fetch(`${api}/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao carregar equipe');
      const data = await res.json();
      setMembers(data.members || []);
      setInvites(data.invites || []);
      setPlan(data.plan || null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao carregar dados da equipe' });
    } finally {
      setLoading(false);
    }
  }, [api, token]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2500);
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setMessage(null);
    try {
      const res = await fetch(`${api}/team/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
          phone: invitePhone ? invitePhone.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Falha ao criar convite');

      setCreatedInviteUrl(data.inviteUrl);
      setMessage({ type: 'success', text: 'Convite gerado com sucesso!' });
      setInviteEmail('');
      setInvitePhone('');
      loadTeam();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao criar convite' });
    } finally {
      setInviting(false);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`${api}/team/invites/${inviteId}/resend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Falha ao reenviar convite');
      setMessage({ type: 'success', text: 'Novo link de convite gerado e pronto para copiar!' });
      if (data.inviteUrl) {
        copyToClipboard(data.inviteUrl, inviteId);
      }
      loadTeam();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao reenviar convite' });
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm('Deseja realmente cancelar este convite?')) return;
    try {
      const res = await fetch(`${api}/team/invites/${inviteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao cancelar convite');
      setMessage({ type: 'success', text: 'Convite cancelado' });
      loadTeam();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao cancelar convite' });
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    const action = member.isActive ? 'desativar' : 'reativar';
    if (!confirm(`Deseja realmente ${action} ${member.name}?`)) return;

    try {
      const endpoint = `${api}/team/${member.id}/${member.isActive ? 'deactivate' : 'reactivate'}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Falha ao ${action} usuário`);

      let msg = member.isActive ? 'Membro desativado com sucesso.' : 'Membro reativado com sucesso.';
      if (data.activeLeadsCount && data.activeLeadsCount > 0) {
        msg += ` Atenção: este vendedor possui ${data.activeLeadsCount} lead(s) ativos que podem ser reatribuídos.`;
      }
      setMessage({ type: 'success', text: msg });
      loadTeam();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || `Erro ao ${action} membro` });
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`${api}/team/${editingMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          role: editRole,
          phone: editPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Falha ao atualizar membro');

      setMessage({ type: 'success', text: 'Dados do membro atualizados com sucesso.' });
      setEditingMember(null);
      loadTeam();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar alterações' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleGenerateReset = async (member: TeamMember) => {
    try {
      const res = await fetch(`${api}/team/${member.id}/password-reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Falha ao gerar link de redefinição');

      setResetUrlInfo({ memberName: member.name, resetUrl: data.resetUrl });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao gerar link' });
    }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningMember || !targetUserId) return;
    setSavingReassign(true);
    try {
      const res = await fetch(`${api}/team/${reassigningMember.id}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Falha ao reatribuir dados');

      setMessage({
        type: 'success',
        text: `Reatribuição concluída: ${data.reassignedLeads} leads, ${data.reassignedProjects} projetos e ${data.reassignedProposals} propostas transferidos.`,
      });
      setReassigningMember(null);
      setTargetUserId('');
      loadTeam();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro na reatribuição' });
    } finally {
      setSavingReassign(false);
    }
  };

  const roleLabel = (r: string) => {
    switch (r) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'seller':
        return 'Vendedor';
      case 'superadmin':
        return 'Superadmin';
      default:
        return r;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Alert Banner */}
      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
            color: message.type === 'success' ? '#065F46' : '#991B1B',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {message.type === 'success' ? (
              <CheckCircleIcon style={{ width: 18, height: 18 }} />
            ) : (
              <ExclamationTriangleIcon style={{ width: 18, height: 18 }} />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <XMarkIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>
      )}

      {/* Header & Plan Counter */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          padding: 24,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <UserGroupIcon style={{ width: 24, height: 24, color: 'var(--green)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Gestão de Equipe</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Gerencie acessos, convites e perfis dos membros da sua empresa.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {plan && (
            <div
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: plan.isLimitReached ? '#FEF2F2' : 'var(--bg)',
                border: `1px solid ${plan.isLimitReached ? '#FCA5A5' : 'var(--border)'}`,
                fontSize: '12px',
                fontWeight: 600,
                color: plan.isLimitReached ? '#B91C1C' : 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>
                {plan.maxUsers !== null
                  ? `${plan.totalSeatsUsed} de ${plan.maxUsers} usuários do plano`
                  : `${plan.activeUsers} usuários (ilimitado)`}
              </span>
              {plan.pendingInvites > 0 && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ({plan.pendingInvites} convite(s) pendente(s))
                </span>
              )}
            </div>
          )}

          <button
            onClick={() => {
              setCreatedInviteUrl(null);
              setShowInviteModal(true);
            }}
            disabled={plan?.isLimitReached}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--green)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: plan?.isLimitReached ? 'not-allowed' : 'pointer',
              opacity: plan?.isLimitReached ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'inherit',
            }}
            title={plan?.isLimitReached ? 'Limite do plano atingido' : 'Convidar novo membro'}
          >
            <UserPlusIcon style={{ width: 18, height: 18 }} />
            Convidar Membro
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Membros Ativos & Equipe ({members.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Carregando membros...
          </div>
        ) : members.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Nenhum membro cadastrado.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Nome</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>E-mail</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Perfil</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Telefone</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Último Acesso</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      opacity: m.isActive ? 1 : 0.6,
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{m.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{m.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px',
                          fontWeight: 700,
                          background:
                            m.role === 'admin'
                              ? '#EEF2FF'
                              : m.role === 'manager'
                              ? '#FEF3C7'
                              : '#F0FDF4',
                          color:
                            m.role === 'admin'
                              ? '#3730A3'
                              : m.role === 'manager'
                              ? '#92400E'
                              : '#166534',
                        }}
                      >
                        {roleLabel(m.role)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {m.phone || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: m.isActive ? '#ECFDF5' : '#F3F4F6',
                          color: m.isActive ? '#065F46' : '#6B7280',
                        }}
                      >
                        {m.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {m.lastLoginAt
                        ? new Date(m.lastLoginAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Nunca acessou'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => {
                            setEditingMember(m);
                            setEditRole(m.role === 'superadmin' ? 'admin' : (m.role as any));
                            setEditPhone(m.phone || '');
                          }}
                          title="Editar perfil e telefone"
                          style={{
                            padding: '6px 8px',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            color: 'var(--text)',
                          }}
                        >
                          <PencilSquareIcon style={{ width: 14, height: 14 }} />
                        </button>

                        <button
                          onClick={() => handleGenerateReset(m)}
                          title="Gerar link de redefinição de senha"
                          style={{
                            padding: '6px 8px',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            color: 'var(--text)',
                          }}
                        >
                          <KeyIcon style={{ width: 14, height: 14 }} />
                        </button>

                        <button
                          onClick={() => {
                            setReassigningMember(m);
                            const otherActive = members.find((x) => x.id !== m.id && x.isActive);
                            setTargetUserId(otherActive ? otherActive.id : '');
                          }}
                          title="Reatribuir clientes, projetos e propostas"
                          style={{
                            padding: '6px 8px',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            color: 'var(--text)',
                          }}
                        >
                          <ArrowRightCircleIcon style={{ width: 14, height: 14 }} />
                        </button>

                        <button
                          onClick={() => handleToggleActive(m)}
                          title={m.isActive ? 'Desativar usuário' : 'Reativar usuário'}
                          style={{
                            padding: '6px 8px',
                            background: m.isActive ? '#FEF2F2' : '#F0FDF4',
                            border: `1px solid ${m.isActive ? '#FECACA' : '#BBF7D0'}`,
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            color: m.isActive ? '#991B1B' : '#166534',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          {m.isActive ? 'Desativar' : 'Reativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Invites List */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Convites Pendentes ({invites.length})
          </h3>
        </div>

        {invites.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Nenhum convite pendente. Novos convites enviados aparecerão aqui.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>E-mail</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Perfil</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Expira em</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{inv.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: '#F3F4F6',
                          color: '#374151',
                        }}
                      >
                        {roleLabel(inv.role)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {new Date(inv.expiresAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          onClick={() => handleResendInvite(inv.id)}
                          style={{
                            padding: '6px 10px',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                          title="Reenviar e copiar novo link"
                        >
                          {copiedTokenId === inv.id ? (
                            <>
                              <ClipboardDocumentCheckIcon style={{ width: 14, height: 14, color: 'var(--green)' }} />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <ArrowPathIcon style={{ width: 14, height: 14 }} />
                              Copiar Link
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteInvite(inv.id)}
                          style={{
                            padding: '6px 8px',
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            color: '#991B1B',
                          }}
                          title="Cancelar convite"
                        >
                          <TrashIcon style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              width: '100%',
              maxWidth: 480,
              padding: 24,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Convidar Membro para a Equipe</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <XMarkIcon style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {createdInviteUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Convite criado com sucesso! Copie o link abaixo e envie ao membro:
                </p>
                <div
                  style={{
                    padding: 12,
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '12px',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                  }}
                >
                  {createdInviteUrl}
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdInviteUrl, 'modal-invite')}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'var(--green)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {copiedTokenId === 'modal-invite' ? (
                    <>
                      <ClipboardDocumentCheckIcon style={{ width: 16, height: 16 }} />
                      Link Copiado!
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon style={{ width: 16, height: 16 }} />
                      Copiar Link do Convite
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedInviteUrl(null);
                    setShowInviteModal(false);
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateInvite} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>
                    E-mail do colaborador *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="ex: consultor@solar.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>
                    Perfil de acesso *
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  >
                    <option value="seller">Vendedor (acessa apenas seus próprios clientes e propostas)</option>
                    <option value="manager">Gerente (enxerga toda a operação, sem acesso a configurações/equipe)</option>
                    <option value="admin">Administrador (acesso completo à empresa e equipe)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>
                    WhatsApp do consultor (opcional)
                  </label>
                  <input
                    type="text"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    placeholder="ex: 11999998888"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Será exibido nas propostas comerciais e no QR Code do consultor.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: 'var(--green)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      opacity: inviting ? 0.6 : 1,
                    }}
                  >
                    {inviting ? 'Gerando...' : 'Gerar Convite'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              width: '100%',
              maxWidth: 440,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Editar Membro: {editingMember.name}</h3>
              <button
                onClick={() => setEditingMember(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <XMarkIcon style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>
                  Perfil de acesso
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  <option value="seller">Vendedor</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>
                  Telefone / WhatsApp (aparece nas propostas)
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="ex: 11988887777"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'var(--green)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: savingEdit ? 0.6 : 1,
                  }}
                >
                  {savingEdit ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {reassigningMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              width: '100%',
              maxWidth: 460,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                Transferir Carteira de {reassigningMember.name}
              </h3>
              <button
                onClick={() => setReassigningMember(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <XMarkIcon style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Transfira todos os leads, projetos e propostas pertencentes a este membro para outro consultor da equipe.
            </p>

            <form onSubmit={handleReassign} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>
                  Novo Responsável *
                </label>
                <select
                  required
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  <option value="">Selecione o novo responsável...</option>
                  {members
                    .filter((m) => m.id !== reassigningMember.id && m.isActive)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({roleLabel(m.role)})
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setReassigningMember(null)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingReassign || !targetUserId}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'var(--green)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: savingReassign || !targetUserId ? 0.6 : 1,
                  }}
                >
                  {savingReassign ? 'Transferindo...' : 'Transferir Carteira'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetUrlInfo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              width: '100%',
              maxWidth: 480,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Redefinir Senha: {resetUrlInfo.memberName}</h3>
              <button
                onClick={() => setResetUrlInfo(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <XMarkIcon style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Copie o link seguro abaixo e envie diretamente ao colaborador para que ele possa cadastrar uma nova senha:
            </p>

            <div
              style={{
                padding: 12,
                background: 'var(--bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                fontSize: '12px',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                marginBottom: 16,
              }}
            >
              {resetUrlInfo.resetUrl}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => copyToClipboard(resetUrlInfo.resetUrl, 'modal-reset')}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--green)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {copiedTokenId === 'modal-reset' ? (
                  <>
                    <ClipboardDocumentCheckIcon style={{ width: 16, height: 16 }} />
                    Link Copiado!
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon style={{ width: 16, height: 16 }} />
                    Copiar Link
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setResetUrlInfo(null)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
