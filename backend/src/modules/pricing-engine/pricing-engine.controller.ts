import {
  Controller,
  Post,
  Body,
  UseGuards,
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PricingEngineService } from './pricing-engine.service';
import { PricingInputDto } from './dto/pricing-input.dto';
import { PricingResultDto } from './dto/pricing-result.dto';

const ALLOWED_PRICING_FIELDS = new Set([
  'equipmentCost',
  'costProject',
  'costArt',
  'costInstallation',
  'costHotel',
  'costFreight',
  'costFood',
  'costTravel',
  'costToll',
  'costCommission',
  'costCrane',
  'costThirdParties',
  'costAdmin',
  'costTaxes',
  'costOther',
  'marginPct',
  'minMarginPct',
  'recommendedMarginPct',
  'commissionPct',
]);

@Injectable()
export class ForbidUnknownPricingFieldsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const body = req.body;
    if (body && typeof body === 'object') {
      const unknownFields = Object.keys(body).filter(key => !ALLOWED_PRICING_FIELDS.has(key));
      if (unknownFields.length > 0) {
        throw new BadRequestException(
          unknownFields.map(field => `property ${field} should not exist`),
        );
      }
    }
    return true;
  }
}

@ApiTags('Pricing Engine')
@UseGuards(AuthGuard('jwt'))
@Controller('pricing-engine')
export class PricingEngineController {
  constructor(private readonly service: PricingEngineService) {}

  @Post('calculate')
  @UseGuards(ForbidUnknownPricingFieldsGuard)
  @ApiOperation({
    summary: 'Calcular preço de venda a partir de custos e margem',
  })
  calculate(@Body() input: PricingInputDto): PricingResultDto {
    return this.service.calculate(input);
  }
}
