import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findActiveUserCached(payload.sub);
    if (!user || user.isActive === false) {
      throw new UnauthorizedException('Usuário inativo ou não encontrado');
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      companyId: user.companyId,
      role: user.role,
    };
  }
}
