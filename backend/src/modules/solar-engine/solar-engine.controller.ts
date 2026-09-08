import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SolarEngineService } from './solar-engine.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('solar-engine')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('solar-engine')
export class SolarEngineController {
  constructor(private readonly solarEngineService: SolarEngineService) {}

  @Post('calculate')
  calculate(
    @Request() req,
    @Body()
    body: {
      consumption: number;
      city: string;
      moduleId?: string;
      inverterId?: string;
      moduleQty?: number;
    },
  ) {
    return this.solarEngineService.calculate(
      req.user.companyId,
      body.consumption,
      body.city,
      body.moduleId,
      body.inverterId,
      body.moduleQty,
    );
  }
}
