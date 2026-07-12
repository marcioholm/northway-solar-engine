'use client';

import { MapPinIcon, SunIcon, HomeModernIcon } from '@heroicons/react/24/outline';
import { StepCard, Field } from './_shared';

export function SiteOverview({ project }: { project: any; onUpdate: (p: any) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StepCard icon={<MapPinIcon style={{ width: 16, height: 16 }} />} title="Endereço">
        <Field label="Endereço" value={project.siteAddress} />
        <Field label="CEP" value={project.siteZipcode} />
      </StepCard>

      <StepCard icon={<SunIcon style={{ width: 16, height: 16 }} />} title="Coordenadas">
        <Field label="Latitude" value={project.siteLatitude?.toFixed(6)} />
        <Field label="Longitude" value={project.siteLongitude?.toFixed(6)} />
      </StepCard>

      <StepCard icon={<HomeModernIcon style={{ width: 16, height: 16 }} />} title="Telhado">
        <Field label="Tipo" value={project.siteRoofType} />
        <Field label="Inclinação" value={project.siteInclination ? `${project.siteInclination}°` : undefined} />
        <Field label="Azimute" value={project.siteAzimuth ? `${project.siteAzimuth}°` : undefined} />
      </StepCard>
    </div>
  );
}
