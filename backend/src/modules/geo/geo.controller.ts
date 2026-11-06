import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GeoService, CityData } from './geo.service';

@ApiTags('geo')
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('cities')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Pesquisar cidades brasileiras por nome/UF' })
  @ApiQuery({ name: 'q', required: true, description: 'Termo de busca (mínimo 2 letras)' })
  @ApiQuery({ name: 'uf', required: false, description: 'Sigla da UF para filtrar' })
  searchCities(
    @Query('q') query: string,
    @Query('uf') uf?: string,
  ): CityData[] {
    return this.geoService.searchCities(query, uf);
  }
}

