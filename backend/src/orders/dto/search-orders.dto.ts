import { IsOptional, IsString } from 'class-validator';

export class SearchOrdersDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  orderNumber?: string;
}
