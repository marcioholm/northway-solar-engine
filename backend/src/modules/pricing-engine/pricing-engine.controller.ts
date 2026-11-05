import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PricingEngineService } from './pricing-engine.service';
import { PricingInputDto } from './dto/pricing-input.dto';
import { PricingResultDto } from './dto/pricing-result.dto';

@ApiTags('Pricing Engine')
@UseGuards(AuthGuard('jwt'))
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
