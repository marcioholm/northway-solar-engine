export class CreateSolarProjectDto {
    leadId?: string;
    client?: {
        name?: string;
        document?: string;
        phone?: string;
        email?: string;
        city?: string;
        state?: string;
        zipcode?: string;
        utility?: string;
        consumerClass?: string;
        tariffGroup?: string;
        modality?: string;
        [key: string]: any;
    };
    consumption?: {
        monthlyConsumption?: number;
        monthlyBill?: number;
        tariff?: number;
        utility?: string;
        availabilityCost?: number;
        flag?: string;
        [key: string]: any;
    };
    site?: {
        zipcode?: string;
        latitude?: number;
        longitude?: number;
        inclination?: number;
        azimuth?: number;
        roofType?: string;
        [key: string]: any;
    };
}
