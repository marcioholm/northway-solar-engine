import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { clientIp } from '../utils/client-ip.util';

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    if (userId) {
      return `user-${userId}`;
    }
    const ip = clientIp(req);
    return ip || 'unknown';
  }
}
