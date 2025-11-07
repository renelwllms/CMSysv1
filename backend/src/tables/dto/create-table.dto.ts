import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  tableNumber: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
