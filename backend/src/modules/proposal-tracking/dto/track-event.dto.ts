import { IsString, IsOptional, IsObject, IsIn, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const PUBLIC_TRACK_EVENT_TYPES = [
  'view',
  'download',
  'whatsapp_click',
  'change_request',
  'section_view',
  'qr_scan',
] as const;

export type PublicTrackEventType = (typeof PUBLIC_TRACK_EVENT_TYPES)[number];

export class TrackEventDto {
  @ApiProperty({
    enum: PUBLIC_TRACK_EVENT_TYPES,
  })
  @IsString()
  @IsIn(PUBLIC_TRACK_EVENT_TYPES, {
    message: 'eventType inválido ou não permitido na rota pública de tracking',
  })
  eventType!: PublicTrackEventType;

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
  @IsInt()
  @Min(0)
  @Max(86400)
  duration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(86400)
  durationSeconds?: number;
}
