import {
  ProposalRenderer,
  ProposalAssembledData,
  RenderOutput,
} from './proposal-renderer.interface';
import { ProposalHtmlRenderer } from './proposal-html.renderer';
import * as puppeteer from 'puppeteer-core';
import * as fs from 'fs';
import * as path from 'path';

export function getLocalChromePath(): string {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  if (process.env.CHROME_PATH) {
    return process.env.CHROME_PATH;
  }
  const possiblePaths = [
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA
      ? path.join(
          process.env.LOCALAPPDATA,
          'Google',
          'Chrome',
          'Application',
          'chrome.exe',
        )
      : '',
  ].filter(Boolean);

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // Also check puppeteer cache in ~/.cache/puppeteer
  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (home) {
    const puppeteerCache = path.join(home, '.cache', 'puppeteer', 'chrome');
    if (fs.existsSync(puppeteerCache)) {
      try {
        const entries = fs.readdirSync(puppeteerCache, { recursive: true });
        for (const entry of entries) {
          const fullPath = path.join(puppeteerCache, entry.toString());
          if (
            (fullPath.endsWith('/Google Chrome') ||
              fullPath.endsWith('/chrome') ||
              fullPath.endsWith('/chrome.exe')) &&
            fs.existsSync(fullPath)
          ) {
            return fullPath;
          }
        }
      } catch {
        // ignore read error
      }
    }
  }

  throw new Error(
    'Nenhum executável do Chrome/Chromium foi encontrado para o ambiente local. Defina CHROME_PATH ou instale o Google Chrome.',
  );
}

export class ProposalPdfRenderer implements ProposalRenderer {
  readonly name = 'pdf';

  constructor(private htmlRenderer: ProposalHtmlRenderer) {}

  async render(data: ProposalAssembledData): Promise<RenderOutput> {
    const htmlOutput = await this.htmlRenderer.render(data);

    let browser: puppeteer.Browser | undefined;
    let pdfBuffer: Buffer;

    const isVercel = Boolean(
      process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME,
    );

    try {
      if (isVercel) {
        // No ambiente serverless da Vercel (AWS Lambda), usa @sparticuz/chromium
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const chromium = require('@sparticuz/chromium');
        const executablePath = await chromium.executablePath();
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath,
          headless: chromium.headless,
        });
      } else {
        // No ambiente local de desenvolvimento e testes, usa Chrome local
        const executablePath = getLocalChromePath();
        browser = await puppeteer.launch({
          executablePath,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
          ],
          headless: true,
        });
      }

      const page = await browser.newPage();

      // We set the content and wait for networkidle0 so images/fonts load,
      // with a fallback to domcontentloaded if any network asset fails or hangs
      try {
        await page.setContent(htmlOutput.content as string, {
          waitUntil: 'networkidle0' as any,
          timeout: 10000,
        });
      } catch {
        await page.setContent(htmlOutput.content as string, {
          waitUntil: 'domcontentloaded' as any,
        });
      }

      // O template distribui o conteúdo em páginas via script (paginação automática).
      // Espera o sinal de conclusão; se não vier, segue com o que estiver renderizado.
      if (typeof (page as any).waitForFunction === 'function') {
        await page
          .waitForFunction('window.__paged === true', { timeout: 10000 })
          .catch(() => undefined);
      }

      const uint8Array = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', bottom: '0', left: '0', right: '0' },
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
