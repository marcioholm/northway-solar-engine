import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      companyId: user.companyId,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userDto: any) {
    // Check if user exists
    const existingUser = await this.usersService.findOneByEmail(userDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(userDto.password, salt);

    // Create user via UsersService
    return this.usersService.create({
      ...userDto,
      passwordHash,
    });
  }
}
