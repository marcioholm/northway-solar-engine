import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProposalStatItemDto {
  @IsString()
  @MaxLength(50)
  value: string;

  @IsString()
  @MaxLength(100)
  label: string;
}

export class ProposalHighlightDto {
  @IsString()
  @IsIn(['team', 'support', 'gauge', 'helmet'], {
    message: 'icon deve ser team, support, gauge ou helmet',
  })
  icon: 'team' | 'support' | 'gauge' | 'helmet';

  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(300)
  text: string;
}

export class ServiceAreaCityDto {
  @IsString()
  ibge: string;

  @IsString()
  name: string;

  @IsString()
  @MaxLength(2)
  uf: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lon: number;
}

export class ProposalServiceAreaDto {
  @IsOptional()
  @IsIn(['brasil', 'zoom', 'estados'], {
    message: 'style deve ser brasil, zoom ou estados',
  })
  style?: 'brasil' | 'zoom' | 'estados';

  @IsArray()
  @IsString({ each: true })
  states: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceAreaCityDto)
  cities: ServiceAreaCityDto[];
}

export class ProposalQrSettingsDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  @IsIn(['proposal', 'consultant', 'whatsapp', 'site', 'instagram', 'custom'], {
    message: 'tipo de QR code inválido',
  })
  type: 'proposal' | 'consultant' | 'whatsapp' | 'site' | 'instagram' | 'custom';

  @IsOptional()
  @IsString()
  @MaxLength(300)
  value?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  label?: string;
}

export class ProposalContactDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  instagram?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  whatsapp?: string;
}

export class ProposalSectionsEnabledDto {
  @IsOptional() cover?: boolean;
  @IsOptional() about?: boolean;
  @IsOptional() stats?: boolean;
  @IsOptional() technical?: boolean;
  @IsOptional() equipment?: boolean;
  @IsOptional() financial?: boolean;
  @IsOptional() kit?: boolean;
  @IsOptional() warranties?: boolean;
  @IsOptional() partners?: boolean;
  @IsOptional() contact?: boolean;
}

export class UpdateProposalSettingsDto {
  @IsOptional()
  @IsIn(['classico', 'moderno', 'minimalista'], {
    message: 'template deve ser moderno',
  })
  template?: 'classico' | 'moderno' | 'minimalista';

  @IsOptional()
  @Matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
    message: 'primaryColor deve ser uma cor hexadecimal válida (ex: #1F2937)',
  })
  primaryColor?: string;

  @IsOptional()
  @Matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
    message: 'secondaryColor deve ser uma cor hexadecimal válida (ex: #F59E0B)',
  })
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  coverImageUrl?: string;

  @IsOptional()
  @IsIn(['top', 'center', 'bottom'], {
    message: 'coverFocus deve ser top, center ou bottom',
  })
  coverFocus?: 'top' | 'center' | 'bottom';

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  aboutText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  aboutImageUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4, { message: 'stats pode conter no máximo 4 itens' })
  @ValidateNested({ each: true })
  @Type(() => ProposalStatItemDto)
  stats?: ProposalStatItemDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4, { message: 'highlights pode conter no máximo 4 itens' })
  @ValidateNested({ each: true })
  @Type(() => ProposalHighlightDto)
  highlights?: ProposalHighlightDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12, { message: 'partnerLogos pode conter no máximo 12 logos' })
  @IsString({ each: true })
  partnerLogos?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12, { message: 'brandLogos pode conter no máximo 12 logos' })
  @IsString({ each: true })
  brandLogos?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProposalServiceAreaDto)
  serviceArea?: ProposalServiceAreaDto;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  serviceAreaText?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30, { message: 'includedItems pode conter no máximo 30 itens' })
  @IsString({ each: true })
  includedItems?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  kitImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  servicesText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  warrantiesText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  exclusionsText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notesText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  acceptanceText?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProposalQrSettingsDto)
  qr?: ProposalQrSettingsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProposalContactDto)
  contact?: ProposalContactDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProposalSectionsEnabledDto)
  sectionsEnabled?: ProposalSectionsEnabledDto;
}
