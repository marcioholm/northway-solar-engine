import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { SelectedFutureLoadDto } from '../../proposals/dto/proposal-option.dto';

export class PreviewPdfDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'O consumo mensal deve ser um número válido' })
  @Min(100, { message: 'Consumo mínimo para prévia é 100 kWh/mês' })
  @Max(20000, { message: 'Consumo máximo para prévia é 20.000 kWh/mês' })
  consumptionKwh?: number;

  @IsOptional()
  @IsArray({ message: 'Cargas futuras devem ser uma lista' })
  @ValidateNested({ each: true })
  @Type(() => SelectedFutureLoadDto)
  futureLoads?: SelectedFutureLoadDto[];
}
