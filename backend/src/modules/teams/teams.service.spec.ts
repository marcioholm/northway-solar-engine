import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { SupabaseService } from '../../supabase/supabase.service';

describe('TeamsService', () => {
  let service: TeamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamsService, { provide: SupabaseService, useValue: {} }],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
