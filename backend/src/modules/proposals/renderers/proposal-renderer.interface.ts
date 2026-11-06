import { Proposal } from '../entities/proposal.entity';
import { SolarProject } from '../../solar-project/entities/solar-project.entity';
import { Quote } from '../../solar-project/entities/quote.entity';
import { Company } from '../../companies/entities/company.entity';
import { ProposalSettings } from '../../proposal-settings/entities/proposal-settings.entity';

export interface ProposalAssembledData {
  proposal: Proposal;
  project?: SolarProject;
  quote?: Quote;
  company?: Company;
  proposalSettings?: ProposalSettings;
  consultantName?: string;
  consultantPhone?: string;
}

export interface RenderOutput {
  content: string | Buffer; // HTML string / JSON string / PDF buffer
  filename: string;
  mimeType: string;
}

export interface ProposalRenderer {
  /** Unique identifier for this renderer */
  readonly name: string;
  /** Render the assembled data into the desired output format */
  render(data: ProposalAssembledData): RenderOutput | Promise<RenderOutput>;
}
