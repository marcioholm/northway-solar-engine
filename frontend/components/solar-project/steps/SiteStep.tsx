'use client';

import { Input } from '../../ui/Input';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';

interface SiteData {
  siteAddress: string;
  siteZipcode: string;
  siteLatitude: number;
  siteLongitude: number;
  siteRoofType: string;
  siteInclination: number;
  siteAzimuth: number;
}

export function SiteStep({ data, onChange }: { data: Partial<SiteData>; onChange: (d: Partial<SiteData>) => void }) {
  const setString = (key: string, val: string) => onChange({ ...data, [key]: val });
  const setNumber = (key: string, val: string) => onChange({ ...data, [key]: val ? Number(val) : undefined });

  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Localização do Projeto</Text>
        <Text variant="body" color="secondary">Endereço e características do telhado/terreno.</Text>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input label="Endereço Completo" value={data.siteAddress || ''} onChange={v => setString('siteAddress', v)} />
        <Input label="CEP" value={data.siteZipcode || ''} onChange={v => setString('siteZipcode', v)} />
        <Input label="Latitude" variant="number" placeholder="-23.5505" value={data.siteLatitude ?? ''} onChange={v => setNumber('siteLatitude', v)} />
        <Input label="Longitude" variant="number" placeholder="-46.6333" value={data.siteLongitude ?? ''} onChange={v => setNumber('siteLongitude', v)} />
        <Input label="Tipo de Telhado" value={data.siteRoofType || ''} onChange={v => setString('siteRoofType', v)} placeholder="Cerâmico / Fibrocimento / Laje / Solo / Metálico" />
        <Input label="Inclinação (°)" variant="number" placeholder="15" value={data.siteInclination ?? ''} onChange={v => setNumber('siteInclination', v)} />
        <Input label="Azimute (°)" variant="number" placeholder="0 = Norte" value={data.siteAzimuth ?? ''} onChange={v => setNumber('siteAzimuth', v)} />
      </div>
    </Stack>
  );
}
