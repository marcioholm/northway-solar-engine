export class CreateCatalogProductDto {
    category: 'module' | 'inverter' | 'structure' | 'cable' | 'connector' | 'protection' | 'service';
    brand: string;
    line?: string;
    model: string;
    sku?: string;
    purchasePrice: number;
    suggestedPrice?: number;
    unit?: string;
    active?: boolean;
    specs?: Record<string, any>;
    compatibility?: Record<string, any>;
    tags?: string[];
    supplierId?: string;
}
