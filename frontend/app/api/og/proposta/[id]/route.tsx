import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data } = await supabase
      .from('proposals')
      .select('clientName, systemPowerKwp, finalPrice, monthlySavings, company:companies(name, logoUrl)')
      .eq('id', id)
      .single();

    if (!data) return new Response('Not found', { status: 404 });

    // Fallback api in case supabase fails (just to be safe)
    let companyData: any = data.company;
    let companyName = Array.isArray(companyData) ? companyData[0]?.name : companyData?.name || 'SolarCRM';
    let power = data.systemPowerKwp;
    let client = data.clientName;
    let savings = data.monthlySavings;

    return new ImageResponse(
      (
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          justifyContent: 'center', width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #8fd63a, #6DB522)',
          color: '#fff', fontFamily: 'sans-serif', padding: 40 
        }}>
          <div style={{ fontSize: 32, opacity: 0.9, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
            {companyName}
          </div>
          <div style={{ fontSize: 64, fontWeight: 900, marginTop: 24, textAlign: 'center' }}>
            Proposta Solar {power}kWp
          </div>
          <div style={{ fontSize: 40, marginTop: 24, opacity: 0.9 }}>
            {client}
          </div>
          {savings && (
            <div style={{ fontSize: 48, fontWeight: 800, marginTop: 40, background: 'rgba(0,0,0,0.1)', padding: '16px 32px', borderRadius: 16 }}>
              Economia estimada: R$ {savings.toLocaleString('pt-BR')}/mês
            </div>
          )}
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (e) {
    return new Response('Error generating image', { status: 500 });
  }
}
