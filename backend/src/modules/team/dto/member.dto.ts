import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Perfil inválido' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class ReassignMemberDto {
  @IsUUID('4', { message: 'ID do usuário de destino inválido' })
  toUserId: string;
}
