import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, isNotEmpty, IsNotEmpty, IsString, IsUrl, Max, Min } from "class-validator";

export enum MonitorType{
  HTTP = "HTTP",
  API = "API",
  PING="PING"
}
export class CreateMonitorDto {

  @ApiProperty({ example: "Production Gateway API" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: "https://api.github.com" })
  @IsUrl()
  @IsNotEmpty()
  url: string

  @ApiProperty({ enum: MonitorType, example: MonitorType.HTTP })
  @IsEnum(MonitorType)
  type: MonitorType

  @ApiProperty({ example: 60, description: "Check interval in seconds" })
  @IsInt()
  @Min(10)
  @Max(3600)
  intervalSec: number
}
