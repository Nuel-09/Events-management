import { IsNotEmpty, IsString, IsNumber, IsDateString, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Summer Music Festival', description: 'Event title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A pulsating concert featuring top music stars.', description: 'Event details and description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2026-07-15T18:00:00.000Z', description: 'Date and time of the event' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'Madison Square Garden, NYC', description: 'Event location/venue' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 49.99, description: 'Price of the event ticket (0 for free)' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 500, description: 'Total capacity/number of tickets available' })
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: '1_DAY', default: '1_DAY', description: 'Default reminder interval before event' })
  @IsString()
  @IsOptional()
  reminderInterval?: string;
}
