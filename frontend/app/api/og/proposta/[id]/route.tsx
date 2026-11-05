import { ImageResponse } from 'next/og';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/proposals/public/${encodeURIComponent(id)}`,
    );
    if (!res.ok) return new Response('Not found', { status: 404 });

    const data = await res.json();
    const companyName = data.company?.name || 'SolarCRM';
    const power = data.systemPowerKwp;
    const client = data.clientName;
    const savings = data.monthlySavings;

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
