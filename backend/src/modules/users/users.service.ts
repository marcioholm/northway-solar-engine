import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  private userCache = new Map<string, { user: User; expiresAt: number }>();

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(createUserDto: any) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  findAll(companyId?: string) {
    if (companyId) {
      return this.usersRepository.findBy({ companyId });
    }
    return this.usersRepository.find();
  }

  findOne(id: string, companyId?: string) {
    if (companyId) {
      return this.usersRepository.findOneBy({ id, companyId });
    }
    return this.usersRepository.findOneBy({ id });
  }

  findOneByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async findActiveUserCached(id: string): Promise<User | null> {
    const now = Date.now();
    const cached = this.userCache.get(id);
    if (cached && cached.expiresAt > now) {
      return cached.user;
    }

    const user = await this.usersRepository.findOneBy({ id });
    if (user) {
      this.userCache.set(id, { user, expiresAt: now + 60000 });
    } else {
      this.userCache.delete(id);
    }
    return user;
  }

  invalidateUserCache(id: string): void {
    this.userCache.delete(id);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLoginAt: new Date() });
    this.invalidateUserCache(id);
  }

  async countActive(companyId: string): Promise<number> {
    return this.usersRepository.countBy({ companyId, isActive: true });
  }

  async countActiveAdmins(companyId: string): Promise<number> {
    return this.usersRepository.countBy({
      companyId,
      role: UserRole.ADMIN,
      isActive: true,
    });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData);
    this.invalidateUserCache(id);
    const updated = await this.usersRepository.findOneBy({ id });
    return updated!;
  }
}
