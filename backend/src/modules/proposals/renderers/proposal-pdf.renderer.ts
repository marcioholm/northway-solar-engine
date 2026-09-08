import {
  ProposalRenderer,
  ProposalAssembledData,
  RenderOutput,
} from './proposal-renderer.interface';
import { ProposalHtmlRenderer } from './proposal-html.renderer';

import * as puppeteer from 'puppeteer';

export class ProposalPdfRenderer implements ProposalRenderer {
  readonly name = 'pdf';

  constructor(private htmlRenderer: ProposalHtmlRenderer) {}

  async render(data: ProposalAssembledData): Promise<RenderOutput> {
    const htmlOutput = this.htmlRenderer.render(data);

    let browser;
    let pdfBuffer: Buffer;
    
    try {
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
      const page = await browser.newPage();
      
      // We set the content and wait for networkidle0 so images/fonts load
      await page.setContent(htmlOutput.content as string, { waitUntil: 'networkidle0' });
      
      const uint8Array = await page.pdf({ 
        format: 'A4', 
        printBackground: true,
        margin: { top: '0', bottom: '0', left: '0', right: '0' }
      });
      pdfBuffer = Buffer.from(uint8Array);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      throw new Error('Failed to generate PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    return {
      content: pdfBuffer,
      filename: `proposal-${data.proposal.id}.pdf`,
      mimeType: 'application/pdf',
    };
  }
}
