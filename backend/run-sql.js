const { Client } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const sql = `
  INSERT INTO "follow_up_rules" ("company_id", "trigger", "message", "delay_minutes", "is_active")
  SELECT "id", 'hot_lead', '🔥 {nome_cliente} acabou de revisar o preço da proposta. Bom momento pra ligar!', 0, true
  FROM "companies"
  ON CONFLICT DO NOTHING;

  INSERT INTO "follow_up_rules" ("company_id", "trigger", "message", "delay_minutes", "is_active")
  SELECT "id", 'very_interested', '👀 {nome_cliente} já abriu a proposta várias vezes. Tá comparando — liga antes que feche com outro.', 0, true
  FROM "companies"
  ON CONFLICT DO NOTHING;

  INSERT INTO "follow_up_rules" ("company_id", "trigger", "message", "delay_minutes", "is_active")
  SELECT "id", 'going_cold', '⏰ {nome_cliente} não abriu a proposta há dias. Hora de um follow-up.', 14400, true
  FROM "companies"
  ON CONFLICT DO NOTHING;

  INSERT INTO "follow_up_rules" ("company_id", "trigger", "message", "delay_minutes", "is_active")
  SELECT "id", 'opened_no_action', '📋 {nome_cliente} abriu a proposta rapidamente. Pode ter dúvidas.', 30, true
  FROM "companies"
  ON CONFLICT DO NOTHING;

  INSERT INTO "follow_up_rules" ("company_id", "trigger", "message", "delay_minutes", "is_active")
  SELECT "id", 'expiring_soon_seller', '⚠️ A proposta do {nome_cliente} vence em 3 dias. Se ele não respondeu, é hora de fazer contato.', 0, true
  FROM "companies"
  ON CONFLICT DO NOTHING;

  INSERT INTO "follow_up_rules" ("company_id", "trigger", "message", "delay_minutes", "is_active")
  SELECT "id", 'expired_seller', '❌ A proposta do {nome_cliente} venceu. Quer gerar uma proposta atualizada?', 0, true
  FROM "companies"
  ON CONFLICT DO NOTHING;
  `;
  try {
    await client.query(sql);
    console.log("Migration executed successfully!");
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await client.end();
  }
}
run();
