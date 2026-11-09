import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum UserRole {
  /** Operador da plataforma NorthWay: acessa todas as empresas. */
  SUPERADMIN = 'superadmin',
  /** Administrador de uma única empresa. */
  ADMIN = 'admin',
  /** Gestor comercial de uma empresa: vê tudo da empresa, mas sem acesso a configs/equipe. */
  MANAGER = 'manager',
  /** Vendedor: vê apenas os seus próprios leads, projetos e propostas. */
  SELLER = 'seller',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.SELLER })
  role: UserRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ name: 'last_login_at', type: 'timestamp with time zone', nullable: true })
  lastLoginAt: Date | null;

  @Column({ name: 'deactivated_at', type: 'timestamp with time zone', nullable: true })
  deactivatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
