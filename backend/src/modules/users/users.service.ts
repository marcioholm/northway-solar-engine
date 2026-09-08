import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
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
}
