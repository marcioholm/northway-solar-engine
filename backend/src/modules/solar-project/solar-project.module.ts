import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolarProject } from './entities/solar-project.entity';
import { SolarProjectController } from './solar-project.controller';
import { SolarProjectService } from './solar-project.service';

@Module({
    imports: [TypeOrmModule.forFeature([SolarProject])],
    controllers: [SolarProjectController],
    providers: [SolarProjectService],
    exports: [SolarProjectService],
})
export class SolarProjectModule { }
