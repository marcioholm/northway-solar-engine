import { CreateSolarProjectDto } from './create-solar-project.dto';

export class UpdateSolarProjectDto {
    status?: string;
    client?: Record<string, any>;
    consumption?: Record<string, any>;
    site?: Record<string, any>;
    sizing?: Record<string, any>;
    equipment?: Record<string, any>;
    pricing?: Record<string, any>;
    payment?: Record<string, any>;
}
