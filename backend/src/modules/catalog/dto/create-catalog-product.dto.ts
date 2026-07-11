export class CreateCatalogProductDto {
    category: 'module' | 'inverter' | 'structure' | 'cable' | 'connector' | 'protection' | 'service' | 'material';
    brand: string;
    line?: string;
    model: string;
    sku?: string;
    purchasePrice: number;
    suggestedPrice?: number;
    unit?: string;
    active?: boolean;
    manufacturerId?: string;
    stockQuantity?: number;
    minStock?: number;
    warrantyYears?: number;
    specs?: Record<string, any>;
    compatibility?: Record<string, any>;
    tags?: string[];
    supplierId?: string;
}
