export class CreateCompanyDto {
    name: string;
    baseCity: string;
    costPerKm: number;
    defaultMargin: number;
    lossFactor: number;
    logoUrl?: string;
    cardTax?: number;
    financeTax?: number;
    cashDiscount?: number;
}
