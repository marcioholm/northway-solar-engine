import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class CreateInviteDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsEnum(UserRole, { message: 'Perfil inválido' })
  role: UserRole;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class AcceptInviteDto {
  @IsNotEmpty({ message: 'Token é obrigatório' })
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  password: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Token é obrigatório' })
  @IsString()
  token: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  password: string;
}
