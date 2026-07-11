'use client';

import { Stack } from '../../../../components/primitives/Stack';
import { PageHeader } from '../../../../components/compositions/PageHeader';
import { ProjectWizard } from '../../../../components/solar-project/ProjectWizard';

export default function NewSolarProjectPage() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      <Stack gap={6}>
        <PageHeader
          title="Novo Projeto"
          subtitle="Preencha as informações em cada etapa para criar um projeto solar completo."
        />
        <ProjectWizard />
      </Stack>
    </div>
  );
}
