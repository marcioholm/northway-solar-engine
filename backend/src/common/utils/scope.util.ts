import { UserRole } from '../../modules/users/entities/user.entity';

export interface UserScope {
  companyId: string;
  ownerUserId?: string;
  role: UserRole | string;
  userId: string;
}

/**
 * Retorna o escopo de visualização e mutação de acordo com o perfil do usuário.
 * - Seller (vendedor): recebe ownerUserId = user.userId (enxerga e altera somente os seus recursos).
 * - Manager (gestor): recebe ownerUserId = undefined (enxerga tudo da empresa, mas sem configs/equipe).
 * - Admin / Superadmin: recebe ownerUserId = undefined (acesso amplo à empresa).
 */
export function scopeFor(user: {
  userId: string;
  companyId: string;
  role: UserRole | string;
}): UserScope {
  const isSeller = user?.role === UserRole.SELLER;
  return {
    companyId: user?.companyId,
    ownerUserId: isSeller ? user?.userId : undefined,
    role: user?.role,
    userId: user?.userId,
  };
}
