import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Emmanuel Dennis' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Required when changing password for accounts that already have one',
  })
  @ValidateIf((o: UpdateProfileDto) => !!o.newPassword)
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiPropertyOptional({
    description:
      'New password (min 6 chars). Google-only accounts can set a password without currentPassword.',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  newPassword?: string;
}
