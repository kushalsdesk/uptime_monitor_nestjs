import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { MonitorType } from '../entities/monitor.entity.js';

export class CreateMonitorDto {
  @ApiProperty({ example: 'Production Gateway API' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://api.github.com' })
  @IsUrl({ require_tld: false, require_protocol: true })
  @IsNotEmpty()
  url: string;

  @ApiProperty({ enum: MonitorType, example: MonitorType.HTTP })
  @IsEnum(MonitorType)
  type: MonitorType;

  @ApiProperty({ example: 60, description: 'Check interval in seconds' })
  @IsInt()
  @Min(10)
  @Max(3600)
  intervalSec: number;
}
