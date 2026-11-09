import { scopeFor } from './scope.util';
import { UserRole } from '../../modules/users/entities/user.entity';

describe('scopeFor', () => {
  it('retorna ownerUserId = user.userId para usuário seller', () => {
    const scope = scopeFor({
      userId: 'user-seller-1',
      companyId: 'comp-1',
      role: UserRole.SELLER,
    });

    expect(scope).toEqual({
      companyId: 'comp-1',
      ownerUserId: 'user-seller-1',
      role: UserRole.SELLER,
      userId: 'user-seller-1',
    });
  });

  it('retorna ownerUserId = undefined para usuário manager (gestor vê tudo da empresa)', () => {
    const scope = scopeFor({
      userId: 'user-mgr-1',
      companyId: 'comp-1',
      role: UserRole.MANAGER,
    });

    expect(scope).toEqual({
      companyId: 'comp-1',
      ownerUserId: undefined,
      role: UserRole.MANAGER,
      userId: 'user-mgr-1',
    });
  });

  it('retorna ownerUserId = undefined para usuário admin', () => {
    const scope = scopeFor({
      userId: 'user-adm-1',
      companyId: 'comp-1',
      role: UserRole.ADMIN,
    });

    expect(scope).toEqual({
      companyId: 'comp-1',
      ownerUserId: undefined,
      role: UserRole.ADMIN,
      userId: 'user-adm-1',
    });
  });

  it('retorna ownerUserId = undefined para usuário superadmin', () => {
    const scope = scopeFor({
      userId: 'user-super-1',
      companyId: 'comp-1',
      role: UserRole.SUPERADMIN,
    });

    expect(scope).toEqual({
      companyId: 'comp-1',
      ownerUserId: undefined,
      role: UserRole.SUPERADMIN,
      userId: 'user-super-1',
    });
  });
});
