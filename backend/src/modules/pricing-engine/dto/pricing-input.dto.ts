import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PricingInputDto {
  @ApiProperty({
    description: 'Custo dos equipamentos (da cotação selecionada)',
  })
  @IsNumber()
  @Min(0)
  equipmentCost!: number;

  @ApiProperty({ description: 'Projeto' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costProject: number = 0;

  @ApiProperty({ description: 'ART' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costArt: number = 0;

  @ApiProperty({ description: 'Instalação' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costInstallation: number = 0;

  @ApiProperty({ description: 'Hotel' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costHotel: number = 0;

  @ApiProperty({ description: 'Frete' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costFreight: number = 0;

  @ApiProperty({ description: 'Alimentação' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costFood: number = 0;

  @ApiProperty({ description: 'Deslocamento' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costTravel: number = 0;

  @ApiProperty({ description: 'Pedágio' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costToll: number = 0;

  @ApiProperty({ description: 'Comissão' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costCommission: number = 0;

  @ApiProperty({ description: 'Guindaste' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costCrane: number = 0;

  @ApiProperty({ description: 'Terceiros' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costThirdParties: number = 0;

  @ApiProperty({ description: 'Custos Administrativos' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costAdmin: number = 0;

  @ApiProperty({ description: 'Impostos' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costTaxes: number = 0;

  @ApiProperty({ description: 'Outros' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costOther: number = 0;

  @ApiProperty({ description: 'Margem desejada (%)' })
  @IsNumber()
  @Min(0)
  marginPct!: number;

  @ApiProperty({ description: 'Margem mínima aceitável (%)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minMarginPct: number = 15;

  @ApiProperty({ description: 'Margem recomendada (%)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  recommendedMarginPct: number = 25;
}
