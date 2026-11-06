import {
  calculateOptionPayment,
  calculateProportionalGeneration,
} from './payment-calculator';

describe('Payment & Proportional Generation Calculations', () => {
  describe('calculateOptionPayment', () => {
    const finalPrice = 30000;

    it('calcula desconto à vista corretamente quando configurado', () => {
      const res = calculateOptionPayment(finalPrice, {
        cashDiscountPct: 5,
      });
      expect(res.cashDiscountPct).toBe(5);
      expect(res.cashPrice).toBe(28500); // 30000 * 0.95
    });

    it('não inclui desconto à vista se não configurado ou zero', () => {
      const res = calculateOptionPayment(finalPrice, {
        cashDiscountPct: 0,
      });
      expect(res.cashDiscountPct).toBeUndefined();
      expect(res.cashPrice).toBeUndefined();
    });

    it('calcula cartão com parcelas e acréscimo total', () => {
      // Preço: 30000, 12x com 15% de acréscimo total
      // Total = 30000 * 1.15 = 34500
      // Parcela = 34500 / 12 = 2875
      const res = calculateOptionPayment(finalPrice, {
        card: { installments: 12, totalMarkupPct: 15 },
      });
      expect(res.cardInstallments).toBe(12);
      expect(res.cardTotalPrice).toBe(34500);
      expect(res.cardInstallment).toBe(2875);
    });

    it('calcula financiamento para lista de prazos {n, totalMarkupPct}', () => {
      // 24x com 18% -> 30000 * 1.18 = 35400 / 24 = 1475
      // 60x com 48% -> 30000 * 1.48 = 44400 / 60 = 740
      const res = calculateOptionPayment(finalPrice, {
        finance: [
          { n: 24, totalMarkupPct: 18 },
          { n: 60, totalMarkupPct: 48 },
        ],
      });
      expect(res.financeOptions).toBeDefined();
      expect(res.financeOptions).toHaveLength(2);
      expect(res.financeOptions![0]).toEqual({
        n: 24,
        totalPrice: 35400,
        installment: 1475,
      });
      expect(res.financeOptions![1]).toEqual({
        n: 60,
        totalPrice: 44400,
        installment: 740,
      });
    });

    it('calcula parcelamento próprio com entrada e boletos', () => {
      // Entrada = 30% de 30000 = 9000
      // Restante = 21000
      // 6 boletos = 21000 / 6 = 3500
      const res = calculateOptionPayment(finalPrice, {
        own: { downPaymentPct: 30, installments: 6 },
      });
      expect(res.ownPlan).toEqual({
        downPct: 30,
        downValue: 9000,
        n: 6,
        installment: 3500,
      });
    });

    it('omite formas de pagamento não configuradas', () => {
      const res = calculateOptionPayment(finalPrice, {});
      expect(res.cashPrice).toBeUndefined();
      expect(res.cardInstallment).toBeUndefined();
      expect(res.financeOptions).toBeUndefined();
      expect(res.ownPlan).toBeUndefined();
    });
  });

  describe('calculateProportionalGeneration', () => {
    it('calcula geração proporcional quando dimensionamento existe', () => {
      // Opção 1 do projeto: 5 kWp gera 650 kWh/mês (fator = 130 kWh/mês por kWp)
      // Nova opção com 7.5 kWp -> 7.5 * 130 = 975 kWh/mês
      const gen = calculateProportionalGeneration(7.5, 5, 650);
      expect(gen).toBe(975);
    });

    it('retorna null se projeto não tem dimensionamento (sem número inventado)', () => {
      expect(calculateProportionalGeneration(7.5, 0, 0)).toBeNull();
      expect(calculateProportionalGeneration(7.5, undefined, undefined)).toBeNull();
      expect(calculateProportionalGeneration(7.5, null, null)).toBeNull();
    });

    it('retorna null se potência do kit for inválida ou zero', () => {
      expect(calculateProportionalGeneration(0, 5, 650)).toBeNull();
    });
  });
});
