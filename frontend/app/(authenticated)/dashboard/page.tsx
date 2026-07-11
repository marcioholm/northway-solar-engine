'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    BoltIcon,
    MapPinIcon,
    CalculatorIcon
} from '@heroicons/react/24/outline';

interface IBGEState {
    id: number;
    sigla: string;
    nome: string;
}

interface IBGECity {
    id: number;
    nome: string;
}

export default function Dashboard() {
    return (
        <Suspense fallback={<div style={{ color: '#737B75', padding: '32px' }}>Carregando...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const searchParams = useSearchParams();
    const leadId = searchParams.get('leadId');
    const leadName = searchParams.get('name');
    const leadCity = searchParams.get('city');
    const leadState = searchParams.get('state');
    const leadConsumption = searchParams.get('consumption');

    const [clientName, setClientName] = useState(leadName || '');

    const [consumption, setConsumption] = useState(leadConsumption ? Number(leadConsumption) : 0);
    const [selectedState, setSelectedState] = useState(leadState || '');
    const [selectedCity, setSelectedCity] = useState(leadCity || '');

    // Data State
    const [states, setStates] = useState<IBGEState[]>([]);
    const [cities, setCities] = useState<IBGECity[]>([]);

    // Result State
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch States on Mount
    useEffect(() => {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(res => res.json())
            .then(data => setStates(data));
    }, []);

    // Fetch Cities when State changes
    useEffect(() => {
        if (selectedState) {
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`)
                .then(res => res.json())
                .then(data => setCities(data));
        } else {
            setCities([]);
            setSelectedCity('');
        }
    }, [selectedState]);

    const handleGeneratePdf = async () => {
        if (!result) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // 1. Create Proposal to get ID
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    consumption,
                    city: `${selectedCity} - ${selectedState}`,
                    clientName: clientName || 'Cliente Visitante',
                    clientCep: '00000-000',
                    leadId: leadId || undefined,
                }),
            });

            if (!res.ok) throw new Error('Failed to create proposal');
            const proposal = await res.json();

            // Update lead stage if coming from CRM
            if (leadId) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${leadId}/stage`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ stage: 'proposal_sent' }),
                });
            }

            // 2. Fetch PDF blob with Auth header
            const pdfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals/${proposal.id}/pdf`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!pdfRes.ok) throw new Error('Failed to fetch PDF');

            const blob = await pdfRes.blob();
            const url = window.URL.createObjectURL(blob);

            // 3. Open in new tab
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.click();

            // Clean up
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (err) {
            console.error(err);
            setError('Erro ao gerar PDF. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        // Format City string for backend: "City - UF"
        const cityString = `${selectedCity} - ${selectedState}`;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/solar-engine/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ consumption, city: cityString }),
            });

            if (!res.ok) throw new Error('Calculation failed');
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError('Falha ao calcular. Verifique os dados ou tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dash-page">
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                marginBottom: '32px',
            }}>
                <div>
                    <h1 style={{
                        fontSize: '30px',
                        fontWeight: 700,
                        color: '#151A16',
                        letterSpacing: '-0.03em',
                        margin: 0,
                        lineHeight: 1.2,
                    }}>Novo Dimensionamento</h1>
                    <p style={{
                        fontSize: '14px',
                        color: '#737B75',
                        margin: '6px 0 0',
                    }}>Configure os parâmetros técnicos para gerar uma proposta.</p>
                </div>
                {result && (
                    <button style={{
                        background: 'white',
                        border: '1px solid #E5E9E3',
                        borderRadius: '12px',
                        padding: '10px 18px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#737B75',
                        cursor: 'pointer',
                        transition: 'background 0.12s',
                    }}>
                        Histórico
                    </button>
                )}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '32px',
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '24px',
                }}>
                    {/* Parâmetros da Usina Card */}
                    <div style={{
                        background: 'white',
                        border: '1px solid #E5E9E3',
                        borderRadius: '20px',
                        padding: '28px 32px',
                        boxShadow: '0 10px 30px rgba(31,45,35,0.05)',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '24px',
                            color: '#82C832',
                        }}>
                            <CalculatorIcon style={{ width: '20px', height: '20px' }} />
                            <span style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#82C832',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}>Parâmetros da Usina</span>
                        </div>

                        <form onSubmit={handleCalculate} style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '20px',
                        }}>
                            <div style={{ gridColumn: 'span 3' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#737B75',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    marginBottom: '6px',
                                }}>Nome do Cliente</label>
                                <input
                                    type="text"
                                    required
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '12px 16px',
                                        background: '#F6F8F4',
                                        border: '1px solid #E5E9E3',
                                        borderRadius: '10px',
                                        color: '#151A16',
                                        fontSize: '16px',
                                        outline: 'none',
                                        transition: 'border-color 0.15s, box-shadow 0.15s',
                                    }}
                                    placeholder="Ex: João da Silva"
                                    onFocus={e => { e.target.style.borderColor = '#82C832'; e.target.style.boxShadow = '0 0 0 3px rgba(130,200,50,0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#E5E9E3'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#737B75',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    marginBottom: '6px',
                                }}>Consumo Médio (kWh)</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        required
                                        value={consumption || ''}
                                        onChange={e => setConsumption(Number(e.target.value))}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '12px 16px',
                                            paddingRight: '48px',
                                            background: '#F6F8F4',
                                            border: '1px solid #E5E9E3',
                                            borderRadius: '10px',
                                            color: '#151A16',
                                            fontSize: '16px',
                                            outline: 'none',
                                            transition: 'border-color 0.15s, box-shadow 0.15s',
                                        }}
                                        placeholder="0"
                                        onFocus={e => { e.target.style.borderColor = '#82C832'; e.target.style.boxShadow = '0 0 0 3px rgba(130,200,50,0.15)'; }}
                                        onBlur={e => { e.target.style.borderColor = '#E5E9E3'; e.target.style.boxShadow = 'none'; }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '14px',
                                        color: '#9ca3a0',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                    }}>kWh</span>
                                </div>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#737B75',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    marginBottom: '6px',
                                }}>Estado (UF)</label>
                                <select
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '12px 16px',
                                        background: '#F6F8F4',
                                        border: '1px solid #E5E9E3',
                                        borderRadius: '10px',
                                        color: '#151A16',
                                        fontSize: '14px',
                                        outline: 'none',
                                        appearance: 'none',
                                        transition: 'border-color 0.15s, box-shadow 0.15s',
                                    }}
                                    value={selectedState}
                                    onChange={e => setSelectedState(e.target.value)}
                                    required
                                    onFocus={e => { e.target.style.borderColor = '#82C832'; e.target.style.boxShadow = '0 0 0 3px rgba(130,200,50,0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#E5E9E3'; e.target.style.boxShadow = 'none'; }}
                                >
                                    <option value="">Selecione...</option>
                                    {states.map(uf => (
                                        <option key={uf.id} value={uf.sigla}>{uf.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#737B75',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    marginBottom: '6px',
                                }}>Cidade</label>
                                <select
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '12px 16px',
                                        background: '#F6F8F4',
                                        border: '1px solid #E5E9E3',
                                        borderRadius: '10px',
                                        color: selectedCity ? '#151A16' : '#9ca3a0',
                                        fontSize: '14px',
                                        outline: 'none',
                                        appearance: 'none',
                                        transition: 'border-color 0.15s, box-shadow 0.15s',
                                    }}
                                    value={selectedCity}
                                    onChange={e => setSelectedCity(e.target.value)}
                                    disabled={!selectedState}
                                    required
                                    onFocus={e => { e.target.style.borderColor = '#82C832'; e.target.style.boxShadow = '0 0 0 3px rgba(130,200,50,0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#E5E9E3'; e.target.style.boxShadow = 'none'; }}
                                >
                                    <option value="">Selecione...</option>
                                    {cities.map(city => (
                                        <option key={city.id} value={city.nome}>{city.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ gridColumn: 'span 3', marginTop: '4px' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        background: loading ? '#9ca3a0' : '#82C832',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '12px 28px',
                                        fontWeight: 700,
                                        fontSize: '14px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 8px 18px rgba(130,200,50,0.22)',
                                        transition: 'background 0.15s, transform 0.15s',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em',
                                    }}
                                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6DAF24'; }}
                                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#82C832'; }}
                                >
                                    {loading ? 'Calculando...' : 'Calcular Proposta'}
                                </button>
                                {error && <p style={{ color: '#D94C4C', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
                            </div>
                        </form>
                    </div>

                    {result && (
                        <>
                            {/* Result Cards */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '16px',
                            }}>
                                <div style={{
                                    background: 'white',
                                    padding: '24px',
                                    borderRadius: '20px',
                                    border: '1px solid #E5E9E3',
                                }}>
                                    <p style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#737B75',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        margin: '0 0 8px',
                                    }}>Potência Sugerida</p>
                                    <p style={{
                                        fontSize: '28px',
                                        fontWeight: 800,
                                        color: '#151A16',
                                        margin: 0,
                                    }}>
                                        {result.system_power_kwp.toFixed(2)}{' '}
                                        <span style={{ fontSize: '14px', color: '#737B75', fontWeight: 400 }}>kWp</span>
                                    </p>
                                </div>
                                <div style={{
                                    background: 'white',
                                    padding: '24px',
                                    borderRadius: '20px',
                                    border: '1px solid #E5E9E3',
                                }}>
                                    <p style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#737B75',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        margin: '0 0 8px',
                                    }}>Geração Mensal</p>
                                    <p style={{
                                        fontSize: '28px',
                                        fontWeight: 800,
                                        color: '#151A16',
                                        margin: 0,
                                    }}>
                                        {Math.round(result.monthly_generation)}{' '}
                                        <span style={{ fontSize: '14px', color: '#737B75', fontWeight: 400 }}>kWh</span>
                                    </p>
                                </div>
                                <div style={{
                                    background: 'white',
                                    padding: '24px',
                                    borderRadius: '20px',
                                    border: '1px solid #E5E9E3',
                                }}>
                                    <p style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#737B75',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        margin: '0 0 8px',
                                    }}>Inversor</p>
                                    <p style={{
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        color: '#151A16',
                                        margin: '0 0 4px',
                                        lineHeight: 1.3,
                                    }}>
                                        {result.inverter.model}
                                    </p>
                                    <p style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: '#82C832',
                                        margin: 0,
                                        letterSpacing: '0.03em',
                                    }}>
                                        OTIMIZADO PARA {result.module.brand.toUpperCase()}
                                    </p>
                                </div>
                            </div>

                            {/* Hardware Match */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: '#F2F5EF',
                                padding: '16px 20px',
                                borderRadius: '14px',
                                border: '1px dashed #D0D8CC',
                                gap: '16px',
                            }}>
                                <div>
                                    <p style={{
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        color: '#151A16',
                                        margin: '0 0 2px',
                                    }}>Hardware Engine Match</p>
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#737B75',
                                        margin: 0,
                                    }}>
                                        Dimensionamento automático com {result.module_qty}x módulos {result.module.model} ({result.module.powerWatt}W)
                                    </p>
                                </div>
                                <span style={{
                                    padding: '6px 12px',
                                    borderRadius: '999px',
                                    background: '#EEF2ED',
                                    color: '#58605A',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                }}>
                                    DISPONÍVEL
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Price Card */}
                <div>
                    {result ? (
                        <div style={{
                            background: 'linear-gradient(135deg, #82C832, #6DAF24)',
                            borderRadius: '20px',
                            padding: '32px',
                            color: '#fff',
                            boxShadow: '0 18px 40px rgba(130,200,50,0.30)',
                        }}>
                            <p style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em',
                                opacity: 0.75,
                                margin: '0 0 4px',
                            }}>Preço Final Sugerido</p>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '4px',
                            }}>
                                <span style={{ fontSize: '22px', fontWeight: 600, marginTop: '6px' }}>R$</span>
                                <span style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
                                    {result.final_price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div style={{ margin: '24px 0', borderTop: '1px solid rgba(255,255,255,0.2)' }}></div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px',
                            }}>
                                <div>
                                    <p style={{
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        opacity: 0.75,
                                        margin: '0 0 4px',
                                    }}>Margem ({result.margin_pct}%)</p>
                                    <p style={{
                                        fontSize: '22px',
                                        fontWeight: 800,
                                        margin: 0,
                                    }}>
                                        R$ {result.margin_value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        opacity: 0.75,
                                        margin: '0 0 4px',
                                    }}>Payback</p>
                                    <p style={{
                                        fontSize: '22px',
                                        fontWeight: 800,
                                        margin: 0,
                                    }}>
                                        {result.payback_years.toFixed(1)}{' '}
                                        <span style={{ fontSize: '14px', fontWeight: 400, opacity: 0.7 }}>Anos</span>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleGeneratePdf}
                                disabled={loading}
                                style={{
                                    marginTop: '28px',
                                    width: '100%',
                                    background: 'white',
                                    color: '#82C832',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    padding: '16px',
                                    border: 'none',
                                    borderRadius: '14px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'transform 0.15s, box-shadow 0.15s',
                                }}
                            >
                                <BoltIcon style={{ width: '18px', height: '18px' }} />
                                {loading ? 'GERANDO...' : 'GERAR PDF DA PROPOSTA'}
                            </button>

                            <p style={{
                                fontSize: '10px',
                                textAlign: 'center',
                                marginTop: '16px',
                                opacity: 0.6,
                            }}>
                                Validado pelo motor de engenharia NorthWay™
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'none',
                        }} />
                    )}
                </div>
            </div>
        </div>
    );
}
