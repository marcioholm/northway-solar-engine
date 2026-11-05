import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../modules/users/entities/user.entity';
import { RolesGuard } from './roles.guard';

const contextFor = (role?: UserRole) =>
  ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  }) as unknown as ExecutionContext;

const guardRequiring = (...roles: UserRole[]) =>
  new RolesGuard({
    getAllAndOverride: () => roles,
  } as unknown as Reflector);

describe('RolesGuard', () => {
  it('não confunde admin com superadmin', () => {
    const guard = guardRequiring(UserRole.SUPERADMIN);
    expect(guard.canActivate(contextFor(UserRole.ADMIN))).toBe(false);
  });

  it('deixa o superadmin passar em rotas de admin', () => {
    const guard = guardRequiring(UserRole.ADMIN);
    expect(guard.canActivate(contextFor(UserRole.SUPERADMIN))).toBe(true);
  });

  it('bloqueia vendedor e requisição sem usuário', () => {
    const guard = guardRequiring(UserRole.ADMIN);
    expect(guard.canActivate(contextFor(UserRole.SELLER))).toBe(false);
    expect(guard.canActivate(contextFor())).toBe(false);
  });
});
