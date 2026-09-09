'use client';
import { ProposalData } from '../../lib/proposal-types';
import { ProposalCover } from './ProposalCover';
import { CurrentReality } from './CurrentReality';
import { SavingsAndResults } from './SavingsAndResults';
import { SystemDetails } from './SystemDetails';
import { Investment } from './Investment';
import { TimelineSteps } from './TimelineSteps';
import { NextSteps } from './NextSteps';
import { EnvironmentalFooter } from './EnvironmentalFooter';
import { StickyPriceBanner } from './StickyPriceBanner';

export function ProposalView({ data }: { data: ProposalData }) {
  return (
    <article style={{ fontFamily: 'var(--font-body)', paddingBottom: 72 }}>
      <ProposalCover data={data} />
      <CurrentReality data={data} />
      <SavingsAndResults data={data} />
      <SystemDetails data={data} />
      <Investment data={data} />
      <TimelineSteps data={data} />
      <NextSteps data={data} />
      <EnvironmentalFooter data={data} />
      <StickyPriceBanner data={data} />
    </article>
  );
}
