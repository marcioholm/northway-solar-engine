import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { IrradiationService } from './irradiation.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('irradiation')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('irradiation')
export class IrradiationController {
    constructor(private readonly irradiationService: IrradiationService) { }

    @Get(':location')
    findOne(@Param('location') location: string) {
        return this.irradiationService.getIrradiation(location);
    }
}
