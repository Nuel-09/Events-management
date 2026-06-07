import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTicketDto {
  @ApiProperty({ example: '321a6e9d-16a8-4770-bdc7-cb1a09d2bc11', description: 'The verification token decoded from the QR code' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
