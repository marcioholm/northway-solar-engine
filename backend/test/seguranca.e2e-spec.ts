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
    await app.close();
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
});
