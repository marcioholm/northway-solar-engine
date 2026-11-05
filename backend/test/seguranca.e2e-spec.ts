import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

const COMPANY_A = '11111111-1111-4111-8111-111111111111';
const COMPANY_B = '22222222-2222-4222-8222-222222222222';
const PROPOSAL_ID = '33333333-3333-4333-8333-333333333333';
const PUBLIC_TOKEN = 'token-publico-de-teste';
const PASSWORD = 'senha-de-teste';

describe('Isolamento e rotas públicas (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let sellerToken: string;
  let superadminToken: string;

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

    const db = app.get(DataSource);
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
       ($1, 'Plataforma', 'root@a.test', $2, 'superadmin')`,
      [COMPANY_A, hash],
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
      pricingCommission: 1000,
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
      pricingCommissionPct: 5.0,
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
    expect(getRes.body.pricingCommission).toBe(1000);
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
    expect(getRes.body.pricingCommissionPct).toBe(5.0);
    expect(getRes.body.sizingObservations).toBe('Telhado sem sombreamento');

    const genRes = await http()
      .post(`/proposals/generate/${projectId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(201);

    const proposal = genRes.body;
    const pricingOutput = proposal.settings?.pricingOutput;

    expect(pricingOutput).toBeDefined();
    // 1500 + 400 + 4000 + 500 + 600 + 350 + 800 + 120 + 1000 + 700 + 450 + 300 + 1200 + 280 = 12200
    expect(pricingOutput.operationalCostTotal).toBe(12200);
    // 20000 + 12200 = 32200
    expect(pricingOutput.totalCost).toBe(32200);
    // 32200 * 1.25 = 40250
    expect(proposal.finalPrice).toBe(40250);
    expect(pricingOutput.finalPrice).toBe(40250);
    expect(pricingOutput.appliedMarginPct).toBe(25);
  });
});
