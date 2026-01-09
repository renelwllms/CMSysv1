import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendTestMessageDto {
  @IsString()
  @IsNotEmpty()
  testPhone: string;

  @IsOptional()
  @IsString()
  message?: string;
}
