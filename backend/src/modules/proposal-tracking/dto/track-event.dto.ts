import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { TrackEventType } from '../entities/proposal-tracking.entity';

export class TrackEventDto {
  @ApiProperty({
    enum: [
      'view',
      'download',
      'whatsapp_click',
      'accept',
      'change_request',
      'section_view',
    ],
  })
  @IsString()
  eventType!: TrackEventType;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  section?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  duration?: number;
}
