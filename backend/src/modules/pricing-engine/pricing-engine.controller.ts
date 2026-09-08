import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PricingEngineService } from './pricing-engine.service';
import { PricingInputDto } from './dto/pricing-input.dto';
import { PricingResultDto } from './dto/pricing-result.dto';

@ApiTags('Pricing Engine')
@Controller('pricing-engine')
export class PricingEngineController {
  constructor(private readonly service: PricingEngineService) {}

  @Post('calculate')
  @ApiOperation({
    summary: 'Calcular preço de venda a partir de custos e margem',
  })
  calculate(@Body() input: PricingInputDto): PricingResultDto {
    return this.service.calculate(input);
  }
}
