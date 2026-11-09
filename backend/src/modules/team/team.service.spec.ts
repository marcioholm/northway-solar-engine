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

  const mockUserInviteRepo = {
    create: jest.fn((dto) => ({ ...dto, id: 'invite-1' })),
    save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || 'invite-1' })),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
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

    it('should succeed creating invite when within limit', async () => {
      companyRepo.findOne.mockResolvedValue({ id: 'comp-1', maxUsers: 5 });
      userRepo.countBy.mockResolvedValue(1);
      inviteRepo.count.mockResolvedValue(1);
      userRepo.findOne.mockResolvedValue(null); // not already a user
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
  });

  describe('Invite acceptance & single-use tokens', () => {
    it('should reject already used token (404)', async () => {
      const rawToken = '12345678901234567890123456789012';

      inviteRepo.findOne.mockResolvedValue(null); // DB query has usedAt: IsNull(), so used returns null

      await expect(
        service.acceptInvite({
          token: rawToken,
          name: 'João',
          password: 'Password123!',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject expired token (404)', async () => {
      const rawToken = '12345678901234567890123456789012';

      inviteRepo.findOne.mockResolvedValue(null); // DB query has expiresAt: MoreThan(now), so expired returns null

      await expect(
        service.acceptInvite({
          token: rawToken,
          name: 'João',
          password: 'Password123!',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should mark token as used when accepted and create user with invite companyId and role', async () => {
      const rawToken = '12345678901234567890123456789012';
      const hash = crypto.createHash('sha256').update(rawToken).digest('hex');

      const invite = {
        id: 'inv-1',
        companyId: 'company-secure',
        role: UserRole.SELLER,
        email: 'joao@teste.com',
        tokenHash: hash,
        usedAt: null,
        expiresAt: new Date(Date.now() + 100000),
      };

      inviteRepo.findOne.mockResolvedValue(invite);
      userRepo.findOneBy.mockResolvedValue(null); // not existing user

      const res = await service.acceptInvite({
        token: rawToken,
        name: 'João Vendedor',
        password: 'Password123!',
        phone: '11999999999',
      });

      expect(invite.usedAt).toBeInstanceOf(Date);
      expect(userRepo.create).toHaveBeenCalledWith(
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
