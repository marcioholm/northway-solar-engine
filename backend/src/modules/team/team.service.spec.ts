import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeamService } from './team.service';
import { UserInvite } from './entities/user-invite.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Lead } from '../leads/entities/lead.entity';
import { SolarProject } from '../solar-project/entities/solar-project.entity';
import { Proposal } from '../proposals/entities/proposal.entity';
import { Company } from '../companies/entities/company.entity';
import { CompaniesService } from '../companies/companies.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('TeamService', () => {
  let service: TeamService;
  let inviteRepo: any;
  let userRepo: any;
  let companyRepo: any;
  let usersService: any;

  const mockManager = {
    query: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((entityClass, dto) => ({ ...dto, id: 'user-new' })),
    save: jest.fn((entityClass, entity) => Promise.resolve({ ...entity, id: entity.id || 'user-1' })),
  };

  const mockUserInviteRepo = {
    create: jest.fn((dto) => ({ ...dto, id: 'invite-1' })),
    save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || 'invite-1' })),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    manager: {
      transaction: jest.fn(async (cb) => cb(mockManager)),
    },
  };

  const mockUserRepo = {
    create: jest.fn((dto) => ({ ...dto, id: 'user-new' })),
    save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || 'user-1' })),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    countBy: jest.fn(),
  };

  const mockCompanyRepo = {
    findOne: jest.fn(),
  };

  const mockCompaniesService = {
    findOne: jest.fn(),
  };

  const mockLeadRepo = {
    count: jest.fn(),
    update: jest.fn(),
  };

  const mockProjectRepo = {
    update: jest.fn(),
  };

  const mockProposalRepo = {
    update: jest.fn(),
  };

  const mockUsersService = {
    countActive: jest.fn(),
    countActiveAdmins: jest.fn(),
    invalidateUserCache: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: getRepositoryToken(UserInvite), useValue: mockUserInviteRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Lead), useValue: mockLeadRepo },
        { provide: getRepositoryToken(SolarProject), useValue: mockProjectRepo },
        { provide: getRepositoryToken(Proposal), useValue: mockProposalRepo },
        { provide: getRepositoryToken(Company), useValue: mockCompanyRepo },
        { provide: CompaniesService, useValue: mockCompaniesService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(null) } },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
    inviteRepo = mockUserInviteRepo;
    userRepo = mockUserRepo;
    companyRepo = mockCompanyRepo;
    usersService = mockUsersService;
    mockCompaniesService.findOne.mockImplementation((id) => mockCompanyRepo.findOne({ where: { id } }));
  });

  describe('Invite creation & plan limit', () => {
    it('should block invite when plan user limit is reached (403)', async () => {
      companyRepo.findOne.mockResolvedValue({ id: 'comp-1', maxUsers: 2 });
      userRepo.countBy.mockResolvedValue(1);
      inviteRepo.count.mockResolvedValue(1); // 1 active + 1 pending = 2 >= 2

      await expect(
        service.createInvite('comp-1', 'admin-1', {
          email: 'novo@teste.com',
          role: UserRole.SELLER,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject inviting a superadmin (400)', async () => {
      companyRepo.findOne.mockResolvedValue({ id: 'comp-1', maxUsers: 10 });
      userRepo.countBy.mockResolvedValue(1);
      inviteRepo.count.mockResolvedValue(0);

      await expect(
        service.createInvite('comp-1', 'admin-1', {
          email: 'novo@teste.com',
          role: UserRole.SUPERADMIN,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invite if email belongs to another company (active or inactive) (400)', async () => {
      companyRepo.findOne.mockResolvedValue({ id: 'comp-1', maxUsers: 10 });
      userRepo.countBy.mockResolvedValue(1);
      inviteRepo.count.mockResolvedValue(0);

      // Active user in another company
      userRepo.findOneBy.mockResolvedValueOnce({
        id: 'u-ext-1',
        email: 'other@empresa-b.com',
        companyId: 'comp-2',
        isActive: true,
      });

      await expect(
        service.createInvite('comp-1', 'admin-1', {
          email: 'other@empresa-b.com',
          role: UserRole.SELLER,
        }),
      ).rejects.toThrow(new BadRequestException('Este e-mail já está em uso. Fale com o administrador.'));

      // Inactive user in another company
      userRepo.findOneBy.mockResolvedValueOnce({
        id: 'u-ext-2',
        email: 'inactive@empresa-b.com',
        companyId: 'comp-2',
        isActive: false,
      });

      await expect(
        service.createInvite('comp-1', 'admin-1', {
          email: 'inactive@empresa-b.com',
          role: UserRole.SELLER,
        }),
      ).rejects.toThrow(new BadRequestException('Este e-mail já está em uso. Fale com o administrador.'));
    });

    it('should reject invite if email belongs to same company and is inactive (orienting to reactivate)', async () => {
      companyRepo.findOne.mockResolvedValue({ id: 'comp-1', maxUsers: 10 });
      userRepo.countBy.mockResolvedValue(1);
      inviteRepo.count.mockResolvedValue(0);

      userRepo.findOneBy.mockResolvedValue({
        id: 'u-same-inact',
        email: 'inativo@comp-1.com',
        companyId: 'comp-1',
        isActive: false,
      });

      await expect(
        service.createInvite('comp-1', 'admin-1', {
          email: 'inativo@comp-1.com',
          role: UserRole.SELLER,
        }),
      ).rejects.toThrow(/reativar/i);
    });

    it('should succeed creating invite when within limit', async () => {
      companyRepo.findOne.mockResolvedValue({ id: 'comp-1', maxUsers: 5 });
      userRepo.countBy.mockResolvedValue(1);
      inviteRepo.count.mockResolvedValue(1);
      userRepo.findOneBy.mockResolvedValue(null); // not already a user
      inviteRepo.findOne.mockResolvedValue(null); // no active pending invite

      const result = await service.createInvite('comp-1', 'admin-1', {
        email: 'vendedor@solar.com',
        role: UserRole.SELLER,
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('rawToken');
      expect(result).toHaveProperty('inviteUrl');
      expect(inviteRepo.save).toHaveBeenCalled();
    });
  });

  describe('Member update protections', () => {
    it('should not allow admin to demote self (400)', async () => {
      userRepo.findOneBy.mockResolvedValue({
        id: 'admin-1',
        companyId: 'comp-1',
        role: UserRole.ADMIN,
        isActive: true,
      });

      await expect(
        service.updateMember('comp-1', 'admin-1', 'admin-1', {
          role: UserRole.SELLER,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not allow demoting the last active admin (400)', async () => {
      userRepo.findOneBy.mockResolvedValue({
        id: 'admin-2',
        companyId: 'comp-1',
        role: UserRole.ADMIN,
        isActive: true,
      });
      usersService.countActiveAdmins.mockResolvedValue(1);

      await expect(
        service.updateMember('comp-1', 'admin-1', 'admin-2', {
          role: UserRole.SELLER,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not allow promoting to superadmin (400)', async () => {
      userRepo.findOneBy.mockResolvedValue({
        id: 'seller-1',
        companyId: 'comp-1',
        role: UserRole.SELLER,
        isActive: true,
      });

      await expect(
        service.updateMember('comp-1', 'admin-1', 'seller-1', {
          role: UserRole.SUPERADMIN,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return 404 when admin tries to update a superadmin', async () => {
      userRepo.findOneBy.mockResolvedValue({
        id: 'super-1',
        companyId: 'comp-1',
        role: UserRole.SUPERADMIN,
        isActive: true,
      });

      await expect(
        service.updateMember('comp-1', 'admin-1', 'super-1', {
          name: 'Tentativa',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Deactivation protections', () => {
    it('should not allow admin to deactivate self (400)', async () => {
      userRepo.findOneBy.mockResolvedValue({
        id: 'admin-1',
        companyId: 'comp-1',
        role: UserRole.ADMIN,
        isActive: true,
      });

      await expect(
        service.deactivateMember('comp-1', 'admin-1', 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not allow deactivating the last active admin (400)', async () => {
      userRepo.findOneBy.mockResolvedValue({
        id: 'admin-2',
        companyId: 'comp-1',
        role: UserRole.ADMIN,
        isActive: true,
      });
      usersService.countActiveAdmins.mockResolvedValue(1);

      await expect(
        service.deactivateMember('comp-1', 'admin-1', 'admin-2'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return 404 when admin tries to deactivate a superadmin', async () => {
      userRepo.findOneBy.mockResolvedValue({
        id: 'super-1',
        companyId: 'comp-1',
        role: UserRole.SUPERADMIN,
        isActive: true,
      });

      await expect(
        service.deactivateMember('comp-1', 'admin-1', 'super-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Invite acceptance & single-use tokens', () => {
    it('should reject already used or invalid token (400)', async () => {
      const rawToken = '12345678901234567890123456789012';

      // Atomic update returned 0 rows
      mockManager.query.mockResolvedValue([]);

      await expect(
        service.acceptInvite({
          token: rawToken,
          name: 'João',
          password: 'Password123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject accepting invite if user belongs to another company (400)', async () => {
      const rawToken = '12345678901234567890123456789012';

      mockManager.query.mockResolvedValue([
        {
          id: 'inv-1',
          company_id: 'company-b',
          role: UserRole.SELLER,
          email: 'user@company-a.com',
        },
      ]);

      mockManager.findOne.mockResolvedValue({
        id: 'u-existing',
        email: 'user@company-a.com',
        companyId: 'company-a', // Different company!
      });

      await expect(
        service.acceptInvite({
          token: rawToken,
          name: 'João',
          password: 'Password123!',
        }),
      ).rejects.toThrow(new BadRequestException('Este e-mail já está em uso. Fale com o administrador.'));
    });

    it('should mark token as used when accepted and create user with invite companyId and role', async () => {
      const rawToken = '12345678901234567890123456789012';

      mockManager.query.mockResolvedValue([
        {
          id: 'inv-1',
          company_id: 'company-secure',
          role: UserRole.SELLER,
          email: 'joao@teste.com',
        },
      ]);
      mockManager.findOne.mockResolvedValue(null); // not existing user

      const res = await service.acceptInvite({
        token: rawToken,
        name: 'João Vendedor',
        password: 'Password123!',
        phone: '11999999999',
      });

      expect(mockManager.create).toHaveBeenCalledWith(
        User,
        expect.objectContaining({
          companyId: 'company-secure',
          role: UserRole.SELLER,
          email: 'joao@teste.com',
          name: 'João Vendedor',
          phone: '11999999999',
          isActive: true,
        }),
      );
      expect(res.user.email).toBe('joao@teste.com');
    });
  });
});
