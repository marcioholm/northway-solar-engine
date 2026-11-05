// SEM 'use client' — este é um Server Component
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProposalView } from '../../../components/proposta/ProposalView';
import { ProposalData } from '../../../lib/proposal-types';

// Cache da página por 5 minutos (ISR)
export const revalidate = 300;

type PageParams = { params: Promise<{ id: string }> };

// O parâmetro da rota é o token público, nunca o id interno da proposta.
async function fetchProposal(token: string): Promise<ProposalData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(`${apiUrl}/proposals/public/${encodeURIComponent(token)}`, {
      next: { revalidate },
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchProposal(id);

  if (!data) return { title: 'Proposta não encontrada' };

  return {
    title: `Proposta Solar ${data.systemPowerKwp}kWp — ${data.clientName}`,
    description: `Proposta de energia solar de R$ ${data.finalPrice?.toLocaleString('pt-BR')} para ${data.clientName}`,
    openGraph: {
      title: `Proposta Solar — ${data.company?.name || 'SolarCRM'}`,
      description: `Sistema de ${data.systemPowerKwp}kWp · ${data.clientName}`,
      images: [`/api/og/proposta/${id}`],
    },
  };
}

export default async function ProposalPage({ params }: PageParams) {
  const { id } = await params;
  const data = await fetchProposal(id);

  if (!data) notFound();

  return <ProposalView data={data} />;
}
