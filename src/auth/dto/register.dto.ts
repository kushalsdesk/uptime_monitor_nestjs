import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'kushal@dev.com',
    description: 'User email address for account login and alert notifications',
  })
  // 🚀 FIX: Sanitize email (trim and lowercase)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'User password (must be between 8 and 32 characters)',
    minLength: 8,
    maxLength: 32,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must not exceed 32 characters' })
  password: string;

  @ApiProperty({
    example: 'Kushal Mondal',
    description: 'Full name or display name of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
