import {
  calculateFutureLoadKwh,
  calculateScenarios,
  calculateTotalFutureLoadsKwh,
  formatLoadsFootnote,
  formatLoadsSummary,
  normalizeSizingRules,
  SelectedFutureLoad,
} from './scenario-calculator';

describe('ScenarioCalculator', () => {
  describe('Cálculo de cargas futuras', () => {
    it('deve calcular corretamente carga baseada em potência kW × horas/dia × dias × quantidade', () => {
      const load: SelectedFutureLoad = {
        id: 'ac_inv_12000',
        name: 'Ar-condicionado inverter 12.000 BTU',
        powerKw: 0.65,
        hoursPerDay: 8,
        daysPerMonth: 30,
        quantity: 1,
      };
      // 0.65 * 8 * 30 * 1 = 156 kWh/mês
      expect(calculateFutureLoadKwh(load)).toBe(156);

      const load2: SelectedFutureLoad = {
        id: 'ac_inv_12000',
        name: 'Ar-condicionado inverter 12.000 BTU',
        powerKw: 0.65,
        hoursPerDay: 8,
        daysPerMonth: 30,
        quantity: 2,
      };
      // 0.65 * 8 * 30 * 2 = 312 kWh/mês
      expect(calculateFutureLoadKwh(load2)).toBe(312);
    });

    it('deve calcular corretamente carga de valor fixo mensal (ex: Carro elétrico)', () => {
      const load: SelectedFutureLoad = {
        id: 'carro_eletrico',
        name: 'Carro elétrico',
        fixedKwh: 180,
        quantity: 1,
      };
      expect(calculateFutureLoadKwh(load)).toBe(180);

      const load2: SelectedFutureLoad = {
        id: 'carro_eletrico',
        name: 'Carro elétrico',
        fixedKwh: 180,
        quantity: 2,
      };
      expect(calculateFutureLoadKwh(load2)).toBe(360);
    });

    it('deve somar corretamente múltiplas cargas selecionadas', () => {
      const loads: SelectedFutureLoad[] = [
        {
          id: 'ac_inv_12000',
          name: 'Ar-condicionado inverter 12.000 BTU',
          powerKw: 0.65,
          hoursPerDay: 8,
          daysPerMonth: 30,
          quantity: 1, // 156 kWh
        },
        {
          id: 'carro_eletrico',
          name: 'Carro elétrico',
          fixedKwh: 180,
          quantity: 1, // 180 kWh
        },
      ];
      // 156 + 180 = 336 kWh/mês
      expect(calculateTotalFutureLoadsKwh(loads)).toBe(336);
    });
  });

  describe('Limites de folgaPct e expansaoPct', () => {
    it('deve respeitar os limites de folgaPct (0 a 30) e expansaoPct (0 a 100)', () => {
      // Valores padrão quando omitidos
      expect(normalizeSizingRules()).toEqual({ folgaPct: 10, expansaoPct: 25 });

      // Limite superior
      expect(normalizeSizingRules({ folgaPct: 50, expansaoPct: 150 })).toEqual({
        folgaPct: 30,
        expansaoPct: 100,
      });

      // Limite inferior
      expect(normalizeSizingRules({ folgaPct: -10, expansaoPct: -5 })).toEqual({
        folgaPct: 0,
        expansaoPct: 0,
      });

      // Valores dentro do intervalo
      expect(normalizeSizingRules({ folgaPct: 15, expansaoPct: 40 })).toEqual({
        folgaPct: 15,
        expansaoPct: 40,
      });
    });
  });

  describe('Dimensionamento dos 3 cenários e metas', () => {
    const baseInput = {
      consumptionMonthlyKwh: 500,
      sizingPowerKwp: 5.0,
      sizingGenerationKwh: 650, // fator = 650 / 5 = 130 kWh/mês por kWp
      modulePowerWatt: 550,
      sizingRules: { folgaPct: 10, expansaoPct: 25 },
    };

    it('deve calcular metas e módulos com Math.ceil para cada cenário', () => {
      const result = calculateScenarios(baseInput);

      expect(result.factor).toBe(130);
      expect(result.scenarios).toHaveLength(3);

      const [essencial, recomendado, expansao] = result.scenarios;

      // 1. Essencial: meta = 500 * 1.00 = 500 kWh/mês
      // kWp = 500 / 130 = 3.846 kWp
      // Módulos = ceil(3.846 * 1000 / 550) = ceil(6.99) = 7 módulos
      // Potência final = 7 * 550 / 1000 = 3.85 kWp
      // Geração = round(3.85 * 130) = 501 kWh/mês
      expect(essencial.targetConsumptionKwh).toBe(500);
      expect(essencial.moduleQty).toBe(7);
      expect(essencial.systemPowerKwp).toBe(3.85);
      expect(essencial.generationMonthlyKwh).toBe(501);
      expect(essencial.recommended).toBe(false);

      // 2. Recomendado: meta = 500 * 1.10 = 550 kWh/mês
      // kWp = 550 / 130 = 4.23 kWp
      // Módulos = ceil(4.23 * 1000 / 550) = ceil(7.69) = 8 módulos
      // Potência final = 8 * 550 / 1000 = 4.40 kWp
      // Geração = round(4.40 * 130) = 572 kWh/mês
      expect(recomendado.targetConsumptionKwh).toBe(550);
      expect(recomendado.moduleQty).toBe(8);
      expect(recomendado.systemPowerKwp).toBe(4.4);
      expect(recomendado.generationMonthlyKwh).toBe(572);
      expect(recomendado.recommended).toBe(true);

      // 3. Expansão sem cargas selecionadas: meta = 500 * 1.25 = 625 kWh/mês
      // kWp = 625 / 130 = 4.807 kWp
      // Módulos = ceil(4.807 * 1000 / 550) = ceil(8.74) = 9 módulos
      // Potência final = 9 * 550 / 1000 = 4.95 kWp
      // Geração = round(4.95 * 130) = 644 kWh/mês
      expect(expansao.targetConsumptionKwh).toBe(625);
      expect(expansao.moduleQty).toBe(9);
      expect(expansao.systemPowerKwp).toBe(4.95);
      expect(expansao.generationMonthlyKwh).toBe(644);
      expect(expansao.recommended).toBe(false);
    });

    it('deve calcular Expansão com cargas futuras selecionadas', () => {
      const futureLoads: SelectedFutureLoad[] = [
        {
          id: 'ac_inv_12000',
          name: 'Ar-condicionado inverter 12.000 BTU',
          powerKw: 0.65,
          hoursPerDay: 8,
          daysPerMonth: 30,
          quantity: 1, // 156 kWh
        },
        {
          id: 'carro_eletrico',
          name: 'Carro elétrico',
          fixedKwh: 180,
          quantity: 1, // 180 kWh
        },
      ]; // Total cargas = 336 kWh

      const result = calculateScenarios({
        ...baseInput,
        futureLoads,
      });

      const expansao = result.scenarios[2];
      // meta = (consumo + kWh cargas) * (1 + folgaPct/100)
      // meta = (500 + 336) * 1.10 = 836 * 1.10 = 919.6 kWh/mês
      // kWp = 919.6 / 130 = 7.073 kWp
      // Módulos = ceil(7.073 * 1000 / 550) = ceil(12.86) = 13 módulos
      // Potência = 13 * 550 / 1000 = 7.15 kWp
      // Geração = round(7.15 * 130) = 930 kWh/mês
      expect(expansao.targetConsumptionKwh).toBe(919.6);
      expect(expansao.moduleQty).toBe(13);
      expect(expansao.systemPowerKwp).toBe(7.15);
      expect(expansao.generationMonthlyKwh).toBe(930);
    });
  });

  describe('Texto de cada cenário com números reais e premissas', () => {
    it('deve gerar texto exato para Essencial, Recomendado e Expansão sem cargas', () => {
      const result = calculateScenarios({
        consumptionMonthlyKwh: 450,
        sizingPowerKwp: 4.5,
        sizingGenerationKwh: 585,
        modulePowerWatt: 550,
        sizingRules: { folgaPct: 10, expansaoPct: 25 },
      });

      expect(result.scenarios[0].scenarioText).toBe(
        'Cobre seu consumo atual de 450 kWh/mês',
      );
      expect(result.scenarios[1].scenarioText).toBe(
        'Inclui 10% de folga para a perda natural dos painéis',
      );
      expect(result.scenarios[2].scenarioText).toBe(
        'Prevê aumento de 25% no consumo',
      );
      expect(result.scenarios[2].footnote).toBeUndefined();
    });

    it('deve gerar texto com resumo de cargas e nota de rodapé quando cargas forem informadas', () => {
      const futureLoads: SelectedFutureLoad[] = [
        {
          id: 'ac_inv_12000',
          name: 'Ar-condicionado inverter 12.000 BTU',
          powerKw: 0.65,
          hoursPerDay: 8,
          daysPerMonth: 30,
          quantity: 1,
        },
        {
          id: 'carro_eletrico',
          name: 'Carro elétrico',
          fixedKwh: 180,
          quantity: 1,
        },
      ];

      const result = calculateScenarios({
        consumptionMonthlyKwh: 450,
        sizingPowerKwp: 4.5,
        sizingGenerationKwh: 585,
        modulePowerWatt: 550,
        sizingRules: { folgaPct: 10, expansaoPct: 25 },
        futureLoads,
      });

      const exp = result.scenarios[2];
      expect(exp.scenarioText).toContain('Prevê +336 kWh/mês');
      expect(exp.scenarioText).toContain(
        'Ar-condicionado inverter 12.000 BTU (1x, 8 h/dia)',
      );
      expect(exp.scenarioText).toContain('Carro elétrico (1x)');
      expect(exp.footnote).toContain('* Cargas futuras consideradas (30 dias/mês):');
      expect(exp.footnote).toContain('156 kWh/mês');
      expect(exp.footnote).toContain('180 kWh/mês');
    });
  });

  describe('Avisos no dimensionamento', () => {
    it('deve sempre incluir aviso do padrão de entrada com o maior kWp', () => {
      const result = calculateScenarios({
        consumptionMonthlyKwh: 300,
        sizingPowerKwp: 3.0,
        sizingGenerationKwh: 390,
        modulePowerWatt: 550,
      });

      expect(result.warnings.some((w) => w.includes('Confirme se o padrão de entrada comporta'))).toBe(true);
    });

    it('deve incluir aviso da Lei 14.300 quando geração de algum cenário passar de 130% do consumo atual', () => {
      // Consumo = 100 kWh, mas expansão com cargas vai gerar muito mais que 130 kWh
      const result = calculateScenarios({
        consumptionMonthlyKwh: 100,
        sizingPowerKwp: 1.0,
        sizingGenerationKwh: 130,
        modulePowerWatt: 550,
        futureLoads: [
          {
            id: 'carro_eletrico',
            name: 'Carro elétrico',
            fixedKwh: 180,
            quantity: 1,
          },
        ],
      });

      expect(
        result.warnings.some((w) =>
          w.includes('Créditos excedentes vencem em 60 meses (Lei 14.300, art. 13)'),
        ),
      ).toBe(true);
    });
  });
});
