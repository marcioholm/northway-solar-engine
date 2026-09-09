// SEM 'use client' — este é um Server Component
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProposalView } from '../../../components/proposta/ProposalView';
import { ProposalData } from '../../../lib/proposal-types';

// Supabase REST fetch se não quisermos usar o client direto caso dê problema
// Mas como o usuário sugeriu, vou usar o fetch normal via a própria API do NestJS se possível,
// porém as instruções mandaram usar createClient do @supabase/supabase-js, ou fetch no servidor.
// Como não tenho certeza se @supabase/supabase-js está no frontend, vou usar fetch normal REST,
// O código do usuário disse: 
// const supabase = createClient(...)
// Eu vou tentar fazer o fetch pela API interna (nest) ou supabase REST.
// Wait, vou usar a mesma abordagem do usuário com supabase-js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cache da página por 5 minutos (ISR)
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
    .from('proposals')
    .select('clientName, systemPowerKwp, finalPrice, company:companies(name)')
    .eq('id', id)
    .single();

  if (!data) return { title: 'Proposta não encontrada' };

  return {
    title: `Proposta Solar ${data.systemPowerKwp}kWp — ${data.clientName}`,
    description: `Proposta de energia solar de R$ ${data.finalPrice?.toLocaleString('pt-BR')} para ${data.clientName}`,
    openGraph: {
      title: `Proposta Solar — ${(Array.isArray(data.company) ? data.company[0]?.name : (data.company as any)?.name) || 'SolarCRM'}`,
      description: `Sistema de ${data.systemPowerKwp}kWp · ${data.clientName}`,
      images: [`/api/og/proposta/${id}`],
    },
  };
}

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('proposals')
    .select('*, company:companies(*)')
    .eq('id', id)
    .single();

  if (!data || error) {
    // Tenta pela API REST local caso a rota seja diferente
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/proposals/${id}`, { next: { revalidate: 300 } });
        if (res.ok) {
          const apiData = await res.json();
          if (apiData && apiData.id) {
            return <ProposalView data={apiData} />;
          }
        }
      } catch (e) {}
    }
    
    notFound();
  }

  return <ProposalView data={data as ProposalData} />;
}
