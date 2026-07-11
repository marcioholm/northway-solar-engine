'use client';
import { ProposalData } from '../../lib/proposal-types';
import { ProposalCover } from './ProposalCover';
import { CurrentReality } from './CurrentReality';
import { SavingsOverview } from './SavingsOverview';
import { EquipmentList } from './EquipmentList';
import { WhyThisSystem } from './WhyThisSystem';
import { ExpectedResults } from './ExpectedResults';
import { EnvironmentalImpact } from './EnvironmentalImpact';
import { InvestmentHero } from './InvestmentHero';
import { PaymentMethods } from './PaymentMethods';
import { TimelineSteps } from './TimelineSteps';
import { CompanyAuthority } from './CompanyAuthority';
import { NextSteps } from './NextSteps';
import { FAQ } from './FAQ';
import { Testimonials } from './Testimonials';
import { CostOfNotInvesting } from './CostOfNotInvesting';
import { ComparisonPlans } from './ComparisonPlans';

export function ProposalView({ data }: { data: ProposalData }) {
  return (
    <article style={{ fontFamily: 'var(--font-body)' }}>
      <ProposalCover data={data} />
      <CurrentReality data={data} />
      <SavingsOverview data={data} />
      <EquipmentList data={data} />
      <WhyThisSystem data={data} />
      <ExpectedResults data={data} />
      <EnvironmentalImpact data={data} />
      <InvestmentHero data={data} />
      <PaymentMethods data={data} />
      <TimelineSteps data={data} />
      <CompanyAuthority data={data} />
      <CostOfNotInvesting data={data} />
      <ComparisonPlans data={data} />
      <Testimonials data={data} />
      <FAQ data={data} />
      <NextSteps data={data} />
    </article>
  );
}
