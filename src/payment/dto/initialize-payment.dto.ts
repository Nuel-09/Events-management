import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitializePaymentDto {
  @ApiProperty({ example: 'a68ef342-99bd-4934-bc2f-b4dfd0f28df1', description: 'ID of the event to book a ticket for' })
  @IsUUID()
  @IsNotEmpty()
  eventId: string;
}
