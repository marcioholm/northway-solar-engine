import { Proposal } from '../entities/proposal.entity';
import { SolarProject } from '../../solar-project/entities/solar-project.entity';
import { Quote } from '../../solar-project/entities/quote.entity';
import { Company } from '../../companies/entities/company.entity';

export interface ProposalAssembledData {
  proposal: Proposal;
  project?: SolarProject;
  quote?: Quote;
  company?: Company;
  consultantName?: string;
  consultantPhone?: string;
}

export interface RenderOutput {
  content: string;       // HTML string / JSON string / PDF buffer as string
  filename: string;
  mimeType: string;
}

export interface ProposalRenderer {
  /** Unique identifier for this renderer */
  readonly name: string;
  /** Render the assembled data into the desired output format */
  render(data: ProposalAssembledData): RenderOutput;
}
