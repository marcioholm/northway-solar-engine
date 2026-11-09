import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from './dto/login.dto';
import { UserThrottlerGuard } from '../../common/guards/user-throttler.guard';
import { TeamService } from '../team/team.service';
import { AcceptInviteDto, ResetPasswordDto } from '../team/dto/invite.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly teamService: TeamService,
  ) {}

  @UseGuards(UserThrottlerGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Return JWT token' })
  async login(@Body() req: LoginDto) {
    const user = await this.authService.validateUser(req.email, req.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(UserThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Get('invite/:token')
  @ApiOperation({ summary: 'Consultar dados do convite' })
  getInvite(@Param('token') token: string) {
    return this.teamService.getInvitePublic(token);
  }

  @UseGuards(UserThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('accept-invite')
  @ApiOperation({ summary: 'Aceitar convite e definir senha' })
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.teamService.acceptInvite(dto);
  }

  @UseGuards(UserThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('reset-password')
  @ApiOperation({ summary: 'Redefinir senha com token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.teamService.resetPassword(dto);
  }
}
