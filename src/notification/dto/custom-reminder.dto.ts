import { IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CustomReminderDto {
  @ApiProperty({ example: '2026-07-14T12:00:00.000Z', description: 'Custom Date & Time when you want to receive the reminder' })
  @IsDateString()
  @IsNotEmpty()
  triggerTime: string;
}
