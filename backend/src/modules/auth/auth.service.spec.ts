import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;

  beforeEach(async () => {
    usersService = {
      findOneByEmail: jest.fn(),
      updateLastLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: { sign: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('returns null if user not found', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      const res = await service.validateUser('none@test.com', '123456');
      expect(res).toBeNull();
    });

    it('returns null (invalid credentials) if user is inactive but password is wrong', async () => {
      const hash = await bcrypt.hash('correct-pwd', 4);
      usersService.findOneByEmail.mockResolvedValue({
        id: 'u1',
        email: 'inactive@test.com',
        passwordHash: hash,
        isActive: false,
      });

      // Wrong password -> returns null without leaking that user is inactive
      const res = await service.validateUser('inactive@test.com', 'wrong-pwd');
      expect(res).toBeNull();
    });

    it('throws UnauthorizedException if user is inactive and password is correct', async () => {
      const hash = await bcrypt.hash('correct-pwd', 4);
      usersService.findOneByEmail.mockResolvedValue({
        id: 'u1',
        email: 'inactive@test.com',
        passwordHash: hash,
        isActive: false,
      });

      await expect(service.validateUser('inactive@test.com', 'correct-pwd')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns user without passwordHash if active and password is correct', async () => {
      const hash = await bcrypt.hash('correct-pwd', 4);
      usersService.findOneByEmail.mockResolvedValue({
        id: 'u1',
        email: 'active@test.com',
        passwordHash: hash,
        isActive: true,
        name: 'User 1',
      });

      const res = await service.validateUser('active@test.com', 'correct-pwd');
      expect(res).toEqual(
        expect.objectContaining({
          id: 'u1',
          email: 'active@test.com',
          name: 'User 1',
        }),
      );
      expect(res.passwordHash).toBeUndefined();
      expect(usersService.updateLastLogin).toHaveBeenCalledWith('u1');
    });
  });
});
