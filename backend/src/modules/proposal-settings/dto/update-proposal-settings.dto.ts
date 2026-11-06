import {
  IsArray,
  IsIn,
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
    message: 'template deve ser classico, moderno ou minimalista',
  })
  template?: 'classico' | 'moderno' | 'minimalista';

  @IsOptional()
  @Matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
    message: 'primaryColor deve ser uma cor hexadecimal válida (ex: #FFB703)',
  })
  primaryColor?: string;

  @IsOptional()
  @Matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
    message: 'secondaryColor deve ser uma cor hexadecimal válida (ex: #0F172A)',
  })
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  coverImageUrl?: string;

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
  @ArrayMaxSize(12, { message: 'partnerLogos pode conter no máximo 12 logos' })
  @IsString({ each: true })
  partnerLogos?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12, { message: 'brandLogos pode conter no máximo 12 logos' })
  @IsString({ each: true })
  brandLogos?: string[];

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
  @Type(() => ProposalContactDto)
  contact?: ProposalContactDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProposalSectionsEnabledDto)
  sectionsEnabled?: ProposalSectionsEnabledDto;
}
