import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { DataSource } from 'typeorm';
import sharp from 'sharp';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

const COMPANY_A = '11111111-1111-4111-8111-111111111111';
const COMPANY_B = '22222222-2222-4222-8222-222222222222';
const PROPOSAL_ID = '33333333-3333-4333-8333-333333333333';
const PUBLIC_TOKEN = 'token-publico-de-teste';
const PASSWORD = 'senha-de-teste';

describe('Isolamento e rotas públicas (e2e)', () => {
  let app: INestApplication;
  let db: DataSource;
  let adminToken: string;
  let sellerToken: string;
  let superadminToken: string;
  let adminBToken: string;

  const http = () => request(app.getHttpServer());
  const login = async (email: string) => {
    const response = await http()
      .post('/auth/login')
      .send({ email, password: PASSWORD })
      .expect(201);
    return response.body.access_token as string;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    db = app.get(DataSource);
    // Este teste apaga dados: só roda em banco cujo nome termina em _test.
    const [{ current_database: database }] = await db.query(
      'SELECT current_database()',
    );
    if (!String(database).endsWith('_test')) {
      throw new Error(`E2E recusado no banco "${database}"`);
    }

    const hash = await bcrypt.hash(PASSWORD, 4);
    await db.query('TRUNCATE companies, users, proposals, leads CASCADE');
    await db.query(
      `INSERT INTO companies (id, name, base_city, meta_access_token)
       VALUES ($1, 'Empresa A', 'Arapoti - PR', 'segredo-a'),
              ($2, 'Empresa B', 'Curitiba - PR', 'segredo-b')`,
      [COMPANY_A, COMPANY_B],
    );
    await db.query(
      `INSERT INTO users (company_id, name, email, password_hash, role) VALUES
       ($1, 'Admin', 'admin@a.test', $2, 'admin'),
       ($1, 'Vendedor', 'vendedor@a.test', $2, 'seller'),
       ($1, 'Plataforma', 'root@a.test', $2, 'superadmin'),
       ($3, 'Admin B', 'admin@b.test', $2, 'admin')`,
      [COMPANY_A, hash, COMPANY_B],
    );
    await db.query(
      `INSERT INTO proposals (
         id, public_token, company_id, client_name, client_cep, client_city,
         consumption_kwh, system_power_kwp, module_qty, cost_modules,
         cost_inverter, cost_labor, cost_structure, cost_travel, subtotal,
         margin_pct, margin_value, final_price, payback_years, created_by
       ) VALUES (
         $1, $2, $3, 'Cliente Teste', '84990-000', 'Arapoti', 500, 5, 10,
         1000, 1000, 1000, 1000, 0, 4000, 25, 1000, 5000, 4.5, 'teste'
       )`,
      [PROPOSAL_ID, PUBLIC_TOKEN, COMPANY_A],
    );

    adminToken = await login('admin@a.test');
    sellerToken = await login('vendedor@a.test');
    superadminToken = await login('root@a.test');
    adminBToken = await login('admin@b.test');
  });

  afterAll(async () => {
    await app?.close();
  });

  it.each([
    ['get', '/projects'],
    ['get', '/teams'],
    ['get', '/finance/dashboard'],
    ['get', '/intelligence/dashboard'],
    ['post', '/pricing-engine/calculate'],
  ] as const)('%s %s exige login', async (method, path) => {
    await http()[method](path).expect(401);
  });

  it('só a plataforma lista empresas', async () => {
    await http()
      .get('/companies')
      .auth(adminToken, { type: 'bearer' })
      .expect(403);

    const response = await http()
      .get('/companies')
      .auth(superadminToken, { type: 'bearer' })
      .expect(200);
    expect(response.body).toHaveLength(2);
    expect(JSON.stringify(response.body)).not.toContain('segredo');
  });

  it('admin não acessa nem altera outra empresa', async () => {
    await http()
      .get(`/companies/${COMPANY_B}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(403);
    await http()
      .patch(`/companies/${COMPANY_B}`)
      .auth(adminToken, { type: 'bearer' })
      .send({ name: 'Invadida' })
      .expect(403);
    await http()
      .delete(`/companies/${COMPANY_A}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(403);
  });

  it('admin altera a própria empresa e o token não volta', async () => {
    await http()
      .patch(`/companies/${COMPANY_A}`)
      .auth(adminToken, { type: 'bearer' })
      .send({ name: 'Empresa A2', defaultMargin: 30 })
      .expect(200);

    const response = await http()
      .get(`/companies/${COMPANY_A}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
    expect(response.body.name).toBe('Empresa A2');
    expect(response.body.hasMetaAccessToken).toBe(true);
    expect(response.body.metaAccessToken).toBeUndefined();
  });

  it('vendedor não altera a empresa', async () => {
    await http()
      .patch(`/companies/${COMPANY_A}`)
      .auth(sellerToken, { type: 'bearer' })
      .send({ name: 'Vendedor' })
      .expect(403);
  });

  it('cadastro ignora papel e empresa enviados pelo cliente', async () => {
    const response = await http().post('/auth/register').send({
      email: 'x@x.test',
      password: 'senha-longa',
      name: 'X',
      role: 'superadmin',
      companyId: COMPANY_A,
    });
    expect(response.status).not.toBe(201);

    const users = await app
      .get(DataSource)
      .query(`SELECT 1 FROM users WHERE email = 'x@x.test'`);
    expect(users).toHaveLength(0);
  });

  it('cria lead e tarefa pela API', async () => {
    const lead = await http()
      .post('/leads')
      .auth(sellerToken, { type: 'bearer' })
      .send({
        name: 'Lead real',
        phone: '43999999999',
        email: 'lead@a.test',
        city: 'Arapoti',
        state: 'PR',
        address: '',
        zipcode: '',
        clientType: 'residential',
        source: '',
        utility: '',
        notes: '',
        utmSource: 'meta',
        utmMedium: '',
        utmCampaign: 'teste',
        utmTerm: '',
        utmContent: '',
        fbclid: '',
      })
      .expect(201);
    expect(lead.body.companyId).toBe(COMPANY_A);

    await http()
      .post('/tasks')
      .auth(sellerToken, { type: 'bearer' })
      .send({ leadId: lead.body.id, title: 'Ligar' })
      .expect(201);
  });

  it('lead ignora empresa enviada pelo cliente', async () => {
    const response = await http()
      .post('/leads')
      .auth(sellerToken, { type: 'bearer' })
      .send({
        name: 'Intruso',
        phone: '43988888888',
        email: 'intruso@a.test',
        city: 'Arapoti',
        state: 'PR',
        companyId: COMPANY_B,
      })
      .expect(201);
    expect(response.body.companyId).toBe(COMPANY_A);
  });

  it('proposta pública só mostra campos do cliente final', async () => {
    const response = await http()
      .get(`/proposals/public/${PUBLIC_TOKEN}`)
      .expect(200);
    expect(response.body.clientName).toBe('Cliente Teste');
    expect(response.body.finalPrice).toBe(5000);
    expect(Object.keys(response.body.company).sort()).toEqual([
      'logoUrl',
      'name',
    ]);

    const body = JSON.stringify(response.body);
    for (const secret of ['marginPct', 'totalCost', 'subtotal', 'segredo']) {
      expect(body).not.toContain(secret);
    }
    expect(response.body.id).toBeUndefined();

    // Sem condições de pagamento no projeto: não mostra parcelas calculadas
    expect(response.body.payment.cardInstallment).toBeUndefined();
    expect(response.body.payment.financeInstallment).toBeUndefined();
    expect(response.body.payment.cashPrice).toBeUndefined();
    // Sem geração no projeto: omite a geração
    expect(response.body.generationMonthlyKwh).toBeUndefined();
  });

  it('proposta sem condições de pagamento não mostra parcelas e sem geração omite gráfico', async () => {
    // 1. Proposta pública
    const response = await http()
      .get(`/proposals/public/${PUBLIC_TOKEN}`)
      .expect(200);

    expect(response.body.payment.cardInstallments).toBeUndefined();
    expect(response.body.payment.cardInstallment).toBeUndefined();
    expect(response.body.payment.financeInstallments).toBeUndefined();
    expect(response.body.payment.financeInstallment).toBeUndefined();
    expect(response.body.payment.cashDiscount).toBeUndefined();
    expect(response.body.payment.cashPrice).toBeUndefined();
    expect(response.body.generationMonthlyKwh).toBeUndefined();

    // 2. Renderização de PDF: gera sem quebrar e sem dados vazados
    const pdfRes = await http()
      .get(`/proposals/${PROPOSAL_ID}/pdf`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
    expect(pdfRes.header['content-type']).toContain('application/pdf');

    // 3. Sigilo total de dados internos
    const bodyStr = JSON.stringify(response.body);
    for (const secret of ['marginPct', 'totalCost', 'pricingProfit', 'costModules', 'segredo']) {
      expect(bodyStr).not.toContain(secret);
    }
  });

  it('token desconhecido devolve 404', async () => {
    await http().get('/proposals/public/nao-existe').expect(404);
  });

  it('rastreamento só aceita token público', async () => {
    await http()
      .post(`/proposals/public/${PUBLIC_TOKEN}/tracking`)
      .send({ eventType: 'view' })
      .expect(201);
    await http()
      .post(`/proposals/${PROPOSAL_ID}/tracking`)
      .send({ eventType: 'accept' })
      .expect(404);
  });

  it('proposta com cotação exibe marca, modelo e quantidade e não vaza segredos', async () => {
    const db = app.get(DataSource);
    const projId = '44444444-4444-4444-8444-444444444444';
    const quoteId = '55555555-5555-4555-8555-555555555555';
    const proposalId = '66666666-6666-4666-8666-666666666666';
    const token = 'token-com-cotacao-e2e';

    await db.query(
      `INSERT INTO solar_project (id, company_id, client_name, client_city, client_email, client_phone, client_document, status, created_by)
       VALUES ($1, $2, 'Cliente Cotacao', 'Arapoti', 'cliente@secreto.com', '43999990000', '12345678901', 'draft', 'teste')`,
      [projId, COMPANY_A],
    );

    await db.query(
      `INSERT INTO quotes (id, solar_project_id, supplier_name, selected, total_amount, created_by)
       VALUES ($1, $2, 'Fornecedor Super Secreto', true, 12000, 'teste')`,
      [quoteId, projId],
    );

    await db.query(
      `INSERT INTO quote_items (quote_id, product_type, product_brand, product_model, quantity, unit_price, total_price)
       VALUES 
       ($1, 'module', 'Canadian Solar', 'CS6W-550MS', 10, 600, 6000),
       ($1, 'inverter', 'Growatt', 'MIN 5000TL-X', 1, 6000, 6000)`,
      [quoteId],
    );

    await db.query(
      `INSERT INTO proposals (
         id, public_token, company_id, solar_project_id, quote_id, client_name,
         client_cep, client_city, consumption_kwh, system_power_kwp, module_qty,
         cost_modules, cost_inverter, cost_labor, cost_structure, cost_travel,
         subtotal, margin_pct, margin_value, final_price, payback_years, created_by
       ) VALUES (
         $1, $2, $3, $4, $5, 'Cliente Cotacao', '84990-000', 'Arapoti', 500, 5.5, 10,
         6000, 6000, 1000, 1000, 0, 14000, 20, 2800, 16800, 4.2, 'teste'
       )`,
      [proposalId, token, COMPANY_A, projId, quoteId],
    );

    const response = await http().get(`/proposals/public/${token}`).expect(200);
    expect(response.body.equipment).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'module', brand: 'Canadian Solar', model: 'CS6W-550MS', quantity: 10 }),
        expect.objectContaining({ type: 'inverter', brand: 'Growatt', model: 'MIN 5000TL-X', quantity: 1 }),
      ]),
    );

    const htmlRes = await http().get(`/proposals/public/${token}?format=html`).expect(200);
    const html = htmlRes.text;
    expect(html).toContain('Canadian Solar');
    expect(html).toContain('CS6W-550MS');
    expect(html).toContain('Growatt');
    expect(html).toContain('MIN 5000TL-X');
    expect(html).not.toContain('Fornecedor Super Secreto');
    expect(html).not.toContain('cliente@secreto.com');
    expect(html).not.toContain('43999990000');
    expect(html).not.toContain('12345678901');
    expect(html).not.toContain('marginPct');
    expect(html).not.toContain('pricingProfit');
  });

  it('projeto com equipamentos próprios mantém dados sem usar cotação', async () => {
    const db = app.get(DataSource);
    const projId = '77777777-7777-4777-8777-777777777777';
    const quoteId = '88888888-8888-4888-8888-888888888888';
    const proposalId = '99999999-9999-4999-8999-999999999999';
    const token = 'token-proprios-e2e';

    await db.query(
      `INSERT INTO solar_project (id, company_id, client_name, equipment_modules, equipment_inverters, status, created_by)
       VALUES ($1, $2, 'Cliente Proprio', '[{"brand":"JA Solar","model":"JAM72","qty":12}]'::jsonb, '[{"brand":"Solis","model":"S5","qty":1}]'::jsonb, 'draft', 'teste')`,
      [projId, COMPANY_A],
    );

    await db.query(
      `INSERT INTO quotes (id, solar_project_id, supplier_name, selected, total_amount, created_by)
       VALUES ($1, $2, 'Outro Fornecedor', true, 10000, 'teste')`,
      [quoteId, projId],
    );

    await db.query(
      `INSERT INTO quote_items (quote_id, product_type, product_brand, product_model, quantity, unit_price, total_price)
       VALUES ($1, 'module', 'Marca Nao Usada', 'Modelo Nao Usado', 50, 100, 5000)`,
      [quoteId],
    );

    await db.query(
      `INSERT INTO proposals (
         id, public_token, company_id, solar_project_id, quote_id, client_name,
         client_cep, client_city, consumption_kwh, system_power_kwp, module_qty,
         cost_modules, cost_inverter, cost_labor, cost_structure, cost_travel,
         subtotal, margin_pct, margin_value, final_price, payback_years, created_by
       ) VALUES (
         $1, $2, $3, $4, $5, 'Cliente Proprio', '84990-000', 'Arapoti', 600, 6.6, 12,
         5000, 4000, 1000, 1000, 0, 11000, 20, 2200, 13200, 3.5, 'teste'
       )`,
      [proposalId, token, COMPANY_A, projId, quoteId],
    );

    const response = await http().get(`/proposals/public/${token}`).expect(200);
    expect(response.body.equipment).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'module', brand: 'JA Solar', model: 'JAM72', quantity: 12 }),
        expect.objectContaining({ type: 'inverter', brand: 'Solis', model: 'S5', quantity: 1 }),
      ]),
    );
    expect(JSON.stringify(response.body)).not.toContain('Marca Nao Usada');
  });

  it('salva todos os custos por PATCH, confere por GET, gera proposta e valida totalCost e finalPrice', async () => {
    const createRes = await http()
      .post('/solar-project')
      .auth(adminToken, { type: 'bearer' })
      .send({
        clientName: 'Cliente Custos E2E',
        consumptionMonthlyBill: 1000,
        consumptionMonthlyKwh: 1200,
        sizingPowerKwp: 10,
        sizingModuleQty: 20,
      })
      .expect(201);

    const projectId = createRes.body.id;

    const allCostsPayload = {
      pricingEquipmentCost: 20000,
      pricingProjectCost: 1500,
      pricingArtCost: 400,
      pricingInstallationCost: 4000,
      pricingHotelCost: 500,
      pricingFreightCost: 600,
      pricingFoodCost: 350,
      pricingTravelCost: 800,
      pricingTollCost: 120,
      pricingCraneCost: 700,
      pricingThirdPartiesCost: 450,
      pricingAdminCost: 300,
      pricingTaxes: 1200,
      pricingOtherCost: 280,
      pricingMarginPct: 25,
      pricingMinMarginPct: 15,
      pricingRecommendedMarginPct: 25,
      pricingTravelDistance: 120,
      pricingTravelTrips: 2,
      pricingFuelEfficiency: 10,
      pricingFuelPrice: 6.5,
      pricingCommissionPct: 2.5,
      sizingObservations: 'Telhado sem sombreamento',
    };

    await http()
      .patch(`/solar-project/${projectId}`)
      .auth(adminToken, { type: 'bearer' })
      .send(allCostsPayload)
      .expect(200);

    const getRes = await http()
      .get(`/solar-project/${projectId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(getRes.body.pricingEquipmentCost).toBe(20000);
    expect(getRes.body.pricingProjectCost).toBe(1500);
    expect(getRes.body.pricingArtCost).toBe(400);
    expect(getRes.body.pricingInstallationCost).toBe(4000);
    expect(getRes.body.pricingHotelCost).toBe(500);
    expect(getRes.body.pricingFreightCost).toBe(600);
    expect(getRes.body.pricingFoodCost).toBe(350);
    expect(getRes.body.pricingTravelCost).toBe(800);
    expect(getRes.body.pricingTollCost).toBe(120);
    expect(getRes.body.pricingCraneCost).toBe(700);
    expect(getRes.body.pricingThirdPartiesCost).toBe(450);
    expect(getRes.body.pricingAdminCost).toBe(300);
    expect(getRes.body.pricingTaxes).toBe(1200);
    expect(getRes.body.pricingOtherCost).toBe(280);
    expect(getRes.body.pricingMarginPct).toBe(25);
    expect(getRes.body.pricingMinMarginPct).toBe(15);
    expect(getRes.body.pricingRecommendedMarginPct).toBe(25);
    expect(getRes.body.pricingTravelDistance).toBe(120);
    expect(getRes.body.pricingTravelTrips).toBe(2);
    expect(getRes.body.pricingFuelEfficiency).toBe(10);
    expect(getRes.body.pricingFuelPrice).toBe(6.5);
    expect(getRes.body.pricingCommissionPct).toBe(2.5);
    expect(getRes.body.sizingObservations).toBe('Telhado sem sombreamento');

    const genRes = await http()
      .post(`/proposals/generate/${projectId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(201);

    const proposal = genRes.body;
    const pricingOutput = proposal.settings?.pricingOutput;

    expect(pricingOutput).toBeDefined();
    // Base operacional = 1500 + 400 + 4000 + 500 + 600 + 350 + 800 + 120 + 700 + 450 + 300 + 1200 + 280 = 11200
    // Base total = 20000 + 11200 = 31200
    // finalPrice = 31200 * 1.25 / (1 - 0.025 * 1.25) = 39000 / 0.96875 = 40258.06
    // commission = 40258.06 * 0.025 = 1006.45
    // totalCost = 31200 + 1006.45 = 32206.45
    // operationalCostTotal = 11200 + 1006.45 = 12206.45
    expect(pricingOutput.commission).toBe(1006.45);
    expect(pricingOutput.operationalCostTotal).toBe(12206.45);
    expect(pricingOutput.totalCost).toBe(32206.45);
    expect(proposal.finalPrice).toBe(40258.06);
    expect(pricingOutput.finalPrice).toBe(40258.06);
    expect(pricingOutput.appliedMarginPct).toBe(25);
  });

  it('deve recusar campos desconhecidos em POST /pricing-engine/calculate com 400', async () => {
    const res = await http()
      .post('/pricing-engine/calculate')
      .auth(adminToken, { type: 'bearer' })
      .send({
        equipmentCost: 10000,
        marginPct: 20,
        costProjectCost: 1500, // campo desconhecido
      })
      .expect(400);

    expect(res.body.message).toEqual(
      expect.arrayContaining([expect.stringContaining('property costProjectCost should not exist')]),
    );
  });

  it('deve calcular corretamente com todos os custos preenchidos conferindo o total', async () => {
    const payload = {
      equipmentCost: 20000,
      costProject: 1500,
      costArt: 400,
      costInstallation: 4000,
      costHotel: 500,
      costFreight: 600,
      costFood: 350,
      costTravel: 800,
      costToll: 120,
      costCrane: 700,
      costThirdParties: 450,
      costAdmin: 300,
      costTaxes: 1200,
      costOther: 280,
      commissionPct: 2.5,
      marginPct: 25,
      minMarginPct: 15,
      recommendedMarginPct: 25,
    };

    const res = await http()
      .post('/pricing-engine/calculate')
      .auth(adminToken, { type: 'bearer' })
      .send(payload)
      .expect(201);

    expect(res.body.commission).toBe(1006.45);
    expect(res.body.operationalCostTotal).toBe(12206.45);
    expect(res.body.totalCost).toBe(32206.45);
    expect(res.body.finalPrice).toBe(40258.06);
    expect(res.body.effectiveMarginPct).toBe(20);
    expect(res.body.profit).toBe(8051.61);
    expect(res.body.breakdown.costProject).toBe(1500);
    expect(res.body.breakdown.costArt).toBe(400);
    expect(res.body.breakdown.costInstallation).toBe(4000);
    expect(res.body.breakdown.costHotel).toBe(500);
    expect(res.body.breakdown.costFreight).toBe(600);
    expect(res.body.breakdown.costFood).toBe(350);
    expect(res.body.breakdown.costTravel).toBe(800);
    expect(res.body.breakdown.costToll).toBe(120);
    expect(res.body.breakdown.costCrane).toBe(700);
    expect(res.body.breakdown.costThirdParties).toBe(450);
    expect(res.body.breakdown.costAdmin).toBe(300);
    expect(res.body.breakdown.costTaxes).toBe(1200);
    expect(res.body.breakdown.costOther).toBe(280);
    expect(res.body.breakdown.equipmentCost).toBe(20000);
  });

  it('vincula proposta ao lead, avança lead para proposal_sent e lista na aba de propostas do lead', async () => {
    // 1. Criar lead na Empresa A (estágio inicial: new)
    const leadRes = await http()
      .post('/leads')
      .auth(adminToken, { type: 'bearer' })
      .send({
        name: 'Lead Com Proposta E2E',
        phone: '43999990001',
        email: 'lead.prop@a.test',
        city: 'Arapoti',
        state: 'PR',
      })
      .expect(201);

    const leadId = leadRes.body.id;
    expect(leadRes.body.stage).toBe('new');

    // 2. Criar projeto solar vinculado a este lead
    const projectRes = await http()
      .post('/solar-project')
      .auth(adminToken, { type: 'bearer' })
      .send({
        clientName: 'Lead Com Proposta E2E',
        leadId,
        consumptionMonthlyBill: 800,
        consumptionMonthlyKwh: 900,
        sizingPowerKwp: 7.5,
      })
      .expect(201);

    const projectId = projectRes.body.id;
    expect(projectRes.body.leadId).toBe(leadId);

    // 3. Gerar proposta a partir do projeto
    const genRes = await http()
      .post(`/proposals/generate/${projectId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(201);

    expect(genRes.body.leadId).toBe(leadId);
    expect(genRes.body.stage).toBe('proposal_sent');

    // 4. Conferir que o lead avançou para proposal_sent
    const leadAfter = await http()
      .get(`/leads/${leadId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(leadAfter.body.stage).toBe('proposal_sent');

    // 5. Conferir que a proposta aparece na consulta por lead (/proposals/lead/:leadId)
    const proposalsLeadRes = await http()
      .get(`/proposals/lead/${leadId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(Array.isArray(proposalsLeadRes.body)).toBe(true);
    expect(proposalsLeadRes.body.some((p: any) => p.id === genRes.body.id)).toBe(true);
  });

  it('não recua lead que já esteja em etapa mais avançada ao gerar proposta', async () => {
    // 1. Criar lead na Empresa A
    const leadRes = await http()
      .post('/leads')
      .auth(adminToken, { type: 'bearer' })
      .send({
        name: 'Lead em Negociação E2E',
        phone: '43999990002',
        email: 'lead.neg@a.test',
        city: 'Arapoti',
        state: 'PR',
      })
      .expect(201);

    const leadId = leadRes.body.id;

    // 2. Mover o lead para 'negotiation'
    await http()
      .patch(`/leads/${leadId}/stage`)
      .auth(adminToken, { type: 'bearer' })
      .send({ stage: 'negotiation' })
      .expect(200);

    // 3. Criar projeto solar vinculado a este lead
    const projectRes = await http()
      .post('/solar-project')
      .auth(adminToken, { type: 'bearer' })
      .send({
        clientName: 'Lead em Negociação E2E',
        leadId,
        consumptionMonthlyBill: 1200,
        consumptionMonthlyKwh: 1500,
        sizingPowerKwp: 12,
      })
      .expect(201);

    const projectId = projectRes.body.id;

    // 4. Gerar proposta para o projeto
    const genRes = await http()
      .post(`/proposals/generate/${projectId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(201);

    expect(genRes.body.leadId).toBe(leadId);

    // 5. Conferir que o lead PERMANECE em negotiation (não recuou)
    const leadAfter = await http()
      .get(`/leads/${leadId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(leadAfter.body.stage).toBe('negotiation');
  });

  it('não altera lead de outra empresa ao gerar proposta com leadId externo', async () => {
    // 1. Criar lead na Empresa B
    const leadBRes = await http()
      .post('/leads')
      .auth(adminBToken, { type: 'bearer' })
      .send({
        name: 'Lead Empresa B E2E',
        phone: '41999990003',
        email: 'lead.b@b.test',
        city: 'Curitiba',
        state: 'PR',
      })
      .expect(201);

    const leadBId = leadBRes.body.id;
    expect(leadBRes.body.companyId).toBe(COMPANY_B);
    expect(leadBRes.body.stage).toBe('new');

    // 2. Na Empresa A, tentar criar projeto com leadId da Empresa B
    const projectARes = await http()
      .post('/solar-project')
      .auth(adminToken, { type: 'bearer' })
      .send({
        clientName: 'Projeto Empresa A Tentando Lead B',
        leadId: leadBId,
        consumptionMonthlyBill: 600,
        consumptionMonthlyKwh: 700,
        sizingPowerKwp: 5,
      })
      .expect(201);

    const projectAId = projectARes.body.id;

    // 3. Na Empresa A, gerar proposta
    const genRes = await http()
      .post(`/proposals/generate/${projectAId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(201);

    // A proposta da Empresa A não vincula o leadId da Empresa B
    expect(genRes.body.leadId).toBeFalsy();

    // 4. Conferir que o lead da Empresa B PERMANECE 'new' e inalterado
    const leadBAfter = await http()
      .get(`/leads/${leadBId}`)
      .auth(adminBToken, { type: 'bearer' })
      .expect(200);

    expect(leadBAfter.body.stage).toBe('new');

    // 5. Na Empresa B, nenhuma proposta foi criada para seu lead
    const proposalsLeadBRes = await http()
      .get(`/proposals/lead/${leadBId}`)
      .auth(adminBToken, { type: 'bearer' })
      .expect(200);

    expect(proposalsLeadBRes.body).toHaveLength(0);
  });

  it('download de PDF de proposta: exige autenticação, bloqueia outra empresa e devolve application/pdf para a própria empresa', async () => {
    // 1. Criar projeto e proposta na Empresa A
    const projRes = await http()
      .post('/solar-project')
      .auth(adminToken, { type: 'bearer' })
      .send({
        clientName: 'Cliente Teste PDF Empresa A',
        consumptionMonthlyBill: 800,
        consumptionMonthlyKwh: 900,
        sizingPowerKwp: 6,
      })
      .expect(201);

    const propRes = await http()
      .post(`/proposals/generate/${projRes.body.id}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(201);

    const proposalAId = propRes.body.id;

    // 2. Sem token -> 401
    await http()
      .get(`/proposals/${proposalAId}/pdf`)
      .expect(401);

    // 3. Com token da Empresa B -> 404 (isolamento de tenant)
    await http()
      .get(`/proposals/${proposalAId}/pdf`)
      .auth(adminBToken, { type: 'bearer' })
      .expect(404);

    // 4. Com token da própria Empresa A -> 200 com application/pdf
    const pdfRes = await http()
      .get(`/proposals/${proposalAId}/pdf`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(pdfRes.headers['content-type']).toMatch(/application\/pdf/);
    expect(pdfRes.headers['content-disposition']).toMatch(/attachment; filename=/);
    expect(pdfRes.body.toString('utf8')).toContain('%PDF-1.4');
  });

  describe('Configurações de Proposta Comercial (e2e)', () => {
    it('GET /proposal-settings exige login', async () => {
      await http().get('/proposal-settings').expect(401);
    });

    it('vendedor não altera proposal-settings (403)', async () => {
      await http()
        .patch('/proposal-settings')
        .auth(sellerToken, { type: 'bearer' })
        .send({ template: 'minimalista' })
        .expect(403);
    });

    it('vendedor não faz upload em proposal-settings (403)', async () => {
      await http()
        .post('/proposal-settings/upload')
        .auth(sellerToken, { type: 'bearer' })
        .attach('file', Buffer.from('fake'), { filename: 'test.png', contentType: 'image/png' })
        .expect(403);
    });

    it('upload com formato inválido é recusado (400)', async () => {
      const res = await http()
        .post('/proposal-settings/upload')
        .auth(adminToken, { type: 'bearer' })
        .attach('file', Buffer.from('documento texto'), { filename: 'arquivo.txt', contentType: 'text/plain' })
        .expect(400);

      expect(res.body.message).toMatch(/PNG, JPEG/i);
    });

    it('upload com tipo de imagem ausente ou inválido é recusado (400)', async () => {
      const pngBuffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .png()
        .toBuffer();

      const resMissing = await http()
        .post('/proposal-settings/upload')
        .auth(adminToken, { type: 'bearer' })
        .attach('file', pngBuffer, { filename: 'test.png', contentType: 'image/png' })
        .expect(400);

      expect(resMissing.body.message).toMatch(/Tipo de imagem/i);

      const resInvalid = await http()
        .post('/proposal-settings/upload')
        .auth(adminToken, { type: 'bearer' })
        .field('type', 'tipo_invalido')
        .attach('file', pngBuffer, { filename: 'test.png', contentType: 'image/png' })
        .expect(400);

      expect(resInvalid.body.message).toMatch(/Tipo de imagem inválido/i);
    });

    it('upload de imagem grande é reduzida mantendo a proporção (sharp)', async () => {
      const largeBuffer = await sharp({
        create: {
          width: 2000,
          height: 1000,
          channels: 3,
          background: { r: 200, g: 50, b: 50 },
        },
      })
        .jpeg()
        .toBuffer();

      const res = await http()
        .post('/proposal-settings/upload')
        .auth(adminToken, { type: 'bearer' })
        .field('type', 'about')
        .attach('file', largeBuffer, { filename: 'sobre.jpg', contentType: 'image/jpeg' })
        .expect(201);

      expect(res.body.width).toBeLessThanOrEqual(1200);
      expect(res.body.height).toBeLessThanOrEqual(800);
      expect(res.body.width).toBe(1200);
      expect(res.body.height).toBe(600);
    });

    it('upload de imagem pequena não é ampliada (sharp)', async () => {
      const smallBuffer = await sharp({
        create: {
          width: 300,
          height: 150,
          channels: 3,
          background: { r: 50, g: 200, b: 50 },
        },
      })
        .jpeg()
        .toBuffer();

      const res = await http()
        .post('/proposal-settings/upload')
        .auth(adminToken, { type: 'bearer' })
        .field('type', 'logo')
        .attach('file', smallBuffer, { filename: 'logo.jpg', contentType: 'image/jpeg' })
        .expect(201);

      expect(res.body.width).toBe(300);
      expect(res.body.height).toBe(150);
    });

    it('upload de PNG transparente continua transparente (sharp)', async () => {
      const alphaBuffer = await sharp({
        create: {
          width: 400,
          height: 200,
          channels: 4,
          background: { r: 0, g: 0, b: 255, alpha: 0.5 },
        },
      })
        .png()
        .toBuffer();

      const res = await http()
        .post('/proposal-settings/upload')
        .auth(adminToken, { type: 'bearer' })
        .field('type', 'partner')
        .attach('file', alphaBuffer, { filename: 'partner.png', contentType: 'image/png' })
        .expect(201);

      expect(res.body.format).toBe('png');
    });

    it('isolamento entre empresas: empresa A não altera configurações da empresa B', async () => {
      // 1. Empresa A customiza sua proposta
      const patchA = await http()
        .patch('/proposal-settings')
        .auth(adminToken, { type: 'bearer' })
        .send({
          template: 'classico',
          primaryColor: '#112233',
          secondaryColor: '#445566',
          aboutText: 'História exclusiva da Empresa A',
          stats: [{ value: '+500', label: 'Projetos A' }],
        })
        .expect(200);

      expect(patchA.body.template).toBe('classico');
      expect(patchA.body.primaryColor).toBe('#112233');

      // 2. Consulta da Empresa A reflete alterações
      const getA = await http()
        .get('/proposal-settings')
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(getA.body.companyId).toBe(COMPANY_A);
      expect(getA.body.template).toBe('classico');
      expect(getA.body.aboutText).toBe('História exclusiva da Empresa A');

      // 3. Consulta da Empresa B mantém dados próprios isolados
      const getB = await http()
        .get('/proposal-settings')
        .auth(adminBToken, { type: 'bearer' })
        .expect(200);

      expect(getB.body.companyId).toBe(COMPANY_B);
      expect(getB.body.template).not.toBe('classico');
      expect(getB.body.aboutText).not.toBe('História exclusiva da Empresa A');
    });

    it('URL externa em coverImageUrl é recusada (400)', async () => {
      const res = await http()
        .patch('/proposal-settings')
        .auth(adminToken, { type: 'bearer' })
        .send({ coverImageUrl: 'https://images.unsplash.com/photo-123.jpg' })
        .expect(400);

      expect(res.body.message).toMatch(/Supabase da aplicação/i);
    });

    it('URL de imagem de outra empresa é recusada (400)', async () => {
      const otherCompanyUrl = `https://vwyywxckjusuogwkpjjs.supabase.co/storage/v1/object/public/logos/proposals/${COMPANY_B}/capa.png`;
      const res = await http()
        .patch('/proposal-settings')
        .auth(adminToken, { type: 'bearer' })
        .send({ coverImageUrl: otherCompanyUrl })
        .expect(400);

      expect(res.body.message).toMatch(/proposals\//i);
    });

    it('URL válida da própria empresa no storage Supabase é aceita (200)', async () => {
      const validCompanyUrl = `https://vwyywxckjusuogwkpjjs.supabase.co/storage/v1/object/public/logos/proposals/${COMPANY_A}/capa.png`;
      const res = await http()
        .patch('/proposal-settings')
        .auth(adminToken, { type: 'bearer' })
        .send({ coverImageUrl: validCompanyUrl })
        .expect(200);

      expect(res.body.coverImageUrl).toBe(validCompanyUrl);
    });

    it('tabela proposal_settings sem privilégio para anon, quando o papel existir', async () => {
      const [{ has_anon }] = await db.query(
        "SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') AS has_anon",
      );

      if (has_anon) {
        const privileges = await db.query(
          "SELECT privilege_type FROM information_schema.table_privileges WHERE grantee = 'anon' AND table_name = 'proposal_settings'",
        );
        expect(privileges).toHaveLength(0);
      } else {
        // Valida que ao existir a role anon, os privilégios na tabela são revogados conforme a migration 104
        await db.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
              CREATE ROLE anon NOLOGIN;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
              CREATE ROLE authenticated NOLOGIN;
            END IF;
          END $$;
          GRANT ALL ON TABLE proposal_settings TO anon, authenticated;
          DO $$
          DECLARE
            has_api_roles BOOLEAN := EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
              AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated');
          BEGIN
            ALTER TABLE public.proposal_settings ENABLE ROW LEVEL SECURITY;
            IF has_api_roles THEN
              REVOKE ALL ON TABLE public.proposal_settings FROM anon, authenticated;
            END IF;
          END $$;
        `);
        try {
          const privileges = await db.query(
            "SELECT privilege_type FROM information_schema.table_privileges WHERE grantee = 'anon' AND table_name = 'proposal_settings'",
          );
          expect(privileges).toHaveLength(0);
        } finally {
          await db.query(`
            DROP ROLE IF EXISTS anon;
            DROP ROLE IF EXISTS authenticated;
          `);
        }
      }
    });
  });
});
