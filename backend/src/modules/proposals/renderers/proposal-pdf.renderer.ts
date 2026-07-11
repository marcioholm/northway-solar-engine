import { ProposalRenderer, ProposalAssembledData, RenderOutput } from './proposal-renderer.interface';
import { ProposalHtmlRenderer } from './proposal-html.renderer';

export class ProposalPdfRenderer implements ProposalRenderer {
  readonly name = 'pdf';

  constructor(private htmlRenderer: ProposalHtmlRenderer) {}

  render(data: ProposalAssembledData): RenderOutput {
    // Generate HTML first, then wrap for PDF generation
    // In production, this would use puppeteer or a PDF generation library
    // For now, returns HTML that the frontend can print to PDF
    const htmlOutput = this.htmlRenderer.render(data);

    return {
      content: htmlOutput.content,
      filename: `proposal-${data.proposal.id}.pdf`,
      mimeType: 'application/pdf',
    //   pdfOptions: {
    //     format: 'A4',
    //     margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    //   },
    };
  }
}
