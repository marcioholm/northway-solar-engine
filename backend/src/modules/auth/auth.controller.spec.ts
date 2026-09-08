import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ThrottlerStorage } from '@nestjs/throttler';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: 'THROTTLER:MODULE_OPTIONS', useValue: {} },
        { provide: ThrottlerStorage, useValue: {} },
        { provide: 'THROTTLER:LIMIT_DEFAULT', useValue: {} },
        { provide: 'THROTTLER:TTL_DEFAULT', useValue: {} },
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
